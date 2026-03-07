from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from engine.scorer import analyze_message
from engine.gemini_explainer import get_gemini_explanation
from engine.ollama_client import get_local_explanation, get_local_complaint  # Evidence + Analyzer: local DeepSeek R1
from engine.extractor import extract_entities, format_complaint_context
from engine.portal_guide import build_portal_guide
from services.news_fetcher import fetch_fraud_trends

app = FastAPI(title="FinGuard AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class MessageRequest(BaseModel):
    message: str


class EvidenceRequest(BaseModel):
    text: Optional[str] = ""
    image_base64: Optional[str] = None   # base64-encoded screenshot (JPEG/PNG)



@app.get("/api/health")
def health():
    return {"status": "FinGuard AI is running 🛡️"}


@app.post("/api/analyze")
async def analyze(req: MessageRequest):
    """
    Analyze a suspicious message for fraud risk.
    Returns risk score, level, category, explanation, and prevention tips.
    """
    if not req.message or not req.message.strip():
        return {"error": "Message cannot be empty"}

    # Step 1: Rule-based + ML hybrid scoring
    result = analyze_message(req.message)

    # Step 2: Local LLM explanation via Ollama (DeepSeek R1 1.5b)
    # Privacy-preserving — message never leaves your machine.
    explanation_data = get_local_explanation(
        message=req.message,
        matched_patterns=result["matched_patterns"],
        category=result["category"],
        score=result["score"],
    )

    return {
        "score": result["score"],
        "rule_score": result["rule_score"],
        "level": result["level"],
        "level_emoji": result["level_emoji"],
        "category": result["category"],
        "matched_patterns": result["matched_patterns"],
        "prevention_tips": result["prevention_tips"],
        "explanation": explanation_data["explanation"],
        "powered_by": explanation_data["powered_by"],
        # ML fields
        "ml_available":  result["ml_available"],
        "ml_verdict":    result["ml_verdict"],
        "ml_confidence": result["ml_confidence"],
        "ml_fraud_prob": result["ml_fraud_prob"],
    }


@app.get("/api/trends")
async def trends():
    """Fetch fraud trend data from NewsAPI and return categorized results."""
    return await fetch_fraud_trends()


@app.get("/api/stats")
def stats():
    """Return mock dashboard statistics."""
    return {
        "total_analyzed": 1247,
        "high_risk_today": 38,
        "active_scam_types": 7,
        "articles_tracked": 156,
        "fraud_prevented_today": 22,
    }


@app.post("/api/research")
async def research(req: MessageRequest):
    """
    Deep-research endpoint for the Encyclopedia page.
    Analyzes message + fetches related news articles by detected fraud category.
    Returns: full analysis + filtered news + scam type details.
    """
    if not req.message or not req.message.strip():
        return {"error": "Message cannot be empty"}

    # Step 1: Score + classify
    result = analyze_message(req.message)

    # Step 2: AI explanation
    explanation_data = get_gemini_explanation(
        message=req.message,
        matched_patterns=result["matched_patterns"],
        category=result["category"],
        score=result["score"],
    )

    # Step 3: Fetch news and filter by category
    trends_data = await fetch_fraud_trends()
    all_headlines = trends_data.get("headlines", [])

    # Map analyzer category → news category keyword
    CAT_MAP = {
        "UPI / Payment Fraud": "UPI Scam",
        "KYC Phishing": "KYC Scam",
        "Bank Impersonation": "Phishing Attack",
        "Govt / Telecom Scam": "Phishing Attack",
        "Lottery / Prize Scam": "Investment Fraud",
        "Investment Fraud": "Investment Fraud",
        "Loan App Scam": "Loan App Fraud",
        "Job / WFH Scam": "Job Scam",
        "OTP Theft": "Phishing Attack",
        "Crypto Scam": "Crypto Scam",
        "Parcel / Customs Scam": "Investment Fraud",
        "General": None,
    }
    news_cat = CAT_MAP.get(result["category"])

    if news_cat:
        related = [h for h in all_headlines if h.get("category") == news_cat]
        other = [h for h in all_headlines if h.get("category") != news_cat]
        related_news = (related + other)[:6]  # prioritize matching, fill with others
    else:
        related_news = all_headlines[:6]

    return {
        "score": result["score"],
        "rule_score": result["rule_score"],
        "level": result["level"],
        "level_emoji": result["level_emoji"],
        "category": result["category"],
        "matched_patterns": result["matched_patterns"],
        "prevention_tips": result["prevention_tips"],
        "explanation": explanation_data["explanation"],
        "powered_by": explanation_data["powered_by"],
        "related_news": related_news,
        "trend_alert": trends_data.get("alert_level", "MEDIUM"),
        "top_fraud": trends_data.get("top_category", "UPI Scam"),
        # ML fields
        "ml_available":  result["ml_available"],
        "ml_verdict":    result["ml_verdict"],
        "ml_confidence": result["ml_confidence"],
        "ml_fraud_prob": result["ml_fraud_prob"],
    }


@app.post("/api/extract-evidence")
async def extract_evidence(req: EvidenceRequest):
    """
    Evidence Structuring Assistant endpoint.
    1. If image_base64 provided → OCR via Gemini Vision
    2. Extract entities (UPI IDs, phones, URLs, amounts, dates)
    3. Run fraud analysis on extracted text
    4. Generate structured cybercrime complaint draft
    """
    import os

    source_text = req.text or ""
    ocr_text = None

    # --- Step 1: OCR for screenshots via Gemini Vision ---
    if req.image_base64:
        gemini_key = os.getenv("GEMINI_API_KEY", "")
        if gemini_key:
            try:
                from google import genai
                from google.genai import types
                import base64

                client = genai.Client(api_key=gemini_key)
                image_data = base64.b64decode(req.image_base64)

                ocr_prompt = (
                    "Extract ALL text from this screenshot exactly as it appears. "
                    "Include every word, number, URL, UPI ID, phone number, and amount visible. "
                    "Output ONLY the extracted text, no commentary."
                )

                response = client.models.generate_content(
                    model="gemini-2.0-flash",
                    contents=[
                        types.Part.from_bytes(data=image_data, mime_type="image/jpeg"),
                        ocr_prompt,
                    ],
                )
                ocr_text = response.text.strip()
                source_text = ocr_text + "\n" + source_text
            except Exception as e:
                # OCR failed — continue with whatever text was provided
                pass

    if not source_text.strip():
        return {"error": "Please provide text or a screenshot image"}

    # --- Step 2: Entity Extraction ---
    entities = extract_entities(source_text)

    # --- Step 3: Fraud Analysis ---
    analysis = analyze_message(source_text)

    # --- Step 4: Local DeepSeek Fraud Explanation ---
    explanation_data = get_local_explanation(
        message=source_text[:500],
        matched_patterns=analysis["matched_patterns"],
        category=analysis["category"],
        score=analysis["score"],
    )

    # --- Step 5: Local DeepSeek Complaint Draft ---
    complaint_data = get_local_complaint(
        text=req.text or "",
        entities=entities,
        category=analysis["category"],
        score=analysis["score"],
        explanation=explanation_data["explanation"],
    )

    portal_guide = build_portal_guide(
        original_text=req.text or source_text,
        entities=entities,
        category=analysis["category"],
        score=analysis["score"],
        level=analysis["level"],
        explanation=explanation_data["explanation"],
        matched_patterns=analysis["matched_patterns"],
    )

    return {
        "ocr_text": ocr_text,
        "entities": entities,
        "score": analysis["score"],
        "level": analysis["level"],
        "category": analysis["category"],
        "matched_patterns": analysis["matched_patterns"],
        "explanation": explanation_data["explanation"],
        "powered_by": explanation_data["powered_by"],
        "complaint_draft": complaint_data["complaint"],
        "complaint_by": complaint_data["generated_by"],
        "entity_count": sum(
            len(v) for v in entities.values() if isinstance(v, list)
        ),
        "portal_guide": portal_guide,
    }


