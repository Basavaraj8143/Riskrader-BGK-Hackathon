import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

def get_gemini_explanation(message: str, matched_patterns: list, category: str, score: int) -> dict:
    """
    Use Gemini API to generate a human-readable explanation and prevention advice.
    Falls back to rule-based explanation if no API key or API fails.
    """
    if not GEMINI_API_KEY:
        return _fallback_explanation(matched_patterns, category, score)

    try:
        from google import genai
        import time

        client = genai.Client(api_key=GEMINI_API_KEY)

        prompt = f"""You are FinGuard AI, a financial fraud detection expert specializing in India's digital payment ecosystem.

A user submitted this suspicious message for analysis:
"{message}"

Our rule-based engine detected:
- Risk Score: {score}/100
- Fraud Category: {category}
- Warning Signals: {', '.join(matched_patterns)}

In exactly 2-3 sentences, explain in simple English WHY this message is suspicious and what the scammer is trying to do. 
Be direct, specific, and refer to the actual message content. 
Do NOT repeat the prevention tips (those are shown separately).
Write for a non-technical Indian user."""

        def call_gemini():
            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt
            )
            return response.text.strip()

        try:
            explanation = call_gemini()
        except Exception as e:
            if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                # Rate limited — wait 3s and retry once
                time.sleep(3)
                try:
                    explanation = call_gemini()
                except Exception:
                    # Still rate limited — use fallback but label it
                    fb = _fallback_explanation(matched_patterns, category, score)
                    fb["powered_by"] = "FinGuard Rule Engine (Gemini rate limited)"
                    return fb
            else:
                raise

        return {"explanation": explanation, "powered_by": "Gemini AI ✨"}

    except Exception as e:
        return _fallback_explanation(matched_patterns, category, score)


def _fallback_explanation(matched_patterns: list, category: str, score: int) -> dict:
    """Rule-based fallback explanation when Gemini is unavailable."""
    if score >= 70:
        severity_text = "highly suspicious and almost certainly a scam"
    elif score >= 40:
        severity_text = "suspicious and should be treated with caution"
    else:
        severity_text = "mildly suspicious but worth being careful about"

    pattern_summary = ", ".join(matched_patterns[:3]) if matched_patterns else "multiple red flags"

    explanation = (
        f"This message is {severity_text}. "
        f"It was flagged because it contains classic fraud indicators: {pattern_summary}. "
        f"This pattern is typical of a '{category}' scam commonly reported in India — "
        f"do not engage with the sender or follow any instructions in the message."
    )

    return {"explanation": explanation, "powered_by": "FinGuard Rule Engine"}
