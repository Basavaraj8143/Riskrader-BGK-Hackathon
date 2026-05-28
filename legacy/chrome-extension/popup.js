/**
 * RiskRadar Popup Script
 * Handles manual scanning, stats display, and settings navigation.
 */

// ─── DOM Elements ───
const statTotal = document.getElementById('stat-total');
const statSafe = document.getElementById('stat-safe');
const statDangerous = document.getElementById('stat-dangerous');
const scanInput = document.getElementById('scanInput');
const scanBtn = document.getElementById('scanBtn');
const scanResult = document.getElementById('scanResult');
const scanPageBtn = document.getElementById('scanPageBtn');
const settingsBtn = document.getElementById('settingsBtn');
const statusBar = document.getElementById('statusBar');
const statusText = document.getElementById('statusText');

// ─── Load Stats from Content Script ───
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (tabs[0]) {
    chrome.tabs.sendMessage(tabs[0].id, { action: "getStats" }, (response) => {
      if (chrome.runtime.lastError) {
        // Content script not available on this page (e.g., chrome:// pages)
        statusText.textContent = 'Not available on this page';
        statusBar.classList.add('offline');
        scanPageBtn.disabled = true;
        return;
      }
      if (response) {
        updateStatsUI(response);
      }
    });
  }
});

// ─── Listen for Live Stat Updates ───
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "updateStats") {
    updateStatsUI(request.stats);
  }
});

function updateStatsUI(stats) {
  animateCounter(statTotal, stats.totalScanned);
  animateCounter(statSafe, stats.safe);
  animateCounter(statDangerous, stats.dangerous);
}

function animateCounter(el, target) {
  const current = parseInt(el.textContent) || 0;
  if (current === target) return;

  const duration = 300;
  const start = performance.now();

  function step(timestamp) {
    const progress = Math.min((timestamp - start) / duration, 1);
    el.textContent = Math.round(current + (target - current) * progress);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ─── Manual Scan ───
scanBtn.addEventListener('click', performScan);
scanInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') performScan();
});

function performScan() {
  const content = scanInput.value.trim();
  if (!content) {
    scanInput.focus();
    return;
  }

  scanBtn.disabled = true;
  scanBtn.textContent = '...';

  chrome.runtime.sendMessage({ action: "manualScan", content }, (response) => {
    scanBtn.disabled = false;
    scanBtn.textContent = 'Scan';

    if (chrome.runtime.lastError || !response || !response.result) {
      showScanResult({
        isScam: true,
        riskScore: -1,
        reasons: ['Scanner error - could not analyze. Try reloading the extension.']
      });
      return;
    }

    showScanResult(response.result);
  });
}

function showScanResult(result) {
  scanResult.className = 'scan-result visible ' + (result.isScam ? 'danger' : 'safe');

  if (result.isScam) {
    const riskLabel = result.riskScore >= 0 ? 'Risk: ' + result.riskScore + '%' : 'ERROR';
    scanResult.innerHTML = `
      <div class="result-header">WARNING: ${riskLabel}</div>
      <div>This content has been flagged as potentially dangerous.</div>
      ${result.reasons && result.reasons.length > 0 ? `
        <ul class="result-reasons">
          ${result.reasons.slice(0, 5).map(r => '<li>' + r + '</li>').join('')}
        </ul>
      ` : ''}
    `;
  } else {
    scanResult.innerHTML = `
      <div class="result-header">SAFE: No Threats Detected</div>
      <div>This content appears to be safe. Risk score: ${result.riskScore || 0}%</div>
    `;
  }
}

// ─── Scan Current Page ───
scanPageBtn.addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "scanPage" });
      scanPageBtn.textContent = 'Scanning...';
      setTimeout(() => {
        scanPageBtn.textContent = 'Scan This Page';
      }, 2000);
    }
  });
});

// ─── Settings Button ───
settingsBtn.addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

// ─── About Link ───
document.getElementById('aboutLink').addEventListener('click', (e) => {
  e.preventDefault();
  scanResult.className = 'scan-result visible safe';
  scanResult.innerHTML = `
    <div class="result-header">RiskRadar v2.0</div>
    <div>Self-contained phishing & fraud detection engine. Works offline — no backend required.</div>
    <div style="margin-top:6px; font-size:11px; color:#94a3b8;">
      Scans URLs for suspicious TLDs, IP addresses, brand impersonation, homoglyph attacks, and more.
      Analyzes text for scam keywords, urgency patterns, and phishing indicators.
    </div>
  `;
});
