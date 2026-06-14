document.addEventListener('DOMContentLoaded', async () => {
  const syncBtn = document.getElementById('sync-btn');
  const btnSpinner = document.getElementById('btn-spinner');
  const btnText = document.getElementById('btn-text');
  const successMsg = document.getElementById('success-message');
  const errorMsg = document.getElementById('error-message');
  const connStatus = document.getElementById('connection-status');

  let activeTab = null;

  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    activeTab = tabs[0];

    const isEasybizy = activeTab && activeTab.url && activeTab.url.includes('easybizy.net');

    if (isEasybizy) {
      connStatus.textContent = "מחובר לאתר Easybizy ✅";
      connStatus.style.color = "var(--green)";
      syncBtn.disabled = false;
    } else {
      connStatus.textContent = "אנא עורר לשונית Easybizy ⚠️";
      connStatus.style.color = "var(--amber)";
      syncBtn.disabled = true;
    }
  } catch (err) {
    connStatus.textContent = "שגיאה בבדיקת הלשונית";
    connStatus.style.color = "var(--red)";
  }

  syncBtn.addEventListener('click', async () => {
    if (!activeTab) return;

    successMsg.style.display = 'none';
    errorMsg.style.display = 'none';

    btnSpinner.style.display = 'inline-block';
    btnText.textContent = 'מסנכרן לקוחות ופגישות...';
    syncBtn.disabled = true;

    try {
      chrome.tabs.sendMessage(activeTab.id, { action: "sync_customers" }, (response) => {
        btnSpinner.style.display = 'none';
        btnText.textContent = 'סנכרן לקוחות עכשיו';
        syncBtn.disabled = false;

        if (chrome.runtime.lastError) {
          console.error("Communication error:", chrome.runtime.lastError);
          showError("לא ניתן לתקשר עם עמוד איזי ביזי. אנא רענן את העמוד ונסה שוב.");
          return;
        }

        if (response && response.success) {
          showSuccess(response.data);
        } else {
          showError(response ? response.error : "שגיאה לא ידועה בתהליך הסנכרון.");
        }
      });
    } catch (err) {
      btnSpinner.style.display = 'none';
      btnText.textContent = 'סנכרן לקוחות עכשיו';
      syncBtn.disabled = false;
      showError(err.message);
    }
  });

  function showSuccess(data) {
    successMsg.innerHTML = `
      <strong>סנכרון הושלם בהצלחה! 🎉</strong><br>
      • לקוחות חדשים: ${data.addedCustomers || 0}<br>
      • לקוחות שעודכנו: ${data.updatedCustomers || 0}<br>
      • תורים חדשים שיובאו: ${data.addedAppointments || 0}<br>
      • סה"כ לקוחות במערכת: ${data.totalCustomers || 0}<br>
      • סה"כ תורים במערכת: ${data.totalAppointments || 0}
    `;
    successMsg.style.display = 'block';
  }

  function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.style.display = 'block';
  }
});
