const fs = require('fs');
const path = 'extension/content.js';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  `  if (cachedAppointments && cachedAppointments.length > 0) {
    console.log("[Shirly Sync] Using cached appointments from network interception");
    finalAppointments = cachedAppointments;
    syncLogSources.push(\`appointments_network (\${lastInterceptedAppointmentsUrl})\`);
  } else {
    console.log("[Shirly Sync] No cached appointments. Trying relative API fetches...");
    const apiAppointments = await tryRelativeFetches(getAppointmentPaths());
    if (apiAppointments && apiAppointments.length > 0) {
      finalAppointments = apiAppointments;
      syncLogSources.push('appointments_api_fetch');
    }
  }`,
  `  console.log("[Shirly Sync] ALWAYS trying relative API fetches to ensure we don't miss CalendarEvents (like breaks)...");
  const apiAppointments = await tryRelativeFetches(getAppointmentPaths());
  
  let mergedAppts = [];
  if (cachedAppointments && cachedAppointments.length > 0) {
    mergedAppts = [...cachedAppointments];
    syncLogSources.push(\`appointments_network (\${lastInterceptedAppointmentsUrl})\`);
  }
  
  if (apiAppointments && apiAppointments.length > 0) {
    // Merge without duplicates by ID
    const existingIds = new Set(mergedAppts.map(a => String(a.MeetingId || a.id || a.CalendarEventId || a.Id)));
    const newItems = apiAppointments.filter(item => {
      const id = String(item.MeetingId || item.id || item.CalendarEventId || item.Id);
      return !existingIds.has(id) && id !== 'undefined';
    });
    mergedAppts.push(...newItems);
    syncLogSources.push('appointments_api_fetch');
  }
  
  finalAppointments = mergedAppts;`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Patched content.js!');
