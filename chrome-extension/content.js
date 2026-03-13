/**
 * RiskRadar Content Script (Standalone Version)
 * Injects into web pages to scan links and text in real-time.
 * Features an embedded scanner to guarantee 0-latency and perfectly reliable scanning
 * without relying on Manifest V3 service worker message passing.
 */

// ═══════════════════════════════════════════════════════
// EMBEDDED SCANNER ENGINE
// ═══════════════════════════════════════════════════════

const RiskRadarScanner = (() => {
  const SUSPICIOUS_TLDS = [
    '.xyz', '.tk', '.ml', '.ga', '.cf', '.gq', '.buzz', '.top', '.club',
    '.work', '.click', '.link', '.info', '.online', '.site', '.icu',
    '.cam', '.rest', '.monster', '.surf', '.bar', '.uno'
  ];

  const URL_SHORTENERS = [
    'bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'is.gd', 'buff.ly',
    'ow.ly', 'shorte.st', 'adf.ly', 'cutt.ly', 'rb.gy', 'shorturl.at',
    't.ly', 'v.gd', 'clck.ru', 'bit.do', 'qr.ae'
  ];

  const SCAM_KEYWORDS = {
    high: ['suspended', 'disabled', 'blocked', 'unauthorized', 'illegal', 'arrest',
           'warrant', 'seized', 'terminate', 'deactivate', 'compromised',
           'seed phrase', 'recovery phrase', 'wallet validation', 'node sync',
           'dapp connect', 'airdrop claim', 'kyc required', 'account restriction',
           'unusual activity', 'final warning', 'immediate action'],
    medium: ['urgent', 'immediately', 'verify', 'confirm', 'update', 'expire',
             'kyc', 'otp', 'password', 'credential', 'ssn', 'pan card', 'aadhaar',
             'bank account', 'credit card', 'debit card', 'pin number',
             'work from home', 'part time job', 'earn daily', 'crypto investment',
             'guaranteed return', 'double your money', 'tech support',
             'virus detected', 'system infected', 'microsoft support', 'windows defender'],
    low: ['click here', 'act now', 'limited time', 'free', 'winner', 'congratulations',
          'prize', 'reward', 'claim', 'gift', 'lottery', 'selected', 'lucky',
          'offer expires', 'exclusive deal', 'risk-free', 'buy now']
  };

  const PHISHING_TARGETS = [
    'paypal', 'apple', 'amazon', 'netflix', 'microsoft', 'google', 'facebook',
    'instagram', 'whatsapp', 'telegram', 'twitter', 'linkedin', 'snapchat',
    'hdfc', 'icici', 'sbi', 'axis', 'kotak', 'paytm', 'phonepe', 'gpay',
    'razorpay', 'cred', 'flipkart', 'myntra', 'swiggy', 'zomato',
    'chase', 'wellsfargo', 'bankofamerica', 'citibank', 'hsbc', 'barclays',
    'dropbox', 'adobe', 'zoom', 'slack', 'github', 'steam', 'epic',
    'binance', 'coinbase', 'kraken', 'metamask', 'trustwallet', 'phantom',
    'pancakeswap', 'uniswap', 'opensea', 'blur', 'ledger', 'trezor'
  ];

  function analyzeURL(url) {
    const reasons = [];
    let score = 0;

    try {
      if (!/^https?:\/\//i.test(url) && /^[\w.-]+\.\w{2,}/.test(url)) url = 'https://' + url;
      const parsed = new URL(url);
      const hostname = parsed.hostname.toLowerCase();
      const pathname = parsed.pathname.toLowerCase();
      const fullUrl = url.toLowerCase();

      if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
        score += 45; reasons.push('URL uses a raw IP address instead of a domain name');
      }

      const tld = '.' + hostname.split('.').pop();
      if (SUSPICIOUS_TLDS.includes(tld)) {
        score += 35; reasons.push('Suspicious top-level domain: ' + tld);
      }

      if (URL_SHORTENERS.some(s => hostname === s || hostname.endsWith('.' + s))) {
        score += 30; reasons.push('URL shortener detected - real destination is hidden');
      }

      const subdomainCount = hostname.split('.').length - 2;
      if (subdomainCount >= 3) {
        score += 30; reasons.push('Excessive subdomains (' + subdomainCount + ') - common phishing tactic');
      } else if (subdomainCount >= 2) {
        score += 15; reasons.push('Multiple subdomains detected (' + subdomainCount + ')');
      }

      for (const brand of PHISHING_TARGETS) {
        const domainParts = hostname.split('.');
        const mainDomain = domainParts.slice(-2, -1)[0] || '';
        if (hostname.includes(brand) && mainDomain !== brand) {
          score += 40; reasons.push('Possible ' + brand + ' impersonation - brand in URL but not the real domain');
          break;
        }
      }

      for (const brand of PHISHING_TARGETS) {
        if (isHomoglyphMatch(hostname, brand)) {
          score += 45; reasons.push('Domain looks like "' + brand + '" using look-alike characters'); break;
        }
      }

      const suspiciousPaths = ['login', 'signin', 'verify', 'secure', 'account', 'update', 'confirm', 'banking', 'password', 'credential', 'wallet'];
      const pathMatches = suspiciousPaths.filter(kw => pathname.includes(kw));
      if (pathMatches.length >= 2) {
        score += 25; reasons.push('Suspicious keywords in URL path: ' + pathMatches.join(', '));
      } else if (pathMatches.length === 1) {
        score += 10; reasons.push('Sensitive keyword in URL path: ' + pathMatches[0]);
      }

      if (parsed.protocol === 'http:') { score += 15; reasons.push('No HTTPS encryption - connection is not secure'); }
      if (url.length > 150) { score += 10; reasons.push('Unusually long URL (' + url.length + ' chars)'); }
      if (fullUrl.includes('@')) { score += 20; reasons.push('URL contains @ symbol - possible misdirection'); }
      
      const encodedChars = (fullUrl.match(/%[0-9a-f]{2}/gi) || []).length;
      if (encodedChars > 3) { score += 15; reasons.push('URL contains many encoded characters (' + encodedChars + ')'); }
      
      if (parsed.port && !['80', '443', ''].includes(parsed.port)) { score += 15; reasons.push('Unusual port number: ' + parsed.port); }
      if (/\.\w{2,4}\.\w{2,4}$/.test(pathname)) { score += 20; reasons.push('Double file extension detected - possible malware disguise'); }

    } catch (e) {
      score += 35; reasons.push('Malformed or invalid URL');
    }

    if (reasons.length === 0) reasons.push('No suspicious indicators detected');
    score = Math.min(100, score);
    return { isScam: score >= 35, confidence: score / 100, reasons, riskScore: score };
  }

  function analyzeText(text) {
    const reasons = []; let score = 0; const lower = text.toLowerCase();

    const highMatches = SCAM_KEYWORDS.high.filter(kw => lower.includes(kw));
    if (highMatches.length > 0) { score += Math.min(50, highMatches.length * 25); reasons.push('High-risk keywords: ' + highMatches.join(', ')); }

    const medMatches = SCAM_KEYWORDS.medium.filter(kw => lower.includes(kw));
    if (medMatches.length > 0) { score += Math.min(40, medMatches.length * 15); reasons.push('Suspicious keywords: ' + medMatches.join(', ')); }

    const lowMatches = SCAM_KEYWORDS.low.filter(kw => lower.includes(kw));
    if (lowMatches.length > 0) { score += Math.min(25, lowMatches.length * 10); reasons.push('Bait phrases: ' + lowMatches.join(', ')); }

    const urls = text.match(/https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi) || [];
    for (const url of urls) {
      const urlResult = analyzeURL(url);
      if (urlResult.isScam) { score += 35; reasons.push('Contains suspicious link: ' + url.substring(0, 50)); }
    }

    const urgencyPatterns = [
      /within \d+ (hour|minute|day)/i, /last (chance|warning|notice)/i, /action required/i, /respond (immediately|now|asap)/i,
      /failure to .*(will result|may lead)/i, /your.*(has been|is being).*(suspend|block|lock|terminat)/i,
      /account.*(will be|has been).*(clos|delet|block|suspend)/i, /do not (ignore|disregard)/i
    ];
    const urgencyMatches = urgencyPatterns.filter(p => p.test(text));
    if (urgencyMatches.length > 0) { score += urgencyMatches.length * 12; reasons.push('Pressure/urgency language (' + urgencyMatches.length + ' patterns)'); }

    const sensitivePatterns = [
      /send.*(otp|pin|password|cvv)/i, /share.*(otp|pin|password|cvv|card)/i, /enter.*(otp|pin|password|cvv)/i,
      /provide.*(bank|account|card|aadhaar|pan)/i, /click.*(link|here|below).*(verify|confirm|update)/i
    ];
    const sensitiveMatches = sensitivePatterns.filter(p => p.test(text));
    if (sensitiveMatches.length > 0) { score += sensitiveMatches.length * 18; reasons.push('Requests sensitive personal/financial information'); }

    const capsWords = text.split(/\s+/).filter(w => w.length > 3 && w === w.toUpperCase() && /[A-Z]/.test(w));
    if (capsWords.length >= 3) { score += 12; reasons.push('Excessive CAPITAL LETTERS - pressure tactic'); }

    if (/\b(1800|900|190)\d{6,}\b/.test(text)) { score += 10; reasons.push('Contains potentially suspicious phone number'); }
    if (reasons.length === 0) reasons.push('No suspicious indicators detected');

    score = Math.min(100, score);
    return { isScam: score >= 30, confidence: score / 100, reasons, riskScore: score };
  }

  function isHomoglyphMatch(hostname, brand) {
    const domainBase = hostname.split('.').slice(0, -1).join('');
    if (domainBase === brand) return false;

    const HOMOGLYPHS = {
      'a': ['@', '4'], 'e': ['3'], 'i': ['1', 'l', '|'],
      'o': ['0'], 'l': ['1', '|', 'I'], 'g': ['9', 'q'],
      's': ['$', '5'], 't': ['+', '7']
    };

    let normalized = domainBase.toLowerCase();
    for (const [letter, glyphs] of Object.entries(HOMOGLYPHS)) {
      for (const g of glyphs) { normalized = normalized.split(g).join(letter); }
    }
    if (normalized !== domainBase.toLowerCase() && normalized.includes(brand)) return true;
    if (brand.length >= 5) {
      const dist = levenshtein(domainBase, brand);
      if (dist > 0 && dist <= 2) return true;
    }
    return false;
  }

  function levenshtein(a, b) {
    const matrix = Array.from({ length: a.length + 1 }, (_, i) => Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        matrix[i][j] = a[i - 1] === b[j - 1] ? matrix[i - 1][j - 1] : 1 + Math.min(matrix[i - 1][j], matrix[i][j - 1], matrix[i - 1][j - 1]);
      }
    }
    return matrix[a.length][b.length];
  }

  return { analyzeURL, analyzeText };
})();

