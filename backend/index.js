const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
const treatmentsRoutes = require('./routes/treatments');
const appointmentsRoutes = require('./routes/appointments');

app.use('/api/treatments', treatmentsRoutes);
app.use('/api/appointments', appointmentsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Shirly Cosmetics API is running' });
});

// Easybizy Sync Routes
const { syncClients } = require('./scripts/sync-clients');
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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
