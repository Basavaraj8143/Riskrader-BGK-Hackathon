# 🚀 Deployment Guide: RiskRadar AI

This guide covers deploying the RiskRadar AI full-stack application using **Heroku** for the backend and **Vercel** for the frontend.

## 1. Backend Deployment (Heroku)

Heroku will host the FastAPI server. 

### Prerequisites
- [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) installed.
- Logged into Heroku: `heroku login`

### Steps
1. **Add a Procfile:** Ensure a file named `Procfile` exists in the `backend/` directory with the following content:
   ```text
   web: uvicorn main:app --host 0.0.0.0 --port $PORT
   ```
2. **Initialize Heroku App:**
   ```bash
   cd backend
   heroku create riskradar-backend-ai  # Choose a unique name
   ```
3. **Set Environment Variables:**
   ```bash
   heroku config:set GEMINI_API_KEY=your_gemini_key
   heroku config:set NEWS_API_KEY=your_news_api_key
   ```
4. **Deploy:**
   ```bash
   git add .
   git commit -m "Prepare for Heroku deployment"
   git push heroku main
   ```
   *(Note: Since the backend is in a subfolder, you might need to use `git subtree push --prefix backend heroku main` if deploying from the root of the repo).*

---

## 2. Frontend Deployment (Vercel)

Vercel will host the React/Vite frontend.

### Steps
1. **Connect Repository:** Go to [Vercel](https://vercel.com) and import your GitHub repository.
2. **Configure Project:**
   - **Root Directory:** `frontend`
   - **Framework Preset:** `Vite`
3. **Set Environment Variables:**
   Add `VITE_API_BASE_URL` and set it to your Heroku URL (e.g., `https://riskradar-backend-ai.herokuapp.com`).
4. **Deploy:** Click **Deploy**. Vercel will build and host your site.

---

## 3. Browser Extension Update

The "RiskRadar" extension must point to your live Heroku backend.

1. Open `extension/content.js`.
2. Find the line: `this.apiBaseUrl = 'http://localhost:8000';`
3. Change it to: `this.apiBaseUrl = 'https://riskradar-backend-ai.herokuapp.com';`
4. Repeat for `extension/demo-script.js` and `extension/ocr-content.js`.

---

## ⚠️ Important Note on AI Models
Standard Heroku dynos do not support **Ollama** or **DeepSeek R1** due to RAM/CPU limits. 
- The **Analyzer** will automatically use the high-quality **Rule-Engine Fallback**.
- The **Research Lab** and **OCR** will continue to work perfectly using the **Gemini Cloud API**.
- For a full "Privacy-First" demo with local LLMs, a VPS with 8GB+ RAM (like DigitalOcean or AWS EC2) is recommended.
