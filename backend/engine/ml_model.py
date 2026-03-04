"""
FinGuard ML Inference Module
==============================
Loads pre-trained TF-IDF + Logistic Regression model and provides
a simple predict() interface.  Falls back gracefully if model files
are missing (rule-based only mode remains fully functional).
"""

import pathlib
import logging

logger = logging.getLogger(__name__)

BASE_DIR   = pathlib.Path(__file__).parent
MODEL_DIR  = BASE_DIR / "models"
TFIDF_PATH = MODEL_DIR / "tfidf.pkl"
LR_PATH    = MODEL_DIR / "lr_model.pkl"

# Module-level singletons — loaded once at startup
_tfidf    = None
_lr_model = None
_ready    = False   # True only when both artefacts loaded successfully


def load_model() -> bool:
    """
    Load TF-IDF vectorizer and LR model from disk.
    Returns True if both loaded successfully, False otherwise.
    Call once at application startup (e.g., from scorer.py or main.py).
    """
    global _tfidf, _lr_model, _ready

    if _ready:
        return True  # Already loaded

    if not TFIDF_PATH.exists() or not LR_PATH.exists():
        logger.warning(
            "[ML] Model files not found in %s — ML scoring disabled. "
            "Run `python -m engine.train` to generate them.",
            MODEL_DIR,
        )
        return False

    try:
        import joblib
        _tfidf    = joblib.load(TFIDF_PATH)
        _lr_model = joblib.load(LR_PATH)
        _ready    = True
        logger.info("[ML] Model loaded successfully from %s", MODEL_DIR)
        return True
    except Exception as exc:
        logger.error("[ML] Failed to load model: %s", exc)
        return False


def predict(text: str) -> dict:
    """
    Run ML inference on a message.

    Returns:
        {
            "available":    bool,   # False if model not loaded
            "fraud_prob":   float,  # 0.0 – 1.0 probability of being fraud
            "label":        int,    # 1 = Fraud, 0 = Legit
            "confidence":   str,    # e.g. "94%"
            "verdict":      str,    # "FRAUD" | "SAFE"
        }
    """
    if not _ready:
        return {
            "available":  False,
            "fraud_prob": 0.5,
            "label":      -1,
            "confidence": "N/A",
            "verdict":    "UNKNOWN",
        }

    try:
        text_clean  = text.lower().strip()
        vec         = _tfidf.transform([text_clean])
        proba       = _lr_model.predict_proba(vec)[0]  # [P(legit), P(fraud)]

        # Class order from sklearn: sorted unique labels [0, 1]
        fraud_prob  = float(proba[1])
        label       = int(_lr_model.predict(vec)[0])
        confidence  = f"{max(proba) * 100:.0f}%"
        verdict     = "FRAUD" if label == 1 else "SAFE"

        return {
            "available":  True,
            "fraud_prob": round(fraud_prob, 4),
            "label":      label,
            "confidence": confidence,
            "verdict":    verdict,
        }

    except Exception as exc:
        logger.error("[ML] Prediction error: %s", exc)
        return {
            "available":  False,
            "fraud_prob": 0.5,
            "label":      -1,
            "confidence": "N/A",
            "verdict":    "UNKNOWN",
        }


def is_ready() -> bool:
    """Return True if the model is loaded and ready for inference."""
    return _ready
