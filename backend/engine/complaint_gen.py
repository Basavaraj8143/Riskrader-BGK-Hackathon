"""
Complaint Generator — Uses Gemini to generate a structured cybercrime complaint
from extracted evidence and analyzed fraud message.
"""

import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")


def generate_complaint(
    original_text: str,
    entities: dict,
    category: str,
    score: int,
    explanation: str,
    ocr_text: str = None
) -> dict:
    """
    Generate a structured cybercrime complaint draft.
    Uses Gemini if API key available, else builds a template-based draft.
    """
    source_text = ocr_text or original_text

    if GEMINI_API_KEY:
        return _gemini_complaint(source_text, entities, category, score, explanation)
    else:
        return _template_complaint(source_text, entities, category, score)


def _gemini_complaint(text, entities, category, score, explanation):
    try:
        from google import genai
        import time

        client = genai.Client(api_key=GEMINI_API_KEY)

        # Build evidence summary for Gemini
        evidence_parts = []
        if entities.get("upi_ids"):
            evidence_parts.append(f"UPI IDs: {', '.join(entities['upi_ids'])}")
        if entities.get("phone_numbers"):
            evidence_parts.append(f"Phone Numbers: {', '.join(entities['phone_numbers'])}")
        if entities.get("urls"):
            evidence_parts.append(f"Suspicious URLs: {', '.join(entities['urls'])}")
        if entities.get("amounts"):
            evidence_parts.append(f"Amounts Mentioned: {', '.join(entities['amounts'])}")
        if entities.get("dates"):
            evidence_parts.append(f"Dates/Times: {', '.join(entities['dates'])}")
        if entities.get("names_mentioned"):
            evidence_parts.append(f"Impersonated Organizations: {', '.join(entities['names_mentioned'])}")

        evidence_str = "\n".join(evidence_parts) if evidence_parts else "No specific entities extracted."
        today = datetime.now().strftime("%d %B %Y")

        prompt = f"""You are a cybercrime legal assistant in India. Generate a formal, well-structured cybercrime complaint letter in English.

FRAUD MESSAGE RECEIVED BY VICTIM:
---
{text}
---

EXTRACTED EVIDENCE:
{evidence_str}

FRAUD ANALYSIS:
- Category: {category}
- Risk Score: {score}/100
- AI Assessment: {explanation}

Generate a formal complaint letter with these sections:
1. Header: "To, The Station House Officer / Cyber Crime Cell" + date ({today})
2. Subject line
3. Respectful opening
4. Incident Description (3-4 sentences describing the fraud based on the actual message)
5. Evidence Collected (list all extracted UPI IDs, phone numbers, URLs, amounts as bullet points - write "Not found" if none)
6. Legal Sections Applicable (cite relevant IT Act / IPC sections for {category})
7. Relief Requested (3 specific asks)
8. Closing with signature placeholders
9. Footer: "National Cyber Crime Helpline: 1930 | cybercrime.gov.in"

Keep it formal, concise, and under 400 words. Use Indian legal complaint format."""

        def call():
            r = client.models.generate_content(model="gemini-2.0-flash", contents=prompt)
            return r.text.strip()

        try:
            draft = call()
        except Exception as e:
            if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                import time
                time.sleep(3)
                try:
                    draft = call()
                except Exception:
                    return _template_complaint(text, entities, category, score)
            else:
                raise

        return {"complaint": draft, "generated_by": "Gemini AI ✨"}

    except Exception:
        return _template_complaint(text, entities, category, score)


def _template_complaint(text, entities, category, score):
    """Fallback template-based complaint when Gemini unavailable."""
    today = datetime.now().strftime("%d %B %Y")

    upi = ", ".join(entities.get("upi_ids", [])) or "Not identified"
    phones = ", ".join(entities.get("phone_numbers", [])) or "Not identified"
    urls = ", ".join(entities.get("urls", [])) or "Not identified"
    amounts = ", ".join(entities.get("amounts", [])) or "Not mentioned"
    dates = ", ".join(entities.get("dates", [])) or "Refer to attached screenshot"
    orgs = ", ".join(entities.get("names_mentioned", [])) or "Unknown"

    level_map = {"HIGH": "HIGH RISK (imminent financial threat)", "MEDIUM": "MEDIUM RISK", "LOW": "LOW RISK"}
    level = level_map.get("HIGH" if score >= 61 else "MEDIUM" if score >= 31 else "LOW", "HIGH RISK")

    draft = f"""CYBERCRIME COMPLAINT DRAFT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

To,
The Station House Officer / Nodal Officer,
Cyber Crime Cell,
[Your City], [Your State]

Date: {today}

Subject: Complaint Regarding Digital Financial Fraud via {category}

Respected Sir/Madam,

I, [YOUR FULL NAME], son/daughter of [FATHER'S NAME], aged [AGE] years, permanently residing at [YOUR COMPLETE ADDRESS], Contact: [YOUR PHONE NUMBER], hereby lodge this formal complaint regarding a digital fraud attempt against me.

INCIDENT DETAILS:
━━━━━━━━━━━━━━━━
• Date of Incident: {dates}
• Mode of Fraud: {category}
• Fraud Risk Assessment: {level} ({score}/100)
• Organization(s) Impersonated: {orgs}

FRAUDULENT MESSAGE RECEIVED:
━━━━━━━━━━━━━━━━━━━━━━━━━━━
"{text[:300]}{'...' if len(text) > 300 else ''}"

EVIDENCE COLLECTED:
━━━━━━━━━━━━━━━━━━━
• UPI ID(s):           {upi}
• Phone Number(s):     {phones}
• Suspicious URL(s):   {urls}
• Amount(s) Mentioned: {amounts}
• Date(s)/Time(s):     {dates}

RELIEF REQUESTED:
━━━━━━━━━━━━━━━━━━━
1. Register FIR under IT Act Sections 66C, 66D and IPC Sections 415, 420, 468
2. Immediately block the UPI IDs and phone numbers listed above
3. Trace, identify, and arrest the accused person(s)
4. [If money transferred] Direct concerned bank to initiate chargeback/reversal

DECLARATION:
I declare that the information provided above is true and correct to the best of my knowledge.

Yours faithfully,

[YOUR FULL NAME]
[YOUR SIGNATURE]
[YOUR CONTACT NUMBER]
[YOUR EMAIL ADDRESS]
Date: {today}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  IMPORTANT: Also file at cybercrime.gov.in (fastest response)
📞  National Cyber Crime Helpline: 1930 (24x7)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"""

    return {"complaint": draft, "generated_by": "FinGuard Template Engine"}
