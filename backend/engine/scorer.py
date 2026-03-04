import re
from .patterns import PATTERNS, CATEGORY_KEYWORDS, PREVENTION_TIPS
from . import ml_model as _ml

# Load ML model once at module import time
_ml.load_model()


def analyze_message(text: str) -> dict:
    """
    Hybrid fraud risk scoring engine.
    Combines rule-based pattern matching with ML model prediction.
    Returns score (0-100), level, category, matched patterns, prevention tips,
    and ML confidence details.
    """
    text_lower = text.lower()
    rule_score = 0
    matched = []

    # ---- Weighted Pattern Scoring ----
    for pattern_group in PATTERNS:
        for regex in pattern_group["patterns"]:
            if re.search(regex, text_lower, re.IGNORECASE):
                rule_score += pattern_group["weight"]
                matched.append(pattern_group["label"])
                break  # Only score once per group

    # ---- URL / Link Detection ----
    url_pattern = r"(https?://|bit\.ly|tinyurl|t\.co|goo\.gl|rb\.gy|cutt\.ly|short\.|tiny\.|link\.|click\.|go\.)"
    if re.search(url_pattern, text_lower, re.IGNORECASE):
        rule_score += 25
        matched.append("🔗 Suspicious URL/link detected")

    # ---- Multi-Signal Escalation ----
    if len(matched) >= 4:
        rule_score += 20
    elif len(matched) == 3:
        rule_score += 10

    # ---- High-Confidence Pattern Boosts ----
    invest_signals = [
        r"\bguaranteed\b",
        r"\b\d+\s*%\s*(daily|per day|monthly|weekly)\b",
        r"\b(daily|weekly|monthly)\s*returns?\b",
        r"\b(whatsapp|telegram).{0,25}(group|channel|invest)\b",
        r"\b(members?|users?).{0,20}(earning|already earning)\b",
    ]
    invest_hits = sum(1 for p in invest_signals if re.search(p, text_lower, re.IGNORECASE))
    if invest_hits >= 2:
        rule_score += invest_hits * 8

    # ---- Cap rule score at 100 ----
    rule_score = min(rule_score, 100)

    # ---- ML Prediction ----
    ml_result = _ml.predict(text)

    # ---- Hybrid Score Fusion ----
    # 50% rule-based + 50% ML probability (scaled to 0-100)
    # If ML is unavailable, fall back to rule score only
    if ml_result["available"]:
        ml_score_scaled = ml_result["fraud_prob"] * 100
        final_score = int(round(0.5 * rule_score + 0.5 * ml_score_scaled))
    else:
        final_score = rule_score

    final_score = min(final_score, 100)

    # ---- Determine Risk Level ----
    if final_score >= 61:
        level = "HIGH"
        level_emoji = "🔴"
    elif final_score >= 31:
        level = "MEDIUM"
        level_emoji = "🟡"
    else:
        level = "LOW"
        level_emoji = "🟢"

    # ---- Determine Category ----
    category = _classify_category(text_lower)

    # ---- Get Prevention Tips ----
    tips = PREVENTION_TIPS.get(category, PREVENTION_TIPS["General"])

    return {
        "score": final_score,
        "rule_score": rule_score,
        "level": level,
        "level_emoji": level_emoji,
        "category": category,
        "matched_patterns": list(set(matched)),
        "prevention_tips": tips,
        # ML fields
        "ml_available":   ml_result["available"],
        "ml_verdict":     ml_result["verdict"],
        "ml_confidence":  ml_result["confidence"],
        "ml_fraud_prob":  ml_result["fraud_prob"],
    }


def _classify_category(text: str) -> str:
    """Classify the message into a fraud category based on keyword matching."""
    best_category = "General"
    best_count = 0

    for category, keywords in CATEGORY_KEYWORDS.items():
        count = sum(1 for kw in keywords if kw in text)
        if count > best_count:
            best_count = count
            best_category = category

    return best_category
