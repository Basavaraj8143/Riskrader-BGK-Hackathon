# FinGuard AI - WhatsApp Web Extension

## 🚀 Installation for Hackathon Demo

### Method 1: Chrome Extension (Recommended)
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `extension` folder from this project
5. Navigate to WhatsApp Web

### Method 2: Quick Injection (Faster for demo)
1. Open WhatsApp Web
2. Press F12 to open Developer Tools
3. Go to Console tab
4. Copy-paste the entire content of `content.js` and press Enter
5. Copy-paste the CSS from `styles.css` into a `<style>` tag:
```javascript
const style = document.createElement('style');
style.textContent = `/* Paste CSS from styles.css here */`;
document.head.appendChild(style);
```

## ⚡ Features

### 🎯 Zero Copy-Paste Required
- **Automatic Message Detection**: Scans WhatsApp messages in real-time
- **Smart Message Extraction**: Works with all WhatsApp message types
- **Instant Analysis**: One-click fraud detection without manual copying

### 🤖 Smart Detection
- **Auto-Detect Mode**: Automatically analyzes suspicious messages
- **Manual Analysis**: Analyze any message on demand
- **Risk Scoring**: 0-100 risk scale with HIGH/MEDIUM/LOW levels
- **Category Detection**: Identifies 12+ fraud types (UPI, KYC, Investment, etc.)

### 🎨 User-Friendly Interface
- **Floating Widget**: Non-intrusive overlay on WhatsApp Web
- **Keyboard Shortcuts**: 
  - `Alt+Shift+G`: Toggle widget (G for FinGuard)
  - `Alt+Shift+A`: Analyze current message
- **Real-time Results**: Instant feedback with explanations
- **Dark Mode Support**: Matches WhatsApp Web theme

## 🔧 How It Works

1. **Message Monitoring**: Uses MutationObserver to detect new messages
2. **Text Extraction**: Intelligently extracts message content from WhatsApp DOM
3. **API Integration**: Sends messages to FinGuard AI backend for analysis
4. **Result Display**: Shows risk scores, categories, and explanations in-widget

## 📋 Demo Script for Judges

### Step 1: Setup
```
1. Start FinGuard backend: cd backend && uvicorn main:app --reload
2. Install extension or use injection method
3. Open WhatsApp Web
```

### Step 2: Live Demo
```
1. Show the floating FinGuard widget (Ctrl+Shift+F)
2. Enable Auto-Detect mode
3. Receive/test a scam message (sample provided below)
4. Watch automatic detection in action
5. Show manual analysis feature
6. Display detailed results and explanations
```

### Sample Scam Messages for Testing:
```
🚨 UPI SCAM:
"Your UPI account will be blocked today. Please update your KYC immediately: http://fake-bank.com/update"

🚨 INVESTMENT SCAM:
"🔥 DAILY 2% RETURNS! Invest ₹5000 and get ₹100 daily. Guaranteed profit. Register now: bit.ly/scam-invest"

🚨 LOTTERY SCAM:
"CONGRATULATIONS! You won ₹25,00,000 in WhatsApp lottery. Claim now by sending ₹5000 to winner@paytm"
```

## 🎯 Key Benefits for Hackathon

### ✅ Innovation
- **First-of-its-kind** WhatsApp Web integration for fraud detection
- **Zero-friction** user experience - no copy-paste needed
- **Real-time** protection while users chat

### ✅ Impact
- **Massive market**: 400M+ WhatsApp users in India
- **Critical need**: ₹12,000+ crore annual digital fraud losses
- **Immediate value**: Works instantly on existing WhatsApp Web

### ✅ Technical Excellence
- **Hybrid AI**: Rule-based + ML + LLM approach
- **Privacy-first**: Local processing for sensitive messages
- **Scalable architecture**: Browser extension + cloud API

## 🔄 Troubleshooting

### Extension Not Loading
- Refresh WhatsApp Web after installation
- Check Developer Tools console for errors
- Ensure backend is running on localhost:8000

### Messages Not Detected
- Try clicking on a message first
- Check if Auto-Detect is enabled
- Use manual analysis button

### API Errors
- Verify backend is running: `curl http://localhost:8000/api/health`
- Check CORS settings in backend
- Look for network errors in browser console

## 🚀 Future Enhancements
- **Multi-platform**: Support for other messaging apps
- **Voice detection**: Analyze voice notes
- **Image analysis**: OCR for scam screenshots
- **Alert system**: Proactive fraud warnings
