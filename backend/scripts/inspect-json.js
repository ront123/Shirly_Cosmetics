const fs = require('fs');
const path = require('path');

const APPOINTMENTS_PATH = path.join(__dirname, '../../frontend/src/data/appointments.json');

try {
  const data = JSON.parse(fs.readFileSync(APPOINTMENTS_PATH, 'utf8'));
  console.log(`Total appointments in JSON: ${data.length}`);
  
  const todayAppts = data.filter(a => a.startTime && a.startTime.startsWith('2026-06-14'));
  console.log(`\nAppointments scheduled for 2026-06-14: (${todayAppts.length})`);
  todayAppts.forEach(r => {
    console.log(JSON.stringify(r, null, 2));
  });
} catch (err) {
  console.error('Error reading appointments JSON:', err);
}
