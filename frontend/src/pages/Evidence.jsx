import { useState, useRef } from 'react';

const ENTITY_CONFIG = [
    { key: 'upi_ids', icon: '💸', label: 'UPI IDs', color: '#ff3b5c', emptyMsg: 'No UPI IDs found' },
    { key: 'phone_numbers', icon: '📞', label: 'Phone Numbers', color: '#ffcc00', emptyMsg: 'No phone numbers found' },
    { key: 'urls', icon: '🔗', label: 'Suspicious URLs', color: '#ff00ff', emptyMsg: 'No URLs found' },
    { key: 'amounts', icon: '₹', label: 'Payment Amounts', color: '#00ffff', emptyMsg: 'No amounts found' },
    { key: 'dates', icon: '📅', label: 'Dates / Times', color: '#a855f7', emptyMsg: 'No dates found' },
    { key: 'names_mentioned', icon: '🏦', label: 'Orgs Impersonated', color: '#ff6b35', emptyMsg: 'None detected' },
    { key: 'emails', icon: '📧', label: 'Email Addresses', color: '#00ff41', emptyMsg: 'No emails found' },
];

const SAMPLES = [
    {
        label: '📱 UPI Fraud SMS',
        text: 'Congratulations! Your UPI cashback of Rs 5000 is ready. Pay Rs 1 to receive it. UPI: scammer@okaxis | Contact: 9876543210 | Link: bit.ly/getmoney | Hurry, expires 03/03/2026 at 11:59 PM!'
    },
    {
        label: '🏦 KYC Phishing',
        text: 'Dear SBI customer, your KYC has expired. Click http://sbi-kyc-update.com/verify to update immediately. Your account will be blocked by 25/02/2026. Call 8800112233 for help. Reference: ACC123456789.'
    },
    {
        label: '📈 Investment Scam',
        text: 'Join WhatsApp investment group! Guaranteed 5% daily returns. Contact agent at invest.guru@paytm. Pay Rs 5000 to receive Rs 50000 in 30 days! Call 9000011111. Telegram: t.me/earnfast'
    },
];

function CopyBtn({ text }) {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button onClick={copy} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied ? '#00ff41' : 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-mono)', padding: '2px 6px', transition: 'color 0.2s' }}>
            {copied ? '✓ copied' : '⎘ copy'}
        </button>
    );
}

