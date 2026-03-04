import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import Analyzer from './pages/Analyzer';
import Evidence from './pages/Evidence';
import Encyclopedia from './pages/Encyclopedia';
import About from './pages/About';

const NAV_ITEMS = [
  { path: '/', icon: '▦', label: 'Dashboard', emoji: '📊' },
  { path: '/analyzer', icon: '⬡', label: 'Analyzer', emoji: '🔍' },
  { path: '/evidence', icon: '🧾', label: 'Evidence Lab', emoji: '🧾' },
  { path: '/encyclopedia', icon: '≡', label: 'Research Lab', emoji: '📚' },
  { path: '/about', icon: '◎', label: 'About', emoji: 'ℹ️' },
];

const PAGE_META = {
  '/': { title: 'Dashboard', sub: 'Overview' },
  '/analyzer': { title: 'Analyzer', sub: 'Message Intelligence' },
  '/evidence': { title: 'Evidence Lab', sub: 'Complaint Generator' },
  '/encyclopedia': { title: 'Research Lab', sub: 'Fraud Research' },
  '/about': { title: 'About', sub: 'FinGuard AI' },
};

function Topbar() {
  const { pathname } = useLocation();
  const [time, setTime] = useState(new Date());
  const meta = PAGE_META[pathname] || { title: 'FinGuard AI', sub: '' };

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="topbar">
      <div className="topbar-left">
        <div>
          <div className="topbar-breadcrumb">FinGuard AI / {meta.sub}</div>
          <div className="topbar-title">{meta.title}</div>
        </div>
      </div>
      <div className="topbar-right">
        <div className="topbar-chip">
          <span className="live-dot" />
          LIVE
        </div>
        <div className="topbar-chip">
          🇮🇳 {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} IST
        </div>
      </div>
    </div>
  );
}

function Sidebar() {
  return (
    <nav className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-logo">
          <div className="brand-icon-wrap">
            <div className="brand-icon">🛡️</div>
            <div className="brand-icon-ring" />
          </div>
          <div className="brand-text">
            <div className="brand-name">FinGuard AI</div>
            <div className="brand-tagline">Fraud Intelligence</div>
          </div>
        </div>
      </div>

      <div className="sidebar-divider" />

      <div className="sidebar-nav">
        <div className="nav-section-label">Navigation</div>
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.emoji}</span>
            {item.label}
          </NavLink>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="threat-indicator">
          <div className="threat-dot-wrap">
            <div className="threat-dot" />
            <div className="threat-dot-ring" />
          </div>
          <div className="threat-text">
            Threat Level: <span className="threat-level">HIGH</span>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Sidebar />
        <div className="main-content">
          <Topbar />
          <div className="page-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/analyzer" element={<Analyzer />} />
              <Route path="/evidence" element={<Evidence />} />
              <Route path="/encyclopedia" element={<Encyclopedia />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}
