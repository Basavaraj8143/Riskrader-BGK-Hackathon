# RISK RADAR AI — Project Overview

> **Tagline:** *Your AI-powered shield against digital financial fraud.*

---

## 🧭 What Is RISKRADAR AI?

**RISKRADAR AI** is a Chrome extention and full-stack, AI-powered fraud detection and cybercrime assistance platform built for the Indian digital ecosystem. It combines rule-based pattern matching, machine learning, and large language models (LLMs) to help everyday users identify scam messages, extract forensic evidence, and file cybercrime complaints — all in one place.

The project was built as a hackathon submission (`bgkhack`) and targets one of India's fastest-growing problems: **online financial fraud via UPI, KYC phishing, investment scams, loan app abuse, and impersonation fraud.**

---

## 🏗️ Architecture Overview

```
bgkhack/
├── backend/               ← Python + FastAPI REST API
│   ├── engine/            ← Core AI Engine
│   │   ├── patterns.py       Rule-based fraud patterns + categories
│   │   ├── scorer.py         Hybrid risk scoring (Rules + ML)
│   │   ├── ml_model.py       TF-IDF + Logistic Regression ML model
│   │   ├── train.py          Model training script
│   │   ├── extractor.py      Forensic entity extraction (regex)
│   │   ├── gemini_explainer.py  Gemini 2.0 Flash AI explanations
│   │   ├── ollama_client.py  Local DeepSeek R1 LLM (privacy-first)
│   │   ├── portal_guide.py   Cybercrime.gov.in complaint pre-filler
│   │   └── gen_com.py        PDF complaint generator (ReportLab)
│   ├── services/
│   │   └── news_fetcher.py   NewsAPI fraud trend fetcher (with caching)
│   ├── main.py               FastAPI application + all API endpoints
│   └── requirements.txt
│
└── frontend/              ← React + Vite SPA
    └── src/
        ├── App.jsx              Sidebar + routing shell
        ├── index.css            Global styles (dark theme, glassmorphism)
        └── pages/
            ├── Dashboard.jsx    Live stats + fraud trend news
            ├── Analyzer.jsx     Message fraud analyzer
            ├── Evidence.jsx     Evidence Lab + complaint generator
            ├── Encyclopedia.jsx Research Lab (deep fraud research)
            └── About.jsx        Project info page
```

---

## 🤖 Core AI Engine (Backend)

### 1. Hybrid Fraud Scoring (`scorer.py`)

The heart of the system. Every message is scored on a **0–100 risk scale** using a two-layer hybrid approach:

| Layer | Method | Weight |
|-------|--------|--------|
| Rule-based | Weighted regex pattern matching across 12+ fraud categories | 50% |
| ML Model | TF-IDF vectorizer + Logistic Regression classifier | 50% |

**Risk Thresholds:**
- 🔴 **HIGH** (61–100): Almost certainly a scam
- 🟡 **MEDIUM** (31–60): Suspicious, proceed with caution
- 🟢 **LOW** (0–30): Likely safe

Special signals like multiple matched patterns (4+) or investment fraud language (guaranteed returns, daily %) trigger score escalation bonuses.

### 2. ML Model (`ml_model.py` + `train.py`)

- **Dataset:** `india_fraud_detection_FINAL.csv` — purpose-built dataset of Indian scam messages
- **Pipeline:** Text → TF-IDF Vectorizer → Logistic Regression → Fraud Probability
- **Output:** `fraud_prob` (0.0–1.0), `verdict` (FRAUD / SAFE), `confidence` percentage
- **Graceful fallback:** If model files are missing, the system silently falls back to rule-only scoring

### 3. Pattern Engine (`patterns.py`)

Contains a comprehensive library of **weighted regex patterns** covering:
- UPI / Payment Fraud
- KYC Phishing
- Bank Impersonation
- Govt / Telecom Scams
- Lottery / Prize Scams
- Investment Fraud
- Loan App Scams
- Job / WFH Scams
- OTP Theft
- Crypto Scams
- Parcel / Customs Scams

Each pattern group carries a **weight score** and maps to a **fraud category** with tailored **prevention tips**.

### 4. Forensic Evidence Extractor (`extractor.py`)

A powerful regex-based entity extraction engine that scans any scam text or screenshot (via OCR) for:

| Entity Type | Example |
|------------|---------|
| UPI IDs | `fraudster@paytm`, `abc@oksbi` |
| Phone Numbers | Indian 10-digit mobiles (handles `+91`, `0091`, bare format) |
| URLs | `https://...`, `bit.ly/...`, `tinyurl.com/...` |
| Payment Amounts | `₹5000`, `Rs 2,500`, `1 lakh`, `2 crore` |
| Dates & Times | `15/03/2025`, `3 March 2025`, `10:30 AM`, `yesterday` |
| Email Addresses | Gmail, Yahoo, Outlook, etc. |
| Account / Card Numbers | Keyword-prefixed bank accounts + bare 16-digit card numbers |
| Impersonated Orgs | SBI, HDFC, RBI, PhonePe, Amazon, Jio, TRAI, SEBI, etc. |

Uses a two-pass UPI extraction strategy (strict known-handle matching + lenient fallback) and carefully excludes email domains from UPI results.

### 5. LLM Explanation Layer

Two LLMs provide human-readable explanations:

| LLM | Use Case | Privacy |
|----|---------|---------|
| **DeepSeek R1 1.5b** (via Ollama, runs locally) | `/api/analyze` and `/api/extract-evidence` explanations + incident description generation | 🔒 100% local — message never leaves device |
| **Gemini 2.0 Flash** (Google AI) | `/api/research` deep-research explanations | ☁️ Cloud API (used only in Research Lab) |

