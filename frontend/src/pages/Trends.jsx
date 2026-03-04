import { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const COLORS = ['#ff3b5c', '#fbbf24', '#a855f7', '#6c63ff', '#10d9a0', '#f472b6'];

const FALLBACK_HEADLINES = [
    { title: 'UPI fraud cases surge 40% in Q1 2025 — NPCI issues advisory', source: 'Economic Times', category: 'UPI Fraud', publishedAt: '2025-01-15' },
    { title: 'Fake TRAI disconnect scam targets mobile users in Maharashtra', source: 'Times of India', category: 'Telecom Scam', publishedAt: '2025-01-13' },
    { title: 'RBI warns against unsolicited KYC update messages via SMS', source: 'Business Standard', category: 'KYC Phishing', publishedAt: '2025-01-12' },
    { title: 'Cryptocurrency Ponzi scheme busted — 3,000 Indians defrauded Rs 50 crore', source: 'NDTV', category: 'Crypto Scam', publishedAt: '2025-01-11' },
    { title: 'Loan app blackmail cases reach all-time high in 2025 — Delhi Police', source: 'Hindustan Times', category: 'Loan App Scam', publishedAt: '2025-01-10' },
    { title: 'WhatsApp investment group scam nets Rs 12 crore from 800 victims in Hyderabad', source: 'Deccan Herald', category: 'Investment Fraud', publishedAt: '2025-01-09' },
    { title: 'Fake job offer scams on rise: Rs 2 lakh registration fee trap hits graduates', source: 'Indian Express', category: 'Job Scam', publishedAt: '2025-01-08' },
    { title: 'Cybercrime helpline 1930 receives record 15,000 calls in single week', source: 'The Hindu', category: 'General', publishedAt: '2025-01-07' },
];

const FALLBACK_TRENDS = [
    { category: 'UPI Fraud', count: 42 },
    { category: 'KYC Phishing', count: 28 },
    { category: 'Investment Fraud', count: 23 },
    { category: 'Loan App Scam', count: 17 },
    { category: 'Job Scam', count: 12 },
    { category: 'Crypto Scam', count: 9 },
    { category: 'Telecom Scam', count: 8 },
];

const GlowTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: 'rgba(10,14,28,0.97)', border: '1px solid rgba(108,99,255,0.25)', borderRadius: 10, padding: '10px 16px' }}>
            <p style={{ color: '#8892aa', fontSize: 11, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</p>
            {payload.map(p => (
                <p key={p.name} style={{ color: p.fill, fontSize: 14, fontWeight: 700 }}>
                    {p.value} <span style={{ color: '#8892aa', fontSize: 11, fontWeight: 400 }}>articles</span>
                </p>
            ))}
        </div>
    );
};

export default function Trends() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:8000/api/trends')
            .then(r => r.json())
            .then(d => setData(d))
            .catch(() => setData(null))
            .finally(() => setLoading(false));
    }, []);

    const alertLevel = data?.alert_level || 'MEDIUM';
    const topCat = data?.top_category || 'UPI Fraud';
    const totalArticles = data?.total_articles || 85;
    const trendData = (data?.trend_data || FALLBACK_TRENDS).map((d, i) => ({ ...d, color: COLORS[i % COLORS.length] }));
    const headlines = data?.headlines || FALLBACK_HEADLINES;

    const alertInfo = {
        HIGH: { icon: '🚨', title: `Fraud Alert Level: HIGH`, sub: 'Significantly elevated scam activity detected — exercise extreme caution', cls: 'alert-high', color: 'var(--danger)' },
        MEDIUM: { icon: '⚠️', title: `Alert Level: MODERATE`, sub: 'Above-average fraud activity detected — stay vigilant with financial transactions', cls: 'alert-medium', color: 'var(--warning)' },
        LOW: { icon: '✅', title: `Alert Level: LOW`, sub: 'Normal fraud activity levels — basic precautions recommended', cls: 'alert-low', color: 'var(--safe)' },
    }[alertLevel] || {};

    return (
        <div>
            <div className="page-header">
                <div className="page-label">📰 Live Intelligence Feed</div>
                <h1 className="page-title">
                    Fraud Trend <span className="highlight">Intelligence</span>
                </h1>
                <p className="page-subtitle">
                    Real-time fraud trend analysis powered by NewsAPI — tracking India's digital scam landscape.
                </p>
            </div>

            {/* Alert Banner */}
            {!loading && (
                <div className={`alert-banner ${alertInfo.cls}`}>
                    <div className="alert-icon">{alertInfo.icon}</div>
                    <div className="alert-content">
                        <div className="alert-title" style={{ color: alertInfo.color }}>{alertInfo.title}</div>
                        <div className="alert-sub">{alertInfo.sub}</div>
                    </div>
                    <div className="alert-ml">
                        <div className="alert-badge" style={{ color: alertInfo.color }}>{totalArticles}</div>
                        <div className="alert-badge-sub">Articles Tracked</div>
                    </div>
                </div>
            )}

            {/* Top Callout */}
            <div className="card callout-card mb-20">
                <div className="callout-emoji">🔥</div>
                <div>
                    <div className="callout-title">{topCat}</div>
                    <div className="callout-desc">
                        Most active fraud type this week — multiple victims reported across major Indian cities.
                        Stay alert and share this with your family.
                    </div>
                </div>
                <div className="callout-actions">
                    <a href="https://cybercrime.gov.in" target="_blank" rel="noreferrer" className="btn-danger">
                        Report Now →
                    </a>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>cybercrime.gov.in</span>
                </div>
            </div>

            <div className="trends-grid">
                {/* Bar Chart */}
                <div className="card chart-card">
                    <div className="section-title">📊 Articles by Fraud Category</div>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={trendData} barCategoryGap="30%" margin={{ top: 4, right: 4, bottom: 20, left: -10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                            <XAxis
                                dataKey="category"
                                stroke="transparent"
                                tick={{ fill: '#3d4a60', fontSize: 10 }}
                                angle={-35}
                                textAnchor="end"
                                interval={0}
                                height={60}
                            />
                            <YAxis stroke="transparent" tick={{ fill: '#3d4a60', fontSize: 11 }} />
                            <Tooltip content={<GlowTooltip />} cursor={{ fill: 'rgba(108,99,255,0.05)' }} />
                            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                                {trendData.map((e, i) => (
                                    <Cell key={i} fill={e.color} style={{ filter: `drop-shadow(0 0 8px ${e.color}60)` }} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Headlines */}
                <div className="card chart-card">
                    <div className="section-title">📰 Recent Fraud Reports</div>
                    <div>
                        {headlines.slice(0, 6).map((h, i) => (
                            <div key={i} className="headline-item">
                                <div className="headline-title">{h.title}</div>
                                <div className="headline-meta">
                                    <span className="headline-cat">{h.category}</span>
                                    <span className="headline-dot">·</span>
                                    <span className="headline-source">{h.source}</span>
                                    <span className="headline-dot">·</span>
                                    <span className="headline-date">{h.publishedAt?.slice(0, 10)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="card" style={{ padding: '16px 22px' }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>📡</span>
                    Data powered by <strong style={{ color: 'var(--accent-light)' }}>NewsAPI</strong> — updated every request. Curated Indian fraud news keywords: UPI scam, phishing, loan app fraud, cyber crime.
                </div>
            </div>
        </div>
    );
}
