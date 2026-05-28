/**
 * RiskRadar Background Service Worker
 * Fully self-contained — scanner is embedded directly, no imports needed.
 */

// ═══════════════════════════════════════════════════════
// EMBEDDED SCANNER (no importScripts needed)
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
      // Normalize: add https:// if user pastes bare domain
      if (!/^https?:\/\//i.test(url) && /^[\w.-]+\.\w{2,}/.test(url)) {
        url = 'https://' + url;
      }

      const parsed = new URL(url);
      const hostname = parsed.hostname.toLowerCase();
      const pathname = parsed.pathname.toLowerCase();
      const fullUrl = url.toLowerCase();

      // 1. IP-based URL
      if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
        score += 45;
        reasons.push('URL uses a raw IP address instead of a domain name');
      }

      // 2. Suspicious TLD
      const tld = '.' + hostname.split('.').pop();
      if (SUSPICIOUS_TLDS.includes(tld)) {
        score += 35;
        reasons.push('Suspicious top-level domain: ' + tld);
      }

      // 3. URL shortener
      if (URL_SHORTENERS.some(s => hostname === s || hostname.endsWith('.' + s))) {
        score += 30;
        reasons.push('URL shortener detected - real destination is hidden');
      }

      // 4. Excessive subdomains
      const subdomainCount = hostname.split('.').length - 2;
      if (subdomainCount >= 3) {
        score += 30;
        reasons.push('Excessive subdomains (' + subdomainCount + ') - common phishing tactic');
      } else if (subdomainCount >= 2) {
        score += 15;
        reasons.push('Multiple subdomains detected (' + subdomainCount + ')');
      }

      // 5. Brand impersonation
      for (const brand of PHISHING_TARGETS) {
        const domainParts = hostname.split('.');
        const mainDomain = domainParts.slice(-2, -1)[0] || '';
        if (hostname.includes(brand) && mainDomain !== brand) {
          score += 40;
          reasons.push('Possible ' + brand + ' impersonation - brand in URL but not the real domain');
          break;
        }
      }

      // 6. Homoglyph detection
      for (const brand of PHISHING_TARGETS) {
        if (isHomoglyphMatch(hostname, brand)) {
          score += 45;
          reasons.push('Domain looks like "' + brand + '" using look-alike characters');
          break;
        }
      }

      // 7. Suspicious path keywords
      const suspiciousPaths = ['login', 'signin', 'verify', 'secure', 'account', 'update',
                               'confirm', 'banking', 'password', 'credential', 'wallet'];
      const pathMatches = suspiciousPaths.filter(kw => pathname.includes(kw));
      if (pathMatches.length >= 2) {
        score += 25;
        reasons.push('Suspicious keywords in URL path: ' + pathMatches.join(', '));
      } else if (pathMatches.length === 1) {
        score += 10;
        reasons.push('Sensitive keyword in URL path: ' + pathMatches[0]);
      }

      // 8. HTTP (no SSL)
      if (parsed.protocol === 'http:') {
        score += 15;
        reasons.push('No HTTPS encryption - connection is not secure');
      }

      // 9. Very long URL
      if (url.length > 150) {
        score += 10;
        reasons.push('Unusually long URL (' + url.length + ' chars)');
      }

      // 10. @ symbols or excessive encoded characters
      if (fullUrl.includes('@')) {
        score += 20;
        reasons.push('URL contains @ symbol - possible misdirection');
      }
      const encodedChars = (fullUrl.match(/%[0-9a-f]{2}/gi) || []).length;
      if (encodedChars > 3) {
        score += 15;
        reasons.push('URL contains many encoded characters (' + encodedChars + ')');
      }

      // 11. Uncommon port
      if (parsed.port && !['80', '443', ''].includes(parsed.port)) {
        score += 15;
        reasons.push('Unusual port number: ' + parsed.port);
      }

      // 12. Double extension in path (e.g., "document.pdf.exe")
      if (/\.\w{2,4}\.\w{2,4}$/.test(pathname)) {
        score += 20;
        reasons.push('Double file extension detected - possible malware disguise');
      }

    } catch (e) {
      score += 35;
      reasons.push('Malformed or invalid URL');
    }

    // If literally no issues found, make it clear
    if (reasons.length === 0) {
      reasons.push('No suspicious indicators detected');
    }

    score = Math.min(100, score);
    return {
      isScam: score >= 35,
      confidence: score / 100,
      reasons: reasons,
      riskScore: score
    };
  }

  function analyzeText(text) {
    const reasons = [];
    let score = 0;
    const lower = text.toLowerCase();

    // 1. High-risk keywords
    const highMatches = SCAM_KEYWORDS.high.filter(kw => lower.includes(kw));
    if (highMatches.length > 0) {
      score += Math.min(50, highMatches.length * 25);
      reasons.push('High-risk keywords: ' + highMatches.join(', '));
    }

    // 2. Medium-risk keywords
    const medMatches = SCAM_KEYWORDS.medium.filter(kw => lower.includes(kw));
    if (medMatches.length > 0) {
      score += Math.min(40, medMatches.length * 15);
      reasons.push('Suspicious keywords: ' + medMatches.join(', '));
    }

    // 3. Low-risk keywords
    const lowMatches = SCAM_KEYWORDS.low.filter(kw => lower.includes(kw));
    if (lowMatches.length > 0) {
      score += Math.min(25, lowMatches.length * 10);
      reasons.push('Bait phrases: ' + lowMatches.join(', '));
    }

    // 4. Embedded URLs
    const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi;
    const urls = text.match(urlRegex) || [];
    for (const url of urls) {
      const urlResult = analyzeURL(url);
      if (urlResult.isScam) {
        score += 35;
        reasons.push('Contains suspicious link: ' + url.substring(0, 50));
      }
    }

    // 5. Urgency/pressure patterns
    const urgencyPatterns = [
      /within \d+ (hour|minute|day)/i,
      /last (chance|warning|notice)/i,
      /action required/i,
      /respond (immediately|now|asap)/i,
      /failure to .*(will result|may lead)/i,
      /your.*(has been|is being).*(suspend|block|lock|terminat)/i,
      /account.*(will be|has been).*(clos|delet|block|suspend)/i,
      /do not (ignore|disregard)/i
    ];
    const urgencyMatches = urgencyPatterns.filter(p => p.test(text));
    if (urgencyMatches.length > 0) {
      score += urgencyMatches.length * 12;
      reasons.push('Pressure/urgency language (' + urgencyMatches.length + ' patterns)');
    }

    // 6. Requests for sensitive data
    const sensitivePatterns = [
      /send.*(otp|pin|password|cvv)/i,
      /share.*(otp|pin|password|cvv|card)/i,
      /enter.*(otp|pin|password|cvv)/i,
      /provide.*(bank|account|card|aadhaar|pan)/i,
      /click.*(link|here|below).*(verify|confirm|update)/i
    ];
    const sensitiveMatches = sensitivePatterns.filter(p => p.test(text));
    if (sensitiveMatches.length > 0) {
      score += sensitiveMatches.length * 18;
      reasons.push('Requests sensitive personal/financial information');
    }

    // 7. ALL CAPS pressure
    const capsWords = text.split(/\s+/).filter(w => w.length > 3 && w === w.toUpperCase() && /[A-Z]/.test(w));
    if (capsWords.length >= 3) {
      score += 12;
      reasons.push('Excessive CAPITAL LETTERS - pressure tactic');
    }

    // 8. Phone numbers
    if (/\b(1800|900|190)\d{6,}\b/.test(text)) {
      score += 10;
      reasons.push('Contains potentially suspicious phone number');
    }

    if (reasons.length === 0) {
      reasons.push('No suspicious indicators detected');
    }

    score = Math.min(100, score);
    return {
      isScam: score >= 30,
      confidence: score / 100,
      reasons: reasons,
      riskScore: score
    };
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
      for (const g of glyphs) {
        normalized = normalized.split(g).join(letter);
      }
    }
    if (normalized !== domainBase.toLowerCase() && normalized.includes(brand)) {
      return true;
    }

    if (brand.length >= 5) {
      const dist = levenshtein(domainBase, brand);
      if (dist > 0 && dist <= 2) return true;
    }
    return false;
  }

  function levenshtein(a, b) {
    const matrix = Array.from({ length: a.length + 1 }, (_, i) =>
      Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
    );
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        matrix[i][j] = a[i - 1] === b[j - 1]
          ? matrix[i - 1][j - 1]
          : 1 + Math.min(matrix[i - 1][j], matrix[i][j - 1], matrix[i - 1][j - 1]);
      }
    }
    return matrix[a.length][b.length];
  }

  return { analyzeURL, analyzeText };
})();