// ═══════════════════════════════════════════════════════
// DOM SCANNING & HIGHLIGHTING
// ═══════════════════════════════════════════════════════

const linkResults = new Map();
const textResults = new Map();
const stats = { safe: 0, dangerous: 0, totalScanned: 0 };

let isAutoScanEnabled = true;
let confidenceThreshold = 30; // Match background.js
let hasInitialized = false;

// ─── Initialize Settings ───
try {
  chrome.storage.sync.get({ autoScan: true, confidenceThreshold: 30 }, (s) => {
    isAutoScanEnabled = s.autoScan;
    confidenceThreshold = s.confidenceThreshold;
    console.log('[RiskRadar] Settings loaded:', s);
    if (isAutoScanEnabled) initAutoScan();
  });

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.autoScan) {
      isAutoScanEnabled = changes.autoScan.newValue;
      if (isAutoScanEnabled) initAutoScan();
    }
    if (changes.confidenceThreshold) confidenceThreshold = changes.confidenceThreshold.newValue;
  });
} catch (e) {
  console.log('[RiskRadar] Storage not available, using defaults.');
  initAutoScan();
}

// ─── Process Scan Result Locally ───
function processLocalScan(element, type, content, isUnknownContact = true) {
  if (element.hasAttribute('data-rr-scanned')) return;
  element.setAttribute('data-rr-scanned', 'true');

  let result;
  if (type === 'link') {
    if (linkResults.has(content)) {
      result = linkResults.get(content);
    } else {
      result = RiskRadarScanner.analyzeURL(content);
      linkResults.set(content, result);
    }
  } else {
    if (textResults.has(content)) {
      result = textResults.get(content);
    } else {
      result = RiskRadarScanner.analyzeText(content);
      textResults.set(content, result);
    }
  }

  // Apply styling based on contact type and scan result
  if (result.isScam && result.riskScore >= confidenceThreshold && isUnknownContact) {
    // Only show danger for unknown contacts with high risk
    element.classList.add('rr-danger');
    stats.dangerous++;
    
    // Add badge
    const badge = document.createElement('span');
    badge.className = 'rr-badge rr-danger';
    badge.innerHTML = '⚠️';
    if (element.nextSibling) {
      element.parentNode.insertBefore(badge, element.nextSibling);
    } else {
      element.parentNode.appendChild(badge);
    }

    createTooltip(element, result);
    createTooltip(badge, result);
  } else if (!isUnknownContact) {
    // Show safe green for saved contacts
    element.classList.add('rr-safe');
    stats.safe++;
  } else if (!result.isScam || result.riskScore < confidenceThreshold) {
    // Show safe for unknown contacts that pass the scan
    element.classList.add('rr-safe');
    stats.safe++;
  } else {
    // Unknown contact with medium risk - still mark as safe but could add subtle warning
    element.classList.add('rr-safe');
    stats.safe++;
  }

  stats.totalScanned++;
  
  // Try to update badge counter in background without causing errors if disconnected
  try {
    if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ action: "updateStats", stats }).catch(() => {});
      if (result.isScam && isUnknownContact) {
        chrome.runtime.sendMessage({ action: "incrementThreat" }).catch(() => {});
      }
    }
  } catch(e) {}
}

