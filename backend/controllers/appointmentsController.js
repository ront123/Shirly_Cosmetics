const { pool } = require('../config/db');

const fs = require('fs');
const path = require('path');

exports.getAppointments = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, c.first_name, c.last_name, c.phone_number, 
             t.name as treatment_name, t.duration_minutes, t.color_code,
             u.name as therapist_name
      FROM appointments a
      LEFT JOIN clients c ON a.client_id = c.id
      LEFT JOIN treatment_types t ON a.treatment_id = t.id
      LEFT JOIN users u ON a.therapist_id = u.id
      ORDER BY a.start_time ASC
    `);
    
    // Map to camelCase properties expected by frontend
    const formatted = result.rows.map(row => {
      const clientName = `${row.first_name || ''} ${row.last_name || ''}`.trim();
      return {
        id: row.id,
        easybizyId: row.easybizy_id || '',
        clientId: row.client_id || '',
        clientPhone: row.phone_number || '',
        clientName: clientName || 'לקוח לא מזוהה',
        treatmentName: row.treatment_name || 'טיפול כללי',
        therapistName: row.therapist_name || 'שירלי',
        startTime: row.start_time ? new Date(row.start_time).toISOString() : '',
        endTime: row.end_time ? new Date(row.end_time).toISOString() : '',
        status: row.status || 'scheduled',
        notes: row.notes || ''
      };
    });

    res.json(formatted);
  } catch (err) {
    console.warn('⚠️ Database query failed, falling back to static appointments.json file:', err.message);
    
    // Fallback: load from static JSON file
    try {
      const apptsPath = path.join(__dirname, '../../frontend/src/data/appointments.json');
      if (fs.existsSync(apptsPath)) {
        const fileData = fs.readFileSync(apptsPath, 'utf8');
        return res.json(JSON.parse(fileData));
      }
    } catch (fallbackErr) {
      console.error('❌ Fallback failed:', fallbackErr.message);
    }
    
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createAppointment = async (req, res) => {
  const { client_id, therapist_id, treatment_id, start_time, end_time, notes } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO appointments (client_id, therapist_id, treatment_id, start_time, end_time, notes) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [client_id, therapist_id, treatment_id, start_time, end_time, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getAvailableSlots = async (req, res) => {
  // A simple endpoint to get available slots for a specific date
  const { date } = req.query; // format: YYYY-MM-DD
  // Implementation will calculate slots based on working_hours and existing appointments
  // For now, return a placeholder response
  res.json({
    date,
    availableSlots: ['10:00', '11:30', '13:00', '15:45', '17:00']
  });
};
