let cachedCustomers = null;
let lastInterceptedCustomersUrl = null;
let cachedAppointments = null;
let lastInterceptedAppointmentsUrl = null;

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
      const existingIds = new Set(cachedAppointments.map(a => String(a.MeetingId || a.id || a.CalendarEventId)));
      const newItems = incoming.filter(item => {
        const id = String(item.MeetingId || item.id || item.CalendarEventId);
        return !existingIds.has(id);
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
    console.log("[Shirly Sync] Received sync request from popup");
    runSync()
      .then(result => {
        console.log("[Shirly Sync] Sync result:", result);
        sendResponse(result);
      })
      .catch(err => {
        console.error("[Shirly Sync] Sync failed with unexpected error:", err);
        sendResponse({ success: false, error: err.message });
      });
    return true; // Keep message channel open for async response
  }
});

async function runSync() {
  let finalCustomers = [];
  let finalAppointments = [];
  let syncLogSources = [];

  // --- Step 1: Resolve Customers ---
  // Try relative fetches first (to get full lists without pagination limits)
  console.log("[Shirly Sync] Attempting relative API fetches for customers...");
  const apiCustomers = await tryRelativeFetches(getCustomerPaths());
  if (apiCustomers && apiCustomers.length > 0) {
    finalCustomers = apiCustomers;
    syncLogSources.push('customers_api_fetch');
  } else if (cachedCustomers && cachedCustomers.length > 0) {
    // Fallback to intercepted data (which might be paginated)
    console.log("[Shirly Sync] API fetches failed. Using cached customer data from network interception");
    finalCustomers = cachedCustomers;
    syncLogSources.push(`customers_network (${lastInterceptedCustomersUrl})`);
  } else {
    console.log("[Shirly Sync] No cached customers or API success. Trying DOM scraping for customers...");
    const domCustomers = scrapeDOMCustomers();
    if (domCustomers && domCustomers.length > 0) {
      finalCustomers = domCustomers;
      syncLogSources.push('customers_dom_scraping');
    }
  }

  // --- Step 2: Resolve Appointments ---
  if (cachedAppointments && cachedAppointments.length > 0) {
    console.log("[Shirly Sync] Using cached appointments from network interception");
    finalAppointments = cachedAppointments;
    syncLogSources.push(`appointments_network (${lastInterceptedAppointmentsUrl})`);
  } else {
    console.log("[Shirly Sync] No cached appointments. Trying relative API fetches...");
    const apiAppointments = await tryRelativeFetches(getAppointmentPaths());
    if (apiAppointments && apiAppointments.length > 0) {
      finalAppointments = apiAppointments;
      syncLogSources.push('appointments_api_fetch');
    }
  }

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
  const filter = `$filter=Start ge ${range.start} and Start le ${range.end}`;
  return [
    `/odata/CalendarEvents?${filter}&$expand=Employee,Meeting($expand=Customer,Treatment)`,
    `/odata/CalendarEvents?${filter}&$expand=Employee,Meeting($expand=Customer)`,
    `/odata/CalendarEvents?${filter}&$expand=Employee,Meeting`,
    `/odata/CalendarEvents?${filter}`,
    `/api/Calendar/Meetings?start=${range.start}&end=${range.end}`,
    `/odata/Meetings?${filter}&$expand=CalendarEvent,Customer,Employee,Treatment`,
    `/odata/Meetings?${filter}&$expand=CalendarEvent,Customer,Employee`,
    `/odata/Meetings?${filter}`,
    '/api/appointments',
    '/api/meetings'
  ];
}

async function tryRelativeFetches(paths) {
  const origin = window.location.origin;
  const headers = { 'Content-Type': 'application/json' };

  const authToken = findAuthToken();
  if (authToken) {
    headers['Authorization'] = authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`;
  }

  for (const path of paths) {
    const url = `${origin}${path}`;
    try {
      const res = await fetch(url, { method: 'GET', headers: headers });
      if (res.ok) {
        const data = await res.json();
        const array = extractArray(data);
        if (array && array.length > 0) {
          console.log(`[Shirly Sync] Relative fetch succeeded: ${url}`);
          return array;
        }
      }
    } catch (e) {
      // ignore and continue
    }
  }
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
