const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5001;

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
      ALTER TABLE appointments ADD COLUMN IF NOT EXISTS easybizy_id VARCHAR(100);
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
    const { customers, appointments } = req.body;
    if ((!customers || !Array.isArray(customers)) && (!appointments || !Array.isArray(appointments))) {
      return res.status(400).json({ success: false, error: 'Invalid payload: must provide customers or appointments array' });
    }
    const result = await processExtensionSync(customers || [], appointments || []);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
