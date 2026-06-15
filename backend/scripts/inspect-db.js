const { pool } = require('../config/db');
require('dotenv').config();

async function main() {
  try {
    const clientsCount = await pool.query('SELECT COUNT(*) FROM clients');
    const apptsCount = await pool.query('SELECT COUNT(*) FROM appointments');
    console.log(`Total database count -> Clients: ${clientsCount.rows[0].count}, Appointments: ${apptsCount.rows[0].count}`);

    // Today's appointments (2026-06-14)
    const today = '2026-06-14';
    const apptsToday = await pool.query(`
      SELECT a.id, a.easybizy_id, a.start_time, a.end_time, a.status, a.title, a.notes,
             c.first_name, c.last_name, c.phone_number,
             t.name as treatment_name,
             u.name as therapist_name
      FROM appointments a
      LEFT JOIN clients c ON a.client_id = c.id
      LEFT JOIN treatment_types t ON a.treatment_id = t.id
      LEFT JOIN users u ON a.therapist_id = u.id
      WHERE a.start_time >= '2026-06-14 00:00:00+00' AND a.start_time <= '2026-06-14 23:59:59+00'
      ORDER BY a.start_time ASC
    `);

    console.log(`\nAppointments scheduled for ${today}: (${apptsToday.rows.length})`);
    apptsToday.rows.forEach(r => {
      console.log(`- ID: ${r.id}, EasyBizyID: ${r.easybizy_id}, Client: ${r.first_name} ${r.last_name} (${r.phone_number}), Treatment: ${r.treatment_name}, Therapist: ${r.therapist_name}, Time: ${r.start_time.toISOString()}, Title: "${r.title || ''}", Notes: "${r.notes || ''}"`);
    });

    // Let's check treatment_types
    const treatments = await pool.query('SELECT id, name FROM treatment_types');
    console.log(`\nRegistered treatment types: (${treatments.rows.length})`);
    treatments.rows.forEach(t => {
      console.log(`- ${t.id}: ${t.name}`);
    });

  } catch (err) {
    console.error('Error querying database:', err);
  } finally {
    await pool.end();
  }
}

main();
