import { useState } from 'react';
import {
    Shield, ScanLine, AlertTriangle, TrendingUp,
    Briefcase, FlaskConical, CheckCircle, Info
} from 'lucide-react';

const SAMPLES = [
    { label: 'KYC Scam', Icon: Shield, msg: 'Dear Customer, your SBI KYC verification has expired. Click here bit.ly/sbifake to update immediately or your account will be blocked within 24 hours!' },
    { label: 'UPI Fraud', Icon: TrendingUp, msg: 'Congratulations! Scan this QR code and pay Rs 1 to receive Rs 50,000 cashback from BHIM. Offer expires today at midnight!' },
    { label: 'TRAI Scam', Icon: AlertTriangle, msg: 'TRAI has received a complaint from your mobile number for illegal activity. Your number will be disconnected in 2 hours. Press 9 to speak to the cyber officer.' },
    { label: 'Ponzi', Icon: TrendingUp, msg: 'Join our exclusive WhatsApp investment group! Guaranteed 5% daily returns. Over 10,000 members already earning daily. Invest Rs 5000, get Rs 50000 in 30 days!' },
    { label: 'Job Scam', Icon: Briefcase, msg: 'Work from home opportunity! Earn Rs 800 per hour doing simple tasks. No experience required. Pay Rs 500 registration fee to start earning immediately!' },
];

