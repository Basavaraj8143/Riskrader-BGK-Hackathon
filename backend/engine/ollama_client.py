"""
FinGuard — Local LLM Explainer (Ollama / DeepSeek R1)
=======================================================
Used ONLY for the /api/analyze endpoint to preserve privacy.
All other sections (Evidence, Encyclopedia) continue using Gemini.

Calls the Ollama HTTP API at http://localhost:11434 (default).
Model: deepseek-r1:1.5b  (lightweight, runs fully offline)

Falls back to rule-based explanation if Ollama is not running.
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