### 6. Portal Guide Generator (`portal_guide.py`)

Automatically maps the fraud analysis results into a **pre-filled structure** matching the exact sections of **[cybercrime.gov.in](https://cybercrime.gov.in)**:

- **Section 1 – Incident Details:** Category, subcategory, platform, incident date, description
- **Section 2 – Suspect Details:** All extracted UPI IDs, phones, URLs, emails listed as suspect identifiers
- **Section 3 – Complainant Details:** Prompts user to fill in personal info

Supports **5 pre-filled fields** automatically and flags 14 user-fill fields, saving significant time during complaint filing.

### 7. PDF Complaint Generator (`gen_com.py`)

Generates a properly formatted **PDF cybercrime complaint document** from the portal guide data using ReportLab, ready for download and submission.

### 8. News & Trend Fetcher (`news_fetcher.py`)

- Fetches live fraud-related news from **NewsAPI** using Indian-targeted search queries
- **Categorizes** each article into fraud types (UPI Scam, Phishing, Investment Fraud, Job Scam, Crypto Scam, Loan App Fraud)
- **Caches** results with a TTL to avoid redundant API calls (performance + rate-limit protection)
- Calculates an **alert level** (LOW / MEDIUM / HIGH) based on article volume and category distribution

---

## 🌐 API Endpoints (FastAPI)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/health` | Server health check |
| POST | `/api/analyze` | Analyze a suspicious message (Analyzer page) |
| POST | `/api/research` | Deep research: analysis + related news (Research Lab) |
| POST | `/api/extract-evidence` | Extract forensic entities + generate portal guide (Evidence Lab) |
| GET | `/api/trends` | Fetch live fraud trend news (Dashboard) |
| GET | `/api/stats` | Return live usage counters + article count (Dashboard) |
| POST | `/api/generate-pdf` | Generate downloadable complaint PDF |

---

## 🖥️ Frontend Pages (React + Vite)

### Dashboard (`/`)
- Displays **live statistics**: messages analyzed, high-risk detections, frauds prevented
- Shows **top fraud categories** and a live news feed of recent fraud articles
- Stats are fetched in real-time from `/api/stats` and `/api/trends`

### Analyzer (`/analyzer`)
- Clean text input for pasting suspicious SMS, WhatsApp, or email messages
- Shows **risk score gauge**, risk level, category, matched patterns, ML verdict + confidence
- Provides **AI-generated explanation** (from local DeepSeek R1) and actionable prevention tips
- Sample scam messages built-in for quick demo

### Evidence Lab (`/evidence`) ⭐ *Flagship Feature*
- **Multi-step complaint filing assistant**
- **Step 1 – Evidence Input:** Paste suspicious message text OR upload a screenshot
  - Screenshot OCR powered by Gemini 2.0 Flash Vision
- **Step 2 – Extracted Intelligence:** Displays all extracted entities (UPI IDs, phones, URLs, amounts, etc.) + fraud analysis
- **Step 3 – Portal Guide:** A fully pre-filled, field-by-field guide for filing a complaint on cybercrime.gov.in
  - Complainant details auto-filled from saved profile (localStorage) with defaults
- **Download PDF:** Generates a complete complaint document for offline submission

### Research Lab (`/encyclopedia`)
- Deep-analysis mode using Gemini API
- Returns extended AI explanation + related live news articles filtered by fraud category
- Useful for research, awareness, and understanding the fraud landscape

### About (`/about`)
- Project information, team details, hackathon context

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| **Python 3.11+** | Core language |
| **FastAPI** | REST API framework |
| **Uvicorn** | ASGI server |
| **scikit-learn** | TF-IDF + Logistic Regression ML |
| **pandas** | Dataset handling for model training |
| **joblib** | Model serialization |
| **Google GenAI SDK** | Gemini 2.0 Flash (OCR + explanations) |
| **Ollama + DeepSeek R1 1.5b** | Local LLM (privacy-preserving) |
| **ReportLab** | PDF generation |
| **httpx** | Async HTTP for NewsAPI |
| **python-dotenv** | Environment variable management |

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 18** | UI framework |
| **Vite** | Build tool + dev server |
| **React Router v6** | Client-side routing |
| **Lucide React** | Icon library |
| **Vanilla CSS** | Dark theme, glassmorphism, animations |

---

## 🔒 Privacy-First Design

- The `/api/analyze` and `/api/extract-evidence` endpoints use **DeepSeek R1 running locally via Ollama** — your message text never leaves your machine for AI explanation
- Only the `/api/research` (Research Lab) uses a cloud API (Gemini)
- No user data is stored server-side; usage counters are **in-memory only** (reset on server restart)

---

## 📊 Fraud Categories Supported

1. UPI / Payment Fraud
2. KYC Phishing
3. Bank Impersonation
4. Govt / Telecom Scam
5. Lottery / Prize Scam
6. Investment Fraud
7. Loan App Scam
8. Job / WFH Scam
9. OTP Theft
10. Crypto Scam
11. Parcel / Customs Scam
12. General (fallback)

---

## 🚀 Running the Project

### Backend
```bash
cd backend
pip install -r requirements.txt
# Train ML model (first time only)
python -m engine.train
# Start API server
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Open http://localhost:5173
```

> Requires: `GEMINI_API_KEY` and `NEWS_API_KEY` in `backend/.env`
> Requires: Ollama running locally with DeepSeek R1 1.5b pulled (`ollama pull deepseek-r1:1.5b`)
