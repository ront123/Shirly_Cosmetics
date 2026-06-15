const { processExtensionSync } = require('./sync-extension.js');
const fs = require('fs');
const path = require('path');

const RAW_PATH = path.join(__dirname, '../data/last-raw-payload.json');
const APPOINTMENTS_PATH = path.join(__dirname, '../../frontend/src/data/appointments.json');

// Get mapAppointment from sync-extension.js
const { pool } = require('../config/db');
// Read the file directly to find the function
const syncCode = fs.readFileSync(path.join(__dirname, 'sync-extension.js'), 'utf8');

async function main() {
  try {
    const fileContent = fs.readFileSync(RAW_PATH, 'utf8');
    const payload = JSON.parse(fileContent);
    const rawAppts = payload.appointments || [];

    // Find Rinat Reshef's raw appointment
    const rawRinat = rawAppts.find(a => String(a.MeetingId || a.id) === '105438');
    if (rawRinat) {
      console.log('--- Raw Rinat Reshef appointment (105438) ---');
      console.log(JSON.stringify(rawRinat, null, 2));
    }

    // Run the sync
    const result = await processExtensionSync(payload.customers || [], payload.appointments || []);
    
    // Read the saved appointments.json
    const appointments = JSON.parse(fs.readFileSync(APPOINTMENTS_PATH, 'utf8'));
    const tali = appointments.find(a => String(a.id) === '106502');
    const rinat1 = appointments.find(a => String(a.id) === '105438');
    
    console.log('\n--- Saved Results in JSON ---');
    console.log('Tali Melina (106502):', tali);
    console.log('Rinat Reshef (105438):', rinat1);

  } catch (err) {
    console.error('Error:', err);
  }
}

main();
