require('dotenv').config();
const { pool } = require('./backend/config/db');
const fs = require('fs');

async function run() {
  const syncMod = require('./backend/scripts/sync-extension.js');
  const rawCustomers = JSON.parse(fs.readFileSync('./frontend/src/data/clients.json', 'utf8'));
  const rawAppointments = JSON.parse(fs.readFileSync('./frontend/src/data/appointments.json', 'utf8'));
  
  // monkey patch pool.query to catch the error and print the values!
  const originalQuery = pool.query.bind(pool);
  pool.query = async function(queryText, values) {
    try {
      return await originalQuery(queryText, values);
    } catch (err) {
      if (err.message.includes('value too long')) {
        console.error('QUERY THAT FAILED:', queryText);
        console.error('VALUES THAT FAILED:', values);
      }
      throw err;
    }
  };

  console.log("Running processExtensionSync...");
  try {
    await syncMod.processExtensionSync(rawCustomers, rawAppointments);
    console.log("Finished!");
  } catch (err) {
    console.error("FATAL ERROR:", err);
  }
  process.exit(0);
}
run();
