import { useState, useRef } from 'react';

// ── Entity Config ─────────────────────────────────────────────────
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
    { label: '📱 UPI Fraud SMS', text: 'Congratulations! Your UPI cashback of Rs 5000 is ready. Pay Rs 1 to receive it. UPI: scammer@okaxis | Contact: 9876543210 | Link: bit.ly/getmoney | Expires 03/03/2026 at 11:59 PM!' },
    { label: '🏦 KYC Phishing', text: 'Dear SBI customer, your KYC has expired. Click http://sbi-kyc-update.com/verify to update immediately. Your account will be blocked by 25/02/2026. Call 8800112233 for help.' },
    { label: '📈 Investment Scam', text: 'Join WhatsApp investment group! Guaranteed 5% daily returns. Contact invest.guru@paytm. Pay Rs 5000 to receive Rs 50000 in 30 days! Call 9000011111. Telegram: t.me/earnfast' },
];

const PLATFORMS = ['Email', 'Facebook', 'Instagram', 'Snapchat', 'Twitter', 'WhatsApp', 'Website URL', 'YouTube', 'LinkedIn', 'Telegram', 'Mobile App', 'SMS', 'Other'];
const TITLES = ['Mr', 'Mrs', 'Dr', 'Shri', 'Smt', 'Prof', 'Miss'];
const GENDERS = ['Male', 'Female', 'Other'];
const RELATIONS = ['Father', 'Mother', 'Spouse'];

// ── Tiny helpers ──────────────────────────────────────────────────
function CopyBtn({ text }) {
    const [ok, setOk] = useState(false);
    return (
        <button onClick={() => { navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 2000); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: ok ? '#00ff41' : 'rgba(0,255,65,0.5)', fontSize: 13, padding: '2px 4px', transition: 'color .2s' }}>
            {ok ? '✓' : '⎘'}
        </button>
    );
}

function PortalField({ label, value, status, note }) {
    const [ok, setOk] = useState(false);
    const pre = status === 'prefilled' || status === 'user_provided';
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 0, borderBottom: '1px solid rgba(255,255,255,0.04)', padding: '10px 0', alignItems: 'start' }}>
            <div style={{ fontSize: 10.5, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', paddingRight: 10, paddingTop: 2, lineHeight: 1.4 }}>{label}</div>
            <div>
                {pre ? (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                        <div style={{ flex: 1, background: status === 'user_provided' ? 'rgba(0,200,255,0.06)' : 'rgba(0,255,65,0.05)', border: `1px solid ${status === 'user_provided' ? 'rgba(0,200,255,0.25)' : 'rgba(0,255,65,0.2)'}`, borderRadius: 4, padding: '5px 10px', fontSize: 11.5, color: status === 'user_provided' ? '#00cfff' : '#00ff41', fontFamily: 'var(--font-mono)', lineHeight: 1.5, wordBreak: 'break-word' }}>
                            {value}
                        </div>
                        <button onClick={() => { navigator.clipboard.writeText(value); setOk(true); setTimeout(() => setOk(false), 2000); }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: ok ? '#00ff41' : 'rgba(0,255,65,0.4)', fontSize: 13, padding: '4px', transition: 'color .2s', flexShrink: 0 }}>{ok ? '✓' : '⎘'}</button>
                    </div>
                ) : (
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 4, padding: '5px 10px', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', lineHeight: 1.5, fontStyle: 'italic' }}>
                        {value || '— fill manually on portal —'}
                    </div>
                )}
                {note && <div style={{ fontSize: 10, color: pre ? 'rgba(0,255,65,0.45)' : 'rgba(255,255,255,0.25)', marginTop: 3, fontFamily: 'var(--font-mono)', lineHeight: 1.4 }}>{pre ? '✓' : 'ℹ'} {note}</div>}
            </div>
        </div>
    );
}

