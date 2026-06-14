const fs = require('fs');
const path = require('path');

const CLIENTS_PATH = path.join(__dirname, '../../frontend/src/data/clients.json');
const APPOINTMENTS_PATH = path.join(__dirname, '../../frontend/src/data/appointments.json');
const LOG_PATH = path.join(__dirname, '../data/sync-log.json');

function xlDate(serial) {
  if (!serial || typeof serial !== 'number') return '';
  return new Date((serial - 25569) * 86400 * 1000).toISOString().slice(0, 10);
}

function hueFromName(name = '') {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 360;
  return h;
}

function formatPhone(p) {
  if (!p) return '';
  const s = String(p).replace(/\D/g, '');
  if (s.length === 10) return `${s.slice(0, 3)}-${s.slice(3)}`;
  return s;
}

function parseDate(val) {
  if (!val) return '';
  if (typeof val === 'number') return xlDate(val);
  if (typeof val === 'string' && val.includes('T')) return val.slice(0, 10);
  return String(val);
}

function parseDateISO(val) {
  if (!val) return new Date().toISOString();
  try {
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d.toISOString();
  } catch (e) {}
  return new Date().toISOString();
}

function mapClient(raw, index) {
  const name = String(raw.Name || raw.name || raw.FullName || raw.fullName || '').trim();
  const phone = formatPhone(raw.MobileFirst || raw.Mobile || raw.Phone || raw.phone || raw.mobile || '');
  const lastVisit = parseDate(raw.LastVisit || raw.lastVisit || raw.LastVisitDate);
  const dob = parseDate(raw.DateOfBirth || raw.dateOfBirth || raw.BirthDate || raw.birthDate);
  const visits = parseInt(raw.NumberOfVisits || raw.Visits || raw.visits || 0, 10) || 0;
  const avgInvoice = parseFloat(raw.AvarageInvoice || raw.AverageInvoice || raw.avgInvoice || 0) || 0;
  const daysSince = lastVisit
    ? (Date.now() - new Date(lastVisit).getTime()) / (1000 * 60 * 60 * 24)
    : 9999;

  return {
    id: raw.CustomerId || raw.Id || raw.id || `ext_${Date.now()}_${index}`,
    name,
    initials: name[0] || '?',
    phone,
    email: raw.EmailAddress || raw.Email || raw.email || '',
    birthday: dob,
    lastVisit,
    nextMeeting: parseDate(raw.NextMeeting || raw.NextAppointment || raw.nextMeeting || ''),
    visits,
    avgInvoice: Math.round(avgInvoice),
    spent: '₪' + Math.round(avgInvoice * visits).toLocaleString('he-IL'),
    status: daysSince < 90 ? 'active' : 'inactive',
    hue: hueFromName(name),
    address: raw.Address || raw.address || '',
    source: raw.ArrivalSource || raw.Source || raw.source || '',
    notes: '',
    _source: 'easybizy_extension',
    _syncedAt: new Date().toISOString(),
  };
}

