import { useState } from 'react';
import {
    ShieldCheck, AlertTriangle, Eye, Lock, Smartphone,
    CreditCard, Globe, MessageSquare, ChevronDown, ChevronUp,
    CheckCircle, XCircle, Lightbulb, BookOpen, Award, RefreshCw, Hash,
    Key, ShieldAlert, Download, PhoneOff, EyeOff, Trash2, MailWarning
} from 'lucide-react';

/* ─── DATA ─────────────────────────────────────────────── */


const DOS = [
    { id: 'pass', icon: Key, label: 'Strong Passwords', desc: 'Use strong, unique passwords for every account.' },
    { id: '2fa', icon: ShieldCheck, label: 'Enable 2FA', desc: 'Enable two-factor authentication (2FA) on all financial apps.' },
    { id: 'update', icon: RefreshCw, label: 'Keep Updated', desc: 'Keep your banking app and OS updated regularly.' },
    { id: 'verify', icon: Eye, label: 'Verify Links', desc: 'Verify sender identity before clicking any link.' },
    { id: 'report', icon: AlertTriangle, label: 'Report Fraud', desc: 'Report fraud immediately to cybercrime.gov.in or call 1930.' },
    { id: 'sim', icon: Lock, label: 'Lock SIM', desc: 'Lock your SIM with a PIN via your telecom provider.' },
    { id: 'check', icon: BookOpen, label: 'Check Statements', desc: 'Regularly check your bank statements for unknown transactions.' },
    { id: 'app', icon: Download, label: 'Official Apps', desc: 'Use the official app from the Play Store / App Store only.' },
];

const DONTS = [
    { id: 'share', icon: EyeOff, label: 'Never Share Details', desc: 'Share OTP, PIN, CVV, or passwords with anyone — ever.' },
    { id: 'click', icon: MailWarning, label: 'Don\'t Click Unknown', desc: 'Click links in SMS or WhatsApp from unknown senders.' },
    { id: 'anydesk', icon: Smartphone, label: 'No Remote Apps', desc: 'Install apps like AnyDesk for "bank support".' },
    { id: 'trust', icon: PhoneOff, label: 'Don\'t Trust Callers', desc: 'Trust callers claiming to be from RBI, TRAI, or CBI by phone.' },
    { id: 'pin', icon: CreditCard, label: 'No PIN to Receive', desc: 'Enter UPI PIN to "receive" money (you never need to).' },
    { id: 'invest', icon: Award, label: 'Avoid Tips', desc: 'Invest based on social media tips or Telegram trading groups.' },
    { id: 'ignore', icon: Trash2, label: 'Don\'t Ignore', desc: 'Ignore unknown transactions — report within 24 hours for reversal.' },
    { id: 'lottery', icon: Award, label: 'Ignore Lotteries', desc: 'Engage with lottery / prize winner messages.' },
];

/* ─── SMS SENDER ID DATA ────────────────────────────────── */