function SectionHeader({ number, title, prefilled, total }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,255,255,0.08)', border: '1px solid rgba(0,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#00ffff', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>{number}</div>
            <div style={{ flex: 1, fontSize: 11, fontWeight: 700, color: '#00ffff', letterSpacing: 1.5, textTransform: 'uppercase' }}>{title}</div>
            {prefilled > 0 && <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: 3, background: 'rgba(0,255,65,0.06)', border: '1px solid rgba(0,255,65,0.2)', color: '#00ff41' }}>{prefilled}/{total} filled</div>}
        </div>
    );
}

// ── Input styles ──────────────────────────────────────────────────
const inp = {
    width: '100%', background: 'rgba(0,10,0,0.8)', border: '1px solid rgba(0,255,65,0.18)',
    borderRadius: 5, color: '#e0ffe0', fontFamily: 'var(--font-mono)', fontSize: 12,
    padding: '8px 12px', outline: 'none', boxSizing: 'border-box',
};
const sel = { ...inp, cursor: 'pointer' };
const lbl = { fontSize: 10.5, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: 0.5, marginBottom: 5, display: 'block' };

function FInput({ label, placeholder, value, onChange, type = 'text' }) {
    return <div style={{ display: 'flex', flexDirection: 'column' }}><span style={lbl}>{label}</span><input type={type} style={inp} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} /></div>;
}
function FSelect({ label, options, value, onChange }) {
    return <div style={{ display: 'flex', flexDirection: 'column' }}><span style={lbl}>{label}</span>
        <select style={sel} value={value} onChange={e => onChange(e.target.value)}>
            <option value="">— select —</option>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select></div>;
}

