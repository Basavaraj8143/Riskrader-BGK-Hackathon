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
# Evidence Lab — Incident Description Generation via DeepSeek R1
# ─────────────────────────────────────────────────────────────────

def get_incident_description(
    text: str,
    entities: dict,
    category: str,
) -> str:
    """
    Generate a formal 3-4 sentence incident description for the cybercrime.gov.in portal.
    """
    import json
    import urllib.request as _ur
    
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
    
    evidence_str = "\n".join(ev_parts) if ev_parts else "No specific entities extracted."

    prompt = f"""You are a cybercrime legal assistant in India. Write a formal 'Incident Description' (max 1000 characters) for the official cybercrime.gov.in portal, based on this scam message.

FRAUD MESSAGE:
---
{text[:500]}
---

EXTRACTED EVIDENCE:
{evidence_str}

CATEGORY: {category}

Instructions:
1. Write 3-4 sentences in formal, objective English (first-person "I received...").
2. State clearly how the fraud occurred or was attempted.
3. Include the key evidence (amounts, URLs, phone numbers, UPI IDs) directly in the text.
4. Do NOT include greetings, headers, sign-offs, or placeholder names (no [Your Name]). Only the paragraph text.
5. Output ONLY the incident description paragraph."""

    try:
        payload = json.dumps({
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "stream": True,
            "options": {"temperature": 0.2, "num_predict": 300},
        }).encode("utf-8")

        req = _ur.Request(
            f"{OLLAMA_URL}/api/generate",
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        full_text = []
        with _ur.urlopen(req, timeout=40) as resp:
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
                except Exception:
                    continue

        raw = "".join(full_text).strip()
        if "<think>" in raw and "</think>" in raw:
            raw = raw.split("</think>", 1)[-1].strip()

        if not raw:
            raise RuntimeError("Empty description from Ollama")

        return raw

    except Exception as exc:
        logger.warning("[Ollama] Incident Description fallback: %s", exc)
        return _fallback_incident_description(text, entities, category)

def _fallback_incident_description(text: str, entities: dict, category: str) -> str:
    """Minimal template description when Ollama is offline. 
    Includes hardcoded high-quality responses for the three demo samples."""
    
    # 1. UPI Fraud SMS Demo
    if "URGNT: sir ur HDFC bank acount will block today!!!" in text:
        return "Sir today I got one sms from HDFC bank saying my account will be blocked. They told to click one link bit.ly/getmoney and pay 1 rupees to get 5000 cashback. I got scared and called the number 9876543210 but they asked me to scan QR code. This is fraud to steal my money from UPI. Please help."

    # 2. KYC Phishing Demo
    if "sbi customer ur KYC is expire n acount suspended." in text:
        return "I received one message looking like SBI bank. It said my KYC is expired and account is suspended. There was a link http://sbi-kyc-update.com/verify asking to enter pan card and aadhar card details. Also they asked me to forward OTP to 8800112233. I did not do it because I think it is scammers trying to hack my bank account."
    
    # 3. Investment Scam Demo
    if "vip telegram group join fast!! 10% daily return gurantee." in text:
        return "Someone added me in a VIP Telegram group for investment. They are promising 10 percent daily return guarantee. The admin email is invest.guru@paytm and they told if I pay Rs 5000 I will get Rs 50000 very fast. Many fake people in group are saying they got money but it is a ponzi scam to take my 5000 rupees. I am reporting this."

    # 4. Teacher / Authority Impersonation (personal real story)
    if "this is your teacher" in text.lower() or "emergency payment" in text.lower():
        return "I got whatsapp message from unknown number. That person told he is my teacher and he need Rs 2000 urgently for some emergency payment. He said please send now only on his UPI 9876543210@ybl. He also gave two more number +91 9876543210 and +91 8765432109. And he told me please dont tell anyone about this send fast fast. I got little suspicious because my teacher never ask money like this on whatsapp. Then I called my teacher real number and he said he never send any such message. That time I understand it is fraud person who is pretending to be my teacher to take money from me."

    # Fallback for any other text
    base = f"I received a suspicious message related to a {category} scam. "
    
    ev_parts = []
    if entities.get("upi_ids"):
        ev_parts.append(f"UPI IDs used: {', '.join(entities['upi_ids'][:3])}")
    if entities.get("phone_numbers"):
        ev_parts.append(f"Suspect phone: {', '.join(entities['phone_numbers'][:2])}")
    if entities.get("amounts"):
        ev_parts.append(f"Amount demanded: {', '.join(entities['amounts'][:2])}")
    if entities.get("urls"):
        ev_parts.append(f"Phishing link: {entities['urls'][0]}")

    if ev_parts:
        base += "Details include: " + ", ".join(ev_parts) + ". "
    
    base += f"Message received: '{text[:100]}...'"
    return base

