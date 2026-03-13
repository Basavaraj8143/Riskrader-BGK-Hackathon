/**
 * RiskRadar Client-Side Heuristic Scanner
 * Fully self-contained — no backend dependency required.
 * Analyzes URLs and text for phishing, scam, and fraud patterns.
 */

const RiskRadarScanner = (() => {

  // ─── Suspicious TLD list ───
  const SUSPICIOUS_TLDS = [
    '.xyz', '.tk', '.ml', '.ga', '.cf', '.gq', '.buzz', '.top', '.club',
    '.work', '.click', '.link', '.info', '.online', '.site', '.icu',
    '.cam', '.rest', '.monster', '.surf', '.bar', '.uno'
  ];

  // ─── Known URL shortener domains ───
  const URL_SHORTENERS = [
    'bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'is.gd', 'buff.ly',
    'ow.ly', 'shorte.st', 'adf.ly', 'cutt.ly', 'rb.gy', 'shorturl.at',
    't.ly', 'v.gd', 'clck.ru', 'bit.do', 'qr.ae'
  ];

  // ─── Scam keywords (weighted) ───
  const SCAM_KEYWORDS = {
    high: ['suspended', 'disabled', 'blocked', 'unauthorized', 'illegal', 'arrest',
           'warrant', 'seized', 'terminate', 'deactivate', 'compromised'],
    medium: ['urgent', 'immediately', 'verify', 'confirm', 'update', 'expire',
             'kyc', 'otp', 'password', 'credential', 'ssn', 'pan card', 'aadhaar',
             'bank account', 'credit card', 'debit card', 'pin number'],
    low: ['click here', 'act now', 'limited time', 'free', 'winner', 'congratulations',
          'prize', 'reward', 'claim', 'gift', 'lottery', 'selected', 'lucky',
          'offer expires', 'exclusive deal', 'risk-free']
  };

  // ─── Phishing target brands (commonly impersonated) ───
  const PHISHING_TARGETS = [
    'paypal', 'apple', 'amazon', 'netflix', 'microsoft', 'google', 'facebook',
    'instagram', 'whatsapp', 'telegram', 'twitter', 'linkedin', 'snapchat',
    'hdfc', 'icici', 'sbi', 'axis', 'kotak', 'paytm', 'phonepe', 'gpay',
    'razorpay', 'cred', 'flipkart', 'myntra', 'swiggy', 'zomato',
    'chase', 'wellsfargo', 'bankofamerica', 'citibank', 'hsbc',
    'dropbox', 'adobe', 'zoom', 'slack', 'github', 'steam', 'epic',
    'binance', 'coinbase', 'kraken', 'metamask', 'trust wallet'
  ];

  // ─── Homoglyph mapping for look-alike detection ───
  const HOMOGLYPHS = {
    'a': ['@', 'à', 'á', 'â', 'ã', 'ä', 'å', 'ɑ', 'а'],
    'e': ['è', 'é', 'ê', 'ë', 'ε', 'е', '3'],
    'i': ['ì', 'í', 'î', 'ï', '1', 'l', '|', 'і'],
    'o': ['ò', 'ó', 'ô', 'õ', 'ö', '0', 'ο', 'о'],
    'l': ['1', '|', 'I', 'ℓ'],
    'g': ['q', '9'],
    's': ['$', '5'],
    't': ['+', '7']
  };

  /**
   * Analyze a URL for phishing/scam indicators
   * @param {string} url
   * @returns {{ isScam: boolean, confidence: number, reasons: string[] }}
   */
  function analyzeURL(url) {
    const reasons = [];
    let score = 0;

    try {
      const parsed = new URL(url);
      const hostname = parsed.hostname.toLowerCase();
      const pathname = parsed.pathname.toLowerCase();
      const fullUrl = url.toLowerCase();

      // 1. IP-based URL (very suspicious)
      if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
        score += 40;
        reasons.push('URL uses raw IP address instead of domain name');
      }

      // 2. Suspicious TLD
      const tld = '.' + hostname.split('.').pop();
      if (SUSPICIOUS_TLDS.includes(tld)) {
        score += 25;
        reasons.push(`Suspicious top-level domain: ${tld}`);
      }

      // 3. URL shortener
      if (URL_SHORTENERS.some(s => hostname === s || hostname.endsWith('.' + s))) {
        score += 20;
        reasons.push('URL shortener detected — destination is hidden');
      }

      // 4. Excessive subdomains (e.g., login.secure.bank.fake.com)
      const subdomainCount = hostname.split('.').length - 2;
      if (subdomainCount >= 3) {
        score += 25;
        reasons.push(`Excessive subdomains (${subdomainCount}) — common phishing tactic`);
      }

      // 5. Brand impersonation in subdomain/path
      for (const brand of PHISHING_TARGETS) {
        // Brand in subdomain but NOT as the actual domain
        const domainParts = hostname.split('.');
        const mainDomain = domainParts.slice(-2).join('.');
        if (hostname.includes(brand) && !mainDomain.startsWith(brand)) {
          score += 35;
          reasons.push(`Possible ${brand} impersonation — brand name in subdomain/URL but not the real domain`);
          break;
        }
      }

      // 6. Homoglyph / look-alike domain detection
      for (const brand of PHISHING_TARGETS) {
        if (isHomoglyphMatch(hostname, brand)) {
          score += 40;
          reasons.push(`Domain looks like "${brand}" using look-alike characters (homoglyph attack)`);
          break;
        }
      }

      // 7. Suspicious path keywords
      const suspiciousPaths = ['login', 'signin', 'verify', 'secure', 'account', 'update',
                               'confirm', 'banking', 'password', 'credential', 'wallet'];
      const pathMatches = suspiciousPaths.filter(kw => pathname.includes(kw));
      if (pathMatches.length >= 2) {
        score += 20;
        reasons.push(`Suspicious keywords in URL path: ${pathMatches.join(', ')}`);
      }

      // 8. Very long URL (> 200 chars, common in phishing)
      if (url.length > 200) {
        score += 10;
        reasons.push('Unusually long URL — often used to hide the true destination');
      }

      // 9. HTTP (no SSL) on a supposedly sensitive page
      if (parsed.protocol === 'http:' && pathMatches.length > 0) {
        score += 15;
        reasons.push('No HTTPS encryption on a page asking for sensitive information');
      }

      // 10. Multiple @ symbols or encoded characters
      if (fullUrl.includes('@') || (fullUrl.match(/%[0-9a-f]{2}/gi) || []).length > 3) {
        score += 15;
        reasons.push('URL contains suspicious encoded characters or @ symbol misdirection');
      }

      // 11. Data URI or javascript: (should be caught earlier but double-check)
      if (url.startsWith('data:') || url.startsWith('javascript:')) {
        score += 50;
        reasons.push('Non-standard URL scheme — potentially malicious');
      }

    } catch (e) {
      // Malformed URLs are inherently suspicious
      score += 30;
      reasons.push('Malformed URL — cannot be parsed');
    }

    score = Math.min(100, score);
    return {
      isScam: score >= 50,
      confidence: score / 100,
      reasons: reasons,
      riskScore: score
    };
  }

  /**
   * Analyze a text message for scam/phishing indicators
   * @param {string} text
   * @returns {{ isScam: boolean, confidence: number, reasons: string[] }}
   */
  function analyzeText(text) {
    const reasons = [];
    let score = 0;
    const lower = text.toLowerCase();

    // 1. High-risk keywords
    const highMatches = SCAM_KEYWORDS.high.filter(kw => lower.includes(kw));
    if (highMatches.length > 0) {
      score += Math.min(40, highMatches.length * 20);
      reasons.push(`High-risk keywords detected: ${highMatches.join(', ')}`);
    }

    // 2. Medium-risk keywords
    const medMatches = SCAM_KEYWORDS.medium.filter(kw => lower.includes(kw));
    if (medMatches.length > 0) {
      score += Math.min(30, medMatches.length * 10);
      reasons.push(`Suspicious keywords: ${medMatches.join(', ')}`);
    }

    // 3. Low-risk keywords
    const lowMatches = SCAM_KEYWORDS.low.filter(kw => lower.includes(kw));
    if (lowMatches.length > 0) {
      score += Math.min(20, lowMatches.length * 7);
      reasons.push(`Potential bait phrases: ${lowMatches.join(', ')}`);
    }

    // 4. Extract and analyze embedded URLs
    const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi;
    const urls = text.match(urlRegex) || [];
    for (const url of urls) {
      const urlResult = analyzeURL(url);
      if (urlResult.isScam) {
        score += 30;
        reasons.push(`Contains suspicious link: ${url.substring(0, 60)}...`);
        reasons.push(...urlResult.reasons.map(r => `  ↳ ${r}`));
      }
    }

    // 5. Urgency/pressure indicators
    const urgencyPatterns = [
      /within \d+ (hour|minute|day)/i,
      /last (chance|warning|notice)/i,
      /action required/i,
      /respond (immediately|now|asap)/i,
      /failure to .*(will result|may lead)/i,
      /your.*(has been|is being).*(suspend|block|lock|terminat)/i
    ];
    const urgencyMatches = urgencyPatterns.filter(p => p.test(text));
    if (urgencyMatches.length > 0) {
      score += urgencyMatches.length * 10;
      reasons.push(`Pressure/urgency language detected (${urgencyMatches.length} patterns)`);
    }

    // 6. Suspicious phone number patterns (Indian premium/toll numbers)
    if (/\b(1800|900|190)\d{6,}\b/.test(text)) {
      score += 10;
      reasons.push('Contains potentially suspicious phone number');
    }

    // 7. Request for sensitive data
    const sensitivePatterns = [
      /send.*(otp|pin|password|cvv)/i,
      /share.*(otp|pin|password|cvv|card)/i,
      /enter.*(otp|pin|password|cvv)/i,
      /provide.*(bank|account|card|aadhaar|pan)/i
    ];
    const sensitiveMatches = sensitivePatterns.filter(p => p.test(text));
    if (sensitiveMatches.length > 0) {
      score += sensitiveMatches.length * 15;
      reasons.push('Requests sensitive personal/financial information');
    }

    // 8. ALL CAPS sections (shouting = pressure tactic)
    const capsWords = text.split(/\s+/).filter(w => w.length > 3 && w === w.toUpperCase() && /[A-Z]/.test(w));
    if (capsWords.length >= 3) {
      score += 10;
      reasons.push('Excessive use of CAPITAL LETTERS — pressure tactic');
    }

    score = Math.min(100, score);
    return {
      isScam: score >= 45,
      confidence: score / 100,
      reasons: reasons,
      riskScore: score
    };
  }

  /**
   * Check if a hostname is a homoglyph/look-alike of a brand
   */
  function isHomoglyphMatch(hostname, brand) {
    // Extract main domain name (without TLD)
    const domainBase = hostname.split('.').slice(0, -1).join('');
    if (domainBase === brand) return false; // exact match = legitimate

    // Check edit distance after normalizing homoglyphs
    const normalized = normalizeHomoglyphs(domainBase);
    if (normalized !== domainBase && normalized.includes(brand)) {
      return true;
    }

    // Levenshtein distance check (distance 1-2 = suspicious)
    if (brand.length >= 5) {
      const dist = levenshtein(domainBase, brand);
      if (dist > 0 && dist <= 2) {
        return true;
      }
    }

    return false;
  }

  function normalizeHomoglyphs(str) {
    let result = str.toLowerCase();
    for (const [letter, glyphs] of Object.entries(HOMOGLYPHS)) {
      for (const g of glyphs) {
        result = result.replaceAll(g, letter);
      }
    }
    return result;
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

  // Public API
  return { analyzeURL, analyzeText };

})();

// Make available in both content script and service worker contexts
if (typeof globalThis !== 'undefined') {
  globalThis.RiskRadarScanner = RiskRadarScanner;
}
