import { useState, useRef, useEffect, useCallback } from 'react';
import {
    Wallet, Phone, Link, DollarSign, CalendarDays, Building2, Mail,
    Copy, Check, FileText, ClipboardList, BookMarked,
    Microscope, Camera, Lock, Eye, ChevronRight,
    AlertTriangle, Shield, Phone as PhoneIcon, ExternalLink,
    User, Home, MapPin
} from 'lucide-react';

// ── Entity Config ─────────────────────────────────────────────────
const ENTITY_CONFIG = [
    { key: 'upi_ids', Icon: Wallet, label: 'UPI IDs', color: '#ef4444', emptyMsg: 'No UPI IDs found' },
    { key: 'phone_numbers', Icon: Phone, label: 'Phone Numbers', color: '#f59e0b', emptyMsg: 'No phone numbers found' },
    { key: 'urls', Icon: Link, label: 'Suspicious URLs', color: '#8b5cf6', emptyMsg: 'No URLs found' },
    { key: 'amounts', Icon: DollarSign, label: 'Payment Amounts', color: '#3b82f6', emptyMsg: 'No amounts found' },
    { key: 'dates', Icon: CalendarDays, label: 'Dates / Times', color: '#60a5fa', emptyMsg: 'No dates found' },
    { key: 'names_mentioned', Icon: Building2, label: 'Orgs Impersonated', color: '#f97316', emptyMsg: 'None detected' },
    { key: 'emails', Icon: Mail, label: 'Email Addresses', color: '#10b981', emptyMsg: 'No emails found' },
];

const SAMPLES = [
    { label: 'UPI Fraud SMS', text: 'URGNT: sir ur HDFC bank acount will block today!!! clam ur UPI cashback Rs 5000 fast. pay Rs 1 only to receive. scan QR code or click link bit.ly/getmoney . customer care number 9876543210' },
    { label: 'KYC Phishing', text: 'sbi customer ur KYC is expire n acount suspended. click fast http://sbi-kyc-update.com/verify to update PAN and aadhaar card dtls. forward OTP to 8800112233 for verification.' },
    { label: 'Investment Scam', text: 'vip telegram group join fast!! 10% daily return gurantee. members earning big profit every day. u pay Rs 5000 and get Rs 50000. msg admin invest.guru@paytm' },
    { label: '⭐ My Real Story', personal: true, text: 'I got whatsapp message from unknown number. That person told he is my teacher and he need Rs 2000 urgently for some emergency payment. He said please send now only on his UPI 9876543210@ybl. He also gave two more number +91 9876543210 and +91 8765432109 for contact. And he told me please dont tell anyone about this, send fast fast. I got little suspicious because my teacher never ask money like this on whatsapp. Then I called my teacher real number and he said he never send any such message. That time I understand it is fraud person who is pretending to be my teacher to take money from me.' },
];

const PLATFORMS = ['Email', 'Facebook', 'Instagram', 'Snapchat', 'Twitter', 'WhatsApp', 'Website URL', 'YouTube', 'LinkedIn', 'Telegram', 'Mobile App', 'SMS', 'Other'];
const TITLES = ['Mr', 'Mrs', 'Dr', 'Shri', 'Smt', 'Prof', 'Miss'];
const GENDERS = ['Male', 'Female', 'Other'];
const RELATIONS = ['Father', 'Mother', 'Spouse'];

// ── Profile persistence (localStorage) ───────────────────────────
const PROFILE_KEY = 'finguard_complainant_profile';
// Fields that belong to the user's personal profile (saved across sessions)
// Incident-specific fields (incidentDate, platform, delay, suspectName, consent)
// are intentionally NOT part of the profile.
const PROFILE_FIELDS = [
    'title', 'fullName', 'mobile', 'gender', 'dob',
    'familyRelation', 'familyName', 'email',
    'houseNo', 'street', 'colony', 'city', 'state', 'pincode', 'policeStation',
];

function loadProfile() {
    try {
        const raw = localStorage.getItem(PROFILE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
}

function saveProfile(uf) {
    const profileData = {};
    PROFILE_FIELDS.forEach(k => { profileData[k] = uf[k]; });
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profileData));
}

