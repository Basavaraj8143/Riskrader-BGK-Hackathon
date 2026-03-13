// @ts-nocheck
// background.js — Service Worker
// Receives URL from content.js, calls the RiskRadar backend, returns result.

const BACKEND = "http://localhost:8000/api/analyze";
const TIMEOUT_MS = 4000;

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type !== "CHECK_URL") return;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  fetch(BACKEND, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: msg.url }),
    signal: controller.signal,
  })
    .then((r) => r.json())
    .then((data) => {
      clearTimeout(timer);
      sendResponse({
        ok: true,
        score: data.score ?? 0,
        level: data.level ?? "LOW",
        category: data.category ?? "General",
        tips: data.prevention_tips ?? [],
      });
    })
    .catch(() => {
      clearTimeout(timer);
      // Backend unreachable — fail silently, allow navigation.
      sendResponse({ ok: false });
    });

  return true; // keep message channel open for async response
});