// ─── DOM Scanning ───
function scanLink(linkNode) {
  if (linkNode.hasAttribute('data-rr-scanned')) return;
  
  const href = linkNode.href;
  if (!href || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('#') || href === window.location.href) {
    return;
  }

  processLocalScan(linkNode, 'link', href);
}

function shouldScanCurrentChat() {
  const titleEl = document.querySelector('header span[dir="auto"]');
  if (!titleEl) return false; // Safety fallback
  
  const title = titleEl.innerText.trim();
  const isPhoneNumber = /^\+?\d[\d\s]{8,}$/.test(title);
  
  console.log('[RiskRadar] Chat:', title, '| Scan:', isPhoneNumber ? 'YES' : 'NO');
  return isPhoneNumber;
}

function scanWhatsAppMessages(rootNode) {
  if (!window.location.hostname.includes('whatsapp.com')) return;
  
  // Check if current chat is with saved contact or unknown number
  const isUnknownContact = shouldScanCurrentChat();
  
  const selectors = ['span.selectable-text.copyable-text', 'span[dir="ltr"]._ao3e', 'div.copyable-text span'];
  
  for (const selector of selectors) {
    const nodes = rootNode.querySelectorAll ? rootNode.querySelectorAll(selector) : [];
    nodes.forEach((msgNode) => {
      const text = (msgNode.innerText || msgNode.textContent || '').trim();
      if (!text || text.length < 15) return;
      const container = msgNode.closest('[data-id]') || msgNode.closest('.message-in, .message-out') || msgNode.parentElement;
      if (container && !container.hasAttribute('data-rr-scanned')) {
        processLocalScan(container, 'text', text, isUnknownContact);
      }
    });
  }
}

