// @ts-nocheck
// content.js — RiskRadar link interceptor

const SKIP_LEVELS = new Set(["LOW"]);

// Helper: checked at CALL TIME (not load time) so extension-reload invalidation is caught
function _hasRuntime() { return typeof chrome !== "undefined" && !!chrome.runtime && !!chrome.runtime.sendMessage; }
function _hasStorage() { return typeof chrome !== "undefined" && !!chrome.storage && !!chrome.storage.local; }

document.addEventListener(
  "click",
  (e) => {
    const anchor = e.target.closest("a[href]");
    if (!anchor) return;

    const href = anchor.href;
    if (!href || !href.startsWith("http")) return;

    try {
      if (new URL(href).origin === location.origin) return;
    } catch (_) { return; }

    // ⚡ Block synchronously — async callbacks are too late
    e.preventDefault();
    e.stopImmediatePropagation();

    if (_hasStorage()) {
      chrome.storage.local.get("rrEnabled", ({ rrEnabled }) => {
        if (rrEnabled === false) { navigate(href); return; }
        _sendCheck(href);
      });
    } else {
      _sendCheck(href);
    }
  },
  true
);

function _sendCheck(href) {
  // Re-check at call time — extension reload invalidates context after load
  if (!_hasRuntime()) { navigate(href); return; }

  try {
    chrome.runtime.sendMessage({ type: "CHECK_URL", url: href }, (result) => {
      if (chrome.runtime.lastError || !result || !result.ok || SKIP_LEVELS.has(result.level)) {
        navigate(href);
        return;
      }
      if (_hasStorage()) {
        chrome.storage.local.set({
          rrLastScan: { url: href, score: result.score, level: result.level, category: result.category },
        });
      }
      showOverlay(href, result);
    });
  } catch (_) {
    navigate(href);
  }
}

function showOverlay(url, { score, level, category, tips }) {
  removeOverlay();
  const scoreColor = level === "HIGH" ? "#ef4444" : level === "MEDIUM" ? "#ca8a04" : "#16a34a";
  const emoji = level === "HIGH" ? "🔴" : level === "MEDIUM" ? "🟡" : "🟢";
  const title = level === "HIGH" ? "High Risk — Likely a Scam!" : level === "MEDIUM" ? "Suspicious Link Detected" : "Possibly Safe";
  const safeUrl = url.length > 60 ? url.slice(0, 57) + "…" : url;
  const tip = tips?.[0] ?? "Do not share personal or financial information.";

  const overlay = document.createElement("div");
  overlay.id = "rr-overlay";
  overlay.innerHTML = `
    <div id="rr-card">
      <div id="rr-header"><span id="rr-brand">🛡 RiskRadar</span></div>
      <div id="rr-badge" class="${level}">${emoji} ${level} RISK &middot; ${score}/100</div>
      <div id="rr-title">${title}</div>
      <div id="rr-url">${safeUrl}</div>
      <div id="rr-category">Detected: <strong>${category}</strong></div>
      <ul id="rr-tips"><li>${tip}</li></ul>
      <div id="rr-score-bar-wrap">
        <div id="rr-score-bar" style="width:${score}%; background:${scoreColor};"></div>
      </div>
      <div id="rr-actions">
        <button id="rr-cancel">✕ Cancel</button>
        <button id="rr-proceed" class="${level}">Go Anyway &rarr;</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.addEventListener("click", (ev) => { if (ev.target === overlay) removeOverlay(); });
  document.getElementById("rr-cancel").addEventListener("click", removeOverlay);
  document.getElementById("rr-proceed").addEventListener("click", () => { removeOverlay(); navigate(url); });
}

function removeOverlay() { document.getElementById("rr-overlay")?.remove(); }
function navigate(url)   { window.location.href = url; }
