const fs = require('fs');
const path = require('path');

const RAW_PATH = path.join(__dirname, '../data/last-raw-payload.json');

try {
  const fileContent = fs.readFileSync(RAW_PATH, 'utf8');
  const payload = JSON.parse(fileContent);
  const rawAppts = payload.appointments || [];
  
  console.log(`Loaded ${rawAppts.length} appointments.`);

  // 1. Let's find appointments that have a non-null TreatmentId
  const withTreatmentId = rawAppts.filter(a => a.TreatmentId !== null && a.TreatmentId !== undefined);
  console.log(`Appointments with non-null TreatmentId: ${withTreatmentId.length}`);

  // 2. Let's find appointments that contain any key like "treatment" or "service" (case-insensitive)
  let withTreatmentKeyCount = 0;
  let sampleTreatmentKey = null;
  
  let withServiceKeyCount = 0;
  let sampleServiceKey = null;

  for (const appt of rawAppts) {
    const keys = Object.keys(appt).map(k => k.toLowerCase());
    
    const hasTreatment = keys.some(k => k.includes('treatment') && appt[Object.keys(appt).find(x => x.toLowerCase() === k)] !== null);
    if (hasTreatment) {
      withTreatmentKeyCount++;
      if (!sampleTreatmentKey) {
        const key = Object.keys(appt).find(x => x.toLowerCase().includes('treatment'));
        sampleTreatmentKey = { key, value: appt[key] };
      }
    }

    const hasService = keys.some(k => k.includes('service') && appt[Object.keys(appt).find(x => x.toLowerCase() === k)] !== null);
    if (hasService) {
      withServiceKeyCount++;
      if (!sampleServiceKey) {
        const key = Object.keys(appt).find(x => x.toLowerCase().includes('service'));
        sampleServiceKey = { key, value: appt[key] };
      }
    }
  }

  console.log(`Appointments with any non-null Treatment-related key: ${withTreatmentKeyCount}`);
  if (sampleTreatmentKey) {
    console.log(`Sample Treatment key/value:`, JSON.stringify(sampleTreatmentKey, null, 2));
  }

  console.log(`Appointments with any non-null Service-related key: ${withServiceKeyCount}`);
  if (sampleServiceKey) {
    console.log(`Sample Service key/value:`, JSON.stringify(sampleServiceKey, null, 2));
  }

  // 3. Print a sample appointment that has a TreatmentId
  if (withTreatmentId.length > 0) {
    console.log(`\n--- Sample Appointment with TreatmentId ---`);
    console.log(JSON.stringify(withTreatmentId[0], null, 2));
  }

} catch (err) {
  console.error('Error:', err);
}
