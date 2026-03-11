"""
Evidence Extraction Engine
===========================
Extracts UPI IDs, phone numbers, URLs, payment amounts, dates/times,
email addresses, account/card numbers, and impersonated org names
from message text or screenshot (via Gemini Vision OCR).

Input is capped at MAX_TEXT_LENGTH characters before any regex runs to
prevent runaway processing on large payloads.
"""

import re
from datetime import datetime

# ── Safety cap ────────────────────────────────────────────────────
MAX_TEXT_LENGTH = 10_000   # characters; enough for any realistic scam message


# ── Canonical list of orgs known to be impersonated ───────────────
# Imported by portal_guide.py and patterns.py too, so keep it here
# as a single source of truth.
IMPERSONATED_ORGS = [
    # Banks
    'SBI', 'HDFC', 'ICICI', 'Axis Bank', 'Kotak', 'PNB', 'Canara Bank',
    'Bank of Baroda', 'Union Bank', 'IndusInd', 'Yes Bank', 'IDFC First',
    # Regulators / Govt
    'RBI', 'TRAI', 'NPCI', 'CERT-In', 'CBI', 'Income Tax', 'IRDAI', 'SEBI',
    'UIDAI', 'Aadhaar', 'Customs', 'ED',
    # Payments
    'PhonePe', 'Google Pay', 'GPay', 'Paytm', 'BHIM',
    # E-commerce / Logistics
    'Amazon', 'Flipkart', 'Meesho', 'FedEx', 'DHL', 'India Post',
    # Telecom
    'Jio', 'Airtel', 'BSNL', 'Vi',
]

# ── Valid UPI bank handles (used for strict matching) ─────────────
_UPI_HANDLES = (
    "paytm|okaxis|oksbi|okicici|okhdfcbank|ybl|upi|axl|ibl|apl|barodampay|"
    "centralbank|cnrb|csbpay|dbs|federal|freecharge|juspay|kotak|mahb|nsdl|"
    "pingpay|pnb|postpay|rbl|sbi|sc|tjsb|uco|unionbank|utbi|vijb|waaxis|"
    "waicici|wasbi|oksbimab|aubank|abfspay|airtel|allbank|andb|apb|bkid|"
    "bocupi|boi|canarabank|cmsidfc|eazypay|equitas|esaf|fbl|finobank|"
    "hdfcbankjd|hsbc|icici|idbi|idfc|idfcfirst|imobile|indusind|jkb|karb|"
    "kbl|kvb|lime|luckybank|lvb|mahagramupi|mobikwik|myicici|nkgsb|obc|"
    "okbizaxis|okbizhdfc|okbizicici|okbizsbi|payzapp|psb|purz|raj|"
    "rmhdfcbank|rnsb|saraswat|sebl|sib|slbcbank|synb|tapicici|tbsb|tjsy|"
    "uco|usfb|utib|utiitsl|yesbank"
)

_EMAIL_DOMAINS = {'gmail', 'yahoo', 'hotmail', 'outlook', 'rediffmail', 'protonmail', 'ymail'}


# ─────────────────────────────────────────────────────────────────
# PUBLIC API
# ─────────────────────────────────────────────────────────────────

def extract_entities(text: str) -> dict:
    """
    Run all regex extractors on the given text.
    Text is pre-capped at MAX_TEXT_LENGTH to protect against large inputs.

    Returns a dict with lists of all found entities.
    Each entity is a plain string (deduped).
    """
    text = text[:MAX_TEXT_LENGTH]
    return {
        "upi_ids":         _extract_upi_ids(text),
        "phone_numbers":   _extract_phones(text),
        "urls":            _extract_urls(text),
        "amounts":         _extract_amounts(text),
        "dates":           _extract_dates(text),
        "emails":          _extract_emails(text),
        "account_numbers": _extract_account_numbers(text),
        "names_mentioned": _extract_org_names(text),
    }


