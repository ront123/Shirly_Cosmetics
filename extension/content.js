let cachedCustomers = null;
let lastInterceptedCustomersUrl = null;
let cachedAppointments = null;
let lastInterceptedAppointmentsUrl = null;

function remoteLog(msg) {
  console.log(`[Shirly Sync] ${msg}`);
  fetch('https://shirly-cosmetics-api.onrender.com/api/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: msg })
  }).catch(() => {});
}

// Inject the network interceptor script into the page context
try {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('inject.js');
  script.onload = function() {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(script);
  console.log("[Shirly Sync] Successfully injected network interceptor");
} catch (err) {
  console.error("[Shirly Sync] Failed to inject network interceptor:", err);
}

// Listen for messages from the injected script
window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  
  if (event.data && event.data.source === 'shirly-sync-injector') {
    if (event.data.type === 'CUSTOMERS_INTERCEPTED') {
      cachedCustomers = event.data.data;
      lastInterceptedCustomersUrl = event.data.url;
      console.log(`[Shirly Sync] Cached ${cachedCustomers.length} customers from intercepted network call: ${lastInterceptedCustomersUrl}`);
    } else if (event.data.type === 'APPOINTMENTS_INTERCEPTED') {
      if (!cachedAppointments) cachedAppointments = [];
      const incoming = event.data.data || [];
      const existingIds = new Set();
      cachedAppointments.forEach(a => {
        if (a.MeetingId) existingIds.add(String(a.MeetingId));
        if (a.CalendarEventId) existingIds.add(String(a.CalendarEventId));
        if (a.Id) existingIds.add(String(a.Id));
        if (a.id) existingIds.add(String(a.id));
        if (a._tempId) existingIds.add(String(a._tempId));
      });
      const newItems = incoming.filter(item => {
        let id = item.CalendarEventId || item.Id || item.MeetingId || item.id || item.eventId || item.EventId;
        if (!id) {
           item._tempId = `temp_${Math.random()}`;
           id = item._tempId;
        }
        id = String(id);
        if (existingIds.has(id)) return false;
        
        if (item.MeetingId) existingIds.add(String(item.MeetingId));
        if (item.CalendarEventId) existingIds.add(String(item.CalendarEventId));
        if (item.Id) existingIds.add(String(item.Id));
        if (item.id) existingIds.add(String(item.id));
        if (item._tempId) existingIds.add(String(item._tempId));
        return true;
      });
      cachedAppointments.push(...newItems);
      lastInterceptedAppointmentsUrl = event.data.url;
      console.log(`[Shirly Sync] Merged ${newItems.length} new appointments/breaks. Total cached: ${cachedAppointments.length} from: ${lastInterceptedAppointmentsUrl}`);
    }
  }
});

// Listen for requests from the extension popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "sync_customers") {
    remoteLog("Popup triggered sync action.");
    runSync()
      .then(result => {
        remoteLog(`Sync completed successfully. Sent response back to popup. Result keys: ${Object.keys(result)}`);
        sendResponse(result);
      })
      .catch(err => {
        remoteLog(`Sync failed with error: ${err.message}`);
        sendResponse({ success: false, error: err.message });
      });
    return true; // Keep message channel open for async response
  }
});

