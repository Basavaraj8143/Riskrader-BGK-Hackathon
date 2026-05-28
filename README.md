# FinGuard AI — Your AI-Powered Shield Against Digital Fraud

**FinGuard AI** is a full-stack, AI-powered fraud detection and cybercrime assistance platform built for the Indian digital ecosystem. It combines rule-based pattern matching, machine learning, and local large language models (LLMs) to help everyday users identify scam messages, extract forensic evidence, and file cybercrime complaints. 

Built as a hackathon submission, this project directly addresses India's fastest-growing problems: online financial fraud via UPI, KYC phishing, investment scams, loan app abuse, and impersonation fraud.

## 🌟 Key Features

1. **Semantic Fraud Scoring Engine:** Analyzes text using rule-based regex patterns, a semantic similarity model (Sentence Transformers), and an ML classifier (TF-IDF + Logistic Regression) to provide a 0-100 risk score and identify 12+ fraud categories.
2. **Evidence Lab (Flagship Feature):** Extracts crucial forensic entities (UPI IDs, phone numbers, URLs, payment amounts) from scam messages or screenshots (via OCR) and auto-generates a structured portal guide for easy filing on `cybercrime.gov.in`.
3. **Privacy-First Explanations:** Employs a local LLM (DeepSeek R1 via Ollama) to explain exactly why a message is dangerous, ensuring your messages never leave your device.
4. **Live Fraud Dashboard:** Fetches and categorizes real-time fraud trends and news using NewsAPI.
5. **WhatsApp Web Extension:** A companion Chrome extension that overlays directly onto WhatsApp Web for zero-friction, real-time scam message detection.

---

## 🏗️ Architecture & Tech Stack

### Backend (Python / FastAPI)
- **Framework:** FastAPI with Uvicorn
- **AI/ML:** Sentence Transformers (all-MiniLM-L6-v2), scikit-learn (Logistic Regression + TF-IDF), joblib, pandas, torch
- **LLM Integrations:** Ollama (Local DeepSeek R1 1.5b), Google GenAI SDK (Gemini 2.0 Flash for OCR/Research)
- **Utilities:** ReportLab (PDF Generation), httpx (NewsAPI fetcher)

### Frontend (React / Vite)
- **Framework:** React 18, Vite, React Router v6
- **UI:** Custom glassmorphism dark theme, Lucide React icons
- **Features:** Dashboard, Message Analyzer, Evidence Lab, Encyclopedia/Research Lab, and Awareness modules.

### Browser Extension (RiskRadar for WhatsApp Web)
- **Core:** JavaScript, CSS, HTML
- **Functionality:** Real-time DOM monitoring (MutationObserver), automatic message extraction, API integration with the FinGuard backend.

---

## 🔌 The RiskRadar WhatsApp Extension

A standout feature for the demo is our **Zero Copy-Paste Chrome Extension** designed specifically for WhatsApp Web.

### Capabilities:
- **Automatic Detection:** Scans WhatsApp messages in real-time as they arrive.
- **Floating Widget:** Non-intrusive UI overlay right inside WhatsApp Web.
- **Keyboard Shortcuts:** Use `Alt+Shift+G` to toggle the widget, and `Alt+Shift+A` to analyze the current message.
- **Instant Analysis:** Instantly queries the local FinGuard backend to show risk scores, fraud categories, and explanations directly in the browser.

### How to Install (For Demo):
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** in the top right.
3. Click **Load unpacked** and select the `extension` folder inside this repository.
4. Open WhatsApp Web and press `Alt+Shift+G` to bring up the FinGuard shield!

---

## 🚀 Running the Project Locally

### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt

# Train the ML model (required for first-time setup)
python -m engine.train

# Start the FastAPI server
uvicorn main:app --reload --port 8000
```
> **Note:** Requires `GEMINI_API_KEY` and `NEWS_API_KEY` in `backend/.env`. Also requires Ollama running locally with the DeepSeek R1 model (`ollama pull deepseek-r1:1.5b`).

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
> Navigate to `http://localhost:5173` to access the main web application.

---

## 🛡️ Privacy & Security
FinGuard AI is built with privacy in mind. The core analysis endpoint (`/api/analyze`) and the Evidence Lab extraction use the **local DeepSeek R1 LLM**. This ensures that highly sensitive financial or personal messages do not get sent to external cloud APIs for core fraud detection. Cloud APIs (like Gemini) are only utilized for broad research (`/api/research`) or OCR capabilities.

---
*Built with ❤️ to protect users against digital fraud.*