function mapAppointment(raw, index) {
  // 1. Client Name
  let clientName = '';
  if (raw.Customer && typeof raw.Customer === 'object') {
    clientName = `${raw.Customer.FirstName || ''} ${raw.Customer.LastName || ''}`.trim();
  }
  if (!clientName && raw.client && typeof raw.client === 'object') {
    clientName = raw.client.name || raw.client.fullName || raw.client.FullName || '';
  }
  if (!clientName) {
    clientName = raw.clientName || raw.ClientName || raw.customerName || raw.CustomerName || raw.Client || raw.client || '';
  }
  clientName = String(clientName).trim();

  // 2. Treatment Name
  let treatmentName = '';
  if (raw.Treatment && typeof raw.Treatment === 'object') {
    treatmentName = raw.Treatment.Name || raw.Treatment.Title || '';
  }
  if (!treatmentName && raw.treatment && typeof raw.treatment === 'object') {
    treatmentName = raw.treatment.name || raw.treatment.title || '';
  }
  if (!treatmentName) {
    treatmentName = raw.treatmentName || raw.TreatmentName || raw.serviceName || raw.ServiceName || raw.service || raw.treatment || '';
  }
  treatmentName = String(treatmentName).trim();

  // 3. Therapist Name
  let therapistName = '';
  if (raw.Employee && typeof raw.Employee === 'object') {
    therapistName = raw.Employee.Name || raw.Employee.FirstName || '';
  }
  if (!therapistName && raw.employee && typeof raw.employee === 'object') {
    therapistName = raw.employee.name || '';
  }
  if (!therapistName) {
    therapistName = raw.therapistName || raw.TherapistName || raw.employeeName || raw.EmployeeName || raw.employee || raw.therapist || 'שירלי';
  }
  therapistName = String(therapistName).trim();

  // 4. Start & End Times
  let start = '';
  let end = '';
  if (raw.CalendarEvent && typeof raw.CalendarEvent === 'object') {
    start = raw.CalendarEvent.Start || raw.CalendarEvent.StartTime || raw.CalendarEvent.StartDateTime || raw.CalendarEvent.start || '';
    end = raw.CalendarEvent.End || raw.CalendarEvent.EndTime || raw.CalendarEvent.EndDateTime || raw.CalendarEvent.end || '';
  }
  if (!start) {
    start = raw.startTime || raw.start_time || raw.start || raw.date || raw.dateTime || raw.datetime || raw.CreatedOn || '';
  }
  if (!end) {
    end = raw.endTime || raw.end_time || raw.end || start || '';
  }

  // Fallback: If clientName is empty but Remarks has data, use Remarks
  if (!clientName && raw.Remarks) {
    clientName = raw.Remarks.trim();
  }

  return {
    id: raw.MeetingId || raw.id || raw.AppointmentId || `appt_${Date.now()}_${index}`,
    clientName: clientName || 'לקוח לא מזוהה',
    treatmentName: treatmentName || 'טיפול כללי',
    therapistName: therapistName,
    startTime: parseDateISO(start),
    endTime: parseDateISO(end),
    status: raw.status || raw.Status || 'scheduled',
    notes: raw.notes || raw.Notes || raw.Remarks || raw.description || ''
  };
}

function loadLog() {
  try {
    return JSON.parse(fs.readFileSync(LOG_PATH, 'utf8'));
  } catch {
    return { runs: [], last_sync: null, total_synced: 0 };
  }
}

function saveLog(log) {
  try {
    const dir = path.dirname(LOG_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2));
  } catch (err) {
    console.error('Error saving log:', err);
  }
}

function loadClients() {
  try {
    return JSON.parse(fs.readFileSync(CLIENTS_PATH, 'utf8'));
  } catch {
    return [];
  }
}

function saveClients(clients) {
  try {
    const dir = path.dirname(CLIENTS_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CLIENTS_PATH, JSON.stringify(clients, null, 2));
  } catch (err) {
    console.error('Error saving clients:', err);
  }
}

function loadAppointments() {
  try {
    return JSON.parse(fs.readFileSync(APPOINTMENTS_PATH, 'utf8'));
  } catch {
    return [];
  }
}

