const { pool } = require('../config/db');

exports.getTreatments = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM treatment_types ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.addTreatment = async (req, res) => {
  const { name, duration_minutes, price, color_code } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO treatment_types (name, duration_minutes, price, color_code) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, duration_minutes, price, color_code]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