async function runSync() {
  remoteLog("runSync started.");
  let finalCustomers = [];
  let finalAppointments = [];
  let syncLogSources = [];

  // --- Step 1: Resolve Customers ---
  remoteLog("Starting customer resolution...");
  if (cachedCustomers && cachedCustomers.length > 0) {
    remoteLog(`Using cached customers (${cachedCustomers.length})`);
    finalCustomers = cachedCustomers;
    syncLogSources.push(`customers_network (${lastInterceptedCustomersUrl})`);
  } else {
    const apiCustomers = await tryRelativeFetches(getCustomerPaths());
    remoteLog(`Customer resolution completed. Found ${apiCustomers ? apiCustomers.length : 0} customers via API.`);
    if (apiCustomers && apiCustomers.length > 0) {
      finalCustomers = apiCustomers;
      syncLogSources.push('customers_api_fetch');
    } else {
      remoteLog("Falling back to DOM customer scraping...");
      const domCustomers = scrapeDOMCustomers();
      remoteLog(`Scraped ${domCustomers ? domCustomers.length : 0} customers from DOM.`);
      if (domCustomers && domCustomers.length > 0) {
        finalCustomers = domCustomers;
        syncLogSources.push('customers_dom_scraping');
      }
    }
  }

  // --- Step 2: Resolve Appointments ---
  remoteLog("Starting appointment resolution...");
  let mergedAppts = [];
  if (cachedAppointments && cachedAppointments.length > 0) {
    remoteLog(`Using cached appointments (${cachedAppointments.length})`);
    mergedAppts = [...cachedAppointments];
    syncLogSources.push(`appointments_network (${lastInterceptedAppointmentsUrl})`);
  } else {
    const apiAppointments = await tryRelativeFetches(getAppointmentPaths());
    remoteLog(`Appointment resolution completed. Found ${apiAppointments ? apiAppointments.length : 0} appointments via API.`);
    if (apiAppointments && apiAppointments.length > 0) {
      mergedAppts = apiAppointments;
      syncLogSources.push('appointments_api_fetch');
    }
  }
  
  finalAppointments = mergedAppts;
  remoteLog(`Final lists resolved. Customers: ${finalCustomers.length}, Appointments: ${finalAppointments.length}`);

  // If we found neither customers nor appointments
  if (finalCustomers.length === 0 && finalAppointments.length === 0) {
    return {
      success: false,
      error: "לא נמצאו נתוני לקוחות או פגישות לייבוא. אנא נווט לעמוד הלקוחות או ליומן הפגישות ב-Easybizy, רענן את העמוד (F5) ונסה שוב."
    };
  }

  // Return the gathered data back to the popup context
  return {
    success: true,
    customers: finalCustomers,
    appointments: finalAppointments,
    appointmentsUrl: lastInterceptedAppointmentsUrl,
    method: syncLogSources.join(' & ')
  };
}

function getCustomerPaths() {
  return [
    '/odata/Customers?$top=20000',
    '/odata/customers?$top=20000',
    '/odata/Customers',
    '/odata/customers',
    '/api/customers',
    '/api/Customers',
    '/api/v1/customers',
    '/api/clients',
    '/api/Clients',
    '/api/v1/clients',
    '/api/leads',
    '/api/v1/leads',
    '/odata/Clients',
    '/odata/clients',
    '/odata/Leads',
    '/odata/leads'
  ];
}

function getWeekRange() {
  const now = new Date();
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const dateParam = urlParams.get('date');
    if (dateParam) {
      const parts = dateParam.split('-');
      if (parts.length === 3) {
        const yr = 2000 + parseInt(parts[0]);
        const mo = parseInt(parts[1]) - 1;
        const da = parseInt(parts[2]);
        const d = new Date(yr, mo, da);
        if (!isNaN(d.getTime())) {
          now.setTime(d.getTime());
        }
      }
    }
  } catch (e) {}

  const day = now.getDay();
  const distToSat = (day + 1) % 7;
  const start = new Date(now);
  start.setDate(now.getDate() - distToSat);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 8);
  end.setHours(0, 0, 0, 0);

  const formatISO = (d) => {
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    return `${yr}-${mo}-${da}T00:00:00`;
  };

  return { start: formatISO(start), end: formatISO(end) };
}

function getAppointmentPaths() {
  const range = getWeekRange();
  
  // Format range dates without .000Z for standard OData v3 datetime naive literal
  const startStr = range.start.split('.')[0];
  const endStr = range.end.split('.')[0];

  const fV3_StartEnd = `$filter=Start ge datetime'${startStr}' and End le datetime'${endStr}'`;
  const fV3_StartEndDateTime = `$filter=StartDateTime ge datetime'${startStr}' and EndDateTime le datetime'${endStr}'`;
  
  const fV4_StartEnd = `$filter=Start ge ${startStr}Z and End le ${endStr}Z`;
  const fV4_StartEndDateTime = `$filter=StartDateTime ge ${startStr}Z and EndDateTime le ${endStr}Z`;

  const fV3_Old = `$filter=StartDateTime ge datetime'${range.start}.000Z' and EndDateTime le datetime'${range.end}.000Z'`;

  return [
    // 1. OData V3 (datetime literal format - most common in ASP.NET OData)
    `/odata/CalendarEvents?${fV3_StartEndDateTime}&$expand=Employee,Meeting($expand=Customer,Treatment)`,
    `/odata/CalendarEvents?${fV3_StartEnd}&$expand=Employee,Meeting($expand=Customer,Treatment)`,
    
    // 2. OData V4 (ISO string without datetime prefix)
    `/odata/CalendarEvents?${fV4_StartEndDateTime}&$expand=Employee,Meeting($expand=Customer,Treatment)`,
    `/odata/CalendarEvents?${fV4_StartEnd}&$expand=Employee,Meeting($expand=Customer,Treatment)`,

    // 3. Fallbacks: Old query & query without date filter
    `/odata/CalendarEvents?${fV3_Old}&$expand=Employee,Meeting($expand=Customer,Treatment)`,
    `/odata/CalendarEvents?$expand=Employee,Meeting($expand=Customer,Treatment)&$top=1500`,
    `/odata/CalendarEvents?$expand=Employee,Meeting&$top=1500`,
    `/odata/CalendarEvents?$top=1500`,

    // 4. Standard APIs
    `/api/Calendar/Meetings?start=${range.start}&end=${range.end}`,
    `/api/Calendar/Events?start=${range.start}&end=${range.end}`
  ];
}

