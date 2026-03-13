# RiskRadar Chrome Extension

Intercepts suspicious link clicks and warns you before you land on a scam page — powered by the RiskRadar backend AI.

## How It Works

```
Click link → content.js intercepts → background.js sends URL to /api/analyze
→ HIGH/MEDIUM? → show warning overlay → user decides
→ LOW or backend down? → navigate silently
```

## Setup

### 1. Generate Icons (first time only)
```bash
cd extend
pip install Pillow
python generate_icons.py
```

### 2. Start the Backend
```bash
cd ../backend
uvicorn main:app --reload --port 8000
```

### 3. Load the Extension in Chrome
1. Open `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `extend/` folder

The RiskRadar shield icon will appear in your toolbar.

## Files

| File | Purpose |
|------|---------|
| `manifest.json` | Extension config (Manifest V3) |
| `background.js` | Service worker — calls `/api/analyze` |
| `content.js` | Intercepts clicks, shows overlay |
| `styles.css` | Overlay + popup styles |
| `popup.html/js` | Toolbar popup UI |
| `generate_icons.py` | One-time icon generator |

## Backend Endpoint Used

**POST** `http://localhost:8000/api/analyze`
```json
{ "message": "https://sbi-kyc-update.xyz/verify" }
```

Returns `score`, `level`, `category`, `prevention_tips` — the same fields used by the main Analyzer page.

## Notes
- Extension **fails silently** if the backend is not running — navigation is never blocked
- Only URL string is sent — no page content, cookies, or user data
- Same-origin links are always skipped
