const fs = require('fs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function restore() {
  try {
    console.log('Loading appts...');
    const appts = JSON.parse(fs.readFileSync('../frontend/src/data/appointments.json', 'utf8'));
    
    // Get clients map
    const dbClientsRes = await pool.query('SELECT id, phone_number, easybizy_id, first_name, last_name FROM clients');
    const clientByEasybizyId = new Map();
    const clientByPhone = new Map();
    const clientByName = new Map();
    dbClientsRes.rows.forEach(r => {
      if (r.easybizy_id) clientByEasybizyId.set(String(r.easybizy_id), r.id);
      if (r.phone_number) clientByPhone.set(r.phone_number, r.id);
      const nameKey = `${r.first_name || ''} ${r.last_name || ''}`.trim();
      if (nameKey) clientByName.set(nameKey, r.id);
    });

    const dbTherapists = await pool.query('SELECT id, name FROM users');
    const therapistMap = new Map(dbTherapists.rows.map(r => [r.name, r.id]));
    
    const dbTreatments = await pool.query('SELECT id, name FROM treatment_types');
    const treatmentMap = new Map(dbTreatments.rows.map(r => [r.name, r.id]));

    // Get existing appts
    const dbApptsRes = await pool.query('SELECT id, easybizy_id FROM appointments WHERE easybizy_id IS NOT NULL');
    const existingIds = new Set(dbApptsRes.rows.map(r => r.easybizy_id));

    let toInsert = [];

    console.log('Processing appts loop...');
    for (const raw of appts) {
      if (existingIds.has(String(raw.id))) continue;

      let clientId = null;
      if (raw.clientPhone && clientByPhone.has(raw.clientPhone)) {
        clientId = clientByPhone.get(raw.clientPhone);
      } else if (raw.clientId && clientByEasybizyId.has(String(raw.clientId))) {
        clientId = clientByEasybizyId.get(String(raw.clientId));
      }

      // If no clientId, and it's not a break, try to match by name
      const isBreak = ['הפסקה', 'ארוחה', 'ארוחת', 'חסום', 'חסימה', 'break', 'block', 'lunch', 'נעול', 'נעילה'].some(kw => String(raw.clientName).includes(kw));

      if (!clientId && !isBreak && raw.clientName) {
        const nameParts = raw.clientName.split(/\s+/);
        const firstName = nameParts[0] || 'לקוח';
        const lastName = nameParts.slice(1).join(' ') || 'לא-מזוהה';
        const nameKey = `${firstName} ${lastName}`.trim();
        if (clientByName.has(nameKey)) {
          clientId = clientByName.get(nameKey);
        }
      }

      if (!clientId && !isBreak) continue;

      let therapistId = therapistMap.get(raw.therapistName) || 1; // Default
      let treatmentId = treatmentMap.get(raw.treatmentName) || 1; // Default

      let title = isBreak ? raw.clientName : '';

      toInsert.push({
        clientId,
        therapistId,
        treatmentId,
        startTime: raw.startTime,
        endTime: raw.endTime,
        status: raw.status || 'scheduled',
        notes: raw.notes || '',
        easybizyId: String(raw.id),
        title
      });
    }

    console.log(`Found ${toInsert.length} new appointments to restore.`);

    const BATCH_SIZE = 500;
    for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
      const batch = toInsert.slice(i, i + BATCH_SIZE);
      const values = [];
      const placeholders = [];
      batch.forEach((a, idx) => {
        const base = idx * 9;
        placeholders.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9})`);
        values.push(a.clientId, a.therapistId, a.treatmentId, a.startTime, a.endTime, a.status, a.notes, a.easybizyId, a.title);
      });
      const query = `
        INSERT INTO appointments (client_id, therapist_id, treatment_id, start_time, end_time, status, notes, easybizy_id, title)
        VALUES ${placeholders.join(', ')}
      `;
      await pool.query(query, values);
    }

    console.log('Restore complete. Calculating visits...');
    await pool.query(`
      WITH appt_stats AS (
        SELECT a.client_id, COUNT(*) as actual_visits, COALESCE(SUM(t.price), 0) as total_spent
        FROM appointments a
        LEFT JOIN treatment_types t ON a.treatment_id = t.id
        WHERE a.client_id IS NOT NULL AND a.start_time < NOW() AND a.status NOT IN ('cancelled', 'no_show')
        GROUP BY a.client_id
      )
      UPDATE clients SET visits = appt_stats.actual_visits, balance = appt_stats.total_spent,
        avg_invoice = CASE WHEN appt_stats.actual_visits > 0 THEN appt_stats.total_spent / appt_stats.actual_visits ELSE 0 END
      FROM appt_stats WHERE clients.id = appt_stats.client_id;
    `);

    console.log('Done!');
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
restore();