const SMS_SENDER_CODES = [
    {
        code: 'G',
        label: 'Government',
        color: '#22d3ee',
        glow: 'rgba(34,211,238,0.08)',
        border: 'rgba(34,211,238,0.2)',
        desc: 'Official messages from central/state government agencies, UIDAI, I-T dept, EPFO, etc.',
        examples: ['VM-UIDAIG → Aadhaar OTP', 'DM-ITMCPC → Income Tax', 'BP-EPFOHO → PF updates'],
        scamTip: 'If a message claims to be from "Govt" but comes from a 10-digit mobile number — it is fake.',
    },
    {
        code: 'B',
        label: 'Banking / Finance',
        color: 'var(--accent-light)',
        glow: 'var(--accent-dim)',
        border: 'rgba(59,130,246,0.2)',
        desc: 'Banks, NBFCs, insurance companies, and SEBI-registered financial institutions.',
        examples: ['AM-SBIBNK → SBI alerts', 'JD-HDFCBK → HDFC Bank', 'VK-ICICIB → ICICI Bank'],
        scamTip: 'Scammers spoof sender IDs with lookalike names (e.g., SBINNK instead of SBIBNK). Double-check character by character.',
    },
    {
        code: 'T',
        label: 'Telecom',
        color: '#fb923c',
        glow: 'rgba(251,146,60,0.08)',
        border: 'rgba(251,146,60,0.2)',
        desc: 'BSNL, Jio, Airtel, Vi, and other telecom service providers for recharge and usage alerts.',
        examples: ['DL-BSNLMI → BSNL', 'MH-JIONET → Jio balance', 'KA-AIRTEL → Airtel offers'],
        scamTip: 'KYC update or SIM block threats from telecom senders are ALWAYS scams. Telecoms never send such threats via SMS.',
    },
    {
        code: 'P',
        label: 'Promotional',
        color: '#a78bfa',
        glow: 'rgba(167,139,250,0.08)',
        border: 'rgba(167,139,250,0.2)',
        desc: 'Marketing messages from registered businesses — e-commerce, retail, food delivery, etc. Sent only to non-DND numbers.',
        examples: ['VM-AMZONP → Amazon deals', 'DL-ZOMATO → Food offers', 'MH-FLIPKP → Flipkart sale'],
        scamTip: 'Promotional messages cannot send OTPs or transaction alerts by TRAI rules. Any OTP from a "-P" sender is a red flag.',
    },
    {
        code: 'S',
        label: 'Service / Transactional',
        color: 'var(--safe)',
        glow: 'var(--safe-dim)',
        border: 'rgba(16,185,129,0.2)',
        desc: 'OTPs, delivery alerts, booking confirmations, and account activity notifications.',
        examples: ['DM-PAYTMS → Paytm OTP', 'VM-SWGYFS → Swiggy order', 'MH-IRCTCS → IRCTC ticket'],
        scamTip: 'Real OTP senders always use registered 6-letter IDs. OTPs from 10-digit mobile numbers are phishing attempts.',
    },
    {
        code: 'H',
        label: 'Health',
        color: '#f472b6',
        glow: 'rgba(244,114,182,0.08)',
        border: 'rgba(244,114,182,0.2)',
        desc: 'Hospitals, pharmacies, AYUSH, diagnostics labs, CoWIN vaccine reminders, and health schemes.',
        examples: ['VM-COWIDH → CoWIN OTP', 'DL-APOLLOH → Apollo appt', 'MH-AIIMSH → AIIMS Delhi'],
        scamTip: 'Health agencies never ask for payment via SMS. Any "medical emergency fee" SMS is a scam.',
    },
];

const STATE_CODES = [
    { code: 'DL', state: 'Delhi / National' },
    { code: 'MH', state: 'Maharashtra' },
    { code: 'KA', state: 'Karnataka' },
    { code: 'TN', state: 'Tamil Nadu' },
    { code: 'UP', state: 'Uttar Pradesh' },
    { code: 'WB', state: 'West Bengal' },
    { code: 'GJ', state: 'Gujarat' },
    { code: 'AP', state: 'Andhra Pradesh' },
    { code: 'BP', state: 'Bihar' },
    { code: 'JD', state: 'Jharkhand' },
    { code: 'AM', state: 'Assam' },
    { code: 'VK', state: 'All India (VM series)' },
];

const QUIZ_QUESTIONS = [
    {
        q: 'A "bank official" calls asking for your OTP to update KYC. What do you do?',
        options: ['Share the OTP to avoid account freeze', 'Ask them to wait and share OTP after 5 minutes', 'Hang up immediately and call your bank\'s official number', 'Share only the first 3 digits'],
        correct: 2,
        explanation: 'Banks NEVER ask for OTP over phone. Always hang up and call the official number on the back of your card.',
    },
    {
        q: 'You get a UPI "collect" request from an unknown person asking you to enter your PIN to receive ₹5,000. What do you do?',
        options: ['Enter the PIN — it\'s to receive, not send', 'Decline and block the sender immediately', 'Accept after verifying the sender\'s name', 'Ask for their bank details first'],
        correct: 1,
        explanation: 'You NEVER need to enter a PIN to receive money. Entering your PIN in a collect request means you\'re SENDING money.',
    },
    {
        q: 'A WhatsApp group promises 3% daily returns on a crypto investment. It looks legit with "proof" screenshots. What do you do?',
        options: ['Invest a small amount to test', 'Report the group and exit immediately', 'Ask for SEBI registration certificate only', 'Share with family to maximize profits'],
        correct: 1,
        explanation: 'No investment scheme offers guaranteed daily returns. These are always scams (pig butchering / Ponzi). Report on cybercrime.gov.in.',
    },
    {
        q: 'You receive an SMS: "Your SIM will be blocked. Click here to update KYC: jio-update.net". What do you do?',
        options: ['Click the link and update KYC quickly', 'Forward to 10 friends to warn them', 'Delete the message and visit the official Jio store if needed', 'Reply STOP to unsubscribe'],
        correct: 2,
        explanation: 'Telecom KYC is never done via SMS links. Visit the official store or use the official app. Report the SMS to 1909.',
    },
    {
        q: 'A "CBI officer" video-calls you saying you are under "digital arrest" for your parcel with drugs. What do you do?',
        options: ['Cooperate and pay the fine to clear your name', 'Ask for a written warrant via email', 'Disconnect immediately — no agency has "digital arrest" powers', 'Call your lawyer before paying'],
        correct: 2,
        explanation: '"Digital arrest" does not legally exist. Any such call is a scam. Disconnect and report to the National Cyber Helpline: 1930.',
    },
];

