import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  ScanLine, FlaskConical, BookOpen, Info,
  ShieldAlert, Clock, ShieldCheck, MessageCircle, X, Puzzle, Menu
} from 'lucide-react';
import Analyzer from './pages/Analyzer';
import Evidence from './pages/Evidence';
import Encyclopedia from './pages/Encyclopedia';
import About from './pages/About';
import Awareness from './pages/Awareness';
import Extension from './pages/Extension';
import ChatAssistant from './components/ChatAssistant';

const NAV_ITEMS = [
  { path: '/', icon: Puzzle, label: 'Chrome Extension' },
  { path: '/analyzer', icon: ScanLine, label: 'Analyzer' },
  { path: '/evidence', icon: FlaskConical, label: 'Evidence Lab' },
  { path: '/encyclopedia', icon: BookOpen, label: 'Research Lab' },
  { path: '/awareness', icon: ShieldCheck, label: 'Awareness' },
  { path: '/about', icon: Info, label: 'About' },
];

const PAGE_META = {
  '/': { title: 'Chrome Extension', sub: 'Integration' },
  '/analyzer': { title: 'Analyzer', sub: 'Message Intelligence' },
  '/evidence': { title: 'Evidence Lab', sub: 'Complaint Generator' },
  '/encyclopedia': { title: 'Research Lab', sub: 'Fraud Research' },
  '/awareness': { title: 'Awareness', sub: 'Cybersecurity Guide' },
  '/about': { title: 'About', sub: 'RiskRadar' },
};

function Topbar({ onToggleSidebar }) {
  const { pathname } = useLocation();
  const [time, setTime] = useState(new Date());
  const meta = PAGE_META[pathname] || { title: 'RiskRadar', sub: '' };

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="topbar">
      <div className="topbar-left">
        <button 
          onClick={onToggleSidebar} 
          className="mobile-menu-btn" 
          aria-label="Toggle Navigation Sidebar"
        >
          <Menu size={18} />
        </button>
        <div>
          <div className="topbar-breadcrumb">RiskRadar / {meta.sub}</div>
          <div className="topbar-title">{meta.title}</div>
        </div>
      </div>
      <div className="topbar-right">
        <div className="topbar-chip">
          <span className="live-dot" />
          LIVE
        </div>
        <div className="topbar-chip">
          <Clock size={11} style={{ opacity: 0.6 }} />
          {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} IST
        </div>
      </div>
    </div>
  );
}

function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}
      <nav className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-logo">
            <div className="brand-icon-wrap">
              <div className="brand-icon">
                <ShieldAlert size={18} color="var(--accent-light)" />
              </div>
            </div>
            <div className="brand-text">
              <div className="brand-name">RiskRadar</div>
              <div className="brand-tagline">Fraud Intelligence</div>
            </div>
          </div>
          <button className="mobile-close-btn" onClick={onClose} aria-label="Close Sidebar">
            <X size={16} />
          </button>
        </div>

        <div className="sidebar-nav">
          <div className="nav-section-label">Navigation</div>
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <span className="nav-icon">
                  <Icon size={15} />
                </span>
                {item.label}
              </NavLink>
            );
          })}
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
    </>
  );
}

export default function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className={`app-shell ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="main-content">
          <Topbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
          <div className="page-content">
            <Routes>
              <Route path="/" element={<Extension />} />
              <Route path="/analyzer" element={<Analyzer />} />
              <Route path="/evidence" element={<Evidence />} />
              <Route path="/encyclopedia" element={<Encyclopedia />} />
              <Route path="/awareness" element={<Awareness />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </div>
        </div>

        {/* Global Floating Chat Button */}
        <button 
          className={`floating-chat-btn ${isChatOpen ? 'hide-pulse' : ''}`} 
          aria-label="Open AI Assistant"
          onClick={() => setIsChatOpen(!isChatOpen)}
        >
          {isChatOpen ? <X size={24} /> : <MessageCircle size={24} />}
        </button>

        <ChatAssistant isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      </div>
    </BrowserRouter>
  );
}
