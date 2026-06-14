/**
 * sync-clients.js
 * ───────────────────────────────────────────────────────────────
 * Fetches customers from Easybizy API and merges new ones into
 * frontend/src/data/clients.json
 *
 * Usage:
 *   node backend/scripts/sync-clients.js
 *
 * Requires in .env:
 *   EASYBIZY_API_KEY=...
 *   EASYBIZY_API_SECRET=...
 *   EASYBIZY_BASE_URL=https://app.easybizy.net/api  (or your tenant URL)
 */

const axios = require('axios');
const fs    = require('fs');
const path  = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

/* ─── Paths ─────────────────────────────────────────── */
const CLIENTS_PATH  = path.join(__dirname, '../../frontend/src/data/clients.json');
const LOG_PATH      = path.join(__dirname, '../data/sync-log.json');

/* ─── Helpers ────────────────────────────────────────── */
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
  // Easybizy may return ISO string or Excel serial
  if (typeof val === 'number') return xlDate(val);
  if (typeof val === 'string' && val.includes('T')) return val.slice(0, 10);
  return String(val);
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
    id:          raw.CustomerId || raw.Id || raw.id || (Date.now() + index),
    name,
    initials:    name[0] || '?',
    phone,
    email:       raw.EmailAddress || raw.Email || raw.email || raw.Emailaddress || '',
    birthday:    dob,
    lastVisit,
    nextMeeting: parseDate(raw.NextMeeting || raw.NextAppointment || raw.nextMeeting || raw.Nextmeeting || ''),
    visits,
    avgInvoice:  Math.round(avgInvoice),
    spent:       '₪' + Math.round(spentNum).toLocaleString('he-IL'),
    status:      daysSince < 90 ? 'active' : 'inactive',
    hue:         hueFromName(name),
    address:     raw.Address || raw.address || '',
    source:      raw.ArrivalSource || raw.Source || raw.source || '',
    notes:       '',
    _source:     'easybizy',
    _syncedAt:   new Date().toISOString(),
  };
}

function loadLog() {
  try { return JSON.parse(fs.readFileSync(LOG_PATH, 'utf8')); }
  catch { return { runs: [], last_sync: null, total_synced: 0 }; }
}

function saveLog(log) {
  fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2));
}

function loadClients() {
  try { return JSON.parse(fs.readFileSync(CLIENTS_PATH, 'utf8')); }
  catch { return []; }
}

function saveClients(clients) {
  fs.writeFileSync(CLIENTS_PATH, JSON.stringify(clients, null, 2));
}

/* ─── Main Sync ──────────────────────────────────────── */
async function syncClients() {
  const startTime = Date.now();
  console.log(`\n🔄  [${new Date().toLocaleString('he-IL')}] מתחיל סנכרון מ-Easybizy...`);

  const apiKey    = process.env.EASYBIZY_API_KEY;
  const apiSecret = process.env.EASYBIZY_API_SECRET;
  const baseUrl   = process.env.EASYBIZY_BASE_URL || 'https://app.easybizy.net/api';

  /* ── Validate credentials ── */
  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
    const err = 'חסרים מפתחות API — הגדר EASYBIZY_API_KEY ו-EASYBIZY_API_SECRET ב-.env';
    console.error('❌ ' + err);
    appendLog({ success: false, error: err, added: 0, duration: Date.now() - startTime });
    return { success: false, error: err, added: 0 };
  }

  const headers = {
    'x-api-key':    apiKey,
    'x-api-secret': apiSecret,
    'Content-Type': 'application/json',
  };

  /* ── Fetch from Easybizy ── */
  let remoteRaw = [];
  try {
    // Try common Easybizy customer endpoints
    const endpoints = [
      `${baseUrl}/customers`,
      `${baseUrl}/Customers`,
      `${baseUrl}/v1/customers`,
      `${baseUrl}/clients`,
    ];

    let response = null;
    for (const url of endpoints) {
      try {
        console.log(`   📡 מנסה: ${url}`);
        response = await axios.get(url, { headers, timeout: 15000 });
        if (response.data) { console.log(`   ✅ נמצא ב-${url}`); break; }
      } catch (e) {
        console.log(`   ⚠️  לא זמין: ${url} (${e.response?.status || e.code})`);
      }
    }

    if (!response) throw new Error('לא נמצא endpoint זמין ב-Easybizy API');

    // Handle various response shapes
    const data = response.data;
    if (Array.isArray(data))             remoteRaw = data;
    else if (Array.isArray(data?.data))  remoteRaw = data.data;
    else if (Array.isArray(data?.items)) remoteRaw = data.items;
    else if (Array.isArray(data?.customers)) remoteRaw = data.customers;
    else throw new Error(`תגובה לא צפויה מה-API: ${JSON.stringify(data).slice(0, 200)}`);

    console.log(`   📦 התקבלו ${remoteRaw.length} לקוחות מ-Easybizy`);
  } catch (e) {
    const err = e.response
      ? `שגיאת API ${e.response.status}: ${JSON.stringify(e.response.data).slice(0, 300)}`
      : e.message;
    console.error('❌ שגיאה בגישה ל-API:', err);
    appendLog({ success: false, error: err, added: 0, duration: Date.now() - startTime });
    return { success: false, error: err, added: 0 };
  }

  /* ── Diff: find new clients ── */
  const existing      = loadClients();
  const existingIds   = new Set(existing.map(c => String(c.id)));
  const existingPhones = new Set(existing.map(c => c.phone).filter(Boolean));

  const remoteClients = remoteRaw.map(mapClient).filter(c => c.name || c.phone);

  const newClients = remoteClients.filter(c =>
    !existingIds.has(String(c.id)) && !existingPhones.has(c.phone)
  );

  // Also update status of existing clients if their lastVisit changed
  const updatedExisting = existing.map(ec => {
    const remote = remoteClients.find(rc => String(rc.id) === String(ec.id));
    if (!remote) return ec;
    // Update lastVisit and status if changed
    if (remote.lastVisit && remote.lastVisit !== ec.lastVisit) {
      return { ...ec, lastVisit: remote.lastVisit, status: remote.status, _syncedAt: remote._syncedAt };
    }
    return ec;
  });

  const merged = [...newClients, ...updatedExisting];

  /* ── Save ── */
  saveClients(merged);

  const duration = Date.now() - startTime;
  const result = {
    success:  true,
    added:    newClients.length,
    updated:  existing.length,
    total:    merged.length,
    duration,
    timestamp: new Date().toISOString(),
  };

  appendLog(result);

  console.log(`\n✅ סנכרון הסתיים בהצלחה:`);
  console.log(`   🆕 לקוחות חדשים שנוספו: ${newClients.length}`);
  console.log(`   🔄 לקוחות קיימים עודכנו: ${existing.length}`);
  console.log(`   📊 סה"כ לקוחות: ${merged.length}`);
  console.log(`   ⏱  זמן: ${(duration / 1000).toFixed(1)}s\n`);

  return result;
}

function appendLog(entry) {
  const log = loadLog();
  log.runs.unshift({ ...entry, timestamp: new Date().toISOString() });
  log.runs = log.runs.slice(0, 50); // keep last 50 runs
  log.last_sync = new Date().toISOString();
  if (entry.added) log.total_synced = (log.total_synced || 0) + entry.added;
  saveLog(log);
}

/* ─── Run directly ─────────────────────────────────── */
if (require.main === module) {
  syncClients().catch(err => {
    console.error('❌ שגיאה לא צפויה:', err);
    process.exit(1);
  });
}

module.exports = { syncClients };
