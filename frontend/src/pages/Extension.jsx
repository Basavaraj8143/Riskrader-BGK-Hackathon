import React, { useState } from 'react';
import {
  Puzzle, Download, Chrome, Key, Shield,
  AlertTriangle, CheckCircle2, MessageSquare, ExternalLink,
  Laptop, Cpu, Settings
} from 'lucide-react';

export default function Extension() {
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  const handleDownload = () => {
    setDownloading(true);
    setDownloadError('');
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      window.location.href = `${apiBase}/api/download-extension`;
    } catch (err) {
      setDownloadError('Could not connect to the RiskRadar API. Please ensure the backend is running.');
    } finally {
      setTimeout(() => setDownloading(false), 1500);
    }
  };

  const STEPS = [
    {
      num: '1',
      title: 'Download the Extension',
      desc: 'Click the download button above to retrieve the pre-packaged chrome extension ZIP containing all required manifests, contents, and styles.',
      icon: Download
    },
    {
      num: '2',
      title: 'Extract the Archive',
      desc: 'Locate the downloaded riskradar-extension.zip on your machine and extract its contents to a permanent local directory.',
      icon: Laptop
    },
    {
      num: '3',
      title: 'Open Extension Manager',
      desc: 'Open Google Chrome (or any Chromium-based browser) and navigate to chrome://extensions/ in the address bar.',
      icon: Chrome
    },
    {
      num: '4',
      title: 'Enable Developer Mode',
      desc: 'Locate the "Developer mode" toggle switch in the top-right corner of the Extensions manager page and turn it ON.',
      icon: Settings
    },
    {
      num: '5',
      title: 'Load Unpacked Extension',
      desc: 'Click the "Load unpacked" button in the top-left corner, and select the extracted extension folder to install.',
      icon: Puzzle
    }
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-label">
          <Puzzle size={11} /> Browser Integrations
        </div>
        <h1 className="page-title">
          Chrome <span className="highlight">Extension</span> Shield
        </h1>
      </div>

      {/* Overview Hero Card */}
      <div className="card about-hero mb-20" style={{ marginBottom: 20 }}>
        <div className="hero-badge" style={{ background: 'rgba(76,175,80,0.15)', color: '#4CAF50', borderColor: 'rgba(76,175,80,0.3)' }}>
          <Shield size={12} /> WhatsApp Web Protection
        </div>
        <div className="about-title">Zero-Copy WhatsApp Interception</div>
        <p className="about-sub">
          Combine your dashboard analytics directly with WhatsApp Web. Install our companion Chrome Extension to scan incoming messages, check indicators, and generate reports on-the-fly without copy-pasting anything.
        </p>

        <div style={{ marginTop: 24 }}>
          <button 
            className="btn btn-primary" 
            onClick={handleDownload} 
            disabled={downloading}
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 8, 
              padding: '12px 24px', 
              fontSize: '14px',
              cursor: 'pointer' 
            }}
          >
            <Download size={16} />
            {downloading ? 'Packaging ZIP...' : 'Download Extension ZIP'}
          </button>
          {downloadError && (
            <div style={{ color: 'var(--danger)', fontSize: 13, marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertTriangle size={14} />
              {downloadError}
            </div>
          )}
        </div>
      </div>

      {/* Feature Capabilities Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div className="card" style={{ padding: '24px' }}>
          <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Cpu size={14} color="var(--accent-light)" />
            Extension Capabilities
          </div>
          <div className="features-grid" style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
            {[
              'Real-Time Interception: Scans incoming messages inside active chats using DOM observers.',
              'Floating Risk Panel: Injectable HUD overlay displaying risk levels and quick explanations.',
              'Global Keyboard Hotkeys: Toggle extension overlays instantly (Alt+Shift+G) and analyze text (Alt+Shift+A).',
              'FastAPI Link: Directly queries backend rules and ML models on localhost:8000.'
            ].map((text, i) => (
              <div key={i} className="feature-item" style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div className="feature-icon" style={{ flexShrink: 0, marginTop: 2 }}>
                  <CheckCircle2 size={13} color="#4CAF50" />
                </div>
                <div className="feature-text" style={{ fontSize: '13px', lineHeight: 1.5 }}>{text}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: '24px', background: 'rgba(59,130,246,0.03)' }}>
          <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Key size={14} color="var(--accent-light)" />
            Extension Hotkeys
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottom: '1px solid var(--border-muted)' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Toggle Radar Widget</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Show or hide the overlay panel</div>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, padding: '4px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: 4, border: '1px solid var(--border-muted)' }}>
                Alt + Shift + G
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottom: '1px solid var(--border-muted)' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Analyze Selection</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Analyze currently selected message text</div>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, padding: '4px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: 4, border: '1px solid var(--border-muted)' }}>
                Alt + Shift + A
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Auto-Capture Link</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Send entities to Evidence Lab</div>
              </div>
              <span style={{ fontSize: 11, color: 'var(--accent-light)', display: 'flex', alignItems: 'center', gap: 4 }}>
                Fully Automated <CheckCircle2 size={12} />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Step by Step Setup Guide */}
      <div className="card" style={{ padding: '24px', marginBottom: 20 }}>
        <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <Settings size={14} color="var(--accent-light)" />
          Installation & Setup Guide
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div 
                key={step.num} 
                style={{ 
                  display: 'flex', 
                  gap: 16, 
                  padding: 16, 
                  background: 'rgba(255,255,255,0.01)', 
                  borderRadius: 8, 
                  border: '1px solid var(--border-muted)' 
                }}
              >
                <div 
                  style={{ 
                    width: 32, 
                    height: 32, 
                    borderRadius: 16, 
                    background: 'var(--accent-dim)', 
                    border: '1px solid rgba(59,130,246,0.2)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontWeight: 700, 
                    color: 'var(--accent-light)', 
                    fontFamily: 'var(--font-mono)',
                    flexShrink: 0
                  }}
                >
                  {step.num}
                </div>
                <div style={{ flexGrow: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {step.title}
                    <Icon size={12} style={{ opacity: 0.5 }} />
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>{step.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Prerequisite Alert */}
      <div className="card" style={{ padding: '16px 20px', background: 'rgba(239,68,68,0.03)', borderColor: 'rgba(239,68,68,0.15)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <AlertTriangle size={16} color="var(--danger)" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--danger)', marginBottom: 2 }}>Prerequisite: Backend API Link</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            The extension acts as a gateway and queries the local backend at <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-light)', background: 'rgba(255,255,255,0.03)', padding: '2px 4px', borderRadius: 3 }}>http://localhost:8000</code>. Ensure that the FastAPI server is actively running in order for the extension to display risk scores and analysis details.
          </div>
        </div>
      </div>
    </div>
  );
}