// ═══════════════════════════════════════════════════════
// EXTENSION LOGIC
// ═══════════════════════════════════════════════════════

const DEFAULT_SETTINGS = {
  autoScan: true,
  confidenceThreshold: 30,
  scanMode: 'client'
};

let settings = { ...DEFAULT_SETTINGS };
let threatCount = 0;

chrome.storage.sync.get(DEFAULT_SETTINGS, (stored) => {
  settings = { ...DEFAULT_SETTINGS, ...stored };
});

chrome.storage.onChanged.addListener((changes) => {
  for (const [key, { newValue }] of Object.entries(changes)) {
    if (key in settings) settings[key] = newValue;
  }
});

// Context Menus
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "scanLink",
    title: "Scan Link with RiskRadar",
    contexts: ["link"]
  });
  chrome.contextMenus.create({
    id: "scanText",
    title: "Scan Text with RiskRadar",
    contexts: ["selection"]
  });
  chrome.action.setBadgeBackgroundColor({ color: '#10b981' });
  chrome.action.setBadgeText({ text: '' });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  try {
    let result;
    if (info.menuItemId === "scanLink") {
      result = RiskRadarScanner.analyzeURL(info.linkUrl);
    } else if (info.menuItemId === "scanText") {
      result = RiskRadarScanner.analyzeText(info.selectionText);
    }
    if (result) {
      if (result.isScam) {
        threatCount++;
        updateBadge();
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icon128.png',
          title: 'RiskRadar Warning',
          message: 'Risk: ' + result.riskScore + '% - ' + (result.reasons[0] || 'Threat detected'),
          priority: 2
        });
      }
      if (tab && tab.id) {
        chrome.tabs.sendMessage(tab.id, { action: "showResult", result: result, targetId: null });
      }
    }
  } catch (err) {
    console.error('RiskRadar context menu error:', err);
  }
});

