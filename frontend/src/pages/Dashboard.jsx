import { useState, useEffect, useRef } from 'react';
import {
    TrendingUp, AlertTriangle, ShieldCheck, Newspaper,
    BarChart2, Radio, ExternalLink, AlertCircle, CheckCircle
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell
} from 'recharts';

const COLORS = ['#ef4444', '#f59e0b', '#a855f7', '#6c63ff', '#10b981', '#f472b6', '#60a5fa'];

// ── Count-up hook ─────────────────────────────────────────────────
function useCountUp(target, duration = 1200) {
    const [value, setValue] = useState(0);
    useEffect(() => {
        if (!target) return;
        const numeric = parseInt(String(target).replace(/,/g, ''), 10);
        if (isNaN(numeric)) { setValue(target); return; }
        const steps = 40;
        const interval = duration / steps;
        let step = 0;
        const timer = setInterval(() => {
            step++;
            setValue(Math.round((numeric * step) / steps));
            if (step >= steps) clearInterval(timer);
        }, interval);
        return () => clearInterval(timer);
    }, [target, duration]);
    return typeof value === 'number' ? value.toLocaleString('en-IN') : value;
}

// ── Stat Card ─────────────────────────────────────────────────────
function StatCard({ Icon, rawValue, label, trend, trendType, iconBg, valueColor, iconColor }) {
    const animated = useCountUp(rawValue);
    return (
        <div className="card stat-card">
            <div className="stat-card-top">
                <div className="stat-icon-box" style={{ background: iconBg }}>
                    <Icon size={16} color={iconColor} />
                </div>
                <div className={`stat-trend-chip trend-${trendType}`}>{trend}</div>
            </div>
            <div className="stat-value" style={{ color: valueColor }}>{animated}</div>
            <div className="stat-label">{label}</div>
        </div>
    );
}

