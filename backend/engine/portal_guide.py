"""
Portal Guide Generator
======================
Maps analyzed fraud results + extracted entities into pre-filled
fields that match the actual cybercrime.gov.in portal sections.

Returned as `portal_guide` in the /api/extract-evidence response.
"""

from datetime import datetime


# ── Sub-category mapping from our fraud categories ────────────────
SUBCATEGORY_MAP = {
    "UPI / Payment Fraud":    "UPI Related Frauds",
    "KYC Phishing":           "Internet Banking Related Fraud",
    "Bank Impersonation":     "Debit/Credit Card Fraud / SIM Swap Fraud",
    "Govt / Telecom Scam":    "Fraud Call / Vishing",
    "Lottery / Prize Scam":   "UPI Related Frauds",
    "Investment Fraud":       "Business Email Compromise / Email Takeover",
    "Loan App Scam":          "Internet Banking Related Fraud",
    "Job / WFH Scam":         "Internet Banking Related Fraud",
    "OTP Theft":              "UPI Related Frauds",
    "Crypto Scam":            "Demat / Depository Fraud",
    "Parcel / Customs Scam":  "Fraud Call / Vishing",
    "Authority Impersonation": "Fraud Call / Vishing",
    "General":                "Other",
}

# ── Platform detection keywords ───────────────────────────────────
PLATFORM_KEYWORDS = {
    "WhatsApp":  ["whatsapp", "whts", "wa.me"],
    "Telegram":  ["telegram", "t.me"],
    "Email":     ["@gmail", "@yahoo", "@outlook", "@hotmail", "email", "mail"],
    "Facebook":  ["facebook", "fb.com", "fb.me"],
    "Instagram": ["instagram", "insta"],
    "Twitter":   ["twitter", "x.com"],
    "SMS":       ["sms", "text message"],
    "Mobile App":["app", "playstore", "play store"],
    "Website URL":["http://", "https://", "bit.ly", "tinyurl"],
}


def _detect_platform(text: str) -> str:
    """Guess the platform from message text."""
    text_lower = text.lower()
    for platform, keywords in PLATFORM_KEYWORDS.items():
        if any(kw in text_lower for kw in keywords):
            return platform
    return "Other"


def _build_suspect_identifiers(entities: dict) -> list:
    """
    Convert extracted entities into suspect identifier list
    matching portal's Identifier Type options.
    """
    identifiers = []
    for upi in entities.get("upi_ids", []):
        identifiers.append({"type": "Bank Account Number", "value": upi})
    for phone in entities.get("phone_numbers", []):
        identifiers.append({"type": "Mobile Number", "value": phone})
    for url in entities.get("urls", []):
        identifiers.append({"type": "URL", "value": url})
    for email in entities.get("emails", []):
        identifiers.append({"type": "Email", "value": email})
    return identifiers





def build_portal_guide(
    original_text: str,
    entities: dict,
    category: str,
    score: int,
    level: str,
    explanation: str,
    matched_patterns: list,
    incident_description: str = "",
) -> dict:
    """
    Build the full portal_guide structure matching cybercrime.gov.in sections.
    Pre-fills everything extractable from our analysis.
    Returns a dict with three sections.
    """
    subcategory = SUBCATEGORY_MAP.get(category, "Other")
    platform = _detect_platform(original_text)
    identifiers = _build_suspect_identifiers(entities)
    incident_desc = incident_description or explanation
    today = datetime.now().strftime("%Y-%m-%d")

    return {
        # ── Section 1: Incident Details ───────────────────────────
        "section1": {
            "title": "Incident Details",
            "fields": {
                "complaint_category": {
                    "label": "Complaint Category",
                    "value": "Online Financial Fraud",
                    "status": "prefilled",
                },
                "subcategory": {
                    "label": "Sub-Category",
                    "value": subcategory,
                    "status": "prefilled",
                    "note": f"Mapped from detected fraud type: {category}",
                },
                "incident_date": {
                    "label": "Incident Date",
                    "value": ", ".join(entities.get("dates", [])) or today,
                    "status": "prefilled" if entities.get("dates") else "user_fill",
                    "note": entities.get("dates") and "Extracted from message" or "Estimated as today — update if you know the exact date",
                },
                "platform": {
                    "label": "Where Incident Occurred",
                    "value": platform,
                    "status": "prefilled",
                    "note": "Detected from message content",
                },
                "incident_description": {
                    "label": "Incident Description",
                    "value": incident_desc,
                    "status": "prefilled",
                    "note": f"{len(incident_desc)} chars (min 200 / max 1500)",
                },
                "delay_in_reporting": {
                    "label": "Delay in Reporting",
                    "value": "Select: Yes / No",
                    "status": "user_fill",
                },
            },
        },

        # ── Section 2: Suspect Details ────────────────────────────
        "section2": {
            "title": "Suspect Details",
            "identifiers": identifiers,
            "fields": {
                "consent": {
                    "label": "Consent to share suspect info with agencies",
                    "value": "Tick the checkbox",
                    "status": "user_fill",
                },
                "suspect_name": {
                    "label": "Suspect Name",
                    "value": "Unknown" if not entities.get("names_mentioned") else entities["names_mentioned"][0],
                    "status": "user_fill",
                    "note": "Fill if known",
                },
                "suspect_photo": {
                    "label": "Upload Photograph of Suspect",
                    "value": "Optional — JPG/PNG/PDF, max 5 MB",
                    "status": "user_fill",
                },
                "suspect_address": {
                    "label": "Share Suspect Address",
                    "value": "Select: Yes / No",
                    "status": "user_fill",
                },
            },
            "note": f"{len(identifiers)} suspect identifier(s) extracted and ready to add",
        },

        # ── Section 3: Complainant Details ────────────────────────
        "section3": {
            "title": "Complainant / Victim Details",
            "note": "All fields must be filled manually. We cannot pre-fill personal information.",
            "fields": {
                "title":           {"label": "Title (Mr/Mrs/Dr...)",          "status": "user_fill"},
                "name":            {"label": "Full Name",                     "status": "user_fill"},
                "mobile":          {"label": "Mobile Number",                 "status": "user_fill"},
                "gender":          {"label": "Gender",                        "status": "user_fill"},
                "dob":             {"label": "Date of Birth",                 "status": "user_fill"},
                "family_member":   {"label": "Father / Mother / Spouse Name", "status": "user_fill"},
                "email":           {"label": "Email ID",                      "status": "user_fill"},
                "address":         {"label": "Complete Address (House No, Street, City, State, Pincode)", "status": "user_fill"},
                "police_station":  {"label": "Nearest Police Station",        "status": "user_fill"},
                "relationship":    {"label": "Relationship with Victim",      "value": "Self", "status": "user_fill"},
                "national_id":     {"label": "Upload National ID (max 5 MB)", "status": "user_fill"},
            },
        },

        # ── Summary stats ─────────────────────────────────────────
        "summary": {
            "prefilled_fields": 5,
            "user_fill_fields": 14,
            "identifiers_found": len(identifiers),
            "risk_score": score,
            "risk_level": level,
            "portal_url": "https://cybercrime.gov.in",
        },
    }
