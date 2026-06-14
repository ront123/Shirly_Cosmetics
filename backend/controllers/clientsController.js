const { pool } = require('../config/db');
const fs = require('fs');
const path = require('path');

function hueFromName(name = '') {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 360;
  return h;
}

exports.getClients = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM clients ORDER BY first_name ASC, last_name ASC');
    
    const formatted = result.rows.map(row => {
      const name = `${row.first_name || ''} ${row.last_name || ''}`.trim();
      const avgInvoice = Math.round(parseFloat(row.avg_invoice) || 0);
      const visits = parseInt(row.visits, 10) || 0;
      
      const lastVisit = row.last_visit_date ? new Date(row.last_visit_date).toISOString().slice(0, 10) : '';
      const daysSince = lastVisit
        ? (Date.now() - new Date(lastVisit).getTime()) / (1000 * 60 * 60 * 24)
        : 9999;
      const status = daysSince < 90 ? 'active' : 'inactive';

      return {
        id: row.id,
        easybizy_id: row.easybizy_id || '',
        name,
        initials: name[0] || '?',
        phone: row.phone_number || '',
        email: row.email || '',
        birthday: row.date_of_birth ? new Date(row.date_of_birth).toISOString().slice(0, 10) : '',
        lastVisit,
        visits,
        avgInvoice,
        spent: '₪' + (avgInvoice * visits).toLocaleString('he-IL'),
        status,
        hue: hueFromName(name),
        address: row.address || '',
        source: row.source || '',
        notes: row.notes || ''
      };
    });

    return res.json(formatted);
  } catch (err) {
    console.warn('⚠️ Database query failed, falling back to static clients.json file:', err.message);
    
    // Fallback: load from static JSON file
    try {
      const clientsPath = path.join(__dirname, '../../frontend/src/data/clients.json');
      if (fs.existsSync(clientsPath)) {
        const fileData = fs.readFileSync(clientsPath, 'utf8');
        return res.json(JSON.parse(fileData));
      }
    } catch (fallbackErr) {
      console.error('❌ Fallback failed:', fallbackErr.message);
    }
    
    res.status(500).json({ error: 'Server error' });
  }
};
