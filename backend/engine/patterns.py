"""
Fraud Pattern Database — 50+ patterns covering Indian digital fraud vectors.
Each pattern group has: label, weight (how much it adds to risk score), and regex list.
"""

PATTERNS = [
    # ---- Urgency & Threat Language ----
    {
        "label": "⚠️ Urgency manipulation detected",
        "weight": 20,
        "patterns": [
            r"\b(immediately|urgent|urgently|asap|right now|last chance|act now)\b",
            r"\b(within \d+ hours?|expires? (today|now|soon)|deadline)\b",
            r"\b(block(ed)?|suspend(ed)?|deactivate[d]?|terminate[d]?)\b",
        ],
    },
    # ---- Bank / Financial Impersonation ----
    {
        "label": "🏦 Bank or financial impersonation",
        "weight": 15,
        "patterns": [
            r"\b(sbi|hdfc|icici|axis|kotak|pnb|punjab national|bank of baroda|canara|union bank)\b",
            r"\b(your (bank|account|card|debit|credit|savings))\b",
            r"\b(netbanking|internet banking|mobile banking|bank account)\b",
        ],
    },
    # ---- Government / Telecom Impersonation ----
    {
        "label": "🏛️ Government/Telecom impersonation",
        "weight": 20,
        "patterns": [
            r"\b(trai|bsnl|airtel|jio|vi|vodafone|income tax|it department|irdai|sebi)\b",
            r"\b(rbi|reserve bank|government of india|ministry|uidai|aadhaar)\b",
            r"\b(narcot(ics)?|cbi|ed |enforcement direct|police|legal action|fir|cyber crime cell)\b",
        ],
    },
    # ---- OTP / Credential Phishing ----
    {
        "label": "🔑 OTP or credential theft attempt",
        "weight": 30,
        "patterns": [
            r"\b(otp|one.?time.?password|pin|password|cvv|atm pin)\b",
            r"\b(share (your|the) (otp|pin|password|code))\b",
            r"\b(enter (your|the) (otp|details|credentials|information))\b",
        ],
    },
    # ---- KYC Scams ----
    {
        "label": "📋 KYC verification scam",
        "weight": 15,
        "patterns": [
            r"\b(kyc|know your customer|kyc (update|verify|expired|complete|pending))\b",
            r"\b(update (your )?(kyc|pan|aadhaar|address|details))\b",
            r"\b(kyc (required|mandatory|verification|process))\b",
        ],
    },
    # ---- UPI / Money Transfer Scams ----
    {
        "label": "💸 UPI payment fraud pattern",
        "weight": 20,
        "patterns": [
            r"\b(upi|gpay|google pay|phonepe|paytm|bhim)\b",
            r"\b(send|pay|transfer) ?(₹|rs\.?|inr|rupees?) ?\d+.{0,20}(to receive|to get|to win|to claim)\b",
            r"\b(scan (the )?qr|qr code|payment link)\b",
            r"\b(cashback|refund|reimbursement) ?(of )?(₹|rs\.?|inr) ?\d+\b",
            r"\b(pay|send) ?(₹|rs\.?|inr|rupees?) ?\d+.{0,30}(claim|receive|get|win)\b",
        ],
    },
    # ---- Lottery / Prize Scams ----
    {
        "label": "🎰 Lottery or prize scam",
        "weight": 25,
        "patterns": [
            r"\b(lottery|lucky draw|bumper prize|@zudnwm.cyou?id|mega prize)\b",
            r"\b(congratulations|congrats).{0,60}(won|win|prize|award|reward|selected)\b",
            r"\b(won|win|winning).{0,30}(prize|lottery|award|₹|rs|lakh|crore)\b",
            r"\b(claim (your )?(prize|reward|gift|cashback|money|winning))\b",
            r"\b(lucky (winner|draw|number)|selected for prize|you have been selected)\b",
            r"\b(kbc|kaun banega|big boss|ipl|bcci).{0,30}(winner|prize|lottery|lucky)\b",
        ],
    },
    # ---- Money Lure (pay/invest small get big) ----
    {
        "label": "💰 Pay-small-get-big money lure",
        "weight": 25,
        "patterns": [
            r"\b(pay|send|transfer|invest).{0,20}(₹|rs\.?|inr|rupees?) ?\d+.{0,30}(receive|get|win|claim|earn).{0,20}(₹|rs\.?|inr|rupees?) ?\d+\b",
            r"\b(invest|pay|deposit) ?(₹|rs\.?|inr|rupees?) ?\d+.{0,20}(get|earn|receive|returns?).{0,20}(₹|rs\.?|inr|rupees?) ?\d+\b",
            r"\b(₹|rs\.?|inr) ?\d+.{0,30}(get|earn|receive|returns?).{0,20}(₹|rs\.?|inr) ?\d{4,}\b",
            r"\b(invest|pay|deposit) ?(small|\d+).{0,20}(get|earn|receive).{0,20}(big|\d+|lakh|crore)\b",
        ],
    },
    # ---- Investment / Ponzi Scams ----
    {
        "label": "📈 Investment fraud / Ponzi scheme",
        "weight": 30,
        "patterns": [
            r"\bguaranteed.{0,30}(returns?|profit|income|earning|roi)\b",
            r"\b\d+\s*%.{0,20}(daily|weekly|per day|per week|per month|monthly)\s*(returns?|profit|earning|income)?\b",
            r"\b(daily|weekly|monthly).{0,10}returns?\b",
            r"\b(double|triple|10x|5x|2x).{0,20}(money|investment|returns?|profit)\b",
            r"\b(whatsapp|telegram).{0,30}(group|channel|invest|earn|profit)\b",
            r"\b(invest|investing).{0,20}(group|channel|plan|scheme|opportunity)\b",
            r"\b(members?|users?|people).{0,20}(earning|earning daily|already earning|profiting)\b",
            r"\b(exclusive|secret|elite|vip).{0,20}(group|channel|investment|trading)\b",
            r"\b(\d+,\d+|\d+k\+?|thousands? of).{0,20}(members?|investors?|earning)\b",
        ],
    },
    # ---- Loan App Threats ----
    {
        "label": "💰 Loan app / digital lending scam",
        "weight": 15,
        "patterns": [
            r"\b(instant (loan|approval|cash|credit))\b",
            r"\b(no (documents?|kyc|income proof|cibil))\b",
            r"\b(loan (approved|disbursed|ready)|credit (line|limit) (activated|approved))\b",
        ],
    },
    # ---- Job / Work from Home Scams ----
    {
        "label": "💼 Fake job offer scam",
        "weight": 10,
        "patterns": [
            r"\b(work from home|earn (from|at) home|part.?time (job|work|earning))\b",
            r"\b(₹\d+.{0,20}(per day|daily|weekly|monthly) (income|earning|salary))\b",
            r"\b(no (experience|qualification|skill) (required|needed))\b",
        ],
    },
    # ---- SIM / Number Disconnect Scams ----
    {
        "label": "📱 SIM disconnect / telecom scam",
        "weight": 15,
        "patterns": [
            r"\b(sim (card )?(blocked|suspended|disconnected|deactivated))\b",
            r"\b(mobile (number|sim) (will be|is being) (disconnected|blocked))\b",
            r"\b(disconnect(ed)? (your )?(sim|mobile|number|service))\b",
            r"\b(call (our|the) helpline|customer (care|service) number|press \d to speak)\b",
        ],
    },

    # ---- Custom Duty / Parcel Scams ----
    {
        "label": "📦 Fake parcel / customs duty scam",
        "weight": 10,
        "patterns": [
            r"\b(parcel|package|courier|delivery).{0,30}(held|seized|detained|customs)\b",
            r"\b(customs (duty|fee|charge)|import (tax|duty))\b",
            r"\b(fedex|dhl|blue dart|india post).{0,20}(delivery|parcel|package)\b",
        ],
    },
    # ---- Crypto Scams ----
    {
        "label": "₿ Cryptocurrency scam",
        "weight": 10,
        "patterns": [
            r"\b(crypto|bitcoin|ethereum|usdt|bnb|nft).{0,30}(invest|earn|profit|return)\b",
            r"\b(crypto (trading|signals?|bot|group|channel))\b",
        ],
    },
    # ---- Personal Info Harvest ----
    {
        "label": "🪪 Personal information harvesting",
        "weight": 10,
        "patterns": [
            r"\b(share (your )?(aadhaar|pan|passport|voter id))\b",
            r"\b(send (your )?(photo|selfie|id proof|address proof))\b",
            r"\b(date of birth|mother.?s name|full address|account number|ifsc)\b",
        ],
    },
]

