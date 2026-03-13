// @ts-nocheck
// popup.js — RiskRadar popup logic

const toggle    = document.getElementById("enableToggle");
const clearBtn  = document.getElementById("clearBtn");
const scanEl    = document.getElementById("lastScanContent");

// ── Load persisted state ──────────────────────────────────────────
chrome.storage.local.get(["rrEnabled", "rrLastScan"], ({ rrEnabled, rrLastScan }) => {
  toggle.checked = rrEnabled !== false; // default on
  renderScan(rrLastScan ?? null);
});

// ── Toggle ────────────────────────────────────────────────────────
toggle.addEventListener("change", () => {
  chrome.storage.local.set({ rrEnabled: toggle.checked });
});

// ── Clear ─────────────────────────────────────────────────────────
clearBtn.addEventListener("click", () => {
  chrome.storage.local.remove("rrLastScan");
  renderScan(null);
});

// ── Render last scan ──────────────────────────────────────────────
function renderScan(scan) {
  if (!scan) {
    scanEl.innerHTML = `<div class="scan-empty">No links scanned yet</div>`;
    return;
  }

  const emoji =
    scan.level === "HIGH"   ? "🔴" :
    scan.level === "MEDIUM" ? "🟡" : "🟢";

  const safeUrl = scan.url.length > 45
    ? scan.url.slice(0, 42) + "…"
    : scan.url;

  scanEl.innerHTML = `
    <div class="scan-card">
      <div class="scan-badge ${scan.level}">${emoji} ${scan.level} · ${scan.score}/100</div>
      <div class="scan-url">${safeUrl}</div>
      <div class="scan-cat">${scan.category}</div>
    </div>
  `;
}
