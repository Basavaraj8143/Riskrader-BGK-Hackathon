import React from 'react';
import {
  Cpu, Shield, Bot, Key, FileText, Database,
  Settings, Layers, Chrome, ShieldAlert, CheckCircle2,
  AlertTriangle, RefreshCw
} from 'lucide-react';

export default function About() {
  return (
    <div>
      <div className="page-header">
        <div className="page-label">
          <Layers size={11} /> Platform Architecture
        </div>
        <h1 className="page-title">
          System <span className="highlight">Specifications</span> & Logic
        </h1>
      </div>

      {/* Main Hero Architecture Introduction */}
      <div className="card about-hero mb-20" style={{ marginBottom: 20 }}>
        <div className="hero-badge">
          <Shield size={12} /> Tech Stack & Logic
        </div>
        <div className="about-title">RiskRadar AI Engine</div>
        <p className="about-sub">
          RiskRadar AI is built to defend digital banking and payment users from digital financial fraud. It achieves high-accuracy detection and automated documentation by executing a four-stage security pipeline.
        </p>
      </div>

      {/* Technical Pipeline Visualization */}
      <div className="card mb-20" style={{ padding: 24, marginBottom: 20 }}>
        <div className="section-title">
          <Cpu size={13} color="var(--accent-light)" /> Ingestion & Processing Pipeline
        </div>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: 16, 
          marginTop: 20,
          position: 'relative' 
        }}>
          {[
            {
              step: '01',
              title: 'Ingestion Layer',
              desc: 'Accepts raw text or screenshot uploads. Screenshot OCR is powered by Gemini 2.0 Flash Vision for instant extraction.',
              tag: 'Text / OCR Vision'
            },
            {
              step: '02',
              title: 'Hybrid Scoring',
              desc: 'Evaluates inputs across Regex rules (50%), ML classifications (50%), and Sentence Transformers (all-MiniLM-L6-v2) semantic similarity.',
              tag: 'Hybrid Engine'
            },
            {
              step: '03',
              title: 'Privacy Explanation',
              desc: 'Sends parsed text to a local DeepSeek R1 model via Ollama to generate an explainable incident verdict securely on the local device.',
              tag: 'Ollama / DeepSeek R1'
            },
            {
              step: '04',
              title: 'Complaint Output',
              desc: 'Extracts UPI IDs, phones, URLs, and amounts. Generates a cybercrime.gov.in portal guide and downloads a ReportLab PDF.',
              tag: 'Entity Parser & PDF'
            }
          ].map((item, index) => (
            <div 
              key={index} 
              style={{ 
                background: 'rgba(255,255,255,0.01)', 
                border: '1px solid var(--border-muted)', 
                borderRadius: 8, 
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: 180
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent-light)', opacity: 0.8, fontFamily: 'var(--font-mono)' }}>{item.step}</span>
                  <span style={{ fontSize: 9, padding: '2px 6px', background: 'var(--accent-dim)', color: 'var(--accent-light)', borderRadius: 4, fontWeight: 600 }}>{item.tag}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>{item.title}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deep-Dives Rows */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Hybrid Scoring Block */}
        <div className="card" style={{ padding: 24 }}>
          <div className="section-title">
            <ShieldAlert size={14} color="var(--danger)" /> Hybrid Risk Scoring Math
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5 }}>
            To avoid high false-positive rates of pure pattern matching and the edge-case blindspots of ML, RiskRadar AI combines their strengths:
          </p>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16, fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-muted)', textAlign: 'left' }}>
                <th style={{ padding: '8px 0', color: 'var(--text-secondary)' }}>Component</th>
                <th style={{ padding: '8px 0', color: 'var(--text-secondary)' }}>Methodology</th>
                <th style={{ padding: '8px 0', textAlign: 'right', color: 'var(--text-secondary)' }}>Weight</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                <td style={{ padding: '10px 0', fontWeight: 600 }}>Rule Engine</td>
                <td style={{ padding: '10px 0', color: 'var(--text-muted)' }}>Weighted regex over 12 fraud categories</td>
                <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 600, color: 'var(--accent-light)' }}>50%</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                <td style={{ padding: '10px 0', fontWeight: 600 }}>ML Classifier</td>
                <td style={{ padding: '10px 0', color: 'var(--text-muted)' }}>TF-IDF Vectorizer + Logistic Regression</td>
                <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 600, color: 'var(--accent-light)' }}>50%</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                <td style={{ padding: '10px 0', fontWeight: 600 }}>Semantic Encoder</td>
                <td style={{ padding: '10px 0', color: 'var(--text-muted)' }}>Sentence Transformers (centroid cos-sim)</td>
                <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 600, color: 'var(--safe)' }}>Classify Only</td>
              </tr>
            </tbody>
          </table>

          <div style={{ marginTop: 16, padding: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 6, border: '1px solid var(--border-muted)', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Fallback Protection:</span> If the ML training vector weights are missing, the scoring engine automatically shifts to rule-based fallback mode, preserving platform uptime.
          </div>
        </div>

        {/* Privacy-First Design Block */}
        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="section-title">
              <Bot size={14} color="var(--safe)" /> Privacy-First Architecture
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.6 }}>
              RiskRadar separates local scanning tasks from research lookups to ensure that sensitive financial details, credentials, or personal names are never leaked.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--accent-light)', marginTop: 6 }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>Local Scan & Extract (Ollama / DeepSeek R1)</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Sensitive chat strings analyzed via local LLM instances. Input data never leaves your desktop environment.</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--accent-light)', marginTop: 6 }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>Sandbox Research Lab (Google Gemini API)</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>General search and OCR vision tasks utilize secure external APIs. No personal identification data (PII) is transmitted.</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', padding: '10px 12px', borderRadius: 6, fontSize: 11, color: 'var(--text-secondary)' }}>
            <CheckCircle2 size={14} color="var(--safe)" style={{ flexShrink: 0 }} />
            Zero-storage: No analyzed chat logs are persisted on backend databases.
          </div>
        </div>
      </div>

      {/* Chrome Extension & Web Overlay Integration */}
      <div className="card mb-20" style={{ padding: 24, marginBottom: 20 }}>
        <div className="section-title">
          <Chrome size={13} color="var(--accent-light)" /> WhatsApp Web Extension Mechanics
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.6 }}>
          The companion Chrome extension injects a lightweight Javascript client directly inside the active tab DOM of WhatsApp Web:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginTop: 16 }}>
          {[
            {
              title: 'MutationObserver Hooks',
              desc: 'Reacts to DOM mutations to scan incoming chat elements asynchronously as bubbles enter the view area.',
              icon: RefreshCw
            },
            {
              title: 'Keyboard Listeners',
              desc: 'Injects keydown bindings: Alt+Shift+G opens/toggles the HUD, and Alt+Shift+A analyzes selected text strings.',
              icon: Key
            },
            {
              title: 'Local API Queries',
              desc: 'Queries the FastAPI REST service on localhost:8000 via fetch requests to get risk categorizations and tips.',
              icon: Settings
            }
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <div 
                key={index} 
                style={{ 
                  background: 'rgba(255,255,255,0.01)', 
                  border: '1px solid var(--border-muted)', 
                  borderRadius: 6, 
                  padding: 14 
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <Icon size={14} color="var(--accent-light)" />
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{item.title}</div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Technology Stack Specifications */}
      <div className="card" style={{ padding: 24 }}>
        <div className="section-title">
          <Database size={13} color="var(--accent-light)" /> Technology Stack Specifications
        </div>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: 16, 
          marginTop: 20 
        }}>
          {[
            { name: 'FastAPI', desc: 'Python REST API framework hosting endpoints for analysis, trends, OCR and PDF compilation.' },
            { name: 'React + Vite', desc: 'Single-page React dashboard styling using glassmorphism layouts and responsive design.' },
            { name: 'Sentence Transformers', desc: 'Embeds raw input strings into 384-dimensional spaces for category centroid cosine math.' },
            { name: 'Scikit-Learn ML', desc: 'Combines a TF-IDF vectorizer and Logistic Regression classifier for fraud probability scoring.' },
            { name: 'Ollama / DeepSeek R1', desc: 'Hosts DeepSeek R1 locally for privacy-preserving, structured incident evaluations.' },
            { name: 'Google GenAI SDK', desc: 'Integrates Gemini 2.0 Flash for screenshot text OCR and Encyclopedia deep research.' },
            { name: 'ReportLab PDF', desc: 'Generates structured cybercrime complaint briefs in standard PDF document format.' },
            { name: 'Chrome manifest v3', desc: 'Browser extension manifest standard injecting content script listeners.' }
          ].map((tech, index) => (
            <div 
              key={index} 
              style={{ 
                background: 'rgba(255,255,255,0.01)', 
                border: '1px solid var(--border-muted)', 
                borderRadius: 6, 
                padding: 12 
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{tech.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{tech.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