// Message Handler
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    const tabId = sender.tab ? sender.tab.id : null;

    if (request.action === "analyzeLink") {
      const result = RiskRadarScanner.analyzeURL(request.link);
      if (result.isScam) { threatCount++; updateBadge(); }
      if (tabId) {
        chrome.tabs.sendMessage(tabId, { action: "showResult", result: result, targetId: request.targetId, link: request.link });
      }
      sendResponse({ result: result });

    } else if (request.action === "analyzeText") {
      const result = RiskRadarScanner.analyzeText(request.text);
      if (result.isScam) { threatCount++; updateBadge(); }
      if (tabId) {
        chrome.tabs.sendMessage(tabId, { action: "showResult", result: result, targetId: request.targetId, text: request.text });
      }
      sendResponse({ result: result });

    } else if (request.action === "manualScan") {
      let content = (request.content || '').trim();
      if (!content) {
        sendResponse({ result: { isScam: false, riskScore: 0, confidence: 0, reasons: ['No content provided'] } });
        return true;
      }

      let result;
      if (isURL(content)) {
        result = RiskRadarScanner.analyzeURL(content);
      } else {
        result = RiskRadarScanner.analyzeText(content);
      }
      console.log('RiskRadar manual scan:', content, '->', result);
      sendResponse({ result: result });

    } else if (request.action === "getSettings") {
      sendResponse({ settings: settings });
    } else if (request.action === "getThreatCount") {
      sendResponse({ threatCount: threatCount });
    } else if (request.action === "resetThreatCount") {
      threatCount = 0; updateBadge();
      sendResponse({ success: true });
    }
  } catch (err) {
    console.error('RiskRadar message handler error:', err);
    sendResponse({ result: { isScam: false, riskScore: 0, confidence: 0, reasons: ['Internal error: ' + err.message] } });
  }

  return true;
});

function isURL(str) {
  // Check for common URL patterns
  if (/^https?:\/\//i.test(str)) return true;
  if (/^www\./i.test(str)) return true;
  // Check if it looks like a bare domain (e.g. "google.com", "evil.xyz/login")
  if (/^[\w.-]+\.\w{2,}(\/|$)/i.test(str)) return true;
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function updateBadge() {
  if (threatCount > 0) {
    chrome.action.setBadgeBackgroundColor({ color: '#ef4444' });
    chrome.action.setBadgeText({ text: String(threatCount) });
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}