function scanAllLinksOnPage() {
  const links = document.querySelectorAll('a[href]');
  console.log(`[RiskRadar] Scanning ${links.length} links on page...`);
  links.forEach(scanLink);
  scanWhatsAppMessages(document.body);
}

// ─── Listeners & Observers ───
function processNode(node) {
  if (node.nodeType !== Node.ELEMENT_NODE) return;
  if (node.tagName === 'A') scanLink(node);
  if (node.querySelectorAll) node.querySelectorAll('a[href]').forEach(scanLink);
  if (window.location.hostname.includes('whatsapp.com')) scanWhatsAppMessages(node);
}

let mutationBatch = [];
let mutationTimer = null;
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.type === 'childList') {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) mutationBatch.push(node);
      }
    }
  }
  if (mutationTimer) clearTimeout(mutationTimer);
  mutationTimer = setTimeout(() => {
    const nodes = [...mutationBatch];
    mutationBatch = [];
    nodes.forEach(processNode);
  }, 300);
});

function initAutoScan() {
  if (hasInitialized) return;
  if (!document.body) {
    console.log('[RiskRadar] Body not ready, waiting...');
    return;
  }
  
  hasInitialized = true;
  console.log('[RiskRadar] Engine engaged. Scanning dynamically.');
  injectStyles();
  scanAllLinksOnPage();
  observer.observe(document.body, { childList: true, subtree: true });
}

