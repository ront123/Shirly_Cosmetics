const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

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
  if (typeof val === 'string') {
    // Check for MM/DD/YYYY HH:MM
    const match = val.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/);
    if (match) {
      const m = parseInt(match[1], 10);
      const d = parseInt(match[2], 10);
      const y = parseInt(match[3], 10);
      const h = parseInt(match[4], 10);
      const min = parseInt(match[5], 10);
      
      const dateObj = new Date(y, m - 1, d, h, min);
      if (!isNaN(dateObj.getTime())) {
        return dateObj.toISOString();
      }
    }
  }
  
  try {
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d.toISOString();
  } catch (e) {}
  return new Date().toISOString();
}

function mapClient(raw, index) {
  let name = String(raw.Name || raw.name || raw.FullName || raw.fullName || raw.CustomerName || raw.Customername || raw.customerName || '').trim();
  if (!name) {
    const fName = String(raw.FirstName || raw.Firstname || raw.first_name || raw.firstName || '').trim();
    const lName = String(raw.LastName || raw.Lastname || raw.last_name || raw.lastName || '').trim();
    name = `${fName} ${lName}`.trim();
  }
  const phone = formatPhone(raw.MobileFirst || raw.Mobile || raw.Phone || raw.phone || raw.mobile || raw.Mobilefirst || '');
  const lastVisit = parseDate(raw.LastVisit || raw.lastVisit || raw.LastVisitDate || raw.LastMeeting || raw.lastMeeting || '');
  const dob = parseDate(raw.DateOfBirth || raw.dateOfBirth || raw.BirthDate || raw.birthDate || raw.Birthdate || '');
  const visits = parseInt(raw.NumberOfVisits || raw.Visits || raw.visits || raw.HistoryMeetingsCount || raw.historyMeetingsCount || 0, 10) || 0;
  const spentVal = parseFloat(raw.TotalSpent || raw.totalSpent || raw.spent || raw.Spent || 0) || 0;
  let avgInvoice = parseFloat(raw.AvarageInvoice || raw.AverageInvoice || raw.avgInvoice || 0) || 0;
  if (!avgInvoice && spentVal && visits) {
    avgInvoice = spentVal / visits;
  }
  const spentNum = spentVal || Math.round(avgInvoice * visits);
  const daysSince = lastVisit
    ? (Date.now() - new Date(lastVisit).getTime()) / (1000 * 60 * 60 * 24)
    : 9999;

  return {
    id: raw.CustomerId || raw.Id || raw.id || `ext_${Date.now()}_${index}`,
    name,
    initials: name[0] || '?',
    phone,
    email: raw.EmailAddress || raw.Email || raw.email || raw.Emailaddress || '',
    birthday: dob,
    lastVisit,
    nextMeeting: parseDate(raw.NextMeeting || raw.NextAppointment || raw.nextMeeting || raw.Nextmeeting || ''),
    visits,
    avgInvoice: Math.round(avgInvoice),
    spent: '₪' + Math.round(spentNum).toLocaleString('he-IL'),
    status: daysSince < 90 ? 'active' : 'inactive',
    hue: hueFromName(name),
    address: raw.Address || raw.address || '',
    source: raw.ArrivalSource || raw.Source || raw.source || '',
    gender: raw.Gender || raw.gender || '',
    balance: parseFloat(raw.Balance || raw.balance || 0) || 0,
    notes: '',
    _source: 'easybizy_extension',
    _syncedAt: new Date().toISOString(),
  };
}

