import {
    Zap, Layers, Bot, FileText, BarChart2, Palette,
    Search, Newspaper, BookOpen, Shield, Trophy, Info
} from 'lucide-react';

const TECH_STACK = [
    { Icon: Zap, name: 'FastAPI', desc: 'Python backend' },
    { Icon: Layers, name: 'React + Vite', desc: 'Frontend SPA' },
    { Icon: Bot, name: 'Gemini AI', desc: 'Explanations' },
    { Icon: Newspaper, name: 'NewsAPI', desc: 'Trend data' },
    { Icon: BarChart2, name: 'Recharts', desc: 'Visualizations' },
    { Icon: Palette, name: 'Custom CSS', desc: 'Design system' },
];

const FEATURES = [
    { Icon: Search, text: 'Real-time message analysis with rule-based NLP + 50+ Indian fraud patterns' },
    { Icon: Bot, text: 'Gemini AI-powered human-readable explanations for every detected threat' },
    { Icon: BarChart2, text: 'Risk scoring engine: 0–100 score with HIGH / MEDIUM / LOW classification' },
    { Icon: Newspaper, text: 'Live fraud trend tracking via NewsAPI with 7 keyword categories' },
    { Icon: BookOpen, text: 'Encyclopedia of 8 major Indian digital fraud types with red flags' },
    { Icon: Shield, text: 'Actionable prevention advice with official reporting channel links' },
];

export default function About() {
    return (
        <div>
            <div className="page-header">
                <div className="page-label">
                    <Info size={11} /> Project Overview
                </div>
                <h1 className="page-title">
                    About <span className="highlight">RiskRadar</span>
                </h1>
            </div>

            {/* Hero card */}
            <div className="card about-hero mb-20" style={{ marginBottom: 20 }}>
                <div className="hero-badge">
                    <Shield size={12} /> Hackathon Prototype
                </div>
                <div className="about-title">Fighting Fraud<br />with Intelligence</div>
                <p className="about-sub">
                    RiskRadar is a real-time fraud intelligence dashboard built to protect India's 500M+ digital payment users
                    from UPI scams, phishing attacks, fake loan apps, and investment frauds.
                </p>
            </div>

            {/* Stats */}
            <div className="stats-highlight-row mb-20" style={{ marginBottom: 20 }}>
                <div className="card stat-highlight-card">
                    <div className="stat-highlight-num" style={{ color: 'var(--danger)' }}>50+</div>
                    <div className="stat-highlight-label">Fraud Patterns<br />in Detection Engine</div>
                </div>
                <div className="card stat-highlight-card">
                    <div className="stat-highlight-num" style={{ color: 'var(--accent-light)' }}>13</div>
                    <div className="stat-highlight-label">Scam Categories<br />Covered</div>
                </div>
                <div className="card stat-highlight-card">
                    <div className="stat-highlight-num" style={{ color: 'var(--safe)' }}>100ms</div>
                    <div className="stat-highlight-label">Average Analysis<br />Response Time</div>
                </div>
            </div>

            {/* Features */}
            <div className="card" style={{ padding: '24px', marginBottom: 20 }}>
                <div className="section-title">
                    <Layers size={13} /> Core Features
                </div>
                <div className="features-grid">
                    {FEATURES.map(f => {
                        const Icon = f.Icon;
                        return (
                            <div key={f.text} className="feature-item">
                                <div className="feature-icon">
                                    <Icon size={14} color="var(--accent-light)" />
                                </div>
                                <div className="feature-text">{f.text}</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Problem stat */}
            <div className="card" style={{ padding: '24px', marginBottom: 20, background: 'rgba(239,68,68,0.04)', borderColor: 'rgba(239,68,68,0.12)' }}>
                <div className="section-title" style={{ color: 'var(--danger)' }}>
                    <Shield size={13} /> The Problem We're Solving
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    {[
                        { stat: '₹11,000 Cr', label: 'Lost to digital fraud in India (2024)', color: 'var(--danger)' },
                        { stat: '7.7 Lakh', label: 'Cyber crime cases reported annually', color: 'var(--warning)' },
                        { stat: '85%', label: 'Victims had no idea they were being scammed', color: 'var(--accent-light)' },
                    ].map(item => (
                        <div key={item.label} style={{ textAlign: 'center', padding: '16px 8px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid var(--border-muted)' }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 26, fontWeight: 700, color: item.color, letterSpacing: -1, marginBottom: 6 }}>{item.stat}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tech stack */}
            <div className="card" style={{ padding: '24px' }}>
                <div className="section-title">
                    <Layers size={13} /> Tech Stack
                </div>
                <div className="tech-grid">
                    {TECH_STACK.map(t => {
                        const Icon = t.Icon;
                        return (
                            <div key={t.name} className="tech-item">
                                <div className="tech-emoji">
                                    <Icon size={18} color="var(--accent-light)" />
                                </div>
                                <div>
                                    <div className="tech-name">{t.name}</div>
                                    <div className="tech-desc">{t.desc}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div style={{ marginTop: 20, padding: '12px 16px', background: 'var(--accent-dim)', borderRadius: 8, border: '1px solid rgba(59,130,246,0.15)', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <Trophy size={14} color="var(--accent-light)" style={{ flexShrink: 0, marginTop: 2 }} />
                    Built for hackathon demonstrating real-world impact potential. Architecture supports scaling to production with authentication, database persistence, and live ML model integration.
                </div>
            </div>
        </div>
    );
}
