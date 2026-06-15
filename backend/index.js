const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '150mb' }));
app.use(express.urlencoded({ limit: '150mb', extended: true }));

const { pool } = require('./config/db');

// Run database migrations on startup
async function runMigrations() {
  try {
    console.log('🔄 Running database migrations...');
    await pool.query(`
      ALTER TABLE clients ADD COLUMN IF NOT EXISTS easybizy_id VARCHAR(100);
      ALTER TABLE clients ADD COLUMN IF NOT EXISTS date_of_birth DATE;
      ALTER TABLE clients ADD COLUMN IF NOT EXISTS address VARCHAR(255);
      ALTER TABLE clients ADD COLUMN IF NOT EXISTS source VARCHAR(100);
      ALTER TABLE clients ADD COLUMN IF NOT EXISTS visits INTEGER DEFAULT 0;
      ALTER TABLE clients ADD COLUMN IF NOT EXISTS avg_invoice INTEGER DEFAULT 0;
      ALTER TABLE clients ADD COLUMN IF NOT EXISTS gender VARCHAR(50);
      ALTER TABLE clients ADD COLUMN IF NOT EXISTS balance DECIMAL(10,2) DEFAULT 0.00;
      ALTER TABLE appointments ADD COLUMN IF NOT EXISTS easybizy_id VARCHAR(100);
      ALTER TABLE appointments ADD COLUMN IF NOT EXISTS title VARCHAR(255);
    `);
    console.log('✅ Database migrations completed successfully.');
  } catch (err) {
    console.error('❌ Database migration error:', err);
  }
}
runMigrations();

// Routes
const treatmentsRoutes = require('./routes/treatments');
const appointmentsRoutes = require('./routes/appointments');
const clientsRoutes = require('./routes/clients');

app.use('/api/treatments', treatmentsRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.get('/api/test-db', async (req, res) => {
  try {
    const { pool } = require('./config/db');
    const result = await pool.query(`
      SELECT a.*, c.first_name, c.last_name, c.phone_number, 
             t.name as treatment_name, t.duration_minutes, t.color_code,
             u.name as therapist_name
      FROM appointments a
      LEFT JOIN clients c ON a.client_id = c.id
      LEFT JOIN treatment_types t ON a.treatment_id = t.id
      LEFT JOIN users u ON a.therapist_id = u.id
      ORDER BY a.start_time DESC LIMIT 5
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, stack: err.stack });
  }
});

app.use('/api/clients', clientsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Shirly Cosmetics API is running', version: '1.2.0', deployedAt: new Date().toISOString() });
});

// Easybizy Sync Routes
const { syncClients } = require('./scripts/sync-clients');
const { processExtensionSync } = require('./scripts/sync-extension');
const fs = require('fs');
const path = require('path');

app.get('/api/sync-status', (req, res) => {
  try {
    const logPath = path.join(__dirname, 'data/sync-log.json');
    if (fs.existsSync(logPath)) {
      const log = JSON.parse(fs.readFileSync(logPath, 'utf8'));
      res.json({ status: 'ok', data: log });
    } else {
      res.json({ status: 'ok', data: { runs: [], last_sync: null, total_synced: 0 } });
    }
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

app.post('/api/sync', async (req, res) => {
  try {
    const result = await syncClients();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/sync-extension', async (req, res) => {
  try {
    const { customers, appointments, appointmentsUrl } = req.body;
    
    // Save raw payload to disk for debugging
    try {
      const debugDir = path.join(__dirname, 'data');
      if (!fs.existsSync(debugDir)) fs.mkdirSync(debugDir, { recursive: true });
      fs.writeFileSync(path.join(debugDir, 'last-raw-payload.json'), JSON.stringify(req.body, null, 2));
      console.log('📝 Saved raw sync payload to data/last-raw-payload.json');
      
      if (req.body.metadata) {
        fs.writeFileSync(path.join(debugDir, 'metadata.xml'), req.body.metadata);
        console.log('📝 Saved OData schema metadata to data/metadata.xml');
      }
    } catch (debugErr) {
      console.error('Failed to save debug raw payload:', debugErr);
    }

    if ((!customers || !Array.isArray(customers)) && (!appointments || !Array.isArray(appointments))) {
      return res.status(400).json({ success: false, error: 'Invalid payload: must provide customers or appointments array' });
    }
    const result = await processExtensionSync(customers || [], appointments || [], appointmentsUrl);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