# ─────────────────────────────────────────────────────────────────
# PRIVATE EXTRACTORS
# ─────────────────────────────────────────────────────────────────

def _extract_upi_ids(text: str) -> list:
    """
    UPI IDs — two-pass approach:
      1. Strict  : handle must be a known bank VPA suffix  → high confidence
      2. Lenient : any @word that is NOT an email domain   → medium confidence
    Both passes are combined and deduplicated.
    """
    # Pass 1 — strict: only known UPI handles
    strict_pattern = rf'\b([a-zA-Z0-9._\-]{{3,50}}@(?:{_UPI_HANDLES}))\b'
    strict_found = set(re.findall(strict_pattern, text, re.IGNORECASE))

    # Pass 2 — lenient: any handle-like string, excluding known email domains
    lenient_pattern = r'\b([a-zA-Z0-9._\-]{3,30}@[a-zA-Z]{3,20})\b'
    lenient_found = {
        u for u in re.findall(lenient_pattern, text, re.IGNORECASE)
        if u.split('@')[-1].lower() not in _EMAIL_DOMAINS
    }

    return list(strict_found | lenient_found)


def _extract_phones(text: str) -> list:
    """
    Indian mobile numbers — 10 digits starting with 6-9.
    Handles formats:
      +91-XXXXXXXXXX  +91 XXXXXXXXXX  +91XXXXXXXXXX
      0091XXXXXXXXXX  91XXXXXXXXXX
      XXXXXXXXXX (bare)
    Also handles separators: space, hyphen, dot within the number.
    """
    pattern = (
        r'(?:'
            r'(?:\+91|0091|91)'   # optional country code
            r'[\s\-.]?'           # optional separator after CC
        r')?'
        r'(?<!\d)'                # not preceded by digit (boundary)
        r'([6-9]\d{4}[\s\-.]?\d{5})'   # 5+5 with optional mid-separator
        r'(?!\d)'                 # not followed by digit
    )
    found = re.findall(pattern, text)
    cleaned = [re.sub(r'[\s\-.]', '', p) for p in found]
    return list({p for p in cleaned if len(p) == 10})


def _extract_urls(text: str) -> list:
    """
    URLs — full http/https links plus common URL shorteners.
    Strips trailing punctuation that is likely sentence punctuation,
    not part of the URL.
    """
    pattern = (
        r'(?:'
            r'https?://[^\s<>"\')\]]+|'
            r'(?:bit\.ly|tinyurl\.com|t\.co|goo\.gl|rb\.gy|cutt\.ly|'
            r'short\.io|ow\.ly|is\.gd|tiny\.cc)/[^\s<>"\')\]]+'
        r')'
    )
    raw = re.findall(pattern, text, re.IGNORECASE)
    # strip trailing punctuation (., ), ], !)
    cleaned = [re.sub(r'[.,!)\]]+$', '', u) for u in raw]
    return list(set(cleaned))


def _extract_amounts(text: str) -> list:
    """
    Payment amounts in INR.
    Matches: ₹500, Rs 1,000, INR 5000, 50000 rupees, 2 lakh, 1.5 crore.
    """
    pattern = (
        r'(?:'
            r'(?:₹|Rs\.?|INR)\s?[\d,]+(?:\.\d{1,2})?|'
            r'\b\d[\d,]*(?:\.\d{1,2})?\s?(?:rupees?|lakh|crore|thousand)\b'
        r')'
    )
    found = re.findall(pattern, text, re.IGNORECASE)
    return list({f.strip() for f in found})


def _extract_dates(text: str) -> list:
    """
    Dates and times — standard numeric formats, written dates,
    relative terms (today, yesterday), and time strings.
    """
    patterns = [
        r'\b\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4}\b',                           # DD/MM/YY(YY)
        r'\b\d{4}[/\-]\d{2}[/\-]\d{2}\b',                                  # YYYY-MM-DD
        r'\b\d{1,2}\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|'
        r'May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|'
        r'Nov(?:ember)?|Dec(?:ember)?)\s+\d{4}\b',                          # 3 March 2025
        r'\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|'
        r'Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|'
        r'Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2},?\s+\d{4}\b',             # March 3, 2025
        r'\b\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM|am|pm)?\b',               # 10:30 AM
        r'\b(?:today|yesterday|this\s+morning|last\s+night|this\s+evening)\b',
    ]
    found = []
    for p in patterns:
        found.extend(re.findall(p, text, re.IGNORECASE))
    return list({f.strip() for f in found})


