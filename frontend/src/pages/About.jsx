const TECH_STACK = [
    { emoji: '⚡', name: 'FastAPI', desc: 'Python backend' },
    { emoji: '⚛️', name: 'React + Vite', desc: 'Frontend SPA' },
    { emoji: '🤖', name: 'Gemini AI', desc: 'Explanations' },
    { emoji: '📰', name: 'NewsAPI', desc: 'Trend data' },
    { emoji: '📊', name: 'Recharts', desc: 'Visualizations' },
    { emoji: '🎨', name: 'Custom CSS', desc: 'Design system' },
];

const FEATURES = [
    { icon: '🔍', text: 'Real-time message analysis with rule-based NLP + 50+ Indian fraud patterns' },
    { icon: '🤖', text: 'Gemini AI-powered human-readable explanations for every detected threat' },
    { icon: '📊', text: 'Risk scoring engine: 0–100 score with HIGH / MEDIUM / LOW classification' },
    { icon: '📰', text: 'Live fraud trend tracking via NewsAPI with 7 keyword categories' },
    { icon: '📚', text: 'Encyclopedia of 8 major Indian digital fraud types with red flags' },
    { icon: '🛡️', text: 'Actionable prevention advice with official reporting channel links' },
];

export default function About() {
    return (
        <div>
            <div className="page-header">
                <div className="page-label">ℹ️ Project Overview</div>
                <h1 className="page-title">
                    About <span className="highlight">FinGuard AI</span>
                </h1>
            </div>

            {/* Hero card */}
            <div className="card about-hero mb-20" style={{ marginBottom: 20 }}>
                <div className="hero-badge">🛡️ Hackathon Prototype</div>
                <div className="about-title">Fighting Fraud<br />with Intelligence</div>
                <p className="about-sub">
                    FinGuard AI is a real-time fraud intelligence dashboard built to protect India's 500M+ digital payment users
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
                <div className="section-title">✨ Core Features</div>
                <div className="features-grid">
                    {FEATURES.map(f => (
                        <div key={f.text} className="feature-item">
                            <div className="feature-icon">{f.icon}</div>
                            <div className="feature-text">{f.text}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Problem stat */}
            <div className="card" style={{ padding: '24px', marginBottom: 20, background: 'rgba(255,59,92,0.04)', borderColor: 'rgba(255,59,92,0.15)' }}>
                <div className="section-title" style={{ color: 'var(--danger)' }}>🚨 The Problem We're Solving</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    {[
                        { stat: '₹11,000 Cr', label: 'Lost to digital fraud in India (2024)', color: 'var(--danger)' },
                        { stat: '7.7 Lakh', label: 'Cyber crime cases reported annually', color: 'var(--warning)' },
                        { stat: '85%', label: 'Victims had no idea they were being scammed', color: 'var(--accent-light)' },
                    ].map(item => (
                        <div key={item.label} style={{ textAlign: 'center', padding: '16px 8px', background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ fontFamily: 'Outfit', fontSize: 26, fontWeight: 900, color: item.color, letterSpacing: -1, marginBottom: 6 }}>{item.stat}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tech stack */}
            <div className="card" style={{ padding: '24px' }}>
                <div className="section-title">🧰 Tech Stack</div>
                <div className="tech-grid">
                    {TECH_STACK.map(t => (
                        <div key={t.name} className="tech-item">
                            <div className="tech-emoji">{t.emoji}</div>
                            <div>
                                <div className="tech-name">{t.name}</div>
                                <div className="tech-desc">{t.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: 20, padding: '12px 16px', background: 'rgba(108,99,255,0.06)', borderRadius: 10, border: '1px solid rgba(108,99,255,0.15)', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                    🏆 Built for hackathon demonstrating real-world impact potential. Architecture supports scaling to production with authentication, database persistence, and live ML model integration.
                </div>
            </div>
        </div>
    );
}
