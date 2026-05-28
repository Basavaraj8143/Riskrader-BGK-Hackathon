/**
 * RiskRadar Options Page Script
 * Manages extension settings via chrome.storage.sync.
 */

const DEFAULT_SETTINGS = {
  autoScan: true,
  whatsappScan: true,
  confidenceThreshold: 50,
  notifications: true,
  overlayAlerts: true
};

// DOM Elements
const autoScanEl = document.getElementById('autoScan');
const whatsappScanEl = document.getElementById('whatsappScan');
const thresholdEl = document.getElementById('threshold');
const thresholdValueEl = document.getElementById('thresholdValue');
const notificationsEl = document.getElementById('notifications');
const overlayAlertsEl = document.getElementById('overlayAlerts');
const saveBtn = document.getElementById('saveBtn');
const resetBtn = document.getElementById('resetBtn');
const saveMsg = document.getElementById('saveMsg');

// Load existing settings
chrome.storage.sync.get(DEFAULT_SETTINGS, (settings) => {
  autoScanEl.checked = settings.autoScan;
  whatsappScanEl.checked = settings.whatsappScan;
  thresholdEl.value = settings.confidenceThreshold;
  thresholdValueEl.textContent = settings.confidenceThreshold + '%';
  notificationsEl.checked = settings.notifications;
  overlayAlertsEl.checked = settings.overlayAlerts;
});

// Live slider value update
thresholdEl.addEventListener('input', () => {
  thresholdValueEl.textContent = thresholdEl.value + '%';
});

// Save
saveBtn.addEventListener('click', () => {
  const settings = {
    autoScan: autoScanEl.checked,
    whatsappScan: whatsappScanEl.checked,
    confidenceThreshold: parseInt(thresholdEl.value),
    notifications: notificationsEl.checked,
    overlayAlerts: overlayAlertsEl.checked
  };

  chrome.storage.sync.set(settings, () => {
    saveMsg.classList.add('show');
    setTimeout(() => saveMsg.classList.remove('show'), 2500);
  });
});

// Reset
resetBtn.addEventListener('click', () => {
  chrome.storage.sync.set(DEFAULT_SETTINGS, () => {
    autoScanEl.checked = DEFAULT_SETTINGS.autoScan;
    whatsappScanEl.checked = DEFAULT_SETTINGS.whatsappScan;
    thresholdEl.value = DEFAULT_SETTINGS.confidenceThreshold;
    thresholdValueEl.textContent = DEFAULT_SETTINGS.confidenceThreshold + '%';
    notificationsEl.checked = DEFAULT_SETTINGS.notifications;
    overlayAlertsEl.checked = DEFAULT_SETTINGS.overlayAlerts;

    saveMsg.textContent = 'Settings reset to defaults!';
    saveMsg.classList.add('show');
    setTimeout(() => {
      saveMsg.classList.remove('show');
      saveMsg.textContent = 'Settings saved successfully!';
    }, 2500);
  });
});
