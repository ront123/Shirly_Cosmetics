const fs = require('fs');
const path = require('path');

const RAW_PATH = path.join(__dirname, '../data/last-raw-payload.json');

try {
  const fileContent = fs.readFileSync(RAW_PATH, 'utf8');
  const payload = JSON.parse(fileContent);
  const rawAppts = payload.appointments || [];
  
  // Find all items that are NOT "Meeting" type or contain Hebrew break keywords
  const nonMeetings = rawAppts.filter(a => {
    const type = a.CalendarEventType || '';
    const name = a.Title || a.Subject || '';
    return type !== 'Meeting' || /הפסקה|ארוחה|ארוחת|חסום|חסימה|break|block|lunch|נעול|נעילה/.test(name);
  });

  console.log(`Found ${nonMeetings.length} non-meeting/break events in raw payload:`);
  
  nonMeetings.forEach((appt, idx) => {
    console.log(`\n#${idx + 1}: ID: ${appt.MeetingId || appt.id || appt.CalendarEventId}`);
    console.log(`  Type: ${appt.CalendarEventType}`);
    console.log(`  Title/Name: ${appt.Title}`);
    console.log(`  Start: ${appt.StartTime}`);
    console.log(`  End: ${appt.EndTime}`);
    console.log(`  EmployeeId: ${appt.EmployeeId}`);
    console.log(`  ServiceNames:`, appt.ServiceNames);
  });

} catch (err) {
  console.error('Error:', err);
}