function mapAppointment(raw, index) {
  // Check if we have a nested Meeting object (common when raw is a CalendarEvent)
  const meetingRaw = raw.Meeting || raw.meeting;

  // 1. Client Name & Details (ID and Phone)
  let clientName = '';
  let clientPhone = '';
  let easybizyClientId = '';
  
  // Try getting from root level first (common in /api/Calendar/Meetings)
  if (raw.CustomerId) {
    easybizyClientId = String(raw.CustomerId);
  }
  if (raw.MobileFirst || raw.Mobile || raw.Phone || raw.phone || raw.mobile) {
    clientPhone = formatPhone(raw.MobileFirst || raw.Mobile || raw.Phone || raw.phone || raw.mobile);
  }
  if (raw.Title || raw.title) {
    clientName = String(raw.Title || raw.title).trim();
  }
  
  let customerRaw = raw.Customer || raw.client || (meetingRaw && (meetingRaw.Customer || meetingRaw.client));
  if (customerRaw && typeof customerRaw === 'object') {
    const fName = String(customerRaw.FirstName || customerRaw.Firstname || customerRaw.firstName || '').trim();
    const lName = String(customerRaw.LastName || customerRaw.Lastname || customerRaw.lastName || '').trim();
    clientName = `${fName} ${lName}`.trim();
    if (!clientName) {
      clientName = customerRaw.Name || customerRaw.name || customerRaw.FullName || customerRaw.fullName || customerRaw.CustomerName || customerRaw.Customername || customerRaw.customerName || '';
    }
    clientPhone = formatPhone(customerRaw.MobileFirst || customerRaw.Mobile || customerRaw.Phone || customerRaw.phone || customerRaw.mobile || customerRaw.Mobilefirst || '');
    easybizyClientId = String(customerRaw.CustomerId || customerRaw.Id || customerRaw.id || easybizyClientId || '');
  }
  
  if (!clientName) {
    clientName = raw.clientName || raw.ClientName || raw.customerName || raw.CustomerName || raw.customer_name || raw.client_name || raw.Client || raw.client || '';
  }
  
  const isBreak = !easybizyClientId && !raw.Customer && !raw.client && !raw.CustomerId && !raw.MobileFirst && !meetingRaw;

  // If it is a break event, use Subject/Title as clientName
  if (isBreak && !clientName) {
    clientName = raw.Subject || raw.Title || raw.subject || raw.title || 'אירוע כללי';
  }
  clientName = String(clientName).trim();

  if (!clientPhone && raw.clientPhone) {
    clientPhone = formatPhone(raw.clientPhone);
  }

  // Fallback: If clientName is empty but Remarks has data, use Remarks
  if (!clientName && raw.Remarks) {
    clientName = raw.Remarks.trim();
  }

  // 2. Treatment Name
  let treatmentName = '';
  
  // Support ServiceNames array (from /api/Calendar/Meetings)
  if (raw.ServiceNames && Array.isArray(raw.ServiceNames) && raw.ServiceNames.length > 0) {
    treatmentName = raw.ServiceNames.join(', ');
  }
  
  if (!treatmentName) {
    let treatmentRaw = raw.Treatment || raw.treatment || (meetingRaw && (meetingRaw.Treatment || meetingRaw.treatment));
    if (treatmentRaw && typeof treatmentRaw === 'object') {
      treatmentName = treatmentRaw.Name || treatmentRaw.Title || treatmentRaw.name || treatmentRaw.title || treatmentRaw.Subject || treatmentRaw.subject || '';
    }
  }
  if (!treatmentName && raw.Service && typeof raw.Service === 'object') {
    treatmentName = raw.Service.Name || raw.Service.Title || raw.Service.name || raw.Service.title || raw.Service.Subject || raw.Service.subject || '';
  }
  if (!treatmentName && raw.service && typeof raw.service === 'object') {
    treatmentName = raw.service.name || raw.service.title || raw.service.Name || raw.service.Title || raw.service.subject || raw.service.Subject || '';
  }
  if (!treatmentName && raw.CalendarEvent && typeof raw.CalendarEvent === 'object') {
    treatmentName = raw.CalendarEvent.Subject || raw.CalendarEvent.Title || raw.CalendarEvent.subject || raw.CalendarEvent.title || '';
  }
  if (!treatmentName) {
    treatmentName = raw.treatmentName || raw.TreatmentName || raw.serviceName || raw.ServiceName || raw.service || raw.treatment || raw.Subject || raw.subject || '';
  }

  // Fallback: if treatmentName is empty or equals "טיפול כללי", check if we have a short remark/note/description
  if (!treatmentName || treatmentName === 'טיפול כללי') {
    const noteVal = String(raw.Remarks || raw.notes || raw.Notes || raw.description || '').trim();
    if (noteVal && noteVal.length > 0 && noteVal.length < 50) {
      treatmentName = noteVal;
    }
  }
  
  // If it's a break event, use the subject/title as treatmentName
  if (isBreak && (!treatmentName || treatmentName === 'טיפול כללי')) {
    treatmentName = raw.Subject || raw.Title || raw.subject || raw.title || 'אירוע כללי';
  }

  treatmentName = treatmentName || 'טיפול כללי';
  treatmentName = String(treatmentName).trim();

  // 3. Therapist Name
  let therapistName = '';
  
  // Map EmployeeId from /api/Calendar/Meetings
  if (raw.EmployeeId === 1) {
    therapistName = 'שירלי';
  } else if (raw.EmployeeId === 8) {
    therapistName = 'לורה';
  }
  
  if (!therapistName && raw.Employee && typeof raw.Employee === 'object') {
    therapistName = raw.Employee.Name || raw.Employee.FirstName || '';
  }
  if (!therapistName && raw.employee && typeof raw.employee === 'object') {
    therapistName = raw.employee.name || '';
  }
  if (!therapistName && meetingRaw && meetingRaw.Employee && typeof meetingRaw.Employee === 'object') {
    therapistName = meetingRaw.Employee.Name || meetingRaw.Employee.FirstName || '';
  }
  if (!therapistName && meetingRaw && meetingRaw.employee && typeof meetingRaw.employee === 'object') {
    therapistName = meetingRaw.employee.name || '';
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
  if (!start && meetingRaw) {
    start = meetingRaw.startTime || meetingRaw.start_time || meetingRaw.start || '';
    end = meetingRaw.endTime || meetingRaw.end_time || meetingRaw.end || '';
  }
  if (!start) {
    start = raw.StartTime || raw.Start || raw.start || raw.startTime || raw.start_time || raw.date || raw.dateTime || raw.datetime || raw.CreatedOn || '';
  }
  if (!end) {
    end = raw.EndTime || raw.End || raw.end || raw.endTime || raw.end_time || start || '';
  }

  return {
    id: raw.MeetingId || raw.id || raw.AppointmentId || `appt_${Date.now()}_${index}`,
    clientId: easybizyClientId,
    clientName: clientName || 'לקוח לא מזוהה',
    clientPhone: clientPhone,
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

async function syncToPostgres(rawCustomers, rawAppointments, syncedDatesArray = null) {
  console.log('🔌 [Postgres Sync] מתחיל סנכרון לבסיס הנתונים...');
  
  // --- 1. PRE-LOAD MAPS FOR THERAPISTS & TREATMENTS ---
  const treatmentTypesRes = await pool.query('SELECT id, name FROM treatment_types');
  const treatmentMap = new Map(treatmentTypesRes.rows.map(r => [r.name.trim(), r.id]));
  
  const usersRes = await pool.query('SELECT id, name FROM users');
  const userMap = new Map(usersRes.rows.map(r => [r.name.trim(), r.id]));

  const ensureTreatment = async (name) => {
    if (!name) name = 'טיפול כללי';
    name = name.trim();
    if (treatmentMap.has(name)) return treatmentMap.get(name);
    const insertRes = await pool.query(
      'INSERT INTO treatment_types (name, duration_minutes, price, color_code) VALUES ($1, $2, $3, $4) RETURNING id',
      [name, 60, 0, '#6366f1']
    );
    const id = insertRes.rows[0].id;
    treatmentMap.set(name, id);
    return id;
  };

  const ensureTherapist = async (name) => {
    if (!name) name = 'שירלי';
    name = name.trim();
    if (userMap.has(name)) return userMap.get(name);
    const email = `${name.toLowerCase().replace(/\s+/g, '')}_ext@shirlycosmetics.com`;
    const insertRes = await pool.query(
      `INSERT INTO users (name, email, password_hash, role) 
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [name, email, 'hashed_placeholder', 'therapist']
    );
    const id = insertRes.rows[0].id;
    userMap.set(name, id);
    return id;
  };

  await ensureTreatment('טיפול כללי');
  await ensureTherapist('שירלי');

  // --- 2. SYNC CLIENTS ---
  console.log('👤 [Postgres Sync] מסנכרן לקוחות...');
  const dbClientsRes = await pool.query('SELECT id, phone_number, easybizy_id FROM clients');
  const clientByEasybizyId = new Map();
  const clientByPhone = new Map();
  dbClientsRes.rows.forEach(r => {
    if (r.easybizy_id) clientByEasybizyId.set(String(r.easybizy_id), r.id);
    if (r.phone_number) clientByPhone.set(r.phone_number, r.id);
  });

  const clientsToInsert = [];
  const clientsToUpdate = [];

  rawCustomers.forEach((raw, idx) => {
    let name = String(raw.Name || raw.name || raw.FullName || raw.fullName || raw.CustomerName || raw.Customername || raw.customerName || '').trim();
    if (!name) {
      const fName = String(raw.FirstName || raw.Firstname || raw.first_name || raw.firstName || '').trim();
      const lName = String(raw.LastName || raw.Lastname || raw.last_name || raw.lastName || '').trim();
      name = `${fName} ${lName}`.trim();
    }
    const phone = formatPhone(raw.MobileFirst || raw.Mobile || raw.Phone || raw.phone || raw.mobile || raw.Mobilefirst || '');
    if (!name && !phone) return;

    const email = raw.EmailAddress || raw.Email || raw.email || raw.Emailaddress || '';
    const lastVisitStr = parseDate(raw.LastVisit || raw.lastVisit || raw.LastVisitDate || raw.LastMeeting || raw.lastMeeting || '');
    const lastVisit = lastVisitStr ? new Date(lastVisitStr) : null;
    const dobStr = parseDate(raw.DateOfBirth || raw.dateOfBirth || raw.BirthDate || raw.birthDate || raw.Birthdate || '');
    const dob = dobStr ? new Date(dobStr) : null;
    const visits = parseInt(raw.NumberOfVisits || raw.Visits || raw.visits || raw.HistoryMeetingsCount || raw.historyMeetingsCount || 0, 10) || 0;
    const spentVal = parseFloat(raw.TotalSpent || raw.totalSpent || raw.spent || raw.Spent || 0) || 0;
    let avgInvoice = parseFloat(raw.AvarageInvoice || raw.AverageInvoice || raw.avgInvoice || 0) || 0;
    if (!avgInvoice && spentVal && visits) {
      avgInvoice = spentVal / visits;
    }
    const easybizyId = String(raw.CustomerId || raw.Id || raw.id || '');
    const address = raw.Address || raw.address || '';
    const source = raw.ArrivalSource || raw.Source || raw.source || '';
    const gender = raw.Gender || raw.gender || '';
    const balance = parseFloat(raw.Balance || raw.balance || 0) || 0;

    const nameParts = name.split(/\s+/);
    const firstName = raw.FirstName || raw.Firstname || nameParts[0] || 'לקוח';
    const lastName = raw.LastName || raw.Lastname || nameParts.slice(1).join(' ') || 'לא-מזוהה';

    let existingId = null;
    if (easybizyId && clientByEasybizyId.has(easybizyId)) {
      existingId = clientByEasybizyId.get(easybizyId);
    } else if (phone && clientByPhone.has(phone)) {
      existingId = clientByPhone.get(phone);
    }

    const clientObj = {
      firstName,
      lastName,
      phone: phone || `placeholder_${Date.now()}_${idx}`,
      email,
      lastVisit,
      dob,
      visits,
      avgInvoice,
      easybizyId,
      address,
      source,
      gender,
      balance
    };

    if (existingId) {
      clientsToUpdate.push({ id: existingId, ...clientObj });
    } else {
      clientsToInsert.push(clientObj);
    }
  });

  if (clientsToInsert.length > 0) {
    const BATCH_SIZE = 500;
    for (let i = 0; i < clientsToInsert.length; i += BATCH_SIZE) {
      const batch = clientsToInsert.slice(i, i + BATCH_SIZE);
      const values = [];
      const placeholders = [];
      batch.forEach((c, idx) => {
        const base = idx * 13;
        placeholders.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9}, $${base + 10}, $${base + 11}, $${base + 12}, $${base + 13})`);
        values.push(c.firstName, c.lastName, c.phone, c.email, c.lastVisit, c.dob, c.visits, c.avgInvoice, c.easybizyId, c.address, c.source, c.gender, c.balance);
      });
      const query = `
        INSERT INTO clients (first_name, last_name, phone_number, email, last_visit_date, date_of_birth, visits, avg_invoice, easybizy_id, address, source, gender, balance)
        VALUES ${placeholders.join(', ')}
        RETURNING id, phone_number, easybizy_id
      `;
      const res = await pool.query(query, values);
      res.rows.forEach(r => {
        if (r.phone_number) clientByPhone.set(r.phone_number, r.id);
        if (r.easybizy_id) clientByEasybizyId.set(String(r.easybizy_id), r.id);
      });
    }
    console.log(`Inserted ${clientsToInsert.length} new clients to PostgreSQL.`);
  }

  if (clientsToUpdate.length > 0) {
    const BATCH_SIZE = 50;
    for (let i = 0; i < clientsToUpdate.length; i += BATCH_SIZE) {
      const batch = clientsToUpdate.slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map(c => 
        pool.query(
          `UPDATE clients 
           SET first_name = $1, last_name = $2, phone_number = $3, email = $4, last_visit_date = $5, 
               date_of_birth = $6, visits = $7, avg_invoice = $8, easybizy_id = $9, address = $10, source = $11,
               gender = $12, balance = $13
           WHERE id = $14`,
          [c.firstName, c.lastName, c.phone, c.email, c.lastVisit, c.dob, c.visits, c.avgInvoice, c.easybizyId, c.address, c.source, c.gender, c.balance, c.id]
        )
      ));
    }
    console.log(`Updated ${clientsToUpdate.length} existing clients in PostgreSQL.`);
  }

  // --- 3. SYNC APPOINTMENTS ---
  console.log('📅 [Postgres Sync] מסנכרן פגישות...');
  const dbApptsRes = await pool.query('SELECT id, easybizy_id, client_id, start_time, status, notes, title FROM appointments');
  const apptByEasybizyId = new Map();
  const apptByClientTime = new Map();
  dbApptsRes.rows.forEach(r => {
    if (r.easybizy_id) apptByEasybizyId.set(String(r.easybizy_id), r);
    const key = `${r.client_id}_${new Date(r.start_time).getTime()}`;
    apptByClientTime.set(key, r);
  });

  const apptsToInsert = [];
  const apptsToUpdate = [];

  for (let idx = 0; idx < rawAppointments.length; idx++) {
    const raw = rawAppointments[idx];
    const mapped = mapAppointment(raw, idx);

    // Identify if it's a break event
    const isBreakEvent = (mapped.clientName && ['הפסקה', 'ארוחה', 'ארוחת', 'חסום', 'חסימה', 'break', 'block', 'lunch', 'נעול', 'נעילה'].some(kw => mapped.clientName.includes(kw))) || (!raw.Customer && !raw.client && !raw.CustomerId && !raw.id_customer && !raw.Meeting && !raw.meeting);

    let clientId = null;
    
    if (!isBreakEvent) {
      let customerRaw = raw.Customer || raw.client || (raw.Meeting && (raw.Meeting.Customer || raw.Meeting.client));
      if (customerRaw && typeof customerRaw === 'object') {
        const cPhone = formatPhone(customerRaw.MobileFirst || customerRaw.Mobile || customerRaw.Phone || customerRaw.phone || '');
        const cEasybizyId = String(customerRaw.CustomerId || customerRaw.Id || customerRaw.id || '');
        if (cEasybizyId && clientByEasybizyId.has(cEasybizyId)) {
          clientId = clientByEasybizyId.get(cEasybizyId);
        } else if (cPhone && clientByPhone.has(cPhone)) {
          clientId = clientByPhone.get(cPhone);
        }
      }

      if (!clientId && mapped.clientName) {
        const nameParts = mapped.clientName.split(/\s+/);
        const firstName = nameParts[0] || 'לקוח';
        const lastName = nameParts.slice(1).join(' ') || 'לא-מזוהה';
        
        const matchRes = await pool.query(
          'SELECT id FROM clients WHERE first_name = $1 AND last_name = $2 LIMIT 1',
          [firstName, lastName]
        );
        if (matchRes.rows.length > 0) {
          clientId = matchRes.rows[0].id;
        } else {
          const insertClientRes = await pool.query(
            `INSERT INTO clients (first_name, last_name, phone_number) 
             VALUES ($1, $2, $3) RETURNING id`,
            [firstName, lastName, `placeholder_${Date.now()}_${idx}`]
          );
          clientId = insertClientRes.rows[0].id;
          clientByPhone.set(`placeholder_${Date.now()}_${idx}`, clientId);
        }
      }

      if (!clientId) continue; // Non-break appointments must have a client
    }

    const therapistId = await ensureTherapist(mapped.therapistName);
    const treatmentId = await ensureTreatment(mapped.treatmentName);

    const easybizyId = String(mapped.id);
    const startTime = new Date(mapped.startTime);
    const endTime = new Date(mapped.endTime);
    
    let status = 'scheduled';
    if (mapped.status) {
      const s = String(mapped.status).toLowerCase();
      if (s.includes('cancel') || s.includes('ביטול') || s.includes('מבוטל')) status = 'cancelled';
      else if (s.includes('complete') || s.includes('בוצע') || s.includes('סיום')) status = 'completed';
      else if (s.includes('no_show') || s.includes('לא הגיע')) status = 'no_show';
    }
    const notes = mapped.notes || '';
    const title = isBreakEvent ? mapped.clientName : '';

    let existingAppt = null;
    if (easybizyId && !easybizyId.startsWith('appt_') && apptByEasybizyId.has(easybizyId)) {
      existingAppt = apptByEasybizyId.get(easybizyId);
    } else {
      const key = `${clientId}_${startTime.getTime()}`;
      if (apptByClientTime.has(key)) {
        existingAppt = apptByClientTime.get(key);
      }
    }

    const apptObj = {
      clientId,
      therapistId,
      treatmentId,
      startTime,
      endTime,
      status,
      notes,
      easybizyId,
      title
    };

    if (existingAppt) {
      const changed = 
        existingAppt.status !== status || 
        existingAppt.notes !== notes || 
        existingAppt.title !== title ||
        existingAppt.treatment_id !== treatmentId ||
        existingAppt.therapist_id !== therapistId ||
        new Date(existingAppt.start_time).getTime() !== startTime.getTime() ||
        new Date(existingAppt.end_time).getTime() !== endTime.getTime();
      
      if (changed) {
        apptsToUpdate.push({ id: existingAppt.id, ...apptObj });
      }
    } else {
      apptsToInsert.push(apptObj);
    }
  }

  if (apptsToInsert.length > 0) {
    const BATCH_SIZE = 500;
    for (let i = 0; i < apptsToInsert.length; i += BATCH_SIZE) {
      const batch = apptsToInsert.slice(i, i + BATCH_SIZE);
      const values = [];
      const placeholders = [];
      batch.forEach((a, idx) => {
        const base = idx * 9;
        placeholders.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9})`);
        values.push(a.clientId, a.therapistId, a.treatmentId, a.startTime, a.endTime, a.status, a.notes, a.easybizyId, a.title);
      });
      const query = `
        INSERT INTO appointments (client_id, therapist_id, treatment_id, start_time, end_time, status, notes, easybizy_id, title)
        VALUES ${placeholders.join(', ')}
      `;
      await pool.query(query, values);
    }
    console.log(`Inserted ${apptsToInsert.length} new appointments to PostgreSQL.`);
  }

  if (apptsToUpdate.length > 0) {
    const BATCH_SIZE = 50;
    for (let i = 0; i < apptsToUpdate.length; i += BATCH_SIZE) {
      const batch = apptsToUpdate.slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map(a => 
        pool.query(
          `UPDATE appointments 
           SET client_id = $1, therapist_id = $2, treatment_id = $3, start_time = $4, end_time = $5, status = $6, notes = $7, easybizy_id = $8, title = $9
           WHERE id = $10`,
          [a.clientId, a.therapistId, a.treatmentId, a.startTime, a.endTime, a.status, a.notes, a.easybizyId, a.title, a.id]
        )
      ));
    }
    console.log(`Updated ${apptsToUpdate.length} appointments in PostgreSQL.`);
  }

  // --- 4. CLEANUP DRIFT APPOINTMENTS ---
  const mappedAppts = rawAppointments.map((raw, idx) => mapAppointment(raw, idx));
  const remoteApptIds = mappedAppts.map(a => String(a.id)).filter(Boolean);
  const syncedDates = syncedDatesArray || [...new Set(mappedAppts.map(a => a.startTime.slice(0, 10)).filter(Boolean))];

  if (syncedDates.length > 0) {
    console.log('🧹 [Postgres Sync] מנקה פגישות שנמחקו או הוזזו בימים המסונכרנים...');
    for (const dateStr of syncedDates) {
      const startOfDay = `${dateStr} 00:00:00`;
      const endOfDay = `${dateStr} 23:59:59`;
      
      if (remoteApptIds.length > 0) {
        await pool.query(
          `DELETE FROM appointments 
           WHERE start_time >= $1 AND start_time <= $2 
           AND easybizy_id IS NOT NULL
           AND easybizy_id NOT IN (${remoteApptIds.map((_, i) => `$${i + 3}`).join(', ')})`,
          [startOfDay, endOfDay, ...remoteApptIds]
        );
      } else {
        await pool.query(
          `DELETE FROM appointments 
           WHERE start_time >= $1 AND start_time <= $2
           AND easybizy_id IS NOT NULL`,
          [startOfDay, endOfDay]
        );
      }
    }
  }

  console.log('✅ [Postgres Sync] הסנכרון לבסיס הנתונים הושלם בהצלחה.');
}

function getDatesFromUrl(url) {
  if (!url) return [];
  try {
    const qIndex = url.indexOf('?');
    if (qIndex === -1) return [];
    const queryString = url.slice(qIndex + 1);
    
    const params = {};
    queryString.split('&').forEach(part => {
      const [key, val] = part.split('=');
      if (key && val) {
        params[key.toLowerCase()] = decodeURIComponent(val);
      }
    });

    const startStr = params.start;
    const endStr = params.end;
    if (!startStr || !endStr) return [];

    const startDate = new Date(startStr);
    const endDate = new Date(endStr);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return [];

    const dates = [];
    const curr = new Date(startDate);
    while (curr <= endDate) {
      const yr = curr.getFullYear();
      const mo = String(curr.getMonth() + 1).padStart(2, '0');
      const da = String(curr.getDate()).padStart(2, '0');
      dates.push(`${yr}-${mo}-${da}`);
      curr.setDate(curr.getDate() + 1);
    }
    return dates;
  } catch (err) {
    console.error('Error parsing dates from url:', err);
    return [];
  }
}

async function processExtensionSync(rawCustomers, rawAppointments, appointmentsUrl = null) {
  const startTime = Date.now();
  console.log(`\n🔄 [Extension Sync] מתחיל עיבוד סנכרון (לקוחות: ${rawCustomers.length}, פגישות: ${rawAppointments.length})...`);

  // 1. Process Customers (Static fallback writing)
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
      if (remote.name) {
        updated.name = remote.name;
        updated.initials = remote.initials || remote.name[0] || '?';
        updated.hue = remote.hue;
      }
      if (remote.phone) updated.phone = remote.phone;
      if (remote.email) updated.email = remote.email;
      if (remote.birthday) updated.birthday = remote.birthday;
      if (remote.lastVisit) updated.lastVisit = remote.lastVisit;
      if (remote.nextMeeting) updated.nextMeeting = remote.nextMeeting;
      if (remote.address) updated.address = remote.address;
      if (remote.source) updated.source = remote.source;
      if (remote.gender) updated.gender = remote.gender;
      if (remote.balance !== undefined) updated.balance = remote.balance;
      
      if (remote.visits >= (ec.visits || 0)) {
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

  // 2. Process Appointments (Static fallback writing)
  let addedAppointments = 0;
  let totalAppointmentsCount = 0;
  let syncedDates = new Set();
  if (rawAppointments && rawAppointments.length > 0) {
    const existingAppointments = loadAppointments();
    const remoteAppointments = rawAppointments.map(mapAppointment);
    const remoteApptIds = new Set(remoteAppointments.map(a => String(a.id)));
    syncedDates = new Set(remoteAppointments.map(a => a.startTime.slice(0, 10)).filter(Boolean));
    if (appointmentsUrl) {
      const urlDates = getDatesFromUrl(appointmentsUrl);
      urlDates.forEach(d => syncedDates.add(d));
    }

    // Filter existing appointments: keep them if they are NOT on the synced dates,
    // OR if they are on the synced dates and are present in the new remote list.
    const cleanedExistingAppts = existingAppointments.filter(ea => {
      const dateStr = ea.startTime ? ea.startTime.slice(0, 10) : '';
      if (syncedDates.has(dateStr)) {
        return remoteApptIds.has(String(ea.id));
      }
      return true;
    }).map(ea => {
      // Self-heal: if treatmentName equals clientName, fix it
      if (ea.treatmentName && ea.clientName && ea.treatmentName.trim() === ea.clientName.trim()) {
        ea.treatmentName = (ea.notes && ea.notes.length > 0 && ea.notes.length < 50) ? ea.notes : 'טיפול כללי';
      }
      return ea;
    });

    const cleanedApptIds = new Set(cleanedExistingAppts.map(x => String(x.id)));
    const newAppointments = remoteAppointments.filter(a => !cleanedApptIds.has(String(a.id)));
    
    const updatedExistingAppts = cleanedExistingAppts.map(ea => {
      const remote = remoteAppointments.find(ra => String(ra.id) === String(ea.id));
      if (!remote) return ea;
      
      // Resolve treatment name, prioritizing remote non-general treatments, then notes, then existing treatment
      let resolvedTreatment = 'טיפול כללי';
      if (remote.treatmentName && remote.treatmentName !== 'טיפול כללי') {
        resolvedTreatment = remote.treatmentName;
      } else {
        const noteText = remote.notes || ea.notes || '';
        if (noteText && noteText.length > 0 && noteText.length < 50) {
          resolvedTreatment = noteText;
        } else {
          resolvedTreatment = ea.treatmentName || 'טיפול כללי';
        }
      }

      return {
        ...ea,
        clientId: remote.clientId || ea.clientId || '',
        clientName: remote.clientName || ea.clientName || '',
        clientPhone: remote.clientPhone || ea.clientPhone || '',
        treatmentName: resolvedTreatment,
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

  // 3. PostgreSQL Database Sync (Graceful Try-Catch)
  try {
    const syncedDatesArray = rawAppointments && rawAppointments.length > 0 ? [...syncedDates] : null;
    await syncToPostgres(rawCustomers, rawAppointments, syncedDatesArray);
  } catch (dbErr) {
    console.warn('⚠️ [Postgres Sync] סנכרון לבסיס הנתונים נכשל (ישתמש בגיבוי ה-JSON):', dbErr.message);
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