function clearProfile() {
    localStorage.removeItem(PROFILE_KEY);
}

// ── Tiny helpers ──────────────────────────────────────────────────
function CopyBtn({ text }) {
    const [ok, setOk] = useState(false);
    return (
        <button
            onClick={() => { navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 2000); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: ok ? 'var(--safe-light)' : 'var(--text-muted)', fontSize: 13, padding: '2px 4px', transition: 'color .2s', display: 'flex', alignItems: 'center' }}
        >
            {ok ? <Check size={12} /> : <Copy size={12} />}
        </button>
    );
}

function PortalField({ label, value, status, note }) {
    const [ok, setOk] = useState(false);
    const pre = status === 'prefilled' || status === 'user_provided';
    return (
        <div className="portal-field">
            <div className="portal-field-label">{label}</div>
            <div>
                {pre ? (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                        <div className={`portal-field-value ${status === 'user_provided' ? 'user-provided' : 'prefilled'}`}>
                            {value}
                        </div>
                        <button
                            onClick={() => { navigator.clipboard.writeText(value); setOk(true); setTimeout(() => setOk(false), 2000); }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: ok ? 'var(--safe-light)' : 'var(--text-muted)', padding: '4px', transition: 'color .2s', flexShrink: 0, display: 'flex', alignItems: 'center' }}
                        >{ok ? <Check size={12} /> : <Copy size={12} />}</button>
                    </div>
                ) : (
                    <div className="portal-field-value empty">
                        {value || '— fill manually on portal —'}
                    </div>
                )}
                {note && (
                    <div className={`portal-field-note ${pre ? 'pf-note-filled' : 'pf-note-empty'}`} style={{ color: pre ? 'rgba(16,185,129,0.5)' : 'rgba(255,255,255,0.22)' }}>
                        {pre ? <Check size={10} style={{ display: 'inline', marginRight: 4 }} /> : <AlertTriangle size={10} style={{ display: 'inline', marginRight: 4 }} />}
                        {note}
                    </div>
                )}
            </div>
        </div>
    );
}

function SectionHeader({ number, title, prefilled, total }) {
    return (
        <div className="ev-section-header">
            <div className="ev-section-num">{number}</div>
            <div className="ev-section-title">{title}</div>
            {prefilled > 0 && (
                <div className="ev-section-fill-badge">{prefilled}/{total} filled</div>
            )}
        </div>
    );
}

