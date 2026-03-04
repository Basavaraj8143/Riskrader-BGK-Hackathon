import { useState } from 'react';

// ===== SCAM KNOWLEDGE BASE (local reference data) =====
const SCAM_DB = {
    "UPI / Payment Fraud": {
        icon: '📱', color: '#ff3b5c',
        summary: 'Scammer tricks you into scanning a QR code or sending a small amount to "receive" a larger cashback. UPI QR codes can only SEND money — never receive it.',
        howItWorks: [
            'Scammer poses as cashback/refund agent or lottery official',
            'Asks you to scan a QR code or click a "collect money" link',
            'You authorize a payment thinking you\'re receiving money',
            'Money is instantly transferred out of your account',
        ],
        redFlags: ['QR code to "receive" money', 'UPI collect request from unknown', 'Cashback that requires payment first', 'Urgent time-limited offer'],
        report: ['NPCI Helpline: 1800-120-1740', 'Your bank fraud helpline', 'cybercrime.gov.in'],
    },
    "KYC Phishing": {
        icon: '🏦', color: '#ff6b35',
        summary: 'Fake SMS/WhatsApp messages impersonating your bank claim your KYC has expired. Any link redirects to a phishing site that steals your credentials and OTP.',
        howItWorks: [
            'You receive SMS with urgent KYC expiry warning',
            'Message contains a shortened link (bit.ly etc.)',
            'Fake website looks identical to your bank\'s portal',
            'Entering credentials gives scammer full account access',
        ],
        redFlags: ['KYC expiry via SMS/WhatsApp', 'Third-party link (not bank\'s domain)', 'Account block threat', 'Asks for OTP on the page'],
        report: ['Your bank\'s official fraud number', 'RBI Complaint: cms.rbi.org.in', 'National Helpline: 1930'],
    },
    "Investment Fraud": {
        icon: '📈', color: '#ff00ff',
        summary: 'WhatsApp/Telegram groups promise guaranteed daily returns of 3–10%. These are Ponzi schemes — early members are paid with newer investors\' money until it collapses.',
        howItWorks: [
            'Invitation to "exclusive" investment group with fake testimonials',
            'Small investment seems to generate returns (designed to lure)',
            'You\'re encouraged to invest more or recruit others',
            'Eventually the scheme collapses and withdrawals are frozen',
        ],
        redFlags: ['Guaranteed daily/weekly returns', 'WhatsApp/Telegram-only group', 'No SEBI registration', 'Pressure to recruit others', 'Celebrity endorsement screenshots'],
        report: ['SEBI: sebi.gov.in/info', 'cybercrime.gov.in', 'National Helpline: 1930'],
    },
    "Loan App Scam": {
        icon: '💰', color: '#a855f7',
        summary: 'Predatory apps grant small loans quickly, then access your contacts and photos. Harassment and morphed images sent to contacts are used as blackmail for repayment.',
        howItWorks: [
            'App promises instant loan with no documents',
            'App secretly accesses your entire contact list and gallery',
            'Loan terms are exploitative (hidden fees, 1-day repayment)',
            'On default: contacts receive abusive messages and morphed images',
        ],
        redFlags: ['No documents/CIBIL required', 'App requests contact access', 'Unusually high processing fee', 'Repayment window under 7 days'],
        report: ['Local police station (FIR)', 'National Helpline: 1930', 'RBI: rbi.org.in (NBFC complaints)'],
    },
    "Govt / Telecom Scam": {
        icon: '📡', color: '#00ffff',
        summary: 'Caller impersonates TRAI, RBI, CBI or police officers claiming your number/account is linked to illegal activity. They demand payment or personal info to "clear your name".',
        howItWorks: [
            'Call from official-sounding number (may be spoofed)',
            'Claims your SIM/account linked to drug trafficking or money laundering',
            'Threatens arrest, SIM disconnection, or legal action',
            'Demands immediate payment or sensitive documents',
        ],
        redFlags: ['Government agency threatening arrest', 'Demand to press a number', 'Request for Aadhaar/PAN over call', 'Urgency + fear'],
        report: ['Hang up immediately — real agencies never call like this', 'File complaint: cybercrime.gov.in', 'National Helpline: 1930'],
    },
    "Bank Impersonation": {
        icon: '🏛️', color: '#00ff41',
        summary: 'Caller poses as your bank\'s customer care claiming your account has suspicious activity. They ask for OTP, CVV, or card details to "secure" your account.',
        howItWorks: [
            'Call appears to come from bank\'s number (can be spoofed)',
            'Creates urgency with fraud transaction/account block story',
            'Asks you to share OTP received on your phone',
            'Uses OTP to complete unauthorized transaction immediately',
        ],
        redFlags: ['Bank asking for OTP over call', 'Urgency about account block', 'Asking for card CVV/PIN', 'Claims unauthorized transaction needs your verification'],
        report: ['Call your bank\'s official helpline only', 'Freeze card via bank app', 'National Helpline: 1930'],
    },
    "Job / WFH Scam": {
        icon: '💼', color: '#ffcc00',
        summary: 'Ads promise high-paying work-from-home jobs requiring no experience. After paying a "registration" or "training" fee, the job never materializes.',
        howItWorks: [
            'Job posting appears on social media with high salary promise',
            'Interview is done over WhatsApp/Telegram (no video)',
            'Offer letter sent, asks for registration/equipment fee',
            'After payment, contact disappears or gives excuses',
        ],
        redFlags: ['No experience/qualification needed', 'Fee required before starting', 'Salary too high for role', 'Interview only on chat'],
        report: ['Report to cybercrime.gov.in', 'Alert job platform (Naukri/LinkedIn)', 'File police complaint'],
    },
    "OTP Theft": {
        icon: '🔑', color: '#ff6b35',
        summary: 'Scammer calls pretending to be bank/app support and tricks you into sharing your OTP "for verification". OTP is immediately used to drain your account.',
        howItWorks: [
            'You receive legitimate OTP (triggered by scammer attempting login)',
            'Scammer calls claiming to be bank/NPCI/RBI support',
            'Asks for OTP to "verify" your account or "stop a transaction"',
            'OTP is used to authorize transfers instantly',
        ],
        redFlags: ['Anyone asking for OTP over call', 'Unexpected OTP on your phone', '"Verify to stop unauthorized transaction"', 'Asking to install remote access app'],
        report: ['Call your bank IMMEDIATELY to freeze account', 'National Helpline: 1930 within minutes', 'cybercrime.gov.in'],
    },
    "Crypto Scam": {
        icon: '₿', color: '#6c63ff',
        summary: 'Fake crypto trading groups, signal channels, or exchanges promise guaranteed profits. Your deposited funds are locked or stolen, with fake profit screenshots used as bait.',
        howItWorks: [
            'Added to Telegram/WhatsApp crypto trading group',
            'Fake "admin" shows fabricated profit screenshots',
            'You deposit on their fake exchange platform',
            'Profits show on screen but withdrawals are always blocked',
        ],
        redFlags: ['Guaranteed crypto profits', 'Telegram "signals" group', 'Unregistered exchange platform', 'Withdrawal fees keep increasing'],
        report: ['Report to enforcement.gov.in', 'cybercrime.gov.in', 'Alert your bank to freeze related transactions'],
    },
};