def _extract_emails(text: str) -> list:
    """
    Standard email addresses at known personal email domains.
    UPI IDs (e.g. name@paytm) are deliberately excluded here —
    they are captured by _extract_upi_ids().
    """
    pattern = (
        r'\b[a-zA-Z0-9._%+\-]+@'
        r'(?:gmail|yahoo|hotmail|outlook|rediffmail|protonmail|ymail|'
        r'icloud|live|msn)\.[a-zA-Z]{2,}\b'
    )
    return list(set(re.findall(pattern, text, re.IGNORECASE)))


def _extract_account_numbers(text: str) -> list:
    """
    Bank account / card numbers.

    Two strategies:
      1. Keyword-prefixed  : 'account number 123456789012' → most reliable
      2. Standalone 16-digit: bare 16-digit strings (credit/debit card style)
         — only captured if NOT already caught as a phone number and not
           a date-like pattern.
    """
    found = set()

    # Strategy 1: keyword-prefixed account numbers (9–18 digits)
    kw_pattern = r'(?:account(?:\s+no\.?|\s+number)?|a/c|ac\s*no\.?|acct)[\s:#-]*(\d{9,18})'
    found.update(re.findall(kw_pattern, text, re.IGNORECASE))

    # Strategy 2: standalone 16-digit numbers (card numbers)
    card_pattern = r'(?<!\d)(\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4})(?!\d)'
    for match in re.findall(card_pattern, text):
        digits = re.sub(r'[\s\-]', '', match)
        if len(digits) == 16:
            found.add(digits)

    return list(found)


def _extract_org_names(text: str) -> list:
    """
    Well-known organizations known to be impersonated in Indian scams.
    Uses word-boundary regex to avoid false matches like 'ED' inside
    'send'/'needed' or 'Vi' inside 'via'/'victim'.
    """
    found = []
    for org in IMPERSONATED_ORGS:
        # Escape special regex chars (e.g. 'CERT-In') and wrap in \b boundaries
        pattern = r'\b' + re.escape(org) + r'\b'
        if re.search(pattern, text, re.IGNORECASE):
            found.append(org)
    return found


# ─────────────────────────────────────────────────────────────────
# COMPLAINT CONTEXT HELPER
# ─────────────────────────────────────────────────────────────────

def format_complaint_context(entities: dict, original_text: str, category: str, score: int) -> str:
    """
    Build a structured context string for an LLM to generate a complaint draft.

    NOTE: The main /api/extract-evidence pipeline currently uses
    get_incident_description() (ollama_client.py) instead of this function.
    Kept here for potential future use or manual complaint drafting.
    """
    lines = [f"FRAUD MESSAGE:\n{original_text}\n"]
    lines.append(f"DETECTED CATEGORY: {category} (Risk Score: {score}/100)\n")

    field_map = {
        "upi_ids":         "UPI IDs FOUND",
        "phone_numbers":   "PHONE NUMBERS FOUND",
        "urls":            "SUSPICIOUS URLS",
        "amounts":         "PAYMENT AMOUNTS",
        "dates":           "DATES/TIMES MENTIONED",
        "emails":          "EMAIL ADDRESSES",
        "account_numbers": "ACCOUNT/CARD NUMBERS",
        "names_mentioned": "ORGANIZATIONS IMPERSONATED",
    }
    for key, label in field_map.items():
        values = entities.get(key, [])
        if values:
            lines.append(f"{label}: {', '.join(values)}")

    return "\n".join(lines)
