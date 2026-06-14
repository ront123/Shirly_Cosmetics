(function() {
  console.log("[Shirly Sync Injector] Network interceptor loaded (Customers & Appointments)");

  function isCustomerData(data) {
    if (!data) return false;
    const array = extractArray(data);
    if (!array || array.length === 0) return false;

    const sample = array.slice(0, 5);
    let score = 0;
    
    for (const item of sample) {
      if (item && typeof item === 'object') {
        const keys = Object.keys(item).map(k => k.toLowerCase());
        const hasName = keys.some(k => k.includes('name') || k.includes('title') || k.includes('first') || k.includes('last'));
        const hasPhone = keys.some(k => k.includes('phone') || k.includes('mobile') || k.includes('tel'));
        const hasId = keys.some(k => k.includes('id') || k.includes('key') || k.includes('code'));
        
        if (hasName) score += 2;
        if (hasPhone) score += 2;
        if (hasId) score += 1;
      }
    }
    return (score / sample.length) >= 2;
  }

  function isAppointmentData(data) {
    if (!data) return false;
    const array = extractArray(data);
    if (!array || array.length === 0) return false;

    const sample = array.slice(0, 5);
    let score = 0;
    
    for (const item of sample) {
      if (item && typeof item === 'object') {
        const keys = Object.keys(item).map(k => k.toLowerCase());
        
        // Check for time fields (start_time, startTime, start, date, datetime)
        const hasTime = keys.some(k => k.includes('time') || k.includes('start') || k.includes('end') || k.includes('date'));
        // Check for client reference (client, customer, patient)
        const hasClient = keys.some(k => k.includes('client') || k.includes('customer') || k.includes('patient') || k.includes('user'));
        // Check for service/treatment reference (treatment, service, duration)
        const hasTreatment = keys.some(k => k.includes('treatment') || k.includes('service') || k.includes('type') || k.includes('duration'));
        
        if (hasTime) score += 2;
        if (hasClient) score += 1.5;
        if (hasTreatment) score += 1.5;
      }
    }
    return (score / sample.length) >= 2.5;
  }

  function extractArray(data) {
    if (!data) return null;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.customers)) return data.customers;
    if (Array.isArray(data.clients)) return data.clients;
    if (Array.isArray(data.appointments)) return data.appointments;
    if (Array.isArray(data.meetings)) return data.meetings;
    if (Array.isArray(data.events)) return data.events;
    
    for (const key in data) {
      if (Array.isArray(data[key])) {
        return data[key];
      }
    }
    return null;
  }

  function handleInterceptedData(url, data) {
    if (isCustomerData(data)) {
      const array = extractArray(data);
      console.log(`[Shirly Sync Injector] Intercepted ${array.length} customers from ${url}`);
      window.postMessage({
        source: 'shirly-sync-injector',
        type: 'CUSTOMERS_INTERCEPTED',
        url: url,
        data: array
      }, '*');
    } else if (isAppointmentData(data)) {
      const array = extractArray(data);
      console.log(`[Shirly Sync Injector] Intercepted ${array.length} appointments from ${url}`);
      window.postMessage({
        source: 'shirly-sync-injector',
        type: 'APPOINTMENTS_INTERCEPTED',
        url: url,
        data: array
      }, '*');
    }
  }

  // 1. Intercept window.fetch
  const originalFetch = window.fetch;
  window.fetch = async function(...args) {
    const res = await originalFetch.apply(this, args);
    try {
      const url = args[0];
      const urlString = typeof url === 'string' ? url : url.url;
      const clone = res.clone();
      clone.json().then(data => {
        handleInterceptedData(urlString, data);
      }).catch(() => {});
    } catch (e) {}
    return res;
  };

  // 2. Intercept XMLHttpRequest
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function(method, url, ...args) {
    this._url = url;
    return originalOpen.apply(this, [method, url, ...args]);
  };

  XMLHttpRequest.prototype.send = function(...args) {
    const onreadystatechange = this.onreadystatechange;
    this.onreadystatechange = function() {
      if (this.readyState === 4 && this.status === 200) {
        try {
          const contentType = this.getResponseHeader('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = JSON.parse(this.responseText);
            handleInterceptedData(this._url, data);
          }
        } catch (e) {}
      }
      if (onreadystatechange) {
        return onreadystatechange.apply(this, arguments);
      }
    };
    return originalSend.apply(this, args);
  };
})();