const SAMPLES = [
    { label: '📱 UPI Scam', msg: 'Congratulations! Scan QR code to receive Rs 50000 BHIM cashback. Pay Rs 1 processing fee. Expires in 30 minutes!' },
    { label: '🏦 KYC Fraud', msg: 'Dear Customer, your SBI KYC expired. Click bit.ly/sbifake to update immediately or account blocked in 24 hours.' },
    { label: '📈 Ponzi', msg: 'Join exclusive WhatsApp investment group! Guaranteed 5% daily returns. 10,000 members already earning. Invest Rs 5000 get Rs 50000 in 30 days!' },
    { label: '📡 TRAI', msg: 'TRAI authority: Your mobile number linked to illegal activity. Will be disconnected in 2 hours. Press 9 to speak to cyber officer.' },
    { label: '💰 Loan App', msg: 'Instant loan approved! Rs 50000 in 10 minutes. No documents. No CIBIL. Download app and fill details. Processing fee Rs 500 only.' },
];

const LEVEL_STYLE = {
    HIGH: { color: '#ff3b5c', border: 'rgba(255,59,92,0.25)', bg: 'rgba(255,59,92,0.05)', label: '🔴 HIGH RISK' },
    MEDIUM: { color: '#ffcc00', border: 'rgba(255,204,0,0.25)', bg: 'rgba(255,204,0,0.05)', label: '🟡 MEDIUM RISK' },
    LOW: { color: '#00ff41', border: 'rgba(0,255,65,0.25)', bg: 'rgba(0,255,65,0.04)', label: '🟢 LOW RISK' },
};