function RiskGauge({ score }) {
    const color = score >= 70 ? '#ef4444' : score >= 40 ? '#f59e0b' : '#10b981';
    const label = score >= 70 ? 'HIGH RISK' : score >= 40 ? 'MEDIUM RISK' : 'LOW RISK';
    const blockClass = score >= 70 ? 'risk-block-high' : score >= 40 ? 'risk-block-medium' : 'risk-block-low';

    return (
        <div className={`risk-score-block ${blockClass}`}>
            <div className="risk-score-num" style={{ color }}>{score}</div>
            <div className="risk-score-right">
                <div className="risk-score-label">Risk Score</div>
                <div className="risk-level-text" style={{ color }}>{label}</div>
                <div className="risk-score-sub">out of 100 — {score < 30 ? 'Message appears safe' : score < 60 ? 'Exercise caution' : 'Do not engage!'}</div>
            </div>
            <div style={{ marginLeft: 'auto', alignSelf: 'center', minWidth: 80 }}>
                <svg width="80" height="80" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="32" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="none" />
                    <circle
                        cx="40" cy="40" r="32"
                        stroke={color}
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 32}`}
                        strokeDashoffset={`${2 * Math.PI * 32 * (1 - score / 100)}`}
                        transform="rotate(-90 40 40)"
                        style={{ transition: 'stroke-dashoffset 1s ease' }}
                    />
                    <text x="40" y="46" textAnchor="middle" fill={color} fontSize="16" fontWeight="900" fontFamily="Inter">{score}%</text>
                </svg>
            </div>
        </div>
    );
}

export default function Analyzer() {
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const analyze = async () => {
        if (!msg.trim()) return;
        setLoading(true); setError(null); setResult(null);
        try {
            const r = await fetch('http://localhost:8000/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: msg }),
            });
            if (!r.ok) throw new Error(`Server error ${r.status}`);
            setResult(await r.json());
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="page-header">
                <div className="page-label">
                    <ScanLine size={11} /> AI-Powered Detection
                </div>
                <h1 className="page-title">
                    Suspicious Message <span className="highlight">Analyzer</span>
                </h1>
                <p className="page-subtitle">
                    Paste any SMS, WhatsApp, or email message. Our AI engine analyzes fraud patterns in milliseconds.
                </p>
            </div>

            <div className="analyzer-layout">
                {/* Input */}
                <div className="card analyzer-input-card">
                    <div className="input-label">Paste Message Here</div>
                    <textarea
                        className="message-textarea"
                        placeholder={`Try pasting a suspicious message...\n\nExamples:\n• "Your SBI KYC expired. Click link..."\n• "Congratulations! You won Rs 50,000..."\n• "TRAI will disconnect your SIM..."`}
                        value={msg}
                        onChange={e => setMsg(e.target.value)}
                        rows={9}
                    />

                    {error && <div className="error-box mt-8"><AlertTriangle size={12} style={{ display: 'inline', marginRight: 6 }} />{error} — Is the backend running on port 8000?</div>}

                    <div className="analyze-btn-wrap mt-16">
                        <button className="analyze-btn" onClick={analyze} disabled={loading || !msg.trim()}>
                            {loading ? (<><span className="spinner" /> Analyzing with AI...</>) : (<><Shield size={14} /> Analyze Now</>)}
                        </button>
                    </div>

                    <div className="samples-wrap">
                        <div className="samples-label">Try Sample Messages</div>
                        <div className="sample-chips">
                            {SAMPLES.map(s => (
                                <button key={s.label} className="sample-chip" onClick={() => setMsg(s.msg)}>
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginTop: 18, padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid var(--border)', fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.6, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <Info size={13} style={{ flexShrink: 0, marginTop: 1 }} />
                        Your message is analyzed locally and never stored or shared. Powered by FinGuard Rule Engine + Gemini AI.
                    </div>
                </div>

                {/* Result */}
                <div className="card result-card">
                    {!result ? (
                        <div className="result-empty">
                            <div className="result-empty-icon">
                                <Shield size={32} color="var(--accent-light)" />
                            </div>
                            <div className="result-empty-title">Awaiting Analysis</div>
                            <p className="result-empty-sub">Paste a suspicious message and hit Analyze Now to see the AI-powered risk assessment.</p>
                        </div>
                    ) : (
                        <div>
                            <RiskGauge score={result.score} />

                            {/* ML Model Badge */}
                            {result.ml_available && (
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 10, marginTop: 14,
                                    padding: '9px 14px', borderRadius: 8,
                                    background: result.ml_verdict === 'FRAUD' ? 'rgba(239,68,68,0.07)' : 'rgba(16,185,129,0.07)',
                                    border: `1px solid ${result.ml_verdict === 'FRAUD' ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`,
                                }}>
                                    <FlaskConical size={17} color={result.ml_verdict === 'FRAUD' ? '#ef4444' : '#10b981'} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: result.ml_verdict === 'FRAUD' ? '#ef4444' : '#10b981', textTransform: 'uppercase' }}>
                                            ML Model · {result.ml_verdict}
                                        </div>
                                        <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
                                            {result.ml_confidence} confident · TF-IDF + Logistic Regression
                                        </div>
                                    </div>
                                    <div style={{ fontSize: 20, fontWeight: 900, color: result.ml_verdict === 'FRAUD' ? '#ef4444' : '#10b981', minWidth: 52, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                                        {result.ml_confidence}
                                    </div>
                                </div>
                            )}

                            <div className="category-row mt-16">
                                <div className="category-badge">{result.category}</div>
                            </div>

                            {result.matched_patterns?.length > 0 && (
                                <div className="pattern-chips">
                                    {result.matched_patterns.map(p => (
                                        <span key={p} className="pattern-chip">
                                            <AlertTriangle size={9} style={{ display: 'inline', marginRight: 3 }} />{p}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="explanation-block">
                                <div className="explanation-badge">
                                    {result.powered_by?.includes('Gemini') ? 'Cloud AI (Gemini)' :
                                        result.powered_by?.includes('DeepSeek') || result.powered_by?.includes('Ollama') ? 'Local AI (DeepSeek)' :
                                            'Rule Engine Fallback'}
                                    <span style={{ marginLeft: '12px', fontSize: 10, opacity: 0.6, fontStyle: 'normal', fontWeight: 'normal', textTransform: 'none' }}>
                                        Source: {result.powered_by}
                                    </span>
                                </div>
                                <div className="explanation-text">"{result.explanation}"</div>
                            </div>

                            {result.prevention_tips?.length > 0 && (
                                <>
                                    <div className="section-title mb-8">
                                        <Shield size={12} /> Prevention Advice
                                    </div>
                                    <ul className="tips-list">
                                        {result.prevention_tips.map((tip, i) => (
                                            <li key={i}><span className="tip-check"><CheckCircle size={12} /></span>{tip}</li>
                                        ))}
                                    </ul>
                                </>
                            )}

                            <div className="report-cta">
                                Report to National Cyber Crime Helpline: <strong style={{ color: 'var(--danger-light)', marginLeft: 4 }}>1930</strong>
                                <span style={{ marginLeft: 6 }}>· cybercrime.gov.in</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
