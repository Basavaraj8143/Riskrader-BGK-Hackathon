# 🚀 Deployment Guide: RiskRadar AI

This guide covers deploying the RiskRadar AI full-stack application using **Heroku** for the backend and **Vercel** for the frontend.

---

## 1. Backend Deployment (Heroku)

Heroku hosts the FastAPI REST API.

### Prerequisites
- [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) installed.
- Logged into Heroku: `heroku login`

### Steps
1. **Procfile Configuration:** Ensure a file named `Procfile` exists in the `backend/` directory with the following content:
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
4. **Deploy Repository Subtree:**
   Because the backend is in a subfolder, deploy using `git subtree`:
   ```bash
   git subtree push --prefix backend heroku main
   ```

> [!WARNING]
> **On-the-Fly Extension Downloader Limitation:**  
> The `/api/download-extension` endpoint packages the `extension/` directory by scanning the parent workspace directory (`../extension`). 
> If you deploy only the `backend/` subtree using the Heroku command above, the parent `extension/` folder will not exist in the Heroku build environment. 
> To support the download button in production, deploy the **entire project root** to Heroku and configure your Heroku Dashboard "Run Command" or custom buildpacks to run `uvicorn backend.main:app` from the repository root instead.

---

## 2. Frontend Deployment (Vercel)

Vercel hosts the React + Vite Single Page Application (SPA).

### Steps
1. **Connect Repository:** Log in to [Vercel](https://vercel.com) and import your GitHub repository.
2. **Configure Project Build:**
   - **Root Directory:** `frontend`
   - **Framework Preset:** `Vite`
3. **Set Environment Variables:**
   Add `VITE_API_BASE_URL` in the Vercel Dashboard and set it to your live Heroku backend URL:
   ```env
   VITE_API_BASE_URL=https://riskradar-backend-ai.herokuapp.com
   ```
   *The React frontend will automatically read this environment variable at runtime, falling back to `http://localhost:8000` if not set.*
4. **Deploy:** Click **Deploy**. Vercel will build and host your site.

---

## 3. Browser Extension Update

The "RiskRadar" extension must point to your live Heroku backend URL:

1. Open `extension/content.js`.
2. Locate the line:
   ```javascript
   this.apiBaseUrl = 'http://localhost:8000';
   ```
3. Replace it with your deployed Heroku URL:
   ```javascript
   this.apiBaseUrl = 'https://riskradar-backend-ai.herokuapp.com';
   ```
4. Repeat this replacement in `extension/demo-script.js` and `extension/ocr-content.js`.

---

## ⚠️ Note on Local AI Models

Standard Heroku dynos do not support running **Ollama** or **DeepSeek R1** due to container memory/CPU limits.
- When running in production on Heroku, the **Analyzer** will automatically fallback to the high-performance **Rule-Engine**.
- The **Research Lab** (OCR and deep briefs) will continue to work using the **Gemini Cloud API**.
- For a full "Privacy-First" deployment utilizing local LLMs, a Virtual Private Server (VPS) with 8GB+ RAM (such as DigitalOcean, AWS EC2, or Linode) is recommended.