export default function Encyclopedia() {
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const research = async () => {
        if (!msg.trim()) return;
        setLoading(true); setError(null); setResult(null);
        try {
            const r = await fetch('http://localhost:8000/api/research', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: msg }),
            });
            if (!r.ok) throw new Error(`Backend error ${r.status}`);
            setResult(await r.json());
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const scamData = result ? SCAM_DB[result.category] || null : null;
    const lvl = result ? (LEVEL_STYLE[result.level] || LEVEL_STYLE.LOW) : null;

    return (
        <div>
            <div className="page-header">
                <div className="page-label">📚 Context-Aware Research</div>
                <h1 className="page-title">
                    Fraud <span className="highlight">Research Lab</span>
                </h1>
                <p className="page-subtitle">
                    Paste any suspicious message — we instantly identify the scam type, explain how it works, and surface related real-world news from India.
                </p>
            </div>

            {/* ===== INPUT PANEL ===== */}
            <div className="card" style={{ padding: '28px', marginBottom: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                        <div className="input-label">🔎 Paste suspicious message to research</div>
                        <textarea
                            className="message-textarea"
                            placeholder={'Paste the suspicious SMS, WhatsApp message, or email here...\n\nExample: "Your SBI KYC is expired. Click bit.ly/fake to update or account will be blocked."'}
                            value={msg}
                            onChange={e => setMsg(e.target.value)}
                            rows={5}
                            style={{ minHeight: 120 }}
                        />
                        {error && <div className="error-box" style={{ marginTop: 10 }}>⚠️ {error} — Is backend running on port 8000?</div>}
                    </div>
                    <div style={{ paddingTop: 24 }}>
                        <div className="analyze-btn-wrap" style={{ width: 160 }}>
                            <div className="analyze-btn-glow" />
                            <button className="analyze-btn" onClick={research} disabled={loading || !msg.trim()} style={{ padding: '13px 16px', fontSize: 12 }}>
                                {loading ? <><span className="spinner" /> researching...</> : <>🔬 Research</>}
                            </button>
                        </div>
                        <div style={{ marginTop: 10 }}>
                            <div className="samples-label">Quick tests</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                {SAMPLES.map(s => (
                                    <button key={s.label} className="sample-chip" style={{ textAlign: 'left', fontSize: 10 }} onClick={() => setMsg(s.msg)}>
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== RESULTS ===== */}
            {!result && !loading && (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🔬</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, letterSpacing: 2, textTransform: 'uppercase' }}>
                        Research Lab Ready
                    </div>
                    <div style={{ fontSize: 12, marginTop: 8, lineHeight: 1.7 }}>
                        Paste a suspicious message above and click Research<br />
                        to get full fraud intelligence: category, related news, and prevention guide.
                    </div>
                </div>
            )}

            {result && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

                    {/* ===== LEFT: Analysis + Scam Guide ===== */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                        {/* Risk Score Block */}
                        <div className="card" style={{ padding: '22px', background: lvl.bg, borderColor: lvl.border }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                                <div>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 52, fontWeight: 700, color: lvl.color, lineHeight: 1, textShadow: `0 0 20px ${lvl.color}60` }}>
                                        {result.score}
                                    </div>
                                    <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: 2, textTransform: 'uppercase', marginTop: 4 }}>Risk Score</div>
                                </div>
                                <div>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700, color: lvl.color, letterSpacing: 2, textTransform: 'uppercase', textShadow: `0 0 10px ${lvl.color}60` }}>
                                        {lvl.label}
                                    </div>
                                    <div style={{ marginTop: 8 }}>
                                        <span style={{ background: 'rgba(0,255,255,0.06)', border: '1px solid rgba(0,255,255,0.2)', borderRadius: 3, padding: '4px 10px', fontSize: 11, color: '#00ffff', fontFamily: 'var(--font-mono)', letterSpacing: 1, textTransform: 'uppercase' }}>
                                            📂 {result.category}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Pattern chips */}
                            {result.matched_patterns?.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 14 }}>
                                    {result.matched_patterns.map(p => (
                                        <span key={p} className="pattern-chip" style={{ fontSize: 10 }}>⚠️ {p}</span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* AI Explanation */}
                        <div className="card explanation-block" style={{ padding: '20px' }}>
                            <div className="explanation-badge">
                                {result.powered_by?.includes('Gemini') ? '✨ gemini ai analysis' : '🔢 rule engine analysis'}
                            </div>
                            <div className="explanation-text">"{result.explanation}"</div>
                        </div>

                        {/* Scam Guide — How it Works */}
                        {scamData && (
                            <div className="card" style={{ padding: '22px' }}>
                                <div className="section-title" style={{ color: scamData.color }}>
                                    {scamData.icon} How This Scam Works
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {scamData.howItWorks.map((step, i) => (
                                        <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                            <span style={{ color: scamData.color, fontFamily: 'var(--font-mono)', fontWeight: 700, flexShrink: 0, minWidth: 20 }}>
                                                {String(i + 1).padStart(2, '0')}
                                            </span>
                                            {step}
                                        </div>
                                    ))}
                                </div>

                                <div style={{ marginTop: 16 }}>
                                    <div className="section-title">⚠️ Red Flags</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                        {scamData.redFlags.map(f => (
                                            <span key={f} className="flag-chip">{f}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Prevention Tips */}
                        {result.prevention_tips?.length > 0 && (
                            <div className="card" style={{ padding: '22px' }}>
                                <div className="section-title">🛡️ Prevention Guide</div>
                                <ul className="tips-list">
                                    {result.prevention_tips.map((tip, i) => (
                                        <li key={i}><span className="tip-check">✓</span>{tip}</li>
                                    ))}
                                </ul>

                                {scamData && (
                                    <div style={{ marginTop: 16, padding: '12px 14px', background: 'rgba(0,255,65,0.03)', border: '1px solid rgba(0,255,65,0.12)', borderRadius: 4 }}>
                                        <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#00ff41', marginBottom: 8, fontWeight: 700 }}>📞 Report Channels</div>
                                        {scamData.report.map(r => (
                                            <div key={r} style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.8, fontFamily: 'var(--font-mono)' }}>› {r}</div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ===== RIGHT: Related News ===== */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                        {/* Context Banner */}
                        <div className="card" style={{ padding: '18px 22px', background: 'rgba(0,255,255,0.03)', borderColor: 'rgba(0,255,255,0.15)' }}>
                            <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#00ffff', fontWeight: 700, marginBottom: 6 }}>
                                📰 Related News Intelligence
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                Showing recent fraud reports most relevant to the detected scam type: <strong style={{ color: '#00ffff' }}>{result.category}</strong>
                            </div>
                        </div>

                        {/* News Articles */}
                        <div className="card" style={{ padding: '22px' }}>
                            <div className="section-title">📡 Recent Reports from India</div>
                            {result.related_news?.length > 0 ? (
                                <div>
                                    {result.related_news.map((h, i) => {
                                        const isMatch = h.category && result.category.toLowerCase().includes(h.category.toLowerCase().replace(' scam', '').replace(' fraud', ''));
                                        return (
                                            <div key={i} className="headline-item" style={{ borderBottom: i < result.related_news.length - 1 ? '1px solid rgba(0,255,65,0.07)' : 'none' }}>
                                                {isMatch && (
                                                    <span style={{ fontSize: 9, background: 'rgba(0,255,65,0.1)', border: '1px solid rgba(0,255,65,0.2)', color: '#00ff41', padding: '2px 7px', borderRadius: 2, letterSpacing: 1, fontWeight: 700, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', display: 'inline-block', marginBottom: 4 }}>
                                                        ● RELATED
                                                    </span>
                                                )}
                                                <a
                                                    href={h.url && h.url !== '#' ? h.url : `https://www.google.com/search?q=${encodeURIComponent(h.title)}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="headline-title"
                                                    style={{ textDecoration: 'none', cursor: 'pointer', transition: 'color 0.15s, text-shadow 0.15s' }}
                                                    onMouseEnter={e => { e.target.style.color = '#00ff41'; e.target.style.textShadow = '0 0 8px rgba(0,255,65,0.5)'; }}
                                                    onMouseLeave={e => { e.target.style.color = ''; e.target.style.textShadow = ''; }}
                                                >
                                                    {h.title} ↗
                                                </a>
                                                <div className="headline-meta">
                                                    <span className="headline-cat">{h.category}</span>
                                                    <span className="headline-dot">·</span>
                                                    <span className="headline-source">{h.source}</span>
                                                    <span className="headline-dot">·</span>
                                                    <span className="headline-date">{h.publishedAt}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
                                    No related articles found in current news feed.
                                </div>
                            )}
                        </div>

                        {/* Scam Summary Card */}
                        {scamData && (
                            <div className="card" style={{ padding: '22px', borderColor: `${scamData.color}22` }}>
                                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 4, background: `${scamData.color}10`, border: `1px solid ${scamData.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                                        {scamData.icon}
                                    </div>
                                    <div>
                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: scamData.color, letterSpacing: 1, textTransform: 'uppercase' }}>
                                            Scam Type Profile
                                        </div>
                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: '#00ff41', marginTop: 2, letterSpacing: 0.5 }}>
                                            {result.category}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.75 }}>
                                    {scamData.summary}
                                </div>
                            </div>
                        )}

                        {/* National Helpline CTA */}
                        <div className="card" style={{ padding: '18px 22px', background: 'rgba(255,59,92,0.04)', borderColor: 'rgba(255,59,92,0.2)', textAlign: 'center' }}>
                            <div style={{ fontSize: 11, color: '#ff8fa3', fontFamily: 'var(--font-mono)', letterSpacing: 1, marginBottom: 6 }}>
                                NATIONAL CYBER CRIME HELPLINE
                            </div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 32, fontWeight: 700, color: '#ff3b5c', textShadow: '0 0 20px rgba(255,59,92,0.5)', letterSpacing: 2 }}>
                                1930
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, letterSpacing: 0.5 }}>
                                cybercrime.gov.in · 24/7 available
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
