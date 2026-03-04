"""
Evidence Extraction Engine
Extracts UPI IDs, phone numbers, URLs, payment amounts, dates/times
from message text or screenshot (via Gemini Vision OCR).
"""

import re
from datetime import datetime


def extract_entities(text: str) -> dict:
    """
    Run all regex extractors on the given text.
    Returns a dict with lists of all found entities.
    """
    return {
        "upi_ids": _extract_upi_ids(text),
        "phone_numbers": _extract_phones(text),
        "urls": _extract_urls(text),
        "amounts": _extract_amounts(text),
        "dates": _extract_dates(text),
        "emails": _extract_emails(text),
        "account_numbers": _extract_account_numbers(text),
        "names_mentioned": _extract_org_names(text),
    }


def _extract_upi_ids(text: str) -> list:
    """UPI IDs like: 9876543210@paytm, name@okaxis, abc@ybl"""
    pattern = r'\b([a-zA-Z0-9._\-]{3,}@(?:paytm|okaxis|oksbi|okicici|okhdfcbank|ybl|upi|axl|ibl|apl|barodampay|centralbank|cnrb|csbpay|dbs|federal|freecharge|juspay|kotak|mahb|nsdl|pingpay|pnb|postpay|rbl|sbi|sc|tjsb|uco|unionbank|utbi|vijb|waaxis|waicici|wasbi|oksbimab|aubank|abfspay|airtel|allbank|andb|apb|bkid|bocupi|boi|canarabank|cmsidfc|eazypay|equitas|esaf|fbl|finobank|hdfcbankjd|hsbc|icici|idbi|idfc|idfcfirst|imobile|indusind|ibl|jkb|karb|kbl|kvb|lime|luckybank|lvb|mahagramupi|mobikwik|myicici|nkgsb|obc|okbizaxis|okbizhdfc|okbizicici|okbizsbi|payzapp|psb|purz|raj|rmhdfcbank|rnsb|saraswat|sbi|scbl|sebl|sib|slbcbank|synb|tapicici|tbsb|tjsb|tjsy|uco|unionbank|usfb|utib|utiitsl|vijb|yesbank)\b)'
    simple = r'\b[a-zA-Z0-9._\-]{3,30}@[a-zA-Z]{3,20}\b'
    found = set(re.findall(pattern, text, re.IGNORECASE))
    found.update(re.findall(simple, text, re.IGNORECASE))
    # exclude email-like patterns (gmail, yahoo, etc.)
    email_domains = {'gmail', 'yahoo', 'hotmail', 'outlook', 'rediffmail', 'protonmail'}
    result = [u for u in found if u.split('@')[-1].lower() not in email_domains]
    return list(set(result))


def _extract_phones(text: str) -> list:
    """Indian mobile numbers — 10 digits starting with 6-9, optionally prefixed with +91 or 0"""
    pattern = r'(?:(?:\+91|0091|91)?[-.\s]?)?(?<!\d)([6-9]\d{4}[-.\s]?\d{5})(?!\d)'
    found = re.findall(pattern, text)
    cleaned = [re.sub(r'[-.\s]', '', p) for p in found]
    # Deduplicate and filter valid length
    return list(set(p for p in cleaned if len(p) == 10))


def _extract_urls(text: str) -> list:
    """URLs including shortened links (bit.ly, t.co, tinyurl etc.)"""
    pattern = r'(?:https?://[^\s<>"]+|(?:bit\.ly|tinyurl\.com|t\.co|goo\.gl|rb\.gy|cutt\.ly|short\.io|ow\.ly|is\.gd)/[^\s<>"]+)'
    return list(set(re.findall(pattern, text, re.IGNORECASE)))


def _extract_amounts(text: str) -> list:
    """Payment amounts in INR — ₹500, Rs 1000, INR 5,000, 50000 rupees"""
    pattern = r'(?:₹|Rs\.?|INR)\s?[\d,]+(?:\.\d{1,2})?|\d[\d,]*\s?(?:rupees?|lakh|crore|thousand)'
    found = re.findall(pattern, text, re.IGNORECASE)
    return list(set(f.strip() for f in found))


def _extract_dates(text: str) -> list:
    """Date and time — DD/MM/YYYY, YYYY-MM-DD, 3rd March 2025, today, etc."""
    patterns = [
        r'\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b',
        r'\b\d{4}[/-]\d{2}[/-]\d{2}\b',
        r'\b\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}\b',
        r'\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b',
        r'\b\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?\b',
        r'\b(?:today|yesterday|this morning|last night)\b',
    ]
    found = []
    for p in patterns:
        found.extend(re.findall(p, text, re.IGNORECASE))
    return list(set(f.strip() for f in found))


def _extract_emails(text: str) -> list:
    """Standard email addresses (not UPI IDs)"""
    pattern = r'\b[a-zA-Z0-9._%+\-]+@(?:gmail|yahoo|hotmail|outlook|rediffmail|protonmail|ymail)\.[a-zA-Z]{2,}\b'
    return list(set(re.findall(pattern, text, re.IGNORECASE)))


def _extract_account_numbers(text: str) -> list:
    """Bank account numbers — 9-18 digit sequences (not phone numbers)"""
    pattern = r'(?:account(?:\s+number)?|a/c|ac no\.?|acct)[\s:]*(\d{9,18})'
    return list(set(re.findall(pattern, text, re.IGNORECASE)))


def _extract_org_names(text: str) -> list:
    """Well-known impersonated organizations mentioned"""
    orgs = [
        'SBI', 'HDFC', 'ICICI', 'Axis Bank', 'Kotak', 'PNB', 'Canara Bank',
        'RBI', 'TRAI', 'NPCI', 'CERT-In', 'CBI', 'Income Tax', 'IRDAI', 'SEBI',
        'UIDAI', 'Aadhaar', 'PhonePe', 'Google Pay', 'GPay', 'Paytm', 'BHIM',
        'Amazon', 'Flipkart', 'Meesho', 'FedEx', 'DHL', 'India Post',
    ]
    text_lower = text.lower()
    return [org for org in orgs if org.lower() in text_lower]


def format_complaint_context(entities: dict, original_text: str, category: str, score: int) -> str:
    """Build a structured context string for Gemini to generate the complaint."""
    lines = [f"FRAUD MESSAGE:\n{original_text}\n"]
    lines.append(f"DETECTED CATEGORY: {category} (Risk Score: {score}/100)\n")

    if entities.get("upi_ids"):
        lines.append(f"UPI IDs FOUND: {', '.join(entities['upi_ids'])}")
    if entities.get("phone_numbers"):
        lines.append(f"PHONE NUMBERS FOUND: {', '.join(entities['phone_numbers'])}")
    if entities.get("urls"):
        lines.append(f"SUSPICIOUS URLS: {', '.join(entities['urls'])}")
    if entities.get("amounts"):
        lines.append(f"PAYMENT AMOUNTS: {', '.join(entities['amounts'])}")
    if entities.get("dates"):
        lines.append(f"DATES/TIMES MENTIONED: {', '.join(entities['dates'])}")
    if entities.get("emails"):
        lines.append(f"EMAIL ADDRESSES: {', '.join(entities['emails'])}")
    if entities.get("names_mentioned"):
        lines.append(f"ORGANIZATIONS IMPERSONATED: {', '.join(entities['names_mentioned'])}")

    return "\n".join(lines)
