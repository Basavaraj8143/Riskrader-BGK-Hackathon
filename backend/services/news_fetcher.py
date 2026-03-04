import os
import httpx
from dotenv import load_dotenv
from datetime import datetime, timedelta

load_dotenv()

NEWS_API_KEY = os.getenv("NEWS_API_KEY", "")
NEWS_API_URL = "https://newsapi.org/v2/everything"

FRAUD_KEYWORDS = {
    "UPI Scam": ["UPI scam India", "UPI fraud India"],
    "Phishing Attack": ["phishing attack India", "SMS phishing India"],
    "Loan App Fraud": ["loan app fraud India", "instant loan scam India"],
    "Crypto Scam": ["crypto scam India", "bitcoin fraud India"],
    "Investment Fraud": ["investment fraud India", "ponzi scheme India"],
    "KYC Scam": ["KYC fraud India", "fake KYC India"],
    "Job Scam": ["job scam India", "work from home fraud India"],
}

SAMPLE_HEADLINES = [
    {"title": "Bengaluru man loses ₹14 lakh in fake UPI cashback scam", "source": "Times of India", "category": "UPI Scam", "url": "#", "publishedAt": "2026-02-22"},
    {"title": "RBI warns about surge in KYC update phishing SMS", "source": "Economic Times", "category": "KYC Scam", "url": "#", "publishedAt": "2026-02-21"},
    {"title": "CERT-In alerts: New WhatsApp investment group fraud targeting middle class", "source": "CERT-In", "category": "Investment Fraud", "url": "#", "publishedAt": "2026-02-20"},
    {"title": "Delhi Police busts loan app blackmail racket operating from Rajasthan", "source": "Hindustan Times", "category": "Loan App Fraud", "url": "#", "publishedAt": "2026-02-19"},
    {"title": "Fake TRAI calls threatening SIM disconnection on the rise: DoT", "source": "DoT India", "category": "Phishing Attack", "url": "#", "publishedAt": "2026-02-18"},
    {"title": "Mumbai senior citizens targeted in fake FedEx parcel customs scam", "source": "Mid-Day", "category": "Investment Fraud", "url": "#", "publishedAt": "2026-02-17"},
    {"title": "Crypto trading signal scams cost Indians ₹200 crore in 2025", "source": "Business Standard", "category": "Crypto Scam", "url": "#", "publishedAt": "2026-02-16"},
    {"title": "Job scam network busted: 500 fake offer letters sent daily from Hyderabad", "source": "The Hindu", "category": "Job Scam", "url": "#", "publishedAt": "2026-02-15"},
]


async def fetch_fraud_trends() -> dict:
    """Fetch fraud trend data from NewsAPI, fallback to sample data."""
    if not NEWS_API_KEY:
        return _build_trend_response(SAMPLE_HEADLINES)

    try:
        from_date = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
        all_articles = []
        category_counts = {cat: 0 for cat in FRAUD_KEYWORDS}

        async with httpx.AsyncClient(timeout=10.0) as client:
            for category, keywords in FRAUD_KEYWORDS.items():
                query = " OR ".join([f'"{kw}"' for kw in keywords])
                params = {
                    "q": query,
                    "from": from_date,
                    "language": "en",
                    "sortBy": "relevancy",
                    "pageSize": 5,
                    "apiKey": NEWS_API_KEY,
                }
                resp = await client.get(NEWS_API_URL, params=params)
                if resp.status_code == 200:
                    data = resp.json()
                    articles = data.get("articles", [])
                    category_counts[category] = len(articles)
                    for a in articles[:2]:
                        all_articles.append({
                            "title": a.get("title", ""),
                            "source": a.get("source", {}).get("name", "Unknown"),
                            "category": category,
                            "url": a.get("url", "#"),
                            "publishedAt": a.get("publishedAt", "")[:10],
                        })

        if not all_articles:
            return _build_trend_response(SAMPLE_HEADLINES)

        return _build_trend_response(all_articles, category_counts)

    except Exception:
        return _build_trend_response(SAMPLE_HEADLINES)


def _build_trend_response(articles: list, category_counts: dict = None) -> dict:
    if category_counts is None:
        # Count from sample data
        category_counts = {}
        for a in articles:
            cat = a.get("category", "Other")
            category_counts[cat] = category_counts.get(cat, 0) + 1

    total = sum(category_counts.values())
    top_category = max(category_counts, key=category_counts.get) if category_counts else "UPI Scam"

    return {
        "category_counts": category_counts,
        "total_articles": total,
        "top_category": top_category,
        "alert_level": "HIGH" if total >= 10 else ("MEDIUM" if total >= 5 else "LOW"),
        "headlines": articles[:8],
    }