/* ─── SUB-COMPONENTS ────────────────────────────────────── */


function QuizSection() {
    const [idx, setIdx] = useState(0);
    const [selected, setSelected] = useState(null);
    const [score, setScore] = useState(0);
    const [done, setDone] = useState(false);

    const q = QUIZ_QUESTIONS[idx];

    function handleAnswer(i) {
        if (selected !== null) return;
        setSelected(i);
        if (i === q.correct) setScore(s => s + 1);
    }

    function next() {
        if (idx < QUIZ_QUESTIONS.length - 1) {
            setIdx(i => i + 1);
            setSelected(null);
        } else {
            setDone(true);
        }
    }

    function reset() {
        setIdx(0);
        setSelected(null);
        setScore(0);
        setDone(false);
    }

    const pct = Math.round((score / QUIZ_QUESTIONS.length) * 100);

    if (done) {
        const grade = pct === 100 ? { label: 'Perfect!', color: 'var(--safe)', msg: 'Outstanding! You are well-prepared against cyber fraud.' }
            : pct >= 60 ? { label: 'Good', color: 'var(--warning)', msg: 'Decent awareness! Review the threat cards to fill the gaps.' }
            : { label: 'Needs Work', color: 'var(--danger)', msg: 'Please review the awareness guide carefully — your safety depends on it.' };

        return (
            <div style={{ textAlign: 'center', padding: '32px 24px' }}>
                <div style={{ fontSize: 56, fontFamily: 'var(--font-mono)', fontWeight: 700, color: grade.color, lineHeight: 1 }}>{pct}%</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: grade.color, marginTop: 8 }}>{grade.label}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8, maxWidth: 360, margin: '8px auto 0' }}>{grade.msg}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 12 }}>{score} / {QUIZ_QUESTIONS.length} correct</div>
                <button className="analyze-btn" style={{ maxWidth: 200, margin: '20px auto 0' }} onClick={reset}>
                    <RefreshCw size={14} /> Retake Quiz
                </button>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    Question {idx + 1} / {QUIZ_QUESTIONS.length}
                </div>
                <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--accent-light)' }}>Score: {score}</div>
            </div>

            {/* Progress bar */}
            <div style={{ height: 3, background: 'var(--border)', borderRadius: 99, marginBottom: 20, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${((idx) / QUIZ_QUESTIONS.length) * 100}%`, background: 'var(--accent)', transition: 'width 0.4s ease', borderRadius: 99 }} />
            </div>

            <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.55, marginBottom: 20 }}>
                {q.q}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {q.options.map((opt, i) => {
                    let bg = 'var(--bg-raised)';
                    let border = 'var(--border)';
                    let color = 'var(--text-secondary)';

                    if (selected !== null) {
                        if (i === q.correct) { bg = 'var(--safe-dim)'; border = 'rgba(16,185,129,0.3)'; color = 'var(--safe-light)'; }
                        else if (i === selected && i !== q.correct) { bg = 'var(--danger-dim)'; border = 'rgba(239,68,68,0.3)'; color = 'var(--danger-light)'; }
                    }

                    return (
                        <button
                            key={i}
                            onClick={() => handleAnswer(i)}
                            style={{
                                background: bg, border: `1px solid ${border}`, borderRadius: 8,
                                padding: '11px 14px', textAlign: 'left', cursor: selected !== null ? 'default' : 'pointer',
                                color, fontSize: 13, fontFamily: 'var(--font-body)', lineHeight: 1.5,
                                transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: 10,
                            }}
                        >
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, opacity: 0.5, flexShrink: 0 }}>
                                {String.fromCharCode(65 + i)}
                            </span>
                            {opt}
                        </button>
                    );
                })}
            </div>

            {/* Explanation */}
            {selected !== null && (
                <div style={{ marginTop: 16, padding: '12px 14px', background: 'var(--accent-dim)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8, fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.6, display: 'flex', gap: 10 }}>
                    <Lightbulb size={14} color="var(--accent-light)" style={{ flexShrink: 0, marginTop: 1 }} />
                    {q.explanation}
                </div>
            )}

            {selected !== null && (
                <button className="analyze-btn" style={{ marginTop: 16 }} onClick={next}>
                    {idx < QUIZ_QUESTIONS.length - 1 ? 'Next Question →' : 'See Results →'}
                </button>
            )}
        </div>
    );
}

/* ─── SMS SENDER SECTION ────────────────────────────────── */

function SenderIDSection() {
    const [activeCode, setActiveCode] = useState(null);

    const active = SMS_SENDER_CODES.find(c => c.code === activeCode);

    return (
        <div className="card" style={{ padding: '24px', marginBottom: 20 }}>
            <div className="section-title">
                <Hash size={13} /> Decode Your SMS Sender ID
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.7 }}>
                Every legitimate SMS in India uses a <strong style={{ color: 'var(--text-secondary)' }}>6-letter registered sender ID</strong> under TRAI's DLT system
                — never a 10-digit mobile number. The format is: <code style={{ background: 'var(--bg-raised)', padding: '1px 6px', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent-light)' }}>XX-YYYYY<strong>Z</strong></code>
                &nbsp;where <code style={{ background: 'var(--bg-raised)', padding: '1px 6px', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--warning)' }}>XX</code> = telecom circle prefix,
                &nbsp;<code style={{ background: 'var(--bg-raised)', padding: '1px 6px', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)' }}>YYYYY</code> = company name,
                &nbsp;<code style={{ background: 'var(--bg-raised)', padding: '1px 6px', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: 12, color: '#f472b6' }}><strong>Z</strong></code> = <strong>category code</strong>.
            </p>

            {/* Category code grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
                {SMS_SENDER_CODES.map(cat => (
                    <div
                        key={cat.code}
                        onClick={() => setActiveCode(a => a === cat.code ? null : cat.code)}
                        style={{
                            padding: '14px 16px',
                            borderRadius: 8,
                            border: `1px solid ${activeCode === cat.code ? cat.border : 'var(--border)'}`,
                            background: activeCode === cat.code ? cat.glow : 'var(--bg-raised)',
                            cursor: 'pointer',
                            transition: 'all 0.18s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                        }}
                    >
                        <div style={{
                            minWidth: 36, height: 36, borderRadius: 6, background: cat.glow,
                            border: `1px solid ${cat.border}`, display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontFamily: 'var(--font-mono)', fontWeight: 800,
                            fontSize: 18, color: cat.color, flexShrink: 0,
                        }}>
                            {cat.code}
                        </div>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>{cat.label}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Click to expand</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Expanded detail panel */}
            {active && (
                <div style={{ padding: '18px', borderRadius: 8, border: `1px solid ${active.border}`, background: active.glow, marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <span style={{
                            fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 20, color: active.color,
                            background: 'var(--bg-card)', border: `1px solid ${active.border}`,
                            width: 40, height: 40, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>{active.code}</span>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{active.label} Messages</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{active.desc}</div>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <div>
                            <div style={{ fontSize: 10.5, fontWeight: 700, color: active.color, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Real Examples</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {active.examples.map(ex => (
                                    <div key={ex} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <code style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: active.color, background: 'var(--bg-card)', padding: '2px 8px', borderRadius: 4, flexShrink: 0 }}>
                                            {ex.split(' → ')[0]}
                                        </code>
                                        <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>→ {ex.split(' → ')[1]}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--danger-light)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>🛡 Scam Red Flag</div>
                            <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.6, padding: '10px 12px', background: 'var(--danger-dim)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 6 }}>
                                {active.scamTip}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* State prefix table */}
            <div>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Common Telecom Circle Prefixes (XX-)</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                    {STATE_CODES.map(s => (
                        <div key={s.code} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: 'var(--bg-raised)', border: '1px solid var(--border-muted)', borderRadius: 6 }}>
                            <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--warning)', flexShrink: 0 }}>{s.code}</code>
                            <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{s.state}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Key rule callout */}
            <div style={{ marginTop: 16, padding: '12px 14px', background: 'var(--danger-dim)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 8, fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.6, display: 'flex', gap: 10 }}>
                <AlertTriangle size={14} color="var(--danger)" style={{ flexShrink: 0, marginTop: 1 }} />
                <span><strong style={{ color: 'var(--danger-light)' }}>Golden Rule:</strong> If a suspicious message arrives from a <strong>10-digit mobile number</strong> (like 9876543210) instead of a 6-letter sender ID — it is <strong>not</strong> from your bank, govt agency, or any registered business. Block and report immediately.</span>
            </div>
        </div>
    );
}

/* ─── MAIN PAGE ─────────────────────────────────────────── */

export default function Awareness() {
    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <div className="page-label">
                    <ShieldCheck size={11} /> Cybersecurity Awareness
                </div>
                <h1 className="page-title">
                    Stay <span className="highlight">Protected</span>
                </h1>
                <p className="page-subtitle">
                    Learn to identify, avoid, and report the most common digital frauds targeting Indian users.
                </p>
            </div>

            {/* Helpline Banner */}
            <div className="card" style={{ padding: '14px 20px', marginBottom: 20, background: 'rgba(16,185,129,0.04)', borderColor: 'rgba(16,185,129,0.18)', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--safe-dim)', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Smartphone size={16} color="var(--safe)" />
                </div>
                <div>
                    <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--safe-light)' }}>National Cyber Crime Helpline: <span style={{ fontFamily: 'var(--font-mono)' }}>1930</span></div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                        Available 24×7 · Online portal: <span style={{ color: 'var(--accent-light)' }}>cybercrime.gov.in</span> · Report within 24 hrs for best chance of money recovery
                    </div>
                </div>
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
                {[
                    { val: '₹11,000 Cr', label: 'Lost to digital fraud in India (2024)', color: 'var(--danger)' },
                    { val: '2.5 Lakh', label: 'Est. scams happening daily in India', color: 'var(--accent-light)' },
                    { val: '7.7 Lakh', label: 'Cases officially generated/reported (2024)', color: 'var(--warning)' },
                ].map(s => (
                    <div key={s.label} className="card" style={{ padding: '18px 20px', textAlign: 'center' }}>
                        <div style={{ fontSize: 28, fontFamily: 'var(--font-mono)', fontWeight: 700, color: s.color, letterSpacing: -1, lineHeight: 1 }}>{s.val}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5 }}>{s.label}</div>
                    </div>
                ))}
            </div>


            {/* SMS Sender ID Decoder */}
            <SenderIDSection />

            {/* Do's & Don'ts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div className="card" style={{ padding: '22px' }}>
                    <div className="section-title" style={{ color: 'var(--safe-light)' }}>
                        <CheckCircle size={13} color="var(--safe)" /> Must Do
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        {DOS.map(d => {
                            const Icon = d.icon;
                            return (
                                <div key={d.id} className="awareness-action-card safe-action">
                                    <Icon size={18} className="action-icon" />
                                    <div className="action-content">
                                        <div className="action-label">{d.label}</div>
                                        <div className="action-desc">{d.desc}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="card" style={{ padding: '22px' }}>
                    <div className="section-title" style={{ color: 'var(--danger-light)' }}>
                        <XCircle size={13} color="var(--danger)" /> Never Do
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        {DONTS.map(d => {
                            const Icon = d.icon;
                            return (
                                <div key={d.id} className="awareness-action-card danger-action">
                                    <Icon size={18} className="action-icon" />
                                    <div className="action-content">
                                        <div className="action-label">{d.label}</div>
                                        <div className="action-desc">{d.desc}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Quiz */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div style={{ padding: '22px 24px 0' }}>
                    <div className="section-title">
                        <BookOpen size={13} /> Awareness Quiz — Test Yourself
                    </div>
                    <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 0, lineHeight: 1.6 }}>
                        5 real-world scenarios. How prepared are you?
                    </p>
                </div>
                <QuizSection />
            </div>

            {/* Footer note */}
            <div style={{ padding: '14px 18px', background: 'var(--accent-dim)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 10, fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.7, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <Lightbulb size={14} color="var(--accent-light)" style={{ flexShrink: 0, marginTop: 2 }} />
                <span>
                    If you've already been scammed, <strong style={{ color: 'var(--accent-light)' }}>report within 24 hours</strong> to the helpline at <strong style={{ color: 'var(--accent-light)' }}>1930</strong> or file online at <strong style={{ color: 'var(--accent-light)' }}>cybercrime.gov.in</strong> — timely reporting dramatically improves the chance of recovering your money. Use RiskRadar's <strong style={{ color: 'var(--accent-light)' }}>Evidence Lab</strong> to prepare your complaint in minutes.
                </span>
            </div>
        </div>
    );
}