function saveAppointments(appointments) {
  try {
    const dir = path.dirname(APPOINTMENTS_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(APPOINTMENTS_PATH, JSON.stringify(appointments, null, 2));
  } catch (err) {
    console.error('Error saving appointments:', err);
  }
}

function appendLog(entry) {
  const log = loadLog();
  log.runs.unshift({ ...entry, timestamp: new Date().toISOString() });
  log.runs = log.runs.slice(0, 50);
  log.last_sync = new Date().toISOString();
  if (entry.added) log.total_synced = (log.total_synced || 0) + entry.added;
  log.source = entry.source || 'chrome_extension';
  saveLog(log);
}

async function processExtensionSync(rawCustomers, rawAppointments) {
  const startTime = Date.now();
  console.log(`\n🔄 [Extension Sync] מתחיל עיבוד סנכרון (לקוחות: ${rawCustomers.length}, פגישות: ${rawAppointments.length})...`);

  if (rawAppointments && rawAppointments.length > 0) {
    console.log("=== RAW APPOINTMENT KEYS ===");
    console.log(Object.keys(rawAppointments[0]));
    console.log("=== RAW APPOINTMENT SAMPLE ===");
    console.log(JSON.stringify(rawAppointments[0]).slice(0, 800));
  }
  if (rawCustomers && rawCustomers.length > 0) {
    console.log("=== RAW CUSTOMER KEYS ===");
    console.log(Object.keys(rawCustomers[0]));
    console.log("=== RAW CUSTOMER SAMPLE ===");
    console.log(JSON.stringify(rawCustomers[0]).slice(0, 800));
  }

  // 1. Process Customers
  let addedCustomers = 0;
  let updatedCustomersCount = 0;
  let totalCustomers = 0;

  if (rawCustomers && rawCustomers.length > 0) {
    const existing = loadClients();
    const existingIds = new Set(existing.map(c => String(c.id)));
    const existingPhones = new Set(existing.map(c => c.phone).filter(Boolean));

    const remoteClients = rawCustomers.map(mapClient).filter(c => c.name || c.phone);

    const newClients = remoteClients.filter(c =>
      !existingIds.has(String(c.id)) && !existingPhones.has(c.phone)
    );

    const updatedExisting = existing.map(ec => {
      const remote = remoteClients.find(rc => String(rc.id) === String(ec.id) || (rc.phone && rc.phone === ec.phone));
      if (!remote) return ec;

      const updated = { ...ec };
      if (remote.lastVisit) updated.lastVisit = remote.lastVisit;
      if (remote.visits > (ec.visits || 0)) {
        updated.visits = remote.visits;
        updated.avgInvoice = remote.avgInvoice;
        updated.spent = remote.spent;
      }
      updated.status = remote.status;
      updated._syncedAt = remote._syncedAt;
      updated._source = 'easybizy_extension';
      return updated;
    });

    const mergedClients = [...newClients, ...updatedExisting];
    saveClients(mergedClients);

    addedCustomers = newClients.length;
    updatedCustomersCount = updatedExisting.filter(c => c._syncedAt === remoteClients[0]?._syncedAt).length;
    totalCustomers = mergedClients.length;
  } else {
    totalCustomers = loadClients().length;
  }

  // 2. Process Appointments
  let addedAppointments = 0;
  let totalAppointmentsCount = 0;
  if (rawAppointments && rawAppointments.length > 0) {
    const existingAppointments = loadAppointments();
    const existingApptIds = new Set(existingAppointments.map(a => String(a.id)));

    const remoteAppointments = rawAppointments.map(mapAppointment);

    const newAppointments = remoteAppointments.filter(a => !existingApptIds.has(String(a.id)));
    
    // Merge and update status of existing appointments if they matched
    const updatedExistingAppts = existingAppointments.map(ea => {
      const remote = remoteAppointments.find(ra => String(ra.id) === String(ea.id));
      if (!remote) return ea;
      return {
        ...ea,
        status: remote.status,
        notes: remote.notes || ea.notes,
        startTime: remote.startTime,
        endTime: remote.endTime
      };
    });

    const mergedAppts = [...newAppointments, ...updatedExistingAppts];
    saveAppointments(mergedAppts);
    addedAppointments = newAppointments.length;
    totalAppointmentsCount = mergedAppts.length;
  } else {
    totalAppointmentsCount = loadAppointments().length;
  }

  const duration = Date.now() - startTime;
  const result = {
    success: true,
    addedCustomers,
    updatedCustomers: updatedCustomersCount,
    totalCustomers,
    addedAppointments,
    totalAppointments: totalAppointmentsCount,
    duration,
    timestamp: new Date().toISOString(),
    source: 'chrome_extension'
  };

  appendLog({
    success: true,
    added: addedCustomers,
    total_synced: addedCustomers,
    duration,
    source: 'chrome_extension'
  });

  console.log(`✅ [Extension Sync] סנכרון הסתיים: נוספו ${addedCustomers} לקוחות, ${addedAppointments} פגישות חדשות, סה"כ ${totalAppointmentsCount} פגישות.`);
  return result;
}

module.exports = { processExtensionSync };
