const fs = require('fs');
const path = require('path');

const RAW_PATH = path.join(__dirname, '../data/last-raw-payload.json');

try {
  const fileContent = fs.readFileSync(RAW_PATH, 'utf8');
  const payload = JSON.parse(fileContent);
  const rawAppts = payload.appointments || [];
  
  console.log(`Analyzing ${rawAppts.length} raw appointments...`);
  
  const types = new Set();
  const states = new Set();
  const titles = [];

  rawAppts.forEach(a => {
    types.add(a.CalendarEventType);
    states.add(a.MeetingState);
    titles.push({
      id: a.MeetingId || a.id || a.CalendarEventId,
      title: a.Title,
      type: a.CalendarEventType,
      start: a.StartTime,
      end: a.EndTime,
      employeeId: a.EmployeeId
    });
  });

  console.log('\nUnique CalendarEventTypes:', Array.from(types));
  console.log('Unique MeetingStates:', Array.from(states));
  
  console.log('\nList of all 40 items:');
  titles.forEach((t, i) => {
    console.log(`${i+1}. ID: ${t.id}, Type: ${t.type}, Title: "${t.title}", Time: ${t.start}, EmployeeId: ${t.employeeId}`);
  });

} catch (err) {
  console.error('Error:', err);
}
