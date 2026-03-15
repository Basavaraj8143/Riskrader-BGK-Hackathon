/**
 * RiskRadar Content Script (Standalone Version)
 * Injects into web pages to scan links and text in real-time.
 * Features an embedded scanner to guarantee 0-latency and perfectly reliable scanning
 * without relying on Manifest V3 service worker message passing.
 */

// ═══════════════════════════════════════════════════════
// ADVANCED RISKRADAR SCANNER (Synced with Backend)
// ═══════════════════════════════════════════════════════

const RiskRadarScanner = (() => {
  
  // ---- Advanced Pattern Database (from backend) ----
  const PATTERNS = [
    // ---- Urgency & Threat Language ----
    {
      "label": "⚠️ Urgency manipulation detected",
      "weight": 20,
      "patterns": [
        /\b(immediately|urgent|urgently|asap|right now|last chance|act now)\b/gi,
        /\b(within \d+ hours?|expires? (today|now|soon)|deadline)\b/gi,
        /\b(block(ed)?|suspend(ed)?|deactivate[d]?|terminate[d]?)\b/gi,
      ],
    },
    // ---- Bank / Financial Impersonation ----
    {
      "label": "🏦 Bank or financial impersonation",
      "weight": 15,
      "patterns": [
        /\b(sbi|hdfc|icici|axis|kotak|pnb|punjab national|bank of baroda|canara|union bank)\b/gi,
        /\b(your (bank|account|card|debit|credit|savings))\b/gi,
        /\b(netbanking|internet banking|mobile banking|bank account)\b/gi,
      ],
    },
    // ---- Government / Telecom Impersonation ----
    {
      "label": "🏛️ Government/Telecom impersonation",
      "weight": 20,
      "patterns": [
        /\b(trai|bsnl|airtel|jio|vi|vodafone|income tax|it department|irdai|sebi)\b/gi,
        /\b(rbi|reserve bank|government of india|ministry|uidai|aadhaar)\b/gi,
        /\b(narcot(ics)?|cbi|ed |enforcement direct|police|legal action|fir|cyber crime cell)\b/gi,
      ],
    },
    // ---- OTP / Credential Phishing ----
    {
      "label": "🔑 OTP or credential theft attempt",
      "weight": 30,
      "patterns": [
        /\b(otp|one.?time.?password|pin|password|cvv|atm pin)\b/gi,
        /\b(share (your|the) (otp|pin|password|code))\b/gi,
        /\b(enter (your|the) (otp|details|credentials|information))\b/gi,
      ],
    },
    // ---- KYC Scams ----
    {
      "label": "📋 KYC verification scam",
      "weight": 15,
      "patterns": [
        /\b(kyc|know your customer|kyc (update|verify|expired|complete|pending))\b/gi,
        /\b(update (your )?(kyc|pan|aadhaar|address|details))\b/gi,
        /\b(kyc (required|mandatory|verification|process))\b/gi,
      ],
    },
    // ---- UPI / Money Transfer Scams ----
    {
      "label": "💸 UPI payment fraud pattern",
      "weight": 20,
      "patterns": [
        /\b(upi|gpay|google pay|phonepe|paytm|bhim)\b/gi,
        /\b(send|pay|transfer) ?(₹|rs\.?|inr|rupees?) ?\d+.{0,20}(to receive|to get|to win|to claim)\b/gi,
        /\b(scan (the )?qr|qr code|payment link)\b/gi,
        /\b(cashback|refund|reimbursement) ?(of )?(₹|rs\.?|inr) ?\d+\b/gi,
        /\b(pay|send) ?(₹|rs\.?|inr|rupees?) ?\d+.{0,30}(claim|receive|get|win)\b/gi,
      ],
    },
    // ---- Lottery / Prize Scams ----
    {
      "label": "🎰 Lottery or prize scam",
      "weight": 25,
      "patterns": [
        /\b(lottery|lucky draw|bumper prize|mega prize)\b/gi,
        /\b(congratulations|congrats).{0,60}(won|win|prize|award|reward|selected)\b/gi,
        /\b(won|win|winning).{0,30}(prize|lottery|award|₹|rs|lakh|crore)\b/gi,
        /\b(claim (your )?(prize|reward|gift|cashback|money|winning))\b/gi,
        /\b(lucky (winner|draw|number)|selected for prize|you have been selected)\b/gi,
        /\b(kbc|kaun banega|big boss|ipl|bcci).{0,30}(winner|prize|lottery|lucky)\b/gi,
      ],
    },
    // ---- Money Lure (pay/invest small get big) ----
    {
      "label": "💰 Pay-small-get-big money lure",
      "weight": 25,
      "patterns": [
        /\b(pay|send|transfer|invest).{0,20}(₹|rs\.?|inr|rupees?) ?\d+.{0,30}(receive|get|win|claim|earn).{0,20}(₹|rs\.?|inr|rupees?) ?\d+\b/gi,
        /\b(invest|pay|deposit) ?(₹|rs\.?|inr|rupees?) ?\d+.{0,20}(get|earn|receive|returns?).{0,20}(₹|rs\.?|inr|rupees?) ?\d+\b/gi,
        /\b(₹|rs\.?|inr) ?\d+.{0,30}(get|earn|receive|returns?).{0,20}(₹|rs\.?|inr) ?\d{4,}\b/gi,
        /\b(invest|pay|deposit) ?(small|\d+).{0,20}(get|earn|receive).{0,20}(big|\d+|lakh|crore)\b/gi,
      ],
    },
    // ---- Investment / Ponzi Scams ----
    {
      "label": "📈 Investment fraud / Ponzi scheme",
      "weight": 30,
      "patterns": [
        /\bguaranteed.{0,30}(returns?|profit|income|earning|roi)\b/gi,
        /\b\d+\s*%.{0,20}(daily|weekly|per day|per week|per month|monthly)\s*(returns?|profit|earning|income)?\b/gi,
        /\b(daily|weekly|monthly).{0,10}returns?\b/gi,
        /\b(double|triple|10x|5x|2x).{0,20}(money|investment|returns?|profit)\b/gi,
        /\b(whatsapp|telegram).{0,30}(group|channel|invest|earn|profit)\b/gi,
        /\b(invest|investing).{0,20}(group|channel|plan|scheme|opportunity)\b/gi,
        /\b(members?|users?|people).{0,20}(earning|earning daily|already earning|profiting)\b/gi,
        /\b(exclusive|secret|elite|vip).{0,20}(group|channel|investment|trading)\b/gi,
        /\b(\d+,\d+|\d+k\+?|thousands? of).{0,20}(members?|investors?|earning)\b/gi,
      ],
    },
    // ---- Job / Work from Home Scams ----
    {
      "label": "💼 Fake job offer scam",
      "weight": 10,
      "patterns": [
        /\b(work from home|earn (from|at) home|part.?time (job|work|earning))\b/gi,
        /\b(₹\d+.{0,20}(per day|daily|weekly|monthly) (income|earning|salary))\b/gi,
        /\b(no (experience|qualification|skill) (required|needed))\b/gi,
      ],
    },
    // ---- SIM / Number Disconnect Scams ----
    {
      "label": "📱 SIM disconnect / telecom scam",
      "weight": 15,
      "patterns": [
        /\b(sim (card )?(blocked|suspended|disconnected|deactivated))\b/gi,
        /\b(mobile (number|sim) (will be|is being) (disconnected|blocked))\b/gi,
        /\b(disconnect(ed)? (your )?(sim|mobile|number|service))\b/gi,
        /\b(call (our|the) helpline|customer (care|service) number|press \d to speak)\b/gi,
      ],
    },
    // ---- Crypto Scams ----
    {
      "label": "₿ Cryptocurrency scam",
      "weight": 10,
      "patterns": [
        /\b(crypto|bitcoin|ethereum|usdt|bnb|nft).{0,30}(invest|earn|profit|return)\b/gi,
        /\b(crypto (trading|signals?|bot|group|channel))\b/gi,
      ],
    },
    // ---- Personal Info Harvest ----
    {
      "label": "🪪 Personal information harvesting",
      "weight": 10,
      "patterns": [
        /\b(share (your )?(aadhaar|pan|passport|voter id))\b/gi,
        /\b(send (your )?(photo|selfie|id proof|address proof))\b/gi,
        /\b(date of birth|mother.?s name|full address|account number|ifsc)\b/gi,
      ],
    },
  ];

  // ---- Category Keyword Mapping ----
  const CATEGORY_KEYWORDS = {
    "UPI / Payment Fraud": ["upi", "gpay", "phonepe", "paytm", "qr", "scan", "payment link", "bhim"],
    "KYC Phishing": ["kyc", "know your customer", "update kyc", "kyc expired", "kyc verification"],
    "Bank Impersonation": ["sbi", "hdfc", "icici", "axis", "kotak", "pnb", "bank account", "netbanking"],
    "Govt / Telecom Scam": ["trai", "bsnl", "sim blocked", "sim disconnected", "rbi", "income tax", "aadhaar", "uidai"],
    "Lottery / Prize Scam": ["lottery", "won", "winner", "prize", "lucky draw", "claim your"],
    "Investment Fraud": ["guaranteed returns", "roi", "double your money", "invest", "profit per day", "whatsapp group", "telegram"],
    "OTP Theft": ["otp", "one time password", "share otp", "enter otp"],
    "Crypto Scam": ["crypto", "bitcoin", "ethereum", "usdt", "nft", "trading signals"],
    "Job / WFH Scam": ["work from home", "part time", "earn from home", "no experience required"],
    "SIM / Telecom Scam": ["sim blocked", "sim disconnected", "mobile disconnect", "telecom"],
    "Personal Info Harvest": ["aadhaar", "pan", "passport", "share photo", "id proof"],
  };

  // ---- Extract amounts for logarithmic scoring ----
  function _extractAmounts(text) {
    const pattern = /(?:rs\.?|₹)?\s*(\d{1,7})/gi;
    const matches = text.match(pattern) || [];
    const amounts = [];
    
    for (const match of matches) {
      const numMatch = match.match(/\d+/);
      if (numMatch) {
        amounts.push(parseInt(numMatch[0]));
      }
    }
    
    return amounts;
  }

  // ---- Advanced Text Analysis ----
  function analyzeText(text) {
    const reasons = [];
    let ruleScore = 0;
    const textLower = text.toLowerCase();

    // ---- Weighted Pattern Scoring ----
    for (const patternGroup of PATTERNS) {
      for (const regex of patternGroup.patterns) {
        if (regex.test(text)) {
          ruleScore += patternGroup.weight;
          reasons.push(patternGroup.label);
          break; // Only score once per group
        }
      }
    }

    // ---- URL / Link Detection ----
    const urlPattern = /(https?:\/\/|bit\.ly|tinyurl|t\.co|goo\.gl|rb\.gy|cutt\.ly|short\.|tiny\.|link\.|click\.|go\.)/gi;
    if (urlPattern.test(text)) {
      ruleScore += 25;
      reasons.push("🔗 Suspicious URL/link detected");
    }

    // ---- Multi-Signal Escalation ----
    if (reasons.length >= 4) {
      ruleScore += 20;
    } else if (reasons.length === 3) {
      ruleScore += 10;
    }

    // ---- Unrealistic Return Detection (Logarithmic Method) ----
    const amounts = _extractAmounts(text);
    if (amounts.length >= 2) {
      const requested = Math.min(...amounts);
      const promised = Math.max(...amounts);

      if (requested > 0) {
        const ratio = promised / requested;
        const logScore = Math.log(ratio + 1);

        if (logScore > 8) {      // ~2980x return
          ruleScore += 45;
          reasons.push("💰 Extreme unrealistic return");
        } else if (logScore > 6) {    // ~403x return
          ruleScore += 35;
          reasons.push("💰 Unrealistic financial return");
        } else if (logScore > 3) {    // ~20x return
          ruleScore += 20;
          reasons.push("💰 Suspicious reward ratio");
        } else if (logScore > 1.5) {  // ~3.5x return
          ruleScore += 10;
          reasons.push("💰 Questionable return offer");
        }
      }
    }

    // ---- Cap rule score at 100 ----
    ruleScore = Math.min(ruleScore, 100);

    // ---- Determine Category ----
    let category = "General";
    let bestCount = 0;
    for (const [catName, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      const count = keywords.filter(kw => textLower.includes(kw)).length;
      if (count > bestCount) {
        bestCount = count;
        category = catName;
      }
    }

    return {
      isScam: ruleScore >= 45, // Made more strict to reduce false positives
      confidence: ruleScore / 100,
      riskScore: ruleScore,
      reasons: reasons,
      category: category
    };
  }

  // ---- URL Analysis (kept from original) ----
  function analyzeURL(url) {
    const reasons = [];
    let score = 0;

    try {
      if (!/^https?:\/\//i.test(url) && /^[\w.-]+\.\w{2,}/.test(url)) url = 'https://' + url;
      const parsed = new URL(url);

      // Suspicious TLDs
      const suspiciousTlds = ['.xyz', '.tk', '.ml', '.ga', '.cf', '.gq', '.buzz', '.top', '.club'];
      if (suspiciousTlds.some(tld => parsed.hostname.endsWith(tld))) {
        score += 25;
        reasons.push('Suspicious domain extension');
      }

      // URL shorteners
      const shorteners = ['bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'is.gd'];
      if (shorteners.some(short => url.includes(short))) {
        score += 20;
        reasons.push('URL shortener detected');
      }

      // Missing HTTPS
      if (parsed.protocol === 'http:') {
        score += 15;
        reasons.push('No HTTPS encryption');
      }

    } catch (e) {
      score += 35;
      reasons.push('Malformed or invalid URL');
    }

    return {
      isScam: score >= 45, // Made more strict to reduce false positives
      confidence: score / 100,
      riskScore: score,
      reasons: reasons
    };
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
let confidenceThreshold = 50; // Increased to reduce false positives
let hasInitialized = false;

// ─── Initialize Settings ───
try {
  chrome.storage.sync.get({ autoScan: true, confidenceThreshold: 50 }, (s) => {
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

  // Add message container class for positioning
  element.classList.add('rr-message-container');

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

  // Create and add the action button
  const actionBtn = document.createElement('button');
  actionBtn.className = 'rr-action-btn';
  actionBtn.innerHTML = '🛡️';
  actionBtn.title = 'RiskRadar Actions';
  
  // Add click handler for the button (you can customize this)
  actionBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleActionClick(element, result, content);
  });

  // Apply styling based on scan result (show danger for all contacts)
  if (result.isScam && result.riskScore >= confidenceThreshold) {
    // Show danger for any message with high risk (regardless of contact type)
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
  } else {
    // Show safe for messages that pass the scan
    element.classList.add('rr-safe');
    stats.safe++;
  }

  // Add the action button to the message
  element.appendChild(actionBtn);

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

// Handle action button clicks
function handleActionClick(messageElement, scanResult, messageContent) {
  console.log('RiskRadar Action clicked:', {
    message: messageContent.substring(0, 50) + '...',
    riskScore: scanResult.riskScore,
    isScam: scanResult.isScam
  });
  
  // You can customize what happens when the button is clicked
  // Examples: show detailed analysis, copy message, report, etc.
  
  // For now, let's show a simple alert with the scan result
  const riskLevel = scanResult.riskScore >= 70 ? 'High' : scanResult.riskScore >= 45 ? 'Medium' : 'Low';
  const message = `
RiskRadar Analysis:
Risk Level: ${riskLevel} (${scanResult.riskScore}%)
Scam: ${scanResult.isScam ? 'Yes' : 'No'}
Reasons: ${scanResult.reasons ? scanResult.reasons.slice(0, 3).join(', ') : 'None'}
  `.trim();
  
  // You can replace this with your desired action
  console.log(message);
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
    
    /* New icon button styles */
    .rr-action-btn {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: rgba(59, 130, 246, 0.9);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      color: white;
      opacity: 0;
      transition: all 0.2s ease;
      z-index: 1000;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    
    .rr-message-container:hover .rr-action-btn {
      opacity: 1;
    }
    
    .rr-action-btn:hover {
      background: rgba(37, 99, 235, 1);
      transform: scale(1.1);
    }
    
    .rr-message-container {
      position: relative !important;
    }
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
