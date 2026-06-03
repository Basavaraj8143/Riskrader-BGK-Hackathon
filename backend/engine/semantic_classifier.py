"""
RiskRadar Semantic Classification Engine
========================================
Uses Sentence Transformers to classify fraud categories based on 
semantic similarity rather than simple keyword matching.

Model: all-MiniLM-L6-v2 (Lightweight & Fast)
"""
import logging
import numpy as np
from sentence_transformers import SentenceTransformer, util

logger = logging.getLogger(__name__)

# Singleton model instance
_model = None

# Reference descriptions for each category to compare against
# These act as 'Semantic Centroids' for zero-shot classification
CATEGORY_DESCRIPTIONS = {
    "UPI / Payment Fraud": [
        "Scan this QR code to receive cashback or refund in your bank account.",
        "Payment link for UPI transaction or money transfer request.",
        "Click here to claim your BHIM or PhonePe reward and get money back."
    ],
    "KYC Phishing": [
        "Your bank KYC has expired, please update your documents immediately to avoid account block.",
        "Mandatory KYC verification required for your bank account or wallet.",
        "Your account is suspended due to pending KYC details update."
    ],
    "Bank Impersonation": [
        "Message from SBI HDFC ICICI bank regarding your account or credit card status.",
        "Suspicious transaction detected on your bank account, call now to verify.",
        "Netbanking credentials or internet banking access required for security check."
    ],
    "Govt / Telecom Scam": [
        "TRAI or BSNL alert: your mobile number will be disconnected within 2 hours.",
        "Income tax department or RBI notice regarding your financial status or penalty.",
        "Police or CBI warning regarding illegal activities associated with your number."
    ],
    "Lottery / Prize Scam": [
        "Congratulations you have won a huge cash prize or lucky draw lottery.",
        "You are selected for a mega prize from KBC or WhatsApp lucky draw.",
        "Claim your winning prize money by paying a small registration fee."
    ],
    "Investment Fraud": [
        "Earn 5 percent daily returns on your investment with no risk.",
        "Guaranteed high profit from stock trading or crypto investment groups.",
        "Join this WhatsApp or Telegram group to double your money in one week."
    ],
    "Loan App Scam": [
        "Instant personal loan approved without any documentation or CIBIL check.",
        "Apply for low interest loan via this app with immediate disbursal.",
        "Your loan application is processed, pay processing fee to get funds."
    ],
    "Job / WFH Scam": [
        "Part time work from home job offer with high daily income.",
        "Earn money by liking videos or performing simple online tasks from home.",
        "No experience required for this high paying job, register now."
    ],
    "OTP Theft": [
        "Please share the OTP you received to verify your identity or transaction.",
        "Enter your one time password on this link to complete the payment.",
        "Do not share your OTP with anyone but enter it here for verification."
    ],
    "Crypto Scam": [
        "New cryptocurrency or NFT investment opportunity with high ROI.",
        "Bitcoin trading signals and profitable crypto bot for users.",
        "Invest in USDT or BNB to get massive returns from digital assets."
    ],
    "Parcel / Customs Scam": [
        "Your package is detained by Customs for illegal items or unpaid duty.",
        "FedEx or DHL parcel arrival requires payment of shipping fees.",
        "Your international courier is held up, pay immediately to release it."
    ],
}

_reference_embeddings = {}

def load_semantic_model():
    """Load the transformer model and pre-compute reference embeddings."""
    global _model, _reference_embeddings
    
    if _model is not None:
        return True
    
    try:
        logger.info("[Semantic] Loading all-MiniLM-L6-v2 model...")
        _model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Pre-compute embeddings for all reference descriptions
        for category, descriptions in CATEGORY_DESCRIPTIONS.items():
            embeddings = _model.encode(descriptions, convert_to_tensor=True)
            # Store the mean embedding as the 'centroid' for that category
            _reference_embeddings[category] = embeddings
            
        logger.info("[Semantic] Model and reference embeddings loaded successfully.")
        return True
    except Exception as e:
        logger.error(f"[Semantic] Failed to load model: {e}")
        return False

def classify_semantic(text: str, threshold: float = 0.35) -> str:
    """
    Classify a message by comparing it against category reference embeddings.
    Returns the best matching category or 'General' if no match exceeds threshold.
    """
    if _model is None:
        if not load_semantic_model():
            return "General"
            
    try:
        # Encode the input text
        text_embedding = _model.encode(text, convert_to_tensor=True)
        
        best_category = "General"
        max_similarity = -1.0
        
        for category, ref_embeddings in _reference_embeddings.items():
            # Compute cosine similarity between input and each reference in the category
            # Then take the maximum similarity found within that category
            similarities = util.cos_sim(text_embedding, ref_embeddings)
            sim_val = float(similarities.max())
            
            if sim_val > max_similarity:
                max_similarity = sim_val
                best_category = category
        
        # Apply threshold to avoid weak matches
        if max_similarity < threshold:
            return "General"
            
        return best_category
        
    except Exception as e:
        logger.error(f"[Semantic] Classification error: {e}")
        return "General"

def get_similarity_scores(text: str) -> dict:
    """Get raw similarity scores for all categories (useful for debugging)."""
    if _model is None:
        load_semantic_model()
        
    scores = {}
    text_embedding = _model.encode(text, convert_to_tensor=True)
    
    for category, ref_embeddings in _reference_embeddings.items():
        similarities = util.cos_sim(text_embedding, ref_embeddings)
        scores[category] = float(similarities.max())
        
    return dict(sorted(scores.items(), key=lambda item: item[1], reverse=True))