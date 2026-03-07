"""
FinGuard — Local LLM Explainer (Ollama / DeepSeek R1)
=======================================================
Used for:
  - /api/analyze      → get_local_explanation()   (fraud explanation)
  - /api/extract-evidence → get_local_explanation() + get_local_complaint()

Calls the Ollama HTTP API at http://localhost:11434 (default).
Model: deepseek-r1:1.5b  (lightweight, runs fully offline)

Falls back gracefully if Ollama is not running.
"""

import os
import json
import logging
import urllib.request
import urllib.error

logger = logging.getLogger(__name__)

OLLAMA_URL   = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "deepseek-r1:1.5b")


def _call_ollama(prompt: str, timeout: int = 60) -> str:
    """
    Send a prompt to Ollama using streaming mode and accumulate the response.
    Streaming is more reliable with DeepSeek R1 than non-streaming.
    Raises RuntimeError if Ollama is unreachable or returns an error.
    """
    payload = json.dumps({
        "model":  OLLAMA_MODEL,
        "prompt": prompt,
        "stream": True,          # streaming is more reliable with DeepSeek R1
        "options": {
            "temperature": 0.3,
            "num_predict": 250,
        },
    }).encode("utf-8")

    req = urllib.request.Request(
        f"{OLLAMA_URL}/api/generate",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        full_text = []
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            for raw_line in resp:
                line = raw_line.decode("utf-8", errors="ignore").strip()
                if not line:
                    continue
                try:
                    chunk = json.loads(line)
                    token = chunk.get("response", "")
                    if token:
                        full_text.append(token)
                    if chunk.get("done"):
                        break
                except json.JSONDecodeError:
                    continue

        raw = "".join(full_text).strip()

        # DeepSeek R1 wraps chain-of-thought in <think>…</think>.
        # Strip it so only the final answer reaches the user.
        if "<think>" in raw and "</think>" in raw:
            after_think = raw.split("</think>", 1)[-1].strip()
            raw = after_think if after_think else raw

        return raw

    except urllib.error.URLError as exc:
        raise RuntimeError(f"Ollama unreachable: {exc.reason}") from exc


def get_local_explanation(
    message: str,
    matched_patterns: list,
    category: str,
    score: int,
) -> dict:
    """
    Generate a fraud explanation using the local DeepSeek R1 model via Ollama.

    Returns:
        {
            "explanation": str,
            "powered_by":  str,
        }
    Falls back to a rule-based explanation if Ollama is unavailable.
    """
    prompt = f"""You are FinGuard AI, a financial fraud detection expert for India.

A user submitted this message for analysis:
"{message}"

Our system detected:
- Risk Score: {score}/100
- Fraud Category: {category}
- Warning Signals: {', '.join(matched_patterns) if matched_patterns else 'None'}

In exactly 2-3 sentences, explain in simple English WHY this message is suspicious and what the scammer is trying to do. Be direct and specific. Write for a non-technical Indian user. Do NOT add prevention tips."""

    try:
        explanation = _call_ollama(prompt)
        if not explanation:
            raise RuntimeError("Empty response from Ollama")
        return {
            "explanation": explanation,
            "powered_by":  f"DeepSeek R1 (Local 🔒)",
        }

    except Exception as exc:
        logger.warning("[Ollama] Falling back to rule-based: %s", exc)
        return _fallback_explanation(matched_patterns, category, score)


def is_ollama_available() -> bool:
    """Quick health-check — returns True if Ollama is reachable."""
    try:
        with urllib.request.urlopen(f"{OLLAMA_URL}/api/tags", timeout=3):
            return True
    except Exception:
        return False


def _fallback_explanation(matched_patterns: list, category: str, score: int) -> dict:
    """Rule-based fallback used when Ollama is offline."""
    if score >= 70:
        severity = "highly suspicious and almost certainly a scam"
    elif score >= 40:
        severity = "suspicious and should be treated with caution"
    else:
        severity = "mildly suspicious but worth being careful about"

    pattern_summary = ", ".join(matched_patterns[:3]) if matched_patterns else "multiple red flags"

    explanation = (
        f"This message is {severity}. "
        f"It was flagged because it contains classic fraud indicators: {pattern_summary}. "
        f"This pattern is typical of a '{category}' scam commonly reported in India — "
        f"do not engage with the sender or follow any instructions in the message."
    )
    return {
        "explanation": explanation,
        "powered_by":  "FinGuard Rule Engine (Ollama offline)",
    }


# ─────────────────────────────────────────────────────────────────
# Evidence Lab — Complaint Generation via DeepSeek R1
# ─────────────────────────────────────────────────────────────────

def get_local_complaint(
    text: str,
    entities: dict,
    category: str,
    score: int,
    explanation: str,
) -> dict:
    """
    Generate a formal Indian cybercrime complaint draft using DeepSeek R1 via Ollama.
    Used exclusively by the Evidence Lab (/api/extract-evidence).

    Returns:
        {
            "complaint":      str,
            "generated_by":   str,
        }
    Falls back to a template draft if Ollama is unavailable.
    """
    from datetime import datetime
    today = datetime.now().strftime("%d %B %Y")

    # Build evidence summary string
    ev_parts = []
    if entities.get("upi_ids"):
        ev_parts.append(f"UPI IDs: {', '.join(entities['upi_ids'])}")
    if entities.get("phone_numbers"):
        ev_parts.append(f"Phone Numbers: {', '.join(entities['phone_numbers'])}")
    if entities.get("urls"):
        ev_parts.append(f"Suspicious URLs: {', '.join(entities['urls'])}")
    if entities.get("amounts"):
        ev_parts.append(f"Amounts: {', '.join(entities['amounts'])}")
    if entities.get("dates"):
        ev_parts.append(f"Dates/Times: {', '.join(entities['dates'])}")
    if entities.get("names_mentioned"):
        ev_parts.append(f"Impersonated Orgs: {', '.join(entities['names_mentioned'])}")
    evidence_str = "\n".join(ev_parts) if ev_parts else "No specific entities extracted."

    prompt = f"""You are a cybercrime legal assistant in India. Write a formal cybercrime complaint letter in English.

FRAUD MESSAGE:
---
{text[:500]}
---

EXTRACTED EVIDENCE:
{evidence_str}

FRAUD ANALYSIS:
- Category: {category}
- Risk Score: {score}/100
- Assessment: {explanation}

Write a formal complaint letter with these sections:
1. Header: "To, The Station House Officer / Cyber Crime Cell" + Date: {today}
2. Subject line
3. Respectful opening
4. Incident Description (3-4 sentences based on actual message content)
5. Evidence Collected (bullet points for each UPI ID, phone, URL, amount — write "Not found" if none)
6. Legal Sections (cite relevant IT Act / IPC sections for {category})
7. Relief Requested (3 specific asks)
8. Closing with [YOUR NAME], [YOUR SIGNATURE], [YOUR CONTACT], [YOUR EMAIL] placeholders
9. Footer: "National Cyber Crime Helpline: 1930 | cybercrime.gov.in"

Keep it formal, under 400 words. Use standard Indian legal complaint format. Output ONLY the complaint letter."""

    try:
        # Use higher token limit for complaint (longer output needed)
        payload = __import__("json").dumps({
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "stream": True,
            "options": {"temperature": 0.2, "num_predict": 600},
        }).encode("utf-8")

        req = __import__("urllib.request", fromlist=["Request"]).Request(
            f"{OLLAMA_URL}/api/generate",
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        full_text = []
        import urllib.request as _ur
        with _ur.urlopen(req, timeout=90) as resp:
            for raw_line in resp:
                line = raw_line.decode("utf-8", errors="ignore").strip()
                if not line:
                    continue
                try:
                    chunk = __import__("json").loads(line)
                    token = chunk.get("response", "")
                    if token:
                        full_text.append(token)
                    if chunk.get("done"):
                        break
                except Exception:
                    continue

        raw = "".join(full_text).strip()
        if "<think>" in raw and "</think>" in raw:
            raw = raw.split("</think>", 1)[-1].strip()

        if not raw:
            raise RuntimeError("Empty complaint from Ollama")

        return {"complaint": raw, "generated_by": "DeepSeek R1 (Local 🔒)"}

    except Exception as exc:
        logger.warning("[Ollama] Complaint fallback: %s", exc)
        return _template_complaint(text, entities, category, score, today)


def _template_complaint(text: str, entities: dict, category: str, score: int, today: str) -> dict:
    """Minimal template complaint when Ollama is offline."""
    upi    = ", ".join(entities.get("upi_ids", [])) or "Not identified"
    phones = ", ".join(entities.get("phone_numbers", [])) or "Not identified"
    urls   = ", ".join(entities.get("urls", [])) or "Not identified"
    amounts= ", ".join(entities.get("amounts", [])) or "Not mentioned"
    dates  = ", ".join(entities.get("dates", [])) or "Refer to attached screenshot"
    orgs   = ", ".join(entities.get("names_mentioned", [])) or "Unknown"
    level  = "HIGH RISK" if score >= 61 else "MEDIUM RISK" if score >= 31 else "LOW RISK"

    draft = f"""CYBERCRIME COMPLAINT DRAFT
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501

To,
The Station House Officer / Nodal Officer,
Cyber Crime Cell,
[Your City], [Your State]

Date: {today}

Subject: Complaint Regarding Digital Financial Fraud — {category}

Respected Sir/Madam,

I, [YOUR FULL NAME], residing at [YOUR COMPLETE ADDRESS], Contact: [YOUR PHONE NUMBER], hereby lodge this formal complaint regarding a digital fraud attempt.

INCIDENT DETAILS:
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
- Mode of Fraud: {category}
- Risk Assessment: {level} ({score}/100)
- Organization(s) Impersonated: {orgs}

FRAUDULENT MESSAGE:
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
"{text[:300]}{'...' if len(text) > 300 else ''}"

EVIDENCE COLLECTED:
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
- UPI ID(s):           {upi}
- Phone Number(s):     {phones}
- Suspicious URL(s):   {urls}
- Amount(s) Mentioned: {amounts}
- Date(s)/Time(s):     {dates}

RELIEF REQUESTED:
1. Register FIR under IT Act Sec 66C, 66D and IPC Sec 415, 420, 468
2. Block the UPI IDs and phone numbers listed above
3. Trace and arrest the accused person(s)

I declare the above information is true and correct.

Yours faithfully,
[YOUR FULL NAME]
[YOUR SIGNATURE]
[YOUR CONTACT NUMBER]
[YOUR EMAIL ADDRESS]
Date: {today}

\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
Also file at cybercrime.gov.in | Helpline: 1930 (24x7)
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501"""

    return {"complaint": draft, "generated_by": "FinGuard Template Engine (Ollama offline)"}