// ── Custom tooltip ────────────────────────────────────────────────
const GlowTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: 'rgba(10,14,28,0.97)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8, padding: '10px 16px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 11, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</p>
            {payload.map(p => (
                <p key={p.name} style={{ color: p.fill, fontSize: 14, fontWeight: 700 }}>
                    {p.value} <span style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 400 }}>articles</span>
                </p>
            ))}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
    const [trends, setTrends] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tickerIdx, setTickerIdx] = useState(0);
    const [tickerAnim, setTickerAnim] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch('http://localhost:8000/api/trends').then(r => r.json()).catch(() => null),
            fetch('http://localhost:8000/api/stats').then(r => r.json()).catch(() => null),
        ]).then(([t, s]) => {
            setTrends(t);
            setStats(s);
            setLoading(false);
        });
    }, []);

    // Ticker — animate between real headlines
    const headlines = trends?.headlines || [];
    useEffect(() => {
        if (!headlines.length) return;
        const t = setInterval(() => {
            setTickerAnim(false);
            setTimeout(() => {
                setTickerIdx(i => (i + 1) % headlines.length);
                setTickerAnim(true);
            }, 300);
        }, 6000);
        return () => clearInterval(t);
    }, [headlines.length]);

    // Derive data
    const alertLevel = trends?.alert_level || 'MEDIUM';
    const topCat = trends?.top_category || '—';
    const catCounts = trends?.category_counts || {};
    const chartData = Object.entries(catCounts)
        .map(([cat, count], i) => ({ category: cat, count, color: COLORS[i % COLORS.length] }))
        .sort((a, b) => b.count - a.count);

    const alertInfo = {
        HIGH:   { title: 'Fraud Alert: HIGH',   sub: 'Elevated scam activity — exercise extreme caution', Icon: AlertTriangle, color: 'var(--danger)',  cls: 'alert-high' },
        MEDIUM: { title: 'Alert Level: Moderate', sub: 'Above-average fraud activity — stay vigilant',      Icon: AlertCircle,   color: 'var(--warning)', cls: 'alert-medium' },
        LOW:    { title: 'Alert Level: Low',      sub: 'Normal activity — basic precautions recommended',   Icon: CheckCircle,   color: 'var(--safe)',    cls: 'alert-low' },
    }[alertLevel] || {};
    const AlertIcon = alertInfo.Icon || AlertCircle;

    const STAT_CARDS = [
        { Icon: TrendingUp,  rawValue: stats?.total_analyzed,        label: 'Messages Analyzed',  trend: 'All time',     trendType: 'neutral', iconBg: 'rgba(108,99,255,0.12)', valueColor: 'var(--text-primary)', iconColor: '#818cf8' },
        { Icon: AlertTriangle, rawValue: stats?.high_risk_today,     label: 'High Risk Detected', trend: 'Today',        trendType: 'danger',  iconBg: 'rgba(239,68,68,0.12)',  valueColor: 'var(--danger)',       iconColor: '#ef4444' },
        { Icon: ShieldCheck, rawValue: stats?.fraud_prevented_today, label: 'Frauds Prevented',   trend: 'Today',        trendType: 'safe',    iconBg: 'rgba(16,185,129,0.12)', valueColor: 'var(--safe)',         iconColor: '#10b981' },
        { Icon: Newspaper,   rawValue: trends?.total_articles,       label: 'Articles Tracked',   trend: 'Last 7 days',  trendType: 'neutral', iconBg: 'rgba(251,191,36,0.12)', valueColor: 'var(--text-primary)', iconColor: '#fbbf24' },
    ];

    return (
        <div>
            <div className="page-header">
                <div className="page-label">
                    <Radio size={11} /> Real-time Fraud Intelligence
                </div>
                <h1 className="page-title">
                    India's Digital Fraud <span className="highlight">Command Center</span>
                </h1>
                <p className="page-subtitle">
                    Live fraud intelligence powered by NewsAPI — tracking India's digital scam landscape in real time.
                </p>
            </div>



            {/* ── Stat Cards ── */}
            <div className="stat-grid">
                {STAT_CARDS.map(s => <StatCard key={s.label} {...s} />)}
            </div>

            {/* ── Charts + Headlines ── */}
            <div className="chart-grid">
                {/* Real category bar chart from NewsAPI */}
                <div className="card chart-card">
                    <div className="section-title">
                        <BarChart2 size={13} /> Scam Reports by Category
                        <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-muted)', fontWeight: 400 }}>
                            India · NCRB 2024 data
                        </span>
                    </div>
                    {loading ? (
                        <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                            Fetching live data...
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={chartData} layout="vertical" barCategoryGap="25%" margin={{ top: 4, right: 20, bottom: 4, left: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                                <XAxis type="number" stroke="transparent" tick={{ fill: '#475569', fontSize: 10 }} />
                                <YAxis type="category" dataKey="category" stroke="transparent" tick={{ fill: '#94a3b8', fontSize: 10 }} width={110} />
                                <Tooltip content={<GlowTooltip />} cursor={{ fill: 'rgba(59,130,246,0.05)' }} />
                                <Bar dataKey="count" radius={[0, 5, 5, 0]}>
                                    {chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Real headlines feed */}
                <div className="card chart-card">
                    <div className="section-title">
                        <Newspaper size={13} /> Recent Fraud Reports
                        <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-muted)', fontWeight: 400 }}>
                            Live · NewsAPI
                        </span>
                    </div>
                    {loading ? (
                        <div style={{ color: 'var(--text-muted)', fontSize: 12, padding: '40px 0', textAlign: 'center' }}>Loading headlines...</div>
                    ) : (
                        <div>
                            {headlines.slice(0, 6).map((h, i) => (
                                <div key={i} className="headline-item">
                                    <div className="headline-title">
                                        {h.url && h.url !== '#' ? (
                                            <a href={h.url} target="_blank" rel="noopener noreferrer"
                                                style={{ color: 'inherit', textDecoration: 'none' }}
                                                onMouseOver={e => e.currentTarget.style.color = 'var(--accent-light)'}
                                                onMouseOut={e => e.currentTarget.style.color = 'inherit'}
                                            >
                                                {h.title}
                                            </a>
                                        ) : h.title}
                                    </div>
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
                    )}
                </div>
            </div>

            {/* ── Data source footer ── */}
            <div className="card" style={{ padding: '12px 18px', marginTop: 4 }}>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Radio size={11} style={{ flexShrink: 0 }} />
                    Powered by <strong style={{ color: 'var(--accent-light)', margin: '0 4px' }}>NewsAPI</strong>
                    · cached 30 min · no repeated key calls ·
                    <a href="https://cybercrime.gov.in" target="_blank" rel="noreferrer"
                        style={{ color: 'var(--accent-light)', marginLeft: 4, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                        Report fraud <ExternalLink size={10} style={{ display: 'inline' }} />
                    </a>
                </div>
            </div>
        </div>
    );
}