# ---- Category Keyword Mapping ----
CATEGORY_KEYWORDS = {
    "UPI / Payment Fraud": ["upi", "gpay", "phonepe", "paytm", "qr", "scan", "payment link", "bhim"],
    "KYC Phishing": ["kyc", "know your customer", "update kyc", "kyc expired", "kyc verification"],
    "Bank Impersonation": ["sbi", "hdfc", "icici", "axis", "kotak", "pnb", "bank account", "netbanking"],
    "Govt / Telecom Scam": ["trai", "bsnl", "sim blocked", "sim disconnected", "rbi", "income tax", "aadhaar", "uidai"],
    "Lottery / Prize Scam": ["lottery", "won", "winner", "prize", "lucky draw", "claim your"],
    "Investment Fraud": ["guaranteed returns", "roi", "double your money", "invest", "profit per day", "whatsapp group", "telegram"],
    "Loan App Scam": ["instant loan", "loan approved", "no documents", "no cibil", "credit line"],
    "Job / WFH Scam": ["work from home", "part time", "earn from home", "no experience required"],
    "OTP Theft": ["otp", "one time password", "share otp", "enter otp"],
    "Crypto Scam": ["crypto", "bitcoin", "ethereum", "usdt", "nft", "trading signals"],
    "Parcel / Customs Scam": ["parcel", "courier", "customs duty", "package detained", "fedex", "dhl"],
}