async function tryRelativeFetches(paths) {
  const origin = window.location.origin;
  const headers = { 'Content-Type': 'application/json' };

  const authToken = findAuthToken();
  if (authToken) {
    headers['Authorization'] = authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`;
  }

  remoteLog(`tryRelativeFetches starting loop for ${paths.length} paths...`);

  for (let idx = 0; idx < paths.length; idx++) {
    const path = paths[idx];
    const url = `${origin}${path}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds to allow large payloads to load

    remoteLog(`[Path ${idx+1}/${paths.length}] Fetching ${path}...`);

    try {
      // Encode spaces manually just in case
      const fetchUrl = url.replace(/ /g, '%20');
      const res = await fetch(fetchUrl, { 
        method: 'GET', 
        headers: headers,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      remoteLog(`[Path ${idx+1}/${paths.length}] Fetch response status: ${res.status}`);

      if (res.ok) {
        const data = await res.json();
        const array = extractArray(data);
        if (array && array.length > 0) {
          remoteLog(`[Path ${idx+1}/${paths.length}] Success! Found ${array.length} items.`);
          return array; // Return immediately on first successful result
        } else {
          remoteLog(`[Path ${idx+1}/${paths.length}] Success but array is empty or null.`);
        }
      }
    } catch (e) {
      clearTimeout(timeoutId);
      remoteLog(`[Path ${idx+1}/${paths.length}] Failed: ${e.message}`);
    }
  }
  remoteLog("tryRelativeFetches completed with null (no path succeeded).");
  return null;
}


function findAuthToken() {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (/token|jwt|session|auth/i.test(key)) {
        const val = localStorage.getItem(key);
        if (val && val.length > 20) {
          try {
            const parsed = JSON.parse(val);
            if (parsed.token || parsed.accessToken || parsed.idToken) {
              return parsed.token || parsed.accessToken || parsed.idToken;
            }
          } catch {}
          return val.replace(/['"]/g, '');
        }
      }
    }
  } catch (e) {}
  return null;
}

function extractArray(data) {
  if (!data) return null;
  if (Array.isArray(data)) return data;
  if (data.value && Array.isArray(data.value)) return data.value;
  if (data.d) {
    if (Array.isArray(data.d)) return data.d;
    if (data.d.results && Array.isArray(data.d.results)) return data.d.results;
  }
  if (data.data && Array.isArray(data.data)) return data.data;
  if (data.items && Array.isArray(data.items)) return data.items;
  if (data.customers && Array.isArray(data.customers)) return data.customers;
  if (data.clients && Array.isArray(data.clients)) return data.clients;
  if (data.appointments && Array.isArray(data.appointments)) return data.appointments;
  if (data.meetings && Array.isArray(data.meetings)) return data.meetings;
  if (data.events && Array.isArray(data.events)) return data.events;
  
  for (const key in data) {
    if (Array.isArray(data[key])) {
      return data[key];
    }
  }
  return null;
}

function scrapeDOMCustomers() {
  const list = [];
  const rows = document.querySelectorAll('table tbody tr, tr, .customer-row, [class*="customer"]');
  if (!rows || rows.length === 0) return null;

  rows.forEach((row, idx) => {
    const cells = Array.from(row.querySelectorAll('td'));
    if (cells.length >= 2) {
      const nameText = cells[0].textContent.trim();
      let phoneText = '';
      let emailText = '';
      
      cells.forEach(cell => {
        const txt = cell.textContent.trim();
        if (/^0[2-9]\d{7,8}$|^05\d{8}$/.test(txt.replace(/[-\s]/g, ''))) {
          phoneText = txt.replace(/\D/g, '');
        }
        if (txt.includes('@')) {
          emailText = txt;
        }
      });

      if (nameText && nameText.length > 1 && phoneText) {
        list.push({
          id: `scraped_${idx}_${Date.now()}`,
          name: nameText,
          phone: phoneText,
          email: emailText
        });
      }
    }
  });

  return list.length > 0 ? list : null;
}
