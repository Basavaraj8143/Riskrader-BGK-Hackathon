import { useState, useEffect } from 'react';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const TREND_DATA = [
    { day: 'Mon', cases: 12, safe: 45 },
    { day: 'Tue', cases: 18, safe: 51 },
    { day: 'Wed', cases: 9, safe: 38 },
    { day: 'Thu', cases: 27, safe: 62 },
    { day: 'Fri', cases: 21, safe: 55 },
    { day: 'Sat', cases: 34, safe: 70 },
    { day: 'Sun', cases: 29, safe: 66 },
];

const PIE_DATA = [
    { name: 'UPI Fraud', value: 34, color: '#ff3b5c' },
    { name: 'Phishing', value: 22, color: '#fbbf24' },
    { name: 'Loan App', value: 15, color: '#a855f7' },
    { name: 'Investment', value: 18, color: '#6c63ff' },
    { name: 'Job Scam', value: 7, color: '#10d9a0' },
    { name: 'Other', value: 4, color: '#3d4a60' },
];

const STATS = [
    {
        icon: '🔍', value: '1,247', label: 'Messages Analyzed',
        trend: '+12%', trendType: 'danger',
        iconBg: 'rgba(108,99,255,0.12)', valueColor: 'var(--text-primary)'
    },
    {
        icon: '🚨', value: '38', label: 'High Risk Detected',
        trend: '+5 today', trendType: 'danger',
        iconBg: 'rgba(255,59,92,0.12)', valueColor: 'var(--danger)'
    },
    {
        icon: '🛡️', value: '22', label: 'Frauds Prevented',
        trend: 'Today', trendType: 'safe',
        iconBg: 'rgba(16,217,160,0.12)', valueColor: 'var(--safe)'
    },
    {
        icon: '📰', value: '156', label: 'Articles Tracked',
        trend: 'This week', trendType: 'neutral',
        iconBg: 'rgba(251,191,36,0.12)', valueColor: 'var(--text-primary)'
    },
];

const TICKER_ITEMS = [
    '🔴 ALERT: UPI QR code scam targeting college students in Pune — 40 victims reported',
    '⚠️ RBI WARNING: Fake TRAI disconnect calls surge 40% this week across metro cities',
    '🔴 BREAKING: KYC phishing SMS campaign using SBI branding — Do not click any links',
    '⚠️ ADVISORY: Fake WhatsApp investment groups promise 5% daily returns — Ponzi scheme',
    '🔴 ALERT: Loan app blackmail cases up 25% in Maharashtra — Report to 1930 immediately',
];

const GlowTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: 'rgba(10,14,28,0.97)', border: '1px solid rgba(108,99,255,0.25)', borderRadius: 10, padding: '10px 16px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
            <p style={{ color: '#8892aa', fontSize: 11, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>{label}</p>
            {payload.map(p => (
                <p key={p.name} style={{ color: p.color, fontSize: 13, fontWeight: 600, marginBottom: 2 }}>
                    {p.name}: <span style={{ color: '#f0f4ff' }}>{p.value}</span>
                </p>
            ))}
        </div>
    );
};

export default function Dashboard() {
    const [tickerIdx, setTickerIdx] = useState(0);
    useEffect(() => {
        const t = setInterval(() => setTickerIdx(i => (i + 1) % TICKER_ITEMS.length), 6000);
        return () => clearInterval(t);
    }, []);

    return (
        <div>
            <div className="page-header">
                <div className="page-label">🛡️ Real-time Fraud Intelligence</div>
                <h1 className="page-title">
                    India's Digital Fraud <span className="highlight">Command Center</span>
                </h1>
                <p className="page-subtitle">
                    Monitor, detect, and prevent financial fraud in real-time across India's digital payment ecosystem.
                </p>
            </div>

            {/* Stat Cards */}
            <div className="stat-grid">
                {STATS.map(s => (
                    <div key={s.label} className="card stat-card">
                        <div className="stat-card-top">
                            <div className="stat-icon-box" style={{ background: s.iconBg }}>{s.icon}</div>
                            <div className={`stat-trend-chip trend-${s.trendType}`}>{s.trend}</div>
                        </div>
                        <div className="stat-value" style={{ color: s.valueColor }}>{s.value}</div>
                        <div className="stat-label">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="chart-grid">
                <div className="card chart-card">
                    <div className="section-title">📈 7-Day Fraud Activity</div>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={TREND_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="day" stroke="transparent" tick={{ fill: '#3d4a60', fontSize: 11 }} />
                            <YAxis stroke="transparent" tick={{ fill: '#3d4a60', fontSize: 11 }} />
                            <Tooltip content={<GlowTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 12, color: '#8892aa', paddingTop: 12 }} />
                            <Line type="monotone" dataKey="cases" name="Fraud Cases" stroke="#ff3b5c" strokeWidth={2.5} dot={{ fill: '#ff3b5c', r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: '#ff3b5c', boxShadow: '0 0 10px #ff3b5c' }} />
                            <Line type="monotone" dataKey="safe" name="Messages Scanned" stroke="#6c63ff" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="card chart-card">
                    <div className="section-title">🎯 Scam Category Split</div>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={58} outerRadius={88} paddingAngle={3} dataKey="value" strokeWidth={0}>
                                {PIE_DATA.map((e, i) => (
                                    <Cell key={i} fill={e.color} style={{ filter: `drop-shadow(0 0 6px ${e.color}60)` }} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(v, n) => [`${v}%`, n]}
                                contentStyle={{ background: 'rgba(10,14,28,0.97)', border: '1px solid rgba(108,99,255,0.25)', borderRadius: 10, fontSize: 12 }}
                                labelStyle={{ color: '#8892aa' }}
                                itemStyle={{ color: '#f0f4ff' }}
                            />
                            <Legend wrapperStyle={{ fontSize: 11, color: '#8892aa' }} iconSize={8} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Live Ticker */}
            <div className="ticker-wrap">
                <span className="ticker-label">🔴 LIVE</span>
                <span className="ticker-content">{TICKER_ITEMS[tickerIdx]}</span>
            </div>
        </div>
    );
}