# ---- Category-Specific Prevention Tips ----
PREVENTION_TIPS = {
    "UPI / Payment Fraud": [
        "Never scan a QR code to receive money — QR codes only send money.",
        "Legitimate cashbacks are credited automatically, never via payment links.",
        "Verify the recipient's VPA (UPI ID) before any transfer.",
        "Report to your bank and NPCI at 1800-120-1740 immediately.",
        "Block the sender's number and report on cybercrime.gov.in.",
    ],
    "KYC Phishing": [
        "Banks never ask for KYC via SMS or WhatsApp links.",
        "Visit your bank branch or official app for KYC updates only.",
        "Do not click any link claiming KYC expiry — it's a phishing trap.",
        "Report the message to cybercrime.gov.in or call 1930.",
        "Forward suspicious bank SMS to 7726 (SPAM) on your mobile.",
    ],
    "Bank Impersonation": [
        "Your bank will NEVER ask for OTP, PIN, or CVV over phone/SMS.",
        "Verify by calling the official bank number on the back of your card.",
        "Do not share your account number or IFSC with unknown callers.",
        "Report to your bank's fraud helpline and RBI Complaint Portal.",
        "Call National Cyber Crime Helpline: 1930.",
    ],
    "Govt / Telecom Scam": [
        "TRAI, RBI, or IT Department never call to threaten disconnection/arrest.",
        "Hang up immediately if someone claims to be a govt official demanding money.",
        "File an online complaint at cybercrime.gov.in — it's free and easy.",
        "Do not share Aadhaar, PAN, or voter ID with unknown callers.",
        "Your SIM can only be blocked by your telecom operator, not via a call.",
    ],
    "Lottery / Prize Scam": [
        "You cannot win a lottery you never entered — it's always a scam.",
        "No legitimate prize requires you to pay anything upfront.",
        "Never share your bank or UPI details to 'claim' a prize.",
        "Block and report the number/account on cybercrime.gov.in.",
        "Alert friends and family — lure-based scams spread virally.",
    ],
    "Investment Fraud": [
        "No legitimate investment guarantees fixed high returns — it's illegal.",
        "SEBI-registered advisors never operate through WhatsApp/Telegram groups.",
        "Verify any investment firm on sebi.gov.in before investing.",
        "Report unregistered investment schemes to SEBI at sebi.gov.in/sebiweb/home/HomeAction.do.",
        "If it sounds too good to be true, it absolutely is.",
    ],
    "Loan App Scam": [
        "Only use RBI-registered NBFCs — check rbi.org.in for the list.",
        "No legitimate lender asks for upfront fees or access to your contacts.",
        "Never grant loan apps access to your camera, contacts, or gallery.",
        "If threatened, report to cybercrime.gov.in and your local police.",
        "Call the National Cyber Crime Helpline: 1930.",
    ],
    "Job / WFH Scam": [
        "Legitimate jobs never require payment for training or registration.",
        "Always verify company details on LinkedIn or their official website.",
        "No genuine employer asks for personal documents before hiring.",
        "Report fake job offers on cybercrime.gov.in.",
        "Check reviews on Glassdoor before joining any company.",
    ],
    "OTP Theft": [
        "NEVER share your OTP with anyone — not even your bank.",
        "OTPs are one-time use for YOUR transactions only.",
        "Immediately call your bank if you've shared an OTP accidentally.",
        "Block your account from the bank's official app if compromised.",
        "File a cybercrime complaint at cybercrime.gov.in within minutes.",
    ],
    "Crypto Scam": [
        "Crypto 'signal groups' on Telegram/WhatsApp are almost always scams.",
        "Check if the exchange is registered with FIU-IND India.",
        "Never invest based on unsolicited DMs or social media posts.",
        "Guaranteed crypto profits are mathematically impossible.",
        "Report crypto fraud to enforcement.gov.in and cybercrime.gov.in.",
    ],
    "Parcel / Customs Scam": [
        "Customs officials never contact you via phone for duty payment.",
        "Verify all delivery notifications on the official courier website.",
        "FedEx/DHL will never ask for payment via UPI or cash.",
        "Contact the courier company directly using numbers from their official site.",
        "Report parcel scams to cybercrime.gov.in.",
    ],
    "General": [
        "Do not click on suspicious links received via SMS or WhatsApp.",
        "Call the National Cyber Crime Helpline 1930 if you're suspicious.",
        "Report the message at cybercrime.gov.in — takes less than 5 minutes.",
        "Block and report the sender's number immediately.",
        "Share this information with elderly family members who may be targeted.",
    ],
}