// ── Form helpers ──────────────────────────────────────────────────
function FInput({ label, placeholder, value, onChange, type = 'text' }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="ev-label">{label}</span>
            <input type={type} className="ev-input" placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
        </div>
    );
}
function FSelect({ label, options, value, onChange }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="ev-label">{label}</span>
            <select className="ev-select" value={value} onChange={e => onChange(e.target.value)}>
                <option value="">— select —</option>
                {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────
export default function Evidence() {
    const [step, setStep] = useState('input');
    const [text, setText] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const fileRef = useRef(null);

    // Initialise with saved profile from localStorage
    const [uf, setUf] = useState(() => {
        const saved = loadProfile();
        return {
            // Incident-specific (always fresh per session)
            incidentDate: '', platform: '', delay: '',
            suspectName: '', consent: false,
            // Complainant profile — loaded from localStorage if available, else use hardcoded defaults
            title: saved.title !== undefined ? saved.title : 'Mr',
            fullName: saved.fullName !== undefined ? saved.fullName : 'Basavaraj Ningasani',
            mobile: saved.mobile !== undefined ? saved.mobile : '7019910124',
            gender: saved.gender !== undefined ? saved.gender : 'Male',
            dob: saved.dob !== undefined ? saved.dob : '2004-10-20',
            familyRelation: saved.familyRelation !== undefined ? saved.familyRelation : 'Father',
            familyName: saved.familyName !== undefined ? saved.familyName : 'Mhantesh Ningasani',
            email: saved.email !== undefined ? saved.email : 'basavarajningasani123@gmail.com',
            houseNo: saved.houseNo !== undefined ? saved.houseNo : '12B',
            street: saved.street !== undefined ? saved.street : 'Navanagara cross',
            colony: saved.colony !== undefined ? saved.colony : 'Navanagar',
            city: saved.city !== undefined ? saved.city : 'BAGALKOT',
            state: saved.state !== undefined ? saved.state : 'Karnataka',
            pincode: saved.pincode !== undefined ? saved.pincode : '587301',
            policeStation: saved.policeStation !== undefined ? saved.policeStation : 'Navanagara Police Station',
        };
    });

    const [profileSaved, setProfileSaved] = useState(false);
    const saveTimerRef = useRef(null);

    const up = (key, val) => setUf(p => ({ ...p, [key]: val }));

    // Auto-save profile fields whenever any profile field changes
    useEffect(() => {
        // Only auto-save if at least one profile field has a non-empty value
        const hasAnyValue = PROFILE_FIELDS.some(k => uf[k]);
        if (!hasAnyValue) return;
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
            saveProfile(uf);
            setProfileSaved(true);
            setTimeout(() => setProfileSaved(false), 2200);
        }, 800); // debounce 800 ms
        return () => clearTimeout(saveTimerRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, PROFILE_FIELDS.map(k => uf[k]));

    const handleDownloadPdf = async () => {
        try {
            setLoading(true);
            const r = await fetch('http://localhost:8000/api/generate-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ guide: mergedGuide }),
            });
            if (!r.ok) throw new Error(`Server error ${r.status}`);
            const blob = await r.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'cybercrime_complaint_guide.pdf';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (e) {
            console.error(e);
            alert('Failed to generate PDF: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleClearProfile = () => {
        clearProfile();
        setUf(p => {
            const reset = { ...p };
            PROFILE_FIELDS.forEach(k => { reset[k] = ''; });
            return reset;
        });
    };

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
            const pg = data.portal_guide;
            const sn = pg?.section2?.fields?.suspect_name?.value;
            setUf(p => ({
                ...p,
                incidentDate: pg?.section1?.fields?.incident_date?.value || '',
                platform: pg?.section1?.fields?.platform?.value || '',
                suspectName: sn && sn !== 'Unknown' ? sn : '',
            }));
            setStep('user_form');
        } catch (e) { setError(e.message); }
        finally { setLoading(false); }
    };


    const pg = result?.portal_guide;

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
                consent: { ...pg.section2.fields.consent, value: uf.consent ? 'Checkbox ticked — consent given' : 'Tick the checkbox', status: uf.consent ? 'user_provided' : 'user_fill' },
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

    const totalProvided = mergedGuide ? Object.values({
        ...(mergedGuide.section1?.fields || {}),
        ...(mergedGuide.section2?.fields || {}),
        ...(mergedGuide.section3?.fields || {})
    }).filter(f => f.status === 'user_provided' || f.status === 'prefilled').length : 0;

    // Steps config
    const STEPS = [
        { id: 'input', Icon: FileText, label: 'Paste & Extract', step: 'Step 1' },
        { id: 'user_form', Icon: ClipboardList, label: 'Add Your Details', step: 'Step 2' },
        { id: 'guide', Icon: BookMarked, label: 'Portal Guide', step: 'Step 3' },
    ];

    // ──────────────────────────────────────────────────────────────
    // RENDER
    // ──────────────────────────────────────────────────────────────
    return (
        <div>
            <div className="page-header">
                <div className="page-label">
                    <FileText size={11} /> AI-Powered Legal Tool
                </div>
                <h1 className="page-title">Evidence <span className="highlight">Structuring Assistant</span></h1>
                <p className="page-subtitle">Paste a suspicious message + optional screenshot. We extract evidence, ask for a few details, and pre-fill the entire cybercrime.gov.in complaint form.</p>
            </div>

            {/* ── STEP INDICATOR ── */}
            <div className="step-indicator">
                {STEPS.map(({ id, Icon, label, step: stepNum }) => {
                    const active = step === id;
                    const done = (id === 'input' && (step === 'user_form' || step === 'guide')) || (id === 'user_form' && step === 'guide');
                    return (
                        <div key={id} className={`step-item ${active ? 'active' : done ? 'done' : ''}`}>
                            <div className="step-item-icon">
                                {done ? <Check size={15} color="var(--safe-light)" /> : <Icon size={15} color={active ? 'var(--accent-light)' : 'var(--text-muted)'} />}
                            </div>
                            <div>
                                <div className={`step-item-num ${active ? 'active-text' : 'muted-text'}`}>{stepNum}</div>
                                <div className={`step-item-label ${active ? 'active-label' : done ? 'done-label' : 'idle-label'}`}>{label}</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ═══════════════ STEP 1: Input ═══════════════════════ */}
            {step === 'input' && (
                <div className="card" style={{ padding: 24, marginBottom: 20 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        <div>
                            <div className="input-label">Paste suspicious message / conversation</div>
                            <textarea
                                className="message-textarea"
                                value={text}
                                onChange={e => setText(e.target.value)}
                                rows={9}
                                style={{ minHeight: 200 }}
                                placeholder={'Paste any suspicious SMS, WhatsApp, or email text here...\n\nTip: Include the full message with all numbers and links visible.'}
                            />
                            <div style={{ marginTop: 10 }}>
                                <div className="samples-label">Try sample evidence</div>
                                <div className="sample-chips">
                                    {SAMPLES.map(s => <button key={s.label} className="sample-chip" onClick={() => setText(s.text)}>{s.label}</button>)}
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="input-label">
                                Upload Screenshot
                                <span style={{ marginLeft: 8, fontSize: 10, color: 'var(--text-muted)', fontWeight: 'normal' }}>optional</span>
                            </div>
                            <div
                                onClick={() => fileRef.current?.click()}
                                onDrop={handleImageDrop}
                                onDragOver={e => e.preventDefault()}
                                style={{
                                    border: `2px dashed ${imagePreview ? 'rgba(59,130,246,0.4)' : 'var(--border)'}`,
                                    borderRadius: 8, cursor: 'pointer', overflow: 'hidden',
                                    height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: 'var(--bg-input)', transition: 'border-color 0.2s',
                                }}
                            >
                                {imagePreview ? (
                                    <img src={imagePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                ) : (
                                    <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                        <Camera size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5 }}>Drop screenshot here<br />or click to browse</div>
                                        <div style={{ fontSize: 10, marginTop: 6, opacity: 0.6 }}>JPG · PNG · WEBP</div>
                                    </div>
                                )}
                                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageDrop} />
                            </div>

                            {imagePreview && (
                                <button onClick={() => { setImageFile(null); setImagePreview(null); }}
                                    style={{ background: 'none', border: 'none', color: 'var(--danger-light)', cursor: 'pointer', fontSize: 11, fontFamily: 'var(--font-mono)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}
                                ><AlertTriangle size={11} /> Remove image</button>
                            )}

                            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <div className="ev-info-chip blue">
                                    <Lock size={11} /> <strong>Analysis</strong> — DeepSeek R1 (local, private)
                                </div>
                                <div className="ev-info-chip purple">
                                    <Eye size={11} /> <strong>OCR</strong> — Gemini Vision (screenshot to text only)
                                </div>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="error-box" style={{ marginTop: 14 }}>
                            <AlertTriangle size={12} style={{ display: 'inline', marginRight: 6 }} />{error}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: 12, marginTop: 20, alignItems: 'center' }}>
                        <div className="analyze-btn-wrap" style={{ flex: 1, maxWidth: 360 }}>
                            <div className="analyze-btn-glow" />
                            <button className="analyze-btn" onClick={analyze} disabled={loading || (!text.trim() && !imageFile)}>
                                {loading ? <><span className="spinner" /> Extracting evidence...</> : <><Microscope size={14} /> Extract Evidence — Step 1 of 3</>}
                            </button>
                        </div>
                        <div style={{ fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.7 }}>
                            Extracts entities · Pre-fills portal fields<br />Your data never leaves your machine.
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════ STEP 2: User Details Form ═══════ */}
            {step === 'user_form' && result && (
                <>
                    {/* Summary bar */}
                    <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
                        {[
                            { label: 'Category', val: result.category, color: 'var(--accent-light)' },
                            { label: 'Entities', val: `${result.entity_count} found`, color: 'var(--safe-light)' },
                            { label: 'AI', val: result.powered_by?.includes('DeepSeek') ? 'DeepSeek (Local)' : 'Gemini', color: 'var(--text-secondary)' },
                        ].map(b => (
                            <div key={b.label} className="summary-stat-box">
                                <div className="summary-stat-label">{b.label}</div>
                                <div className="summary-stat-value" style={{ color: b.color }}>{b.val}</div>
                            </div>
                        ))}
                        <button onClick={() => { setStep('input'); setResult(null); }} className="btn-ghost" style={{ marginLeft: 'auto' }}>← Re-extract</button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                        {/* LEFT: Incident + Suspect */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div className="card" style={{ padding: 20 }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <CalendarDays size={12} /> Section 1 — Incident Details
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <FSelect label="Delay in Reporting *" options={['Yes', 'No']} value={uf.delay} onChange={v => up('delay', v)} />
                                    <FInput label="Incident Date (if you know it)" placeholder="e.g. 03/03/2026" value={uf.incidentDate} onChange={v => up('incidentDate', v)} />
                                    <FSelect label="Platform / Where it happened" options={PLATFORMS} value={uf.platform} onChange={v => up('platform', v)} />
                                </div>
                            </div>

                            <div className="card" style={{ padding: 20 }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <User size={12} /> Section 2 — Suspect Details
                                </div>
                                {pg.section2.identifiers.length > 0 && (
                                    <div className="extracted-ids-block">
                                        <div className="extracted-ids-title">
                                            <Check size={11} style={{ display: 'inline', marginRight: 4 }} />
                                            {pg.section2.identifiers.length} Identifiers Extracted Automatically
                                        </div>
                                        {pg.section2.identifiers.map((id, i) => (
                                            <div key={i} className="identifier-row">
                                                <span className="id-type-badge">{id.type}</span>
                                                <span className="id-value">{id.value}</span>
                                                <CopyBtn text={id.value} />
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <FInput label="Suspect Name (if known)" placeholder="Leave blank if unknown" value={uf.suspectName} onChange={v => up('suspectName', v)} />
                                    <label className="consent-row">
                                        <input type="checkbox" checked={uf.consent} onChange={e => up('consent', e.target.checked)} style={{ width: 15, height: 15, accentColor: 'var(--accent)' }} />
                                        <span className="consent-text">I consent to share suspect information with investigating agencies</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Complainant Details */}
                        <div className="card" style={{ padding: 20 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <User size={12} /> Section 3 — Your Details (Complainant)
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                                    Fill what you can — more you provide, the more complete your portal guide will be.
                                    <span style={{ color: 'var(--safe-light)', marginLeft: 4 }}>All optional for the guide.</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                                    <span style={{ fontSize: 10, color: profileSaved ? 'var(--safe-light)' : 'transparent', transition: 'color 0.3s', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <Check size={10} /> Profile auto-saved
                                    </span>
                                    {PROFILE_FIELDS.some(k => uf[k]) && (
                                        <button onClick={handleClearProfile} className="btn-ghost" style={{ padding: '4px 8px', fontSize: 10, height: 'auto', background: 'rgba(239,68,68,0.05)', color: 'var(--danger-light)' }}>
                                            Clear Profile
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 10 }}>
                                    <FSelect label="Title" options={TITLES} value={uf.title} onChange={v => up('title', v)} />
                                    <FInput label="Full Name" placeholder="Your full name" value={uf.fullName} onChange={v => up('fullName', v)} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                    <FInput label="Mobile Number" placeholder="10-digit mobile" value={uf.mobile} onChange={v => up('mobile', v)} />
                                    <FSelect label="Gender" options={GENDERS} value={uf.gender} onChange={v => up('gender', v)} />
                                </div>
                                <FInput label="Date of Birth" type="date" placeholder="" value={uf.dob} onChange={v => up('dob', v)} />
                                <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: 10 }}>
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
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px', gap: 10 }}>
                                    <FInput label="State" placeholder="" value={uf.state} onChange={v => up('state', v)} />
                                    <FInput label="Pincode" placeholder="" value={uf.pincode} onChange={v => up('pincode', v)} />
                                </div>
                                <FInput label="Nearest Police Station" placeholder="e.g. Koramangala PS" value={uf.policeStation} onChange={v => up('policeStation', v)} />
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: 18, display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div className="analyze-btn-wrap" style={{ flex: 1, maxWidth: 380 }}>
                            <button className="analyze-btn" onClick={() => setStep('guide')}>
                                <BookMarked size={14} /> Generate Complete Portal Filing Guide
                            </button>
                        </div>
                        <div style={{ fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.7 }}>
                            All unfilled fields will be marked<br />"fill manually" on the portal.
                        </div>
                    </div>
                </>
            )}

            {/* ═══════════════ STEP 3: Complete Portal Guide ═══════ */}
            {step === 'guide' && result && mergedGuide && (
                <>
                    <div className="guide-header">
                        <div className="guide-header-icon">
                            <BookMarked size={20} color="var(--accent-light)" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div className="guide-header-title">Complete cybercrime.gov.in Filing Guide</div>
                            <div className="guide-header-sub">
                                <span className="filled-count">{totalProvided} fields filled</span>
                                {' · '}
                                <span className="id-count">{mergedGuide.summary.identifiers_found} suspect identifier(s)</span>
                                {' · '}
                                <span>Green = auto-filled · Blue = you provided · Dashed = fill on portal</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => setStep('user_form')} className="btn-ghost">← Edit Details</button>
                            <button onClick={handleDownloadPdf} className="btn-ghost" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-light)' }}>
                                <FileText size={11} style={{ display: 'inline', marginRight: 4 }} />
                                Save as PDF
                            </button>
                            <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="btn-secondary-link">
                                Open Portal <ExternalLink size={11} style={{ display: 'inline', marginLeft: 4 }} />
                            </a>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.05fr', gap: 18 }}>
                        {/* LEFT: Entities + AI */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {/* Analysis Summary */}
                            <div className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 18 }}>
                                <div>
                                    <div style={{ fontSize: 9.5, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Identified Category</div>
                                    <span style={{ background: 'var(--accent-dim)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 20, padding: '4px 12px', fontSize: 11.5, color: 'var(--accent-light)', fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase', display: 'inline-block' }}>{result.category}</span>
                                </div>
                                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 26, fontWeight: 700, color: 'var(--text-primary)' }}>{result.entity_count}</div>
                                    <div style={{ fontSize: 9.5, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase' }}>Entities Found</div>
                                </div>
                            </div>

                            {/* Entities */}
                            <div className="card" style={{ padding: 20 }}>
                                <div className="section-title">
                                    <Microscope size={13} /> Extracted Forensic Evidence
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {ENTITY_CONFIG.map(cfg => {
                                        const items = result.entities?.[cfg.key] || [];
                                        const Icon = cfg.Icon;
                                        return (
                                            <div key={cfg.key} style={{ borderBottom: '1px solid var(--border-muted)', paddingBottom: 10 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                                                    <span style={{ fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase', color: cfg.color, fontWeight: 700, fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: 5 }}>
                                                        <Icon size={11} /> {cfg.label}
                                                    </span>
                                                    <span style={{ fontSize: 10, color: items.length > 0 ? cfg.color : 'var(--text-muted)', background: items.length > 0 ? `${cfg.color}14` : 'transparent', padding: '1px 7px', borderRadius: 10, fontFamily: 'var(--font-mono)', border: items.length > 0 ? `1px solid ${cfg.color}28` : 'none' }}>{items.length} found</span>
                                                </div>
                                                {items.length > 0
                                                    ? <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                                                        {items.map(item => (
                                                            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 4, background: `${cfg.color}10`, border: `1px solid ${cfg.color}25`, borderRadius: 4, padding: '3px 9px' }}>
                                                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: cfg.color, fontWeight: 600 }}>{item}</span>
                                                                <CopyBtn text={item} />
                                                            </div>
                                                        ))}
                                                    </div>
                                                    : <div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontStyle: 'italic', fontFamily: 'var(--font-mono)' }}>{cfg.emptyMsg}</div>
                                                }
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* AI Explanation */}
                            <div className="card explanation-block" style={{ padding: 20 }}>
                                <div className="explanation-badge">
                                    {result.powered_by?.includes('DeepSeek') ? 'Local AI (DeepSeek R1)' : 'Rule Engine'}
                                    <span style={{ marginLeft: 10, fontSize: 10, opacity: 0.5, fontStyle: 'normal', fontWeight: 'normal', textTransform: 'none' }}>Source: {result.powered_by}</span>
                                </div>
                                <div className="explanation-text">"{result.explanation}"</div>
                                {result.matched_patterns?.length > 0 && (
                                    <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                                        {result.matched_patterns.map(p => <span key={p} className="pattern-chip" style={{ fontSize: 10 }}><AlertTriangle size={9} style={{ display: 'inline', marginRight: 3 }} />{p}</span>)}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT: Portal Sections */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {/* Legend */}
                            <div className="legend-row">
                                {[
                                    ['rgba(16,185,129,0.5)', 'rgba(16,185,129,0.1)', 'var(--safe-light)', 'Auto pre-filled'],
                                    ['rgba(59,130,246,0.5)', 'rgba(59,130,246,0.1)', 'var(--accent-light)', 'You provided'],
                                    ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.03)', 'var(--text-muted)', 'Fill on portal'],
                                ].map(([bc, bg, tc, lab]) => (
                                    <div key={lab} className="legend-item">
                                        <div className="legend-dot" style={{ border: `1px solid ${bc}`, background: bg }} />
                                        <span style={{ color: tc }}>{lab}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Section 1 */}
                            <div className="card" style={{ padding: 20 }}>
                                <SectionHeader number="1" title={mergedGuide.section1.title}
                                    prefilled={Object.values(mergedGuide.section1.fields).filter(f => f.status === 'prefilled' || f.status === 'user_provided').length}
                                    total={Object.keys(mergedGuide.section1.fields).length} />
                                {Object.entries(mergedGuide.section1.fields).map(([k, f]) => <PortalField key={k} label={f.label} value={f.value} status={f.status} note={f.note} />)}
                            </div>

                            {/* Section 2 */}
                            <div className="card" style={{ padding: 20 }}>
                                <SectionHeader number="2" title={mergedGuide.section2.title}
                                    prefilled={mergedGuide.summary.identifiers_found + (uf.consent ? 1 : 0) + (uf.suspectName ? 1 : 0)}
                                    total={mergedGuide.summary.identifiers_found + Object.keys(mergedGuide.section2.fields).length} />
                                {mergedGuide.section2.identifiers.length > 0 && (
                                    <div style={{ marginBottom: 14 }}>
                                        <div className="extracted-ids-title" style={{ marginBottom: 8 }}>
                                            <Check size={11} style={{ display: 'inline', marginRight: 4 }} /> Suspect Identifiers — Copy & Add in Portal
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                            {mergedGuide.section2.identifiers.map((id, i) => (
                                                <div key={i} className="identifier-row" style={{ padding: '7px 12px', background: 'var(--safe-dim)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 6 }}>
                                                    <span className="id-type-badge">{id.type}</span>
                                                    <span className="id-value">{id.value}</span>
                                                    <CopyBtn text={id.value} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {Object.entries(mergedGuide.section2.fields).map(([k, f]) => <PortalField key={k} label={f.label} value={f.value} status={f.status} note={f.note} />)}
                            </div>

                            {/* Section 3 */}
                            <div className="card" style={{ padding: 20 }}>
                                <SectionHeader number="3" title={mergedGuide.section3.title}
                                    prefilled={Object.values(mergedGuide.section3.fields).filter(f => f.status === 'user_provided').length}
                                    total={Object.keys(mergedGuide.section3.fields).length} />
                                {Object.entries(mergedGuide.section3.fields).map(([k, f]) => <PortalField key={k} label={f.label} value={f.value} status={f.status} note={f.note} />)}
                            </div>

                            {/* File CTA */}
                            <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="cta-link">
                                <BookMarked size={15} style={{ display: 'inline', marginRight: 8 }} />
                                Open cybercrime.gov.in & Start Filing
                                <span className="cta-link-sub">— use this guide while filling</span>
                            </a>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