// ─── Tooltip System ───
function createTooltip(element, result) {
  element.addEventListener('mouseenter', () => {
    const existing = document.getElementById('rr-tooltip');
    if (existing) existing.remove();

    const tooltip = document.createElement('div');
    tooltip.id = 'rr-tooltip';
    tooltip.className = 'rr-tooltip';

    const riskLevel = result.riskScore >= 70 ? 'High' : result.riskScore >= 45 ? 'Medium' : 'Low';
    const riskColor = result.riskScore >= 70 ? '#ef4444' : result.riskScore >= 45 ? '#f59e0b' : '#10b981';

    tooltip.innerHTML = `
      <div class="rr-tooltip-header">
        <span>RiskRadar Analysis</span>
        <span style="color:${riskColor}; font-weight:700;">${riskLevel} Risk (${result.riskScore}%)</span>
      </div>
      <div class="rr-tooltip-bar"><div class="rr-tooltip-bar-fill" style="width:${result.riskScore}%; background:${riskColor};"></div></div>
      ${result.reasons && result.reasons.length > 0 ? `<ul class="rr-tooltip-reasons">${result.reasons.slice(0, 5).map(r => `<li>${r}</li>`).join('')}</ul>` : ''}
    `;

    document.body.appendChild(tooltip);
    const rect = element.getBoundingClientRect();
    tooltip.style.top = `${rect.bottom + window.scrollY + 8}px`;
    tooltip.style.left = `${Math.min(rect.left + window.scrollX, Math.max(0, window.innerWidth - 320))}px`;
  });

  element.addEventListener('mouseleave', () => {
    const tooltip = document.getElementById('rr-tooltip');
    if (tooltip) tooltip.remove();
  });
}

// ─── Styles ───
function injectStyles() {
  if (document.getElementById('rr-injected-styles')) return;
  const style = document.createElement('style');
  style.id = 'rr-injected-styles';
  style.textContent = `
    .rr-safe { background-color: rgba(16, 185, 129, 0.15) !important; outline: 2px solid #10b981 !important; border-radius: 3px; transition: all 0.3s ease; }
    .rr-danger { background-color: rgba(239, 68, 68, 0.15) !important; outline: 2px solid #ef4444 !important; outline-offset: 2px; border-radius: 3px; transition: all 0.3s ease; }
    .rr-badge { display: inline-block; font-size: 14px; vertical-align: super; margin-left: 2px; cursor: help; animation: rr-pulse 2s infinite; }
    @keyframes rr-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
    .rr-tooltip { position: absolute; z-index: 2147483647; background: #1e293b; color: #f1f5f9; border-radius: 10px; padding: 14px; width: 300px; font-family: system-ui, sans-serif; font-size: 13px; box-shadow: 0 8px 30px rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); pointer-events: none; }
    .rr-tooltip-header { display: flex; justify-content: space-between; margin-bottom: 10px; font-weight: 600; font-size: 13px; }
    .rr-tooltip-bar { width: 100%; height: 5px; background: #334155; border-radius: 5px; overflow: hidden; margin-bottom: 10px; }
    .rr-tooltip-bar-fill { height: 100%; border-radius: 5px; transition: width 0.5s ease; }
    .rr-tooltip-reasons { margin: 0; padding: 0 0 0 16px; font-size: 12px; color: #cbd5e1; line-height: 1.6; }
  `;
  document.head.appendChild(style);
}

// ─── Message Listener (for external commands like Manual Page Scan) ───
try {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "scanPage") {
      scanAllLinksOnPage();
      sendResponse({ started: true });
    } else if (request.action === "getStats") {
      sendResponse({ ...stats });
    }
    return true;
  });
} catch(e) {}

// Boot
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAutoScan);
} else {
  initAutoScan();
}
