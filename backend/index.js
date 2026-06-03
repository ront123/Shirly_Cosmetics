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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
