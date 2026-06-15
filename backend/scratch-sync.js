require('dotenv').config();
const { processExtensionSync } = require('./scripts/sync-extension.js');
const fs = require('fs');

async function run() {
  const rawCustomers = JSON.parse(fs.readFileSync('../frontend/src/data/clients.json', 'utf8'));
  const rawAppointments = JSON.parse(fs.readFileSync('../frontend/src/data/appointments.json', 'utf8'));
  
  console.log("Running processExtensionSync...");
  try {
    await processExtensionSync(rawCustomers, rawAppointments);
    console.log("Finished!");
  } catch (err) {
    console.error("FATAL ERROR:", err);
  }
  process.exit(0);
}
run();
