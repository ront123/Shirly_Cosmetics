const fs = require('fs');
const code = fs.readFileSync('backend/scripts/sync-extension.js', 'utf8');
const scriptCode = code.replace(/module\.exports = .*/, '') + `
const payload = JSON.parse(fs.readFileSync('backend/data/last-raw-payload.json', 'utf8'));
const ortal = payload.appointments.find(a => a.Title && a.Title.includes('אורטל מזרחי'));
console.log('ORTAL RAW:', JSON.stringify(ortal, null, 2));
console.log('MAPPED:', mapAppointment(ortal, 0));
`;
eval(scriptCode);
