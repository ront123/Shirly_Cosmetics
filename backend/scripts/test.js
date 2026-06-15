const fs = require('fs');
const path = require('path');
const code = fs.readFileSync(path.join(__dirname, 'sync-extension.js'), 'utf8');
const scriptCode = code.replace(/module\.exports = .*/, '') + `
const payload = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/last-raw-payload.json'), 'utf8'));
const ortal = payload.appointments.find(a => a.Title && a.Title.includes('אורטל מזרחי'));
console.log('MAPPED:', mapAppointment(ortal, 0));
`;
eval(scriptCode);