// ─────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────
export default function Evidence() {
    // ── Step state: 'input' | 'user_form' | 'guide' ──────────────
    const [step, setStep] = useState('input');
    const [text, setText] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const fileRef = useRef(null);

    // ── User-fill form state ──────────────────────────────────────
    const [uf, setUf] = useState({
        // Incident
        incidentDate: '', platform: '', delay: '',
        // Suspect
        suspectName: '', consent: false,
        // Complainant
        title: '', fullName: '', mobile: '', gender: '', dob: '',
        familyRelation: '', familyName: '',
        email: '', houseNo: '', street: '', colony: '', city: '',
        state: '', pincode: '', policeStation: '',
    });
    const up = (key, val) => setUf(p => ({ ...p, [key]: val }));

    const handleImageDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer?.files[0] || e.target?.files[0];
        if (file && file.type.startsWith('image/')) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
    };
    const toBase64 = (file) => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result.split(',')[1]); r.onerror = rej; r.readAsDataURL(file); });

    const analyze = async () => {
        if (!text.trim() && !imageFile) return;
        setLoading(true); setError(null); setResult(null);
        try {
            let body = { text: text.trim() };
            if (imageFile) body.image_base64 = await toBase64(imageFile);
            const r = await fetch('http://localhost:8000/api/extract-evidence', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
            });
            if (!r.ok) throw new Error(`Server error ${r.status}`);
            const data = await r.json();
            if (data.error) throw new Error(data.error);
            setResult(data);
            // Pre-fill user form from extracted data where possible
            const pg = data.portal_guide;
            setUf(p => ({
                ...p,
                incidentDate: pg?.section1?.fields?.incident_date?.value || '',
                platform: pg?.section1?.fields?.platform?.value || '',
            }));
            setStep('user_form');
        } catch (e) { setError(e.message); }
        finally { setLoading(false); }
    };

    const lvlColor = { HIGH: '#ff3b5c', MEDIUM: '#ffcc00', LOW: '#00ff41' };
    const pg = result?.portal_guide;

    // Merge portal guide fields with user-provided data
    const mergedGuide = pg ? {
        section1: {
            ...pg.section1,
            fields: {
                ...pg.section1.fields,
                incident_date: uf.incidentDate
                    ? { ...pg.section1.fields.incident_date, value: uf.incidentDate, status: 'user_provided' }
                    : pg.section1.fields.incident_date,
                platform: uf.platform && uf.platform !== pg.section1.fields.platform?.value
                    ? { ...pg.section1.fields.platform, value: uf.platform, status: 'user_provided' }
                    : pg.section1.fields.platform,
                delay_in_reporting: uf.delay
                    ? { ...pg.section1.fields.delay_in_reporting, value: uf.delay, status: 'user_provided' }
                    : pg.section1.fields.delay_in_reporting,
            },
        },
        section2: {
            ...pg.section2,
            fields: {
                ...pg.section2.fields,
                consent: { ...pg.section2.fields.consent, value: uf.consent ? '☑ Checkbox ticked — consent given' : 'Tick the checkbox', status: uf.consent ? 'user_provided' : 'user_fill' },
                suspect_name: { ...pg.section2.fields.suspect_name, value: uf.suspectName || 'Unknown', status: uf.suspectName ? 'user_provided' : 'user_fill' },
            },
        },
        section3: {
            ...pg.section3,
            fields: {
                title: { label: 'Title', value: uf.title, status: uf.title ? 'user_provided' : 'user_fill' },
                name: { label: 'Full Name', value: uf.fullName, status: uf.fullName ? 'user_provided' : 'user_fill' },
                mobile: { label: 'Mobile Number', value: uf.mobile, status: uf.mobile ? 'user_provided' : 'user_fill' },
                gender: { label: 'Gender', value: uf.gender, status: uf.gender ? 'user_provided' : 'user_fill' },
                dob: { label: 'Date of Birth', value: uf.dob, status: uf.dob ? 'user_provided' : 'user_fill' },
                family_member: { label: 'Family Member', value: uf.familyRelation && uf.familyName ? `${uf.familyRelation}: ${uf.familyName}` : '', status: uf.familyName ? 'user_provided' : 'user_fill' },
                email: { label: 'Email ID', value: uf.email, status: uf.email ? 'user_provided' : 'user_fill' },
                address: { label: 'Address', value: [uf.houseNo, uf.street, uf.colony, uf.city, uf.state, uf.pincode].filter(Boolean).join(', '), status: uf.city ? 'user_provided' : 'user_fill' },
                police_station: { label: 'Police Station', value: uf.policeStation, status: uf.policeStation ? 'user_provided' : 'user_fill' },
                relationship: { label: 'Relationship', value: 'Self', status: 'user_provided' },
                national_id: { label: 'National ID Upload', value: 'Upload JPG/PNG/PDF (max 5 MB) on the portal', status: 'user_fill' },
            },
        },
        summary: pg.summary,
    } : null;

    const totalProvided = mergedGuide ? Object.values({ ...(mergedGuide.section1?.fields || {}), ...(mergedGuide.section2?.fields || {}), ...(mergedGuide.section3?.fields || {}) }).filter(f => f.status === 'user_provided' || f.status === 'prefilled').length : 0;

    // ─────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────
    return (
        <div>
            <div className="page-header">
                <div className="page-label">🧾 AI-Powered Legal Tool</div>
                <h1 className="page-title">Evidence <span className="highlight">Structuring Assistant</span></h1>
                <p className="page-subtitle">Paste a suspicious message + optional screenshot. We extract evidence, ask for a few details, and pre-fill the entire cybercrime.gov.in complaint form.</p>
            </div>

            {/* ── STEP INDICATOR ────────────────────────────────── */}
            <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(0,255,65,0.12)' }}>
                {[['📝', 'Step 1', 'Paste & Extract', 'input'], ['📋', 'Step 2', 'Add Your Details', 'user_form'], ['🏛️', 'Step 3', 'Portal Guide', 'guide']].map(([icon, stepNum, label, id]) => {
                    const active = step === id;
                    const done = (id === 'input' && (step === 'user_form' || step === 'guide')) || (id === 'user_form' && step === 'guide');
                    return (
                        <div key={id} style={{ flex: 1, padding: '12px 16px', background: active ? 'rgba(0,255,65,0.07)' : done ? 'rgba(0,255,65,0.03)' : 'transparent', borderRight: '1px solid rgba(0,255,65,0.12)', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ fontSize: 18 }}>{done ? '✅' : icon}</div>
                            <div>
                                <div style={{ fontSize: 9, color: active ? '#00ff41' : 'var(--text-muted)', letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>{stepNum}</div>
                                <div style={{ fontSize: 12, color: active ? '#fff' : done ? 'rgba(255,255,255,0.5)' : 'var(--text-muted)', fontWeight: active ? 700 : 400 }}>{label}</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ═══════════════ STEP 1: Input ═══════════════════════ */}
            {step === 'input' && (
                <div className="card" style={{ padding: 28, marginBottom: 24 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        <div>
                            <div className="input-label">📋 Paste suspicious message / conversation</div>
                            <textarea className="message-textarea" value={text} onChange={e => setText(e.target.value)} rows={9} style={{ minHeight: 200 }}
                                placeholder={'Paste any suspicious SMS, WhatsApp, or email text here...\n\nTip: Include the full message with all numbers and links visible.'} />
                            <div style={{ marginTop: 10 }}>
                                <div className="samples-label">Try sample evidence</div>
                                <div className="sample-chips">{SAMPLES.map(s => <button key={s.label} className="sample-chip" onClick={() => setText(s.text)}>{s.label}</button>)}</div>
                            </div>
                        </div>
                        <div>
                            <div className="input-label">📸 Upload Screenshot <span style={{ marginLeft: 8, fontSize: 10, color: 'var(--text-muted)', fontWeight: 'normal', fontFamily: 'var(--font-mono)' }}>optional</span></div>
                            <div onClick={() => fileRef.current?.click()} onDrop={handleImageDrop} onDragOver={e => e.preventDefault()}
                                style={{ border: `2px dashed ${imagePreview ? 'rgba(0,255,65,0.4)' : 'rgba(0,255,65,0.15)'}`, borderRadius: 6, cursor: 'pointer', overflow: 'hidden', height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,5,0,0.8)', transition: 'border-color 0.2s' }}>
                                {imagePreview ? <img src={imagePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : (
                                    <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                        <div style={{ fontSize: 36, marginBottom: 10 }}>📂</div>
                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 1 }}>Drop screenshot here<br />or click to browse</div>
                                        <div style={{ fontSize: 10, marginTop: 6, opacity: 0.5 }}>JPG · PNG · WEBP</div>
                                    </div>
                                )}
                                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageDrop} />
                            </div>
                            {imagePreview && <button onClick={() => { setImageFile(null); setImagePreview(null); }} style={{ background: 'none', border: 'none', color: '#ff8fa3', cursor: 'pointer', fontSize: 11, fontFamily: 'var(--font-mono)', marginTop: 8 }}>✕ Remove image</button>}
                            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <div style={{ padding: '8px 12px', background: 'rgba(0,255,65,0.04)', border: '1px solid rgba(0,255,65,0.12)', borderRadius: 6, fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>🔒 <strong style={{ color: '#00ff41' }}>Analysis</strong> — DeepSeek R1 (local, private)</div>
                                <div style={{ padding: '8px 12px', background: 'rgba(0,255,255,0.03)', border: '1px solid rgba(0,255,255,0.1)', borderRadius: 6, fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>👁️ <strong style={{ color: '#00ffff' }}>OCR</strong> — Gemini Vision (screenshot to text only)</div>
                            </div>
                        </div>
                    </div>
                    {error && <div className="error-box" style={{ marginTop: 14 }}>⚠️ {error}</div>}
                    <div style={{ display: 'flex', gap: 12, marginTop: 22, alignItems: 'center' }}>
                        <div className="analyze-btn-wrap" style={{ flex: 1, maxWidth: 360 }}>
                            <div className="analyze-btn-glow" />
                            <button className="analyze-btn" onClick={analyze} disabled={loading || (!text.trim() && !imageFile)} style={{ fontSize: 12, padding: '13px' }}>
                                {loading ? <><span className="spinner" /> Extracting evidence...</> : <>🔬 Extract Evidence — Step 1 of 3</>}
                            </button>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.7 }}>Extracts entities · Pre-fills portal fields<br />Your data never leaves your machine.</div>
                    </div>
                </div>
            )}

            {/* ═══════════════ STEP 2: User Details Form ═══════════ */}
            {step === 'user_form' && result && (
                <>
                    {/* Small extraction result summary */}
                    <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                        {[
                            { label: 'Risk Score', val: `${result.score}/100`, color: lvlColor[result.level] },
                            { label: 'Category', val: result.category, color: '#00ffff' },
                            { label: 'Entities', val: `${result.entity_count} found`, color: '#00ff41' },
                            { label: 'AI', val: result.powered_by?.includes('DeepSeek') ? '🔒 DeepSeek' : '✨ Gemini', color: 'rgba(255,255,255,0.6)' },
                        ].map(b => (
                            <div key={b.label} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6 }}>
                                <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>{b.label}</div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: b.color, fontFamily: 'var(--font-mono)' }}>{b.val}</div>
                            </div>
                        ))}
                        <button onClick={() => { setStep('input'); setResult(null); }} style={{ marginLeft: 'auto', background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', borderRadius: 6, padding: '8px 14px', cursor: 'pointer', fontSize: 11, fontFamily: 'var(--font-mono)' }}>← Re-extract</button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

                        {/* ── LEFT: Incident + Suspect ── */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                            {/* Section 1 user fields */}
                            <div className="card" style={{ padding: 22 }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: '#00ffff', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 16 }}>📅 Section 1 — Incident Details</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                    <FSelect label="Delay in Reporting *" options={['Yes', 'No']} value={uf.delay} onChange={v => up('delay', v)} />
                                    <FInput label="Incident Date (if you know it)" placeholder="e.g. 03/03/2026" value={uf.incidentDate} onChange={v => up('incidentDate', v)} />
                                    <FSelect label="Platform / Where it happened" options={PLATFORMS} value={uf.platform} onChange={v => up('platform', v)} />
                                </div>
                            </div>

                            {/* Section 2 user fields */}
                            <div className="card" style={{ padding: 22 }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: '#00ffff', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 16 }}>🕵️ Section 2 — Suspect Details</div>

                                {/* Show extracted identifiers */}
                                {pg.section2.identifiers.length > 0 && (
                                    <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(0,255,65,0.04)', border: '1px solid rgba(0,255,65,0.15)', borderRadius: 6 }}>
                                        <div style={{ fontSize: 10, color: '#00ff41', fontFamily: 'var(--font-mono)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>✓ {pg.section2.identifiers.length} Identifiers Extracted Automatically</div>
                                        {pg.section2.identifiers.map((id, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                                <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: '#00ffff', background: 'rgba(0,255,255,0.08)', border: '1px solid rgba(0,255,255,0.2)', borderRadius: 3, padding: '2px 7px', whiteSpace: 'nowrap' }}>{id.type}</span>
                                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#00ff41', flex: 1, wordBreak: 'break-all' }}>{id.value}</span>
                                                <CopyBtn text={id.value} />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                    <FInput label="Suspect Name (if known)" placeholder="Leave blank if unknown" value={uf.suspectName} onChange={v => up('suspectName', v)} />
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px 12px', background: 'rgba(0,255,65,0.03)', border: '1px solid rgba(0,255,65,0.12)', borderRadius: 5 }}>
                                        <input type="checkbox" checked={uf.consent} onChange={e => up('consent', e.target.checked)} style={{ width: 16, height: 16, accentColor: '#00ff41' }} />
                                        <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', lineHeight: 1.5 }}>
                                            I consent to share suspect information with investigating agencies
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* ── RIGHT: Complainant Details ── */}
                        <div className="card" style={{ padding: 22 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#00ffff', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>👤 Section 3 — Your Details (Complainant)</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.5 }}>
                                Fill what you can — more you provide, the more complete your portal guide will be.
                                <span style={{ color: 'rgba(0,255,65,0.6)', marginLeft: 4 }}>All optional for the guide.</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 10 }}>
                                    <FSelect label="Title" options={TITLES} value={uf.title} onChange={v => up('title', v)} />
                                    <FInput label="Full Name" placeholder="Your full name" value={uf.fullName} onChange={v => up('fullName', v)} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                    <FInput label="Mobile Number" placeholder="10-digit mobile" value={uf.mobile} onChange={v => up('mobile', v)} />
                                    <FSelect label="Gender" options={GENDERS} value={uf.gender} onChange={v => up('gender', v)} />
                                </div>
                                <FInput label="Date of Birth" type="date" placeholder="" value={uf.dob} onChange={v => up('dob', v)} />
                                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 10 }}>
                                    <FSelect label="Family Member" options={RELATIONS} value={uf.familyRelation} onChange={v => up('familyRelation', v)} />
                                    <FInput label="Their Name" placeholder="Name" value={uf.familyName} onChange={v => up('familyName', v)} />
                                </div>
                                <FInput label="Email Address" placeholder="your@email.com" value={uf.email} onChange={v => up('email', v)} />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                    <FInput label="House No / Flat" placeholder="" value={uf.houseNo} onChange={v => up('houseNo', v)} />
                                    <FInput label="Street Name" placeholder="" value={uf.street} onChange={v => up('street', v)} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                    <FInput label="Colony / Area" placeholder="" value={uf.colony} onChange={v => up('colony', v)} />
                                    <FInput label="City / Town" placeholder="" value={uf.city} onChange={v => up('city', v)} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: 10 }}>
                                    <FInput label="State" placeholder="" value={uf.state} onChange={v => up('state', v)} />
                                    <FInput label="Pincode" placeholder="" value={uf.pincode} onChange={v => up('pincode', v)} />
                                </div>
                                <FInput label="Nearest Police Station" placeholder="e.g. Koramangala PS" value={uf.policeStation} onChange={v => up('policeStation', v)} />
                            </div>
                        </div>
                    </div>

                    {/* Generate guide button */}
                    <div style={{ marginTop: 20, display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div className="analyze-btn-wrap" style={{ flex: 1, maxWidth: 380 }}>
                            <div className="analyze-btn-glow" />
                            <button className="analyze-btn" onClick={() => setStep('guide')} style={{ fontSize: 12, padding: '13px', background: 'linear-gradient(135deg,rgba(0,255,65,0.15),rgba(0,255,200,0.08))' }}>
                                🏛️ Generate Complete Portal Filing Guide — Step 3
                            </button>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.7 }}>
                            All unfilled fields will be marked<br />"fill manually" on the portal.
                        </div>
                    </div>
                </>
            )}

            {/* ═══════════════ STEP 3: Complete Portal Guide ═══════ */}
            {step === 'guide' && result && mergedGuide && (
                <>
                    {/* Header bar */}
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '14px 18px', background: 'rgba(0,255,65,0.04)', border: '1px solid rgba(0,255,65,0.15)', borderRadius: 8, marginBottom: 20 }}>
                        <div style={{ fontSize: 22 }}>🏛️</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#00ff41', letterSpacing: 0.5 }}>Complete cybercrime.gov.in Filing Guide</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                                <span style={{ color: '#00ff41', fontWeight: 700 }}>{totalProvided} fields filled</span>
                                {' · '}
                                <span style={{ color: '#00cfff' }}>{mergedGuide.summary.identifiers_found} suspect identifier(s)</span>
                                {' · '}
                                <span>Green = auto-filled / you provided · Blue = you provided · Dashed = fill on portal</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => setStep('user_form')} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.12)', color: 'var(--text-muted)', borderRadius: 5, padding: '7px 12px', cursor: 'pointer', fontSize: 11, fontFamily: 'var(--font-mono)' }}>← Edit Details</button>
                            <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer"
                                style={{ padding: '7px 14px', background: 'rgba(0,255,65,0.12)', border: '1px solid rgba(0,255,65,0.35)', borderRadius: 5, color: '#00ff41', fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: 0.5, textDecoration: 'none', whiteSpace: 'nowrap', boxShadow: '0 0 10px rgba(0,255,65,0.15)' }}>
                                Open Portal ↗
                            </a>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.05fr', gap: 20 }}>

                        {/* ── LEFT: Entities + AI ── */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                            {/* Risk */}
                            <div className="card" style={{ padding: '18px 22px', background: `${lvlColor[result.level] || '#00ff41'}08`, borderColor: `${lvlColor[result.level] || '#00ff41'}30`, display: 'flex', alignItems: 'center', gap: 20 }}>
                                <div>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 48, fontWeight: 700, color: lvlColor[result.level], lineHeight: 1, textShadow: `0 0 20px ${lvlColor[result.level]}60` }}>{result.score}</div>
                                    <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: 2, textTransform: 'uppercase', marginTop: 4 }}>Risk Score</div>
                                </div>
                                <div>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: lvlColor[result.level], letterSpacing: 2, textTransform: 'uppercase' }}>{result.level} RISK</div>
                                    <span style={{ background: 'rgba(0,255,255,0.06)', border: '1px solid rgba(0,255,255,0.2)', borderRadius: 3, padding: '4px 10px', fontSize: 11, color: '#00ffff', fontFamily: 'var(--font-mono)', letterSpacing: 1, textTransform: 'uppercase', marginTop: 8, display: 'inline-block' }}>{result.category}</span>
                                </div>
                                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700, color: '#00ff41', textShadow: '0 0 12px rgba(0,255,65,0.4)' }}>{result.entity_count}</div>
                                    <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: 1.5, textTransform: 'uppercase' }}>Entities Found</div>
                                </div>
                            </div>

                            {/* Entities */}
                            <div className="card" style={{ padding: '22px' }}>
                                <div className="section-title">🔍 Extracted Forensic Evidence</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {ENTITY_CONFIG.map(cfg => {
                                        const items = result.entities?.[cfg.key] || [];
                                        return (
                                            <div key={cfg.key} style={{ borderBottom: '1px solid rgba(0,255,65,0.05)', paddingBottom: 10 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                                                    <span style={{ fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: cfg.color, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{cfg.icon} {cfg.label}</span>
                                                    <span style={{ fontSize: 10, color: items.length > 0 ? cfg.color : 'var(--text-muted)', background: items.length > 0 ? `${cfg.color}12` : 'transparent', padding: '1px 7px', borderRadius: 2, fontFamily: 'var(--font-mono)', border: items.length > 0 ? `1px solid ${cfg.color}25` : 'none' }}>{items.length} found</span>
                                                </div>
                                                {items.length > 0
                                                    ? <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>{items.map(item => <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 4, background: `${cfg.color}08`, border: `1px solid ${cfg.color}22`, borderRadius: 3, padding: '3px 10px' }}><span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: cfg.color, fontWeight: 600 }}>{item}</span><CopyBtn text={item} /></div>)}</div>
                                                    : <div style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic', fontFamily: 'var(--font-mono)' }}>{cfg.emptyMsg}</div>
                                                }
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* AI Explanation */}
                            <div className="card explanation-block" style={{ padding: '20px' }}>
                                <div className="explanation-badge">
                                    {result.powered_by?.includes('DeepSeek') ? '🔒 Local AI (DeepSeek R1)' : '🔢 Rule Engine'}
                                    <span style={{ marginLeft: 10, fontSize: 10, opacity: 0.5, fontStyle: 'normal', fontWeight: 'normal', textTransform: 'none' }}>Source: {result.powered_by}</span>
                                </div>
                                <div className="explanation-text">"{result.explanation}"</div>
                                {result.matched_patterns?.length > 0 && (
                                    <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                                        {result.matched_patterns.map(p => <span key={p} className="pattern-chip" style={{ fontSize: 10 }}>⚠️ {p}</span>)}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── RIGHT: Portal Sections ── */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                            {/* Legend */}
                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                {[['rgba(0,255,65,0.5)', 'rgba(0,255,65,0.15)', '#00ff41', 'Auto pre-filled'], ['rgba(0,200,255,0.5)', 'rgba(0,200,255,0.12)', '#00cfff', 'You provided'], ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.04)', 'var(--text-muted)', 'Fill on portal']].map(([bc, bg, tc, lab]) => (
                                    <div key={lab} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                                        <div style={{ width: 10, height: 10, borderRadius: 2, border: `1px solid ${bc}`, background: bg }} />
                                        <span style={{ color: tc }}>{lab}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Section 1 */}
                            <div className="card" style={{ padding: '20px' }}>
                                <SectionHeader number="1" title={mergedGuide.section1.title} prefilled={Object.values(mergedGuide.section1.fields).filter(f => f.status === 'prefilled' || f.status === 'user_provided').length} total={Object.keys(mergedGuide.section1.fields).length} />
                                {Object.entries(mergedGuide.section1.fields).map(([k, f]) => <PortalField key={k} label={f.label} value={f.value} status={f.status} note={f.note} />)}
                            </div>

                            {/* Section 2 */}
                            <div className="card" style={{ padding: '20px' }}>
                                <SectionHeader number="2" title={mergedGuide.section2.title} prefilled={mergedGuide.summary.identifiers_found + (uf.consent ? 1 : 0) + (uf.suspectName ? 1 : 0)} total={mergedGuide.summary.identifiers_found + Object.keys(mergedGuide.section2.fields).length} />
                                {mergedGuide.section2.identifiers.length > 0 && (
                                    <div style={{ marginBottom: 14 }}>
                                        <div style={{ fontSize: 10, color: '#00ff41', fontFamily: 'var(--font-mono)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>✓ Suspect Identifiers — Copy &amp; Add in Portal</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                            {mergedGuide.section2.identifiers.map((id, i) => (
                                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,255,65,0.04)', border: '1px solid rgba(0,255,65,0.15)', borderRadius: 5, padding: '7px 12px' }}>
                                                    <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: '#00ffff', background: 'rgba(0,255,255,0.08)', border: '1px solid rgba(0,255,255,0.2)', borderRadius: 3, padding: '2px 7px', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>{id.type}</span>
                                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: '#00ff41', fontWeight: 600, flex: 1, wordBreak: 'break-all' }}>{id.value}</span>
                                                    <CopyBtn text={id.value} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {Object.entries(mergedGuide.section2.fields).map(([k, f]) => <PortalField key={k} label={f.label} value={f.value} status={f.status} note={f.note} />)}
                            </div>

                            {/* Section 3 */}
                            <div className="card" style={{ padding: '20px' }}>
                                <SectionHeader number="3" title={mergedGuide.section3.title} prefilled={Object.values(mergedGuide.section3.fields).filter(f => f.status === 'user_provided').length} total={Object.keys(mergedGuide.section3.fields).length} />
                                {Object.entries(mergedGuide.section3.fields).map(([k, f]) => <PortalField key={k} label={f.label} value={f.value} status={f.status} note={f.note} />)}
                            </div>

                            {/* File CTA */}
                            <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '14px 20px', background: 'linear-gradient(135deg,rgba(0,255,65,0.12),rgba(0,255,255,0.06))', border: '1px solid rgba(0,255,65,0.3)', borderRadius: 8, textDecoration: 'none', color: '#00ff41', fontWeight: 700, fontSize: 13, fontFamily: 'var(--font-mono)', letterSpacing: 1, boxShadow: '0 0 20px rgba(0,255,65,0.1)' }}>
                                🏛️ Open cybercrime.gov.in &amp; Start Filing
                                <span style={{ fontSize: 11, color: 'rgba(0,255,65,0.5)', fontWeight: 'normal' }}>— use this guide while filling</span>
                            </a>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
