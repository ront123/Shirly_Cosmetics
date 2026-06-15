const fs = require('fs');
const path = require('path');

const RAW_PATH = path.join(__dirname, '../data/last-raw-payload.json');

try {
  const fileContent = fs.readFileSync(RAW_PATH, 'utf8');
  const payload = JSON.parse(fileContent);
  const rawAppts = payload.appointments || [];
  
  console.log(`Loaded ${rawAppts.length} raw appointments from intercepted network call.`);

  if (rawAppts.length > 0) {
    console.log('\n--- Object keys of first raw appointment ---');
    console.log(Object.keys(rawAppts[0]));
    
    console.log('\n--- Details of all raw appointments ---');
    rawAppts.forEach((appt, idx) => {
      // Find keys containing names, treatments, or services
      const treatmentRelated = {};
      for (const key in appt) {
        const keyLower = key.toLowerCase();
        if (keyLower.includes('treatment') || keyLower.includes('service') || keyLower.includes('subject') || keyLower.includes('title') || keyLower.includes('type') || keyLower.includes('name') || keyLower.includes('remark') || keyLower.includes('note')) {
          treatmentRelated[key] = appt[key];
        }
      }
      
      console.log(`\n#${idx + 1}: ID: ${appt.MeetingId || appt.id || appt.CalendarEventId}`);
      console.log(`  Start: ${appt.StartTime || appt.startTime || appt.Start}`);
      console.log(`  End: ${appt.EndTime || appt.endTime || appt.End}`);
      console.log(`  Customer:`, appt.Customer || appt.client || appt.customer);
      console.log(`  Employee/Therapist:`, appt.Employee || appt.employee || appt.therapist);
      console.log(`  Remarks/Notes: ${appt.Remarks || appt.remarks || appt.Notes || appt.notes}`);
      console.log(`  Treatment-related fields:`, JSON.stringify(treatmentRelated, null, 2));
    });
  }

} catch (err) {
  console.error('Error:', err);
}
