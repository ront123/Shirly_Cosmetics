const fs = require('fs');
const path = require('path');

const RAW_PATH = path.join(__dirname, '../data/last-raw-payload.json');

try {
  const fileContent = fs.readFileSync(RAW_PATH, 'utf8');
  const payload = JSON.parse(fileContent);
  const rawAppts = payload.appointments || [];
  
  const employees = new Map();
  
  rawAppts.forEach(appt => {
    const empId = appt.EmployeeId;
    if (empId !== undefined && empId !== null) {
      if (!employees.has(empId)) {
        employees.set(empId, { count: 0, names: new Set() });
      }
      const info = employees.get(empId);
      info.count++;
      
      // Look for any name fields in this object that could identify the employee
      if (appt.Employee && typeof appt.Employee === 'object') {
        const name = `${appt.Employee.FirstName || ''} ${appt.Employee.LastName || ''}`.trim();
        if (name) info.names.add(name);
      }
      if (appt.EmployeeName) info.names.add(appt.EmployeeName);
    }
  });

  console.log('--- INTERCEPTED EMPLOYEES ---');
  employees.forEach((info, id) => {
    console.log(`EmployeeId: ${id}`);
    console.log(`  Occurrences: ${info.count}`);
    console.log(`  Detected Names:`, Array.from(info.names));
  });

} catch (err) {
  console.error('Error:', err);
}
