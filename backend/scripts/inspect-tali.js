const fs = require('fs');
const path = require('path');

const RAW_PATH = path.join(__dirname, '../data/last-raw-payload.json');

try {
  const fileContent = fs.readFileSync(RAW_PATH, 'utf8');
  const payload = JSON.parse(fileContent);
  const rawAppts = payload.appointments || [];
  
  // Find Tali Melina (ID 106502)
  const tali = rawAppts.find(a => String(a.MeetingId || a.id || a.CalendarEventId) === '106502');
  if (tali) {
    console.log(JSON.stringify(tali, null, 2));
  } else {
    console.log('Tali Melina not found. Here is the first item instead:');
    console.log(JSON.stringify(rawAppts[0], null, 2));
  }

} catch (err) {
  console.error('Error:', err);
}