export default function Evidence() {
    const [mode, setMode] = useState('text'); // 'text' | 'image'
    const [text, setText] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [complaintCopied, setComplaintCopied] = useState(false);
    const dropRef = useRef(null);
    const fileRef = useRef(null);

    const handleImageDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer?.files[0] || e.target?.files[0];
        if (file && file.type.startsWith('image/')) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const toBase64 = (file) => new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result.split(',')[1]);
        reader.onerror = rej;
        reader.readAsDataURL(file);
    });

    const analyze = async () => {
        if (mode === 'text' && !text.trim()) return;
        if (mode === 'image' && !imageFile) return;

        setLoading(true); setError(null); setResult(null);
        try {
            let body = {};
            if (mode === 'image' && imageFile) {
                const b64 = await toBase64(imageFile);
                body = { text: text.trim(), image_base64: b64 };
            } else {
                body = { text: text.trim() };
            }

            const r = await fetch('http://localhost:8000/api/extract-evidence', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!r.ok) throw new Error(`Server error ${r.status}`);
            const data = await r.json();
            if (data.error) throw new Error(data.error);
            setResult(data);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const downloadComplaint = () => {
        if (!result?.complaint_draft) return;
        const blob = new Blob([result.complaint_draft], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cybercrime_complaint_${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const generatePDF = () => {
        if (!result) return;
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
        const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        const lvlC = { HIGH: '#dc2626', MEDIUM: '#d97706', LOW: '#16a34a' };
        const color = lvlC[result.level] || '#dc2626';

        const entityRows = [
            { label: 'UPI IDs', key: 'upi_ids', icon: '💸' },
            { label: 'Phone Numbers', key: 'phone_numbers', icon: '📞' },
            { label: 'Suspicious URLs', key: 'urls', icon: '🔗' },
            { label: 'Payment Amounts', key: 'amounts', icon: '₹' },
            { label: 'Dates / Times', key: 'dates', icon: '📅' },
            { label: 'Orgs Impersonated', key: 'names_mentioned', icon: '🏦' },
            { label: 'Email Addresses', key: 'emails', icon: '📧' },
        ].map(r => {
            const items = result.entities?.[r.key] || [];
            return `<tr>
              <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;font-weight:600;color:#374151;width:170px;vertical-align:top">
                ${r.icon} ${r.label}
              </td>
              <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;color:${items.length ? '#111827' : '#9ca3af'};font-family:monospace;font-size:12px;word-break:break-all">
                ${items.length ? items.join(' &nbsp;|&nbsp; ') : '<em>Not found</em>'}
              </td>
              <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;text-align:center;font-weight:700;color:${items.length ? '#16a34a' : '#9ca3af'}">
                ${items.length}
              </td>
            </tr>`;
        }).join('');

        const patternRows = (result.matched_patterns || []).map(p =>
            `<li style="margin:4px 0;color:#374151">${p}</li>`
        ).join('') || '<li style="color:#9ca3af">No specific patterns matched</li>';

        const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>FinGuard AI — Cybercrime Evidence Report</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; color: #111827; background: #fff; font-size: 13px; line-height: 1.6; }
    @page { margin: 18mm 16mm; size: A4; }
    @media print { .no-print { display: none !important; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }

    /* ---- HEADER ---- */
    .header { background: #0a0a0a; color: white; padding: 28px 32px; display: flex; align-items: center; justify-content: space-between; border-radius: 0; }
    .brand { display: flex; align-items: center; gap: 14px; }
    .shield { font-size: 40px; }
    .brand-text h1 { font-size: 22px; font-weight: 900; letter-spacing: 2px; color: #00ff41; text-shadow: 0 0 20px rgba(0,255,65,0.5); }
    .brand-text p { font-size: 9px; color: #6b7280; letter-spacing: 3px; text-transform: uppercase; margin-top: 2px; }
    .header-meta { text-align: right; font-size: 11px; color: #6b7280; line-height: 1.8; font-family: 'JetBrains Mono', monospace; }
    .header-meta strong { color: #00ff41; }

    /* ---- RISK BANNER ---- */
    .risk-banner { display: flex; align-items: center; gap: 24px; padding: 20px 32px; background: ${color}0d; border-left: 5px solid ${color}; margin: 0; }
    .risk-score { font-size: 56px; font-weight: 900; color: ${color}; font-family: 'JetBrains Mono', monospace; line-height: 1; }
    .risk-info h2 { font-size: 20px; font-weight: 800; color: ${color}; letter-spacing: 2px; text-transform: uppercase; }
    .risk-info .cat { display: inline-block; background: #f3f4f6; border: 1px solid #d1d5db; padding: 3px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; color: #374151; margin-top: 6px; }
    .risk-info .sub { font-size: 11px; color: #6b7280; margin-top: 4px; }
    .entity-count { margin-left: auto; text-align: center; }
    .entity-count .num { font-size: 42px; font-weight: 900; color: #111827; font-family: 'JetBrains Mono', monospace; line-height: 1; }
    .entity-count .lbl { font-size: 9px; color: #6b7280; text-transform: uppercase; letter-spacing: 2px; }

    /* ---- SECTIONS ---- */
    .section { padding: 20px 32px; border-bottom: 1px solid #e5e7eb; }
    .section-title { font-size: 11px; font-weight: 800; color: #374151; text-transform: uppercase; letter-spacing: 2.5px; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
    .section-title::after { content: ''; flex: 1; height: 1px; background: #e5e7eb; }

    /* ---- MESSAGE BOX ---- */
    .msg-box { background: #faf9f9; border: 1px solid #e5e7eb; border-left: 4px solid #dc2626; border-radius: 4px; padding: 14px 16px; font-size: 12.5px; color: #374151; font-family: 'JetBrains Mono', monospace; line-height: 1.8; white-space: pre-wrap; word-break: break-word; }

    /* ---- EVIDENCE TABLE ---- */
    .evidence-table { width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden; font-size: 12.5px; }
    .evidence-table thead tr { background: #111827; color: white; }
    .evidence-table thead th { padding: 10px 14px; text-align: left; font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 700; }

    /* ---- EXPLANATION ---- */
    .explanation { background: #f0fdf4; border: 1px solid #bbf7d0; border-left: 4px solid #16a34a; border-radius: 4px; padding: 14px 16px; font-size: 13px; color: #166534; font-style: italic; line-height: 1.8; }

    /* ---- COMPLAINT ---- */
    .complaint { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px; padding: 18px; font-family: 'JetBrains Mono', monospace; font-size: 11.5px; color: #111827; line-height: 1.9; white-space: pre-wrap; word-break: break-word; }

    /* ---- FOOTER ---- */
    .footer { background: #0a0a0a; color: white; padding: 18px 32px; display: flex; align-items: center; justify-content: space-between; font-size: 11px; }
    .footer .helpline { font-size: 20px; font-weight: 900; color: #ff3b5c; font-family: 'JetBrains Mono', monospace; }
    .footer .right { text-align: right; color: #6b7280; line-height: 1.8; }

    /* ---- PRINT BTN ---- */
    .print-bar { background: #0a0a0a; padding: 14px 32px; display: flex; gap: 12px; align-items: center; position: sticky; top: 0; z-index: 99; }
    .btn { padding: 9px 22px; border: none; border-radius: 4px; cursor: pointer; font-weight: 700; font-size: 12px; letter-spacing: 1px; font-family: 'Inter', sans-serif; }
    .btn-print { background: #00ff41; color: #000; }
    .btn-close { background: transparent; color: #6b7280; border: 1px solid #374151; }
    .btn-close:hover { color: #fff; }
    .print-hint { color: #6b7280; font-size: 11px; }
  </style>
</head>
<body>

  <!-- Print bar (hidden when printing) -->
  <div class="print-bar no-print">
    <button class="btn btn-print" onclick="window.print()">🖨️ SAVE AS PDF / PRINT</button>
    <button class="btn btn-close" onclick="window.close()">✕ Close</button>
    <span class="print-hint">In the print dialog → Destination → "Save as PDF"</span>
  </div>

  <!-- HEADER -->
  <div class="header">
    <div class="brand">
      <div class="shield">🛡️</div>
      <div class="brand-text">
        <h1>FINGUARD AI</h1>
        <p>Cybercrime Evidence Report</p>
      </div>
    </div>
    <div class="header-meta">
      Generated: <strong>${dateStr}, ${timeStr} IST</strong><br>
      Report ID: <strong>FG-${Date.now().toString(36).toUpperCase()}</strong><br>
      Classification: <strong style="color:#ef4444">CONFIDENTIAL</strong>
    </div>
  </div>

  <!-- RISK BANNER -->
  <div class="risk-banner">
    <div class="risk-score">${result.score}</div>
    <div class="risk-info">
      <h2>${result.level} RISK</h2>
      <div class="cat">📂 ${result.category}</div>
      <div class="sub">Risk score out of 100 · ${result.score >= 61 ? 'Immediate action recommended' : result.score >= 31 ? 'Exercise caution' : 'Low threat level'}</div>
    </div>
    <div class="entity-count">
      <div class="num">${result.entity_count}</div>
      <div class="lbl">Forensic Entities<br>Identified</div>
    </div>
  </div>

  <!-- ORIGINAL MESSAGE -->
  <div class="section">
    <div class="section-title">📱 Original Suspicious Message</div>
    <div class="msg-box">${(text || result.ocr_text || 'Message not available').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
  </div>

  <!-- EXTRACTED EVIDENCE TABLE -->
  <div class="section">
    <div class="section-title">🔍 Extracted Forensic Evidence</div>
    <table class="evidence-table">
      <thead>
        <tr>
          <th style="width:170px">Entity Type</th>
          <th>Values Found</th>
          <th style="width:70px;text-align:center">Count</th>
        </tr>
      </thead>
      <tbody>${entityRows}</tbody>
    </table>
  </div>

  <!-- PATTERN MATCHES -->
  <div class="section">
    <div class="section-title">⚠️ Pattern Signatures Matched</div>
    <ul style="padding-left:20px;column-count:2;column-gap:20px">
      ${patternRows}
    </ul>
  </div>

  <!-- AI EXPLANATION -->
  <div class="section">
    <div class="section-title">🤖 AI Fraud Analysis</div>
    <div class="explanation">"${(result.explanation || '').replace(/</g, '&lt;')}"</div>
    <p style="font-size:10px;color:#9ca3af;margin-top:6px">Analysis powered by: ${result.powered_by || 'FinGuard Rule Engine'}</p>
  </div>

  <!-- COMPLAINT DRAFT -->
  <div class="section" style="border-bottom:none">
    <div class="section-title">🧾 Cybercrime Complaint Draft</div>
    <div class="complaint">${(result.complaint_draft || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
    <p style="font-size:10px;color:#9ca3af;margin-top:8px;font-style:italic">
      ⚠️ Fill in all [BRACKETED] placeholders before submitting. This draft is auto-generated and should be reviewed before filing.
    </p>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    <div>
      <div style="color:#6b7280;font-size:9px;letter-spacing:2px;text-transform:uppercase;margin-bottom:4px">National Cyber Crime Helpline</div>
      <div class="helpline">1930</div>
      <div style="color:#6b7280;font-size:11px;margin-top:2px">cybercrime.gov.in · Available 24×7</div>
    </div>
    <div class="right">
      <div style="color:#00ff41;font-size:11px;font-weight:700;margin-bottom:4px">FinGuard AI</div>
      <div>Report generated on ${dateStr}</div>
      <div style="color:#374151;font-weight:600">This document is for official use only</div>
    </div>
  </div>

</body>
</html>`;

        const win = window.open('', '_blank', 'width=900,height=700');
        win.document.write(html);
        win.document.close();
    };

    const lvlColor = { HIGH: '#ff3b5c', MEDIUM: '#ffcc00', LOW: '#00ff41' };


    return (
        <div>
            <div className="page-header">
                <div className="page-label">🧾 AI-Powered Legal Tool</div>
                <h1 className="page-title">
                    Evidence <span className="highlight">Structuring Assistant</span>
                </h1>
                <p className="page-subtitle">
                    Upload a screenshot or paste a suspicious message. We extract all forensic entities and generate a ready-to-file cybercrime complaint draft.
                </p>
            </div>

            {/* ===== INPUT AREA ===== */}
            <div className="card" style={{ padding: 28, marginBottom: 24 }}>

                {/* Mode Toggle */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                    {[
                        { id: 'text', icon: '📝', label: 'Paste Message' },
                        { id: 'image', icon: '🖼️', label: 'Upload Screenshot' },
                    ].map(m => (
                        <button
                            key={m.id}
                            onClick={() => setMode(m.id)}
                            style={{
                                background: mode === m.id ? 'rgba(0,255,65,0.1)' : 'transparent',
                                border: `1px solid ${mode === m.id ? 'rgba(0,255,65,0.4)' : 'rgba(0,255,65,0.12)'}`,
                                color: mode === m.id ? '#00ff41' : 'var(--text-muted)',
                                padding: '8px 18px', borderRadius: 4, cursor: 'pointer',
                                fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: 1,
                                textShadow: mode === m.id ? '0 0 8px rgba(0,255,65,0.5)' : 'none',
                                transition: 'all 0.2s',
                            }}
                        >
                            {m.icon} {m.label}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: mode === 'image' ? '1fr 1fr' : '1fr', gap: 20 }}>
                    {/* Text Input */}
                    <div>
                        <div className="input-label">📋 {mode === 'image' ? 'Additional text context (optional)' : 'Paste suspicious message / conversation'}</div>
                        <textarea
                            className="message-textarea"
                            placeholder={mode === 'text'
                                ? 'Paste any suspicious SMS, WhatsApp, or email text here...\n\nTip: Include the full message with all numbers and links visible.'
                                : 'Optional: add any extra context...'}
                            value={text}
                            onChange={e => setText(e.target.value)}
                            rows={mode === 'image' ? 6 : 8}
                            style={{ minHeight: mode === 'image' ? 130 : 180 }}
                        />

                        {/* Sample chips for text mode */}
                        {mode === 'text' && (
                            <div style={{ marginTop: 10 }}>
                                <div className="samples-label">Try sample evidence</div>
                                <div className="sample-chips">
                                    {SAMPLES.map(s => (
                                        <button key={s.label} className="sample-chip" onClick={() => setText(s.text)}>{s.label}</button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Image Upload */}
                    {mode === 'image' && (
                        <div>
                            <div className="input-label">📸 Screenshot / Image</div>
                            <div
                                ref={dropRef}
                                onClick={() => fileRef.current?.click()}
                                onDrop={handleImageDrop}
                                onDragOver={e => e.preventDefault()}
                                style={{
                                    border: `2px dashed ${imagePreview ? 'rgba(0,255,65,0.4)' : 'rgba(0,255,65,0.15)'}`,
                                    borderRadius: 4, cursor: 'pointer', overflow: 'hidden',
                                    height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: 'rgba(0,5,0,0.8)', position: 'relative',
                                    transition: 'border-color 0.2s',
                                }}
                            >
                                {imagePreview ? (
                                    <img src={imagePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                ) : (
                                    <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                        <div style={{ fontSize: 32, marginBottom: 8 }}>📂</div>
                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 1 }}>
                                            Drop screenshot here<br />or click to browse
                                        </div>
                                        <div style={{ fontSize: 10, marginTop: 6, opacity: 0.5 }}>JPG, PNG, WEBP</div>
                                    </div>
                                )}
                                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageDrop} />
                            </div>
                            {imagePreview && (
                                <button onClick={() => { setImageFile(null); setImagePreview(null); }}
                                    style={{ background: 'none', border: 'none', color: '#ff8fa3', cursor: 'pointer', fontSize: 11, fontFamily: 'var(--font-mono)', marginTop: 6 }}>
                                    ✕ Remove image
                                </button>
                            )}
                            <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                🤖 Gemini Vision will OCR the screenshot and extract all text automatically.
                            </div>
                        </div>
                    )}
                </div>

                {error && <div className="error-box" style={{ marginTop: 14 }}>⚠️ {error}</div>}

                <div style={{ display: 'flex', gap: 12, marginTop: 20, alignItems: 'center' }}>
                    <div className="analyze-btn-wrap" style={{ flex: 1, maxWidth: 300 }}>
                        <div className="analyze-btn-glow" />
                        <button className="analyze-btn" onClick={analyze}
                            disabled={loading || (mode === 'text' && !text.trim()) || (mode === 'image' && !imageFile && !text.trim())}
                            style={{ fontSize: 12, padding: '13px' }}>
                            {loading
                                ? <><span className="spinner" /> Extracting evidence...</>
                                : <>🔬 Extract Evidence &amp; Generate Complaint</>}
                        </button>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                        Powered by regex extraction + Gemini AI complaint generation.<br />
                        Data never stored or shared.
                    </div>
                </div>
            </div>

            {/* ===== EMPTY STATE ===== */}
            {!result && !loading && (
                <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: 52, marginBottom: 14 }}>🧾</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Evidence Lab Ready</div>
                    <div style={{ fontSize: 12, marginTop: 10, lineHeight: 1.8, maxWidth: 400, margin: '10px auto 0' }}>
                        Paste a suspicious message or upload a screenshot.<br />
                        We'll extract all forensic entities and generate a cybercrime complaint draft you can file at <strong style={{ color: '#00ffff' }}>cybercrime.gov.in</strong> or your local police.
                    </div>
                </div>
            )}

            {/* ===== RESULTS ===== */}
            {result && (
                <>
                    {/* OCR Notice */}
                    {result.ocr_text && (
                        <div className="card" style={{ padding: '14px 20px', marginBottom: 16, background: 'rgba(0,255,255,0.03)', borderColor: 'rgba(0,255,255,0.15)' }}>
                            <div style={{ fontSize: 10, letterSpacing: 2, color: '#00ffff', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>
                                🤖 Gemini Vision OCR Extracted Text
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                                {result.ocr_text}
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 20 }}>

                        {/* ===== LEFT: Entities + Analysis ===== */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                            {/* Risk badge */}
                            <div className="card" style={{
                                padding: '18px 22px',
                                background: `${lvlColor[result.level] || '#00ff41'}08`,
                                borderColor: `${lvlColor[result.level] || '#00ff41'}30`,
                                display: 'flex', alignItems: 'center', gap: 20
                            }}>
                                <div>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 48, fontWeight: 700, color: lvlColor[result.level], lineHeight: 1, textShadow: `0 0 20px ${lvlColor[result.level]}60` }}>
                                        {result.score}
                                    </div>
                                    <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: 2, textTransform: 'uppercase', marginTop: 4 }}>Risk Score</div>
                                </div>
                                <div>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: lvlColor[result.level], letterSpacing: 2, textTransform: 'uppercase' }}>
                                        {result.level} RISK
                                    </div>
                                    <span style={{ background: 'rgba(0,255,255,0.06)', border: '1px solid rgba(0,255,255,0.2)', borderRadius: 3, padding: '4px 10px', fontSize: 11, color: '#00ffff', fontFamily: 'var(--font-mono)', letterSpacing: 1, textTransform: 'uppercase', marginTop: 8, display: 'inline-block' }}>
                                        {result.category}
                                    </span>
                                </div>
                                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700, color: '#00ff41', textShadow: '0 0 12px rgba(0,255,65,0.4)' }}>
                                        {result.entity_count}
                                    </div>
                                    <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: 1.5, textTransform: 'uppercase' }}>Entities Found</div>
                                </div>
                            </div>

                            {/* Extracted Entities */}
                            <div className="card" style={{ padding: '22px' }}>
                                <div className="section-title">🔍 Extracted Forensic Evidence</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {ENTITY_CONFIG.map(cfg => {
                                        const items = result.entities?.[cfg.key] || [];
                                        return (
                                            <div key={cfg.key} style={{ borderBottom: '1px solid rgba(0,255,65,0.05)', paddingBottom: 10 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                                                    <span style={{ fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: cfg.color, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                                                        {cfg.icon} {cfg.label}
                                                    </span>
                                                    <span style={{ fontSize: 10, color: items.length > 0 ? cfg.color : 'var(--text-muted)', background: items.length > 0 ? `${cfg.color}12` : 'transparent', padding: '1px 7px', borderRadius: 2, fontFamily: 'var(--font-mono)', border: items.length > 0 ? `1px solid ${cfg.color}25` : 'none' }}>
                                                        {items.length} found
                                                    </span>
                                                </div>
                                                {items.length > 0 ? (
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                                                        {items.map(item => (
                                                            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 4, background: `${cfg.color}08`, border: `1px solid ${cfg.color}22`, borderRadius: 3, padding: '3px 10px' }}>
                                                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: cfg.color, fontWeight: 600 }}>{item}</span>
                                                                <CopyBtn text={item} />
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic', fontFamily: 'var(--font-mono)' }}>{cfg.emptyMsg}</div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* AI Analysis */}
                            <div className="card explanation-block" style={{ padding: '20px' }}>
                                <div className="explanation-badge">🤖 AI Fraud Analysis</div>
                                <div className="explanation-text">"{result.explanation}"</div>
                                {result.matched_patterns?.length > 0 && (
                                    <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                                        {result.matched_patterns.map(p => (
                                            <span key={p} className="pattern-chip" style={{ fontSize: 10 }}>⚠️ {p}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ===== RIGHT: Complaint Draft ===== */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div className="card" style={{ padding: '22px', flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                                    <div className="section-title" style={{ marginBottom: 0 }}>🧾 Cybercrime Complaint Draft</div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button
                                            onClick={() => { navigator.clipboard.writeText(result.complaint_draft); setComplaintCopied(true); setTimeout(() => setComplaintCopied(false), 2000); }}
                                            style={{ background: 'rgba(0,255,65,0.06)', border: '1px solid rgba(0,255,65,0.2)', color: complaintCopied ? '#00ff41' : 'var(--text-secondary)', padding: '5px 14px', borderRadius: 3, cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 1 }}>
                                            {complaintCopied ? '✓ Copied!' : '⎘ Copy'}
                                        </button>
                                        <button
                                            onClick={downloadComplaint}
                                            style={{ background: 'rgba(0,255,255,0.06)', border: '1px solid rgba(0,255,255,0.2)', color: '#00ffff', padding: '5px 14px', borderRadius: 3, cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 1 }}>
                                            ⬇ Download .txt
                                        </button>
                                        <button
                                            onClick={generatePDF}
                                            style={{ background: 'rgba(0,255,65,0.1)', border: '1px solid rgba(0,255,65,0.4)', color: '#00ff41', padding: '5px 16px', borderRadius: 3, cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 1, fontWeight: 700, boxShadow: '0 0 12px rgba(0,255,65,0.2)', textShadow: '0 0 8px rgba(0,255,65,0.5)' }}>
                                            📄 Save as PDF
                                        </button>
                                    </div>
                                </div>

                                <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10, fontFamily: 'var(--font-mono)' }}>
                                    Generated by: {result.complaint_by}
                                </div>

                                <pre style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: 11.5,
                                    color: '#00cc33',
                                    lineHeight: 1.85,
                                    background: 'rgba(0,5,0,0.8)',
                                    border: '1px solid rgba(0,255,65,0.1)',
                                    borderRadius: 4,
                                    padding: '18px',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    maxHeight: 600,
                                    overflowY: 'auto',
                                }}>
                                    {result.complaint_draft}
                                </pre>

                                <div style={{ marginTop: 14, padding: '12px 16px', background: 'rgba(255,59,92,0.04)', border: '1px solid rgba(255,59,92,0.15)', borderRadius: 4, fontSize: 11, color: '#ff8fa3', lineHeight: 1.7, fontFamily: 'var(--font-mono)' }}>
                                    ⚠️ Fill in the [BRACKETED] placeholders before filing.<br />
                                    📞 National Cyber Crime Helpline: <strong style={{ color: '#ff3b5c' }}>1930</strong> | <strong style={{ color: '#00ffff' }}>cybercrime.gov.in</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
