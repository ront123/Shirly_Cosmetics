import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Search, Plus, Phone, Calendar, MoreVertical, TrendingUp,
  X, Upload, ChevronDown, Check, FileSpreadsheet, UserPlus,
  Star, Mail, MapPin, ChevronRight, Users
} from 'lucide-react';
import * as XLSX from 'xlsx';
import REAL_CLIENTS from '../data/clients.json';
import { fetchClients } from '../utils/api';
import ClientPanel from '../components/ClientPanel';


/* ─── Helpers ─────────────────────────────────────────────── */
function xlDate(serial) {
  if (!serial || serial === '') return '';
  return new Date((serial - 25569) * 86400 * 1000).toISOString().slice(0, 10);
}

function hueFromName(name = '') {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 360;
  return h;
}

function formatPhone(p) {
  if (!p) return '';
  const s = String(p).replace(/\D/g, '');
  if (s.length === 10) return s.slice(0, 3) + '-' + s.slice(3);
  return s;
}

function fmtDate(d) {
  if (!d) return '—';
  const dt = new Date(d);
  if (isNaN(dt)) return d;
  return dt.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

/* ─── Field definitions ──────────────────────────────────── */
const CLIENT_FIELDS = [
  { key: 'name',       label: 'שם מלא',         required: true  },
  { key: 'phone',      label: 'טלפון',           required: true  },
  { key: 'gender',     label: 'מגדר',            required: false },
  { key: 'balance',    label: 'יתרת לקוח',       required: false },
  { key: 'email',      label: 'אימייל',          required: false },
  { key: 'birthday',   label: 'יום הולדת',       required: false },
  { key: 'lastVisit',  label: 'ביקור אחרון',     required: false },
  { key: 'visits',     label: 'מספר ביקורים',    required: false },
  { key: 'avgInvoice', label: 'חשבונית ממוצעת',  required: false },
  { key: 'address',    label: 'כתובת',           required: false },
  { key: 'notes',      label: 'הערות',           required: false },
];

// Patterns for auto-detecting Easy Busy / common column names
const COL_PATTERNS = {
  name:       [/^name$/i, /שם/],
  phone:      [/mobile|phone|טל|נייד/i],
  gender:     [/gender|sex|מגדר|מין/i],
  balance:    [/balance|debt|יתרה|חוב/i],
  email:      [/email|mail|אימייל/i],
  birthday:   [/birth|dateofbirth|לידה|יום הולדת/i],
  lastVisit:  [/lastvisit|last.visit|ביקור/i],
  visits:     [/numberofvisits|visits|ביקורים/i],
  avgInvoice: [/avarainvoice|average|invoice|חשבונית/i],
  address:    [/address|כתובת/i],
  notes:      [/note|comment|הערה/i],
};

const FILTERS = [
  { key: 'all',      label: 'כולן'   },
  { key: 'active',   label: 'פעילות' },
  { key: 'inactive', label: 'רדומות' },
  { key: 'birthday', label: '🎂 יום הולדת החודש' },
];



/* ══════════════════════════════════════════════════════════
   NEW CLIENT MODAL
══════════════════════════════════════════════════════════ */
function NewClientModal({ onClose, onSave }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', birthday: '', notes: '', gender: '', balance: '' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name  = 'שם חובה';
    if (!form.phone.trim()) e.phone = 'טלפון חובה';
    return e;
  };

  const save = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    const hue = hueFromName(form.name.trim());
    onSave({
      id:        Date.now(),
      name:      form.name.trim(),
      phone:     formatPhone(form.phone),
      email:     form.email,
      birthday:  form.birthday,
      notes:     form.notes,
      gender:    form.gender,
      balance:   parseFloat(form.balance) || 0,
      initials:  form.name.trim()[0] || '?',
      lastVisit: new Date().toISOString().slice(0, 10),
      visits:    0,
      avgInvoice:0,
      spent:     '₪0',
      status:    'active',
      hue,
    });
    onClose();
  };

  const field = (key, label, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
        {label}{['name','phone'].includes(key) && <span style={{ color: 'var(--accent)' }}> *</span>}
      </label>
      <input type={type} className="input-dark" placeholder={placeholder}
        value={form[key]}
        onChange={e => { setForm(f => ({ ...f, [key]: e.target.value })); setErrors(ev => ({ ...ev, [key]: undefined })); }}
        style={errors[key] ? { borderColor: 'var(--accent)' } : {}} />
      {errors[key] && <p style={{ fontSize: 11, color: 'var(--accent)', marginTop: 3 }}>{errors[key]}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full" style={{ maxWidth: 480, margin: '0 16px' }}>
        <div className="card overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3">
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--accent-light)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserPlus size={16} style={{ color: 'var(--accent)' }} />
              </div>
              <h3 className="font-black" style={{ color: 'var(--text-primary)' }}>לקוחה חדשה</h3>
            </div>
            <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }}>✕</button>
          </div>
          <div className="px-6 py-5 space-y-4">
            {field('name',     'שם מלא',    'text', 'לדוגמא: שרה כהן')}
            {field('phone',    'טלפון',     'tel',  '050-0000000')}
            {field('gender',   'מגדר',      'text', 'נקבה / זכר')}
            {field('balance',  'יתרת לקוח',  'number', '0')}
            {field('email',    'אימייל',    'email', 'example@mail.com')}
            {field('birthday', 'יום הולדת', 'date')}
            {field('notes',    'הערות',     'text', 'אלרגיות, העדפות...')}
          </div>
          <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: '1px solid var(--border)' }}>
            <button onClick={onClose} className="btn-ghost">ביטול</button>
            <button onClick={save} className="btn-primary"><UserPlus size={14} /> הוספת לקוחה</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   EXCEL IMPORT MODAL
══════════════════════════════════════════════════════════ */
function ExcelImportModal({ onClose, onImport }) {
  const [step,     setStep]     = useState('upload');
  const [headers,  setHeaders]  = useState([]);
  const [rows,     setRows]     = useState([]);
  const [rawRows,  setRawRows]  = useState([]); // raw for serial-date detection
  const [mapping,  setMapping]  = useState({});
  const [dragging, setDragging] = useState(false);
  const [isSerial, setIsSerial] = useState({}); // which mapped cols look like Excel serials
  const fileRef = useRef();

  const detectSerialCols = (hdrs, rawData, map) => {
    const s = {};
    for (const [field, idx] of Object.entries(map)) {
      if (idx === undefined) continue;
      const sample = rawData.slice(0,5).map(r => r[idx]).filter(v => v !== '');
      if (sample.length && sample.every(v => typeof v === 'number' && v > 40000 && v < 60000)) {
        s[field] = true;
      }
    }
    setIsSerial(s);
  };

  const parseFile = (file) => {
    const reader = new FileReader();
    reader.onload = e => {
      const wb = XLSX.read(e.target.result, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      // Raw with numbers
      const rawData = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', raw: true });
      if (!rawData || rawData.length < 2) return;
      const hdrs = rawData[0].map(h => String(h));
      const body = rawData.slice(1).filter(r => r.some(c => c !== ''));
      setHeaders(hdrs);
      setRawRows(body);

      // String version for preview
      const strData = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', raw: false });
      setRows(strData.slice(1).filter(r => r.some(c => c !== '')));

      // Auto-map columns
      const autoMap = {};
      hdrs.forEach((h, idx) => {
        for (const [key, rxList] of Object.entries(COL_PATTERNS)) {
          if (autoMap[key] === undefined && rxList.some(rx => rx.test(h))) {
            autoMap[key] = idx;
          }
        }
      });
      setMapping(autoMap);
      detectSerialCols(hdrs, body, autoMap);
      setStep('map');
    };
    reader.readAsArrayBuffer(file);
  };

  const onDrop = useCallback(e => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) parseFile(f);
  }, []);

  const getValue = (row, rawRow, fieldKey) => {
    const idx = mapping[fieldKey];
    if (idx === undefined) return '';
    const val = rawRow[idx];
    if (isSerial[fieldKey] && typeof val === 'number') return xlDate(val);
    return String(row[idx] ?? '');
  };

  const previewRows = rawRows.slice(0, 5).map((rawRow, i) => {
    const obj = {};
    CLIENT_FIELDS.forEach(f => { obj[f.key] = getValue(rows[i] || [], rawRow, f.key); });
    return obj;
  });

  const doImport = () => {
    const imported = rawRows.map((rawRow, i) => {
      const row = rows[i] || [];
      const name  = getValue(row, rawRow, 'name').trim();
      const phone = formatPhone(getValue(row, rawRow, 'phone'));
      if (!name && !phone) return null;
      const visits     = parseInt(getValue(row, rawRow, 'visits')) || 0;
      const avgInvoice = parseFloat(getValue(row, rawRow, 'avgInvoice')) || 0;
      const lastVisit  = getValue(row, rawRow, 'lastVisit');
      const daysSince  = lastVisit
        ? (new Date() - new Date(lastVisit)) / (1000*60*60*24)
        : 999;
      const hue = hueFromName(name);
      return {
        id:          Date.now() + i,
        name,
        phone,
        email:       getValue(row, rawRow, 'email'),
        birthday:    getValue(row, rawRow, 'birthday'),
        lastVisit,
        address:     getValue(row, rawRow, 'address'),
        notes:       getValue(row, rawRow, 'notes'),
        gender:      getValue(row, rawRow, 'gender'),
        balance:     parseFloat(getValue(row, rawRow, 'balance')) || 0,
        initials:    name[0] || '?',
        visits,
        avgInvoice:  Math.round(avgInvoice),
        spent:       '₪' + Math.round(avgInvoice * visits).toLocaleString('he-IL'),
        status:      daysSince < 90 ? 'active' : 'inactive',
        hue,
      };
    }).filter(Boolean);
    onImport(imported);
    onClose();
  };

  const mappedFields = CLIENT_FIELDS.filter(f => mapping[f.key] !== undefined);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full" style={{ maxWidth: 700, margin: '0 16px' }}>
        <div className="card overflow-hidden" style={{ background: 'var(--bg-surface)' }}>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3">
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'color-mix(in srgb,var(--teal) 15%,transparent)', border: '1px solid color-mix(in srgb,var(--teal) 30%,transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileSpreadsheet size={16} style={{ color: 'var(--teal)' }} />
              </div>
              <div>
                <h3 className="font-black" style={{ color: 'var(--text-primary)' }}>ייבוא מאקסל</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {step === 'upload' ? 'תומך בקבצי Easy Busy, Excel ו-CSV' : step === 'map' ? `${rows.length} שורות נמצאו — מיפוי עמודות` : `${rows.length} לקוחות מוכנות לייבוא`}
                </p>
              </div>
            </div>
            <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }}>✕</button>
          </div>

          {/* Step tabs */}
          <div className="flex" style={{ borderBottom: '1px solid var(--border)' }}>
            {[['upload','📤 העלאה'],['map','🔗 מיפוי'],['preview','✅ אישור']].map(([s, label]) => (
              <div key={s} style={{
                padding: '10px 20px', fontSize: 12, fontWeight: 700,
                color: step === s ? 'var(--accent)' : 'var(--text-faint)',
                borderBottom: step === s ? '2px solid var(--accent)' : '2px solid transparent',
              }}>{label}</div>
            ))}
          </div>

          <div className="px-6 py-5" style={{ maxHeight: '55vh', overflowY: 'auto' }}>

            {/* ── STEP 1: Upload ── */}
            {step === 'upload' && (
              <div>
                <div
                  onDragOver={e => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                  onClick={() => fileRef.current.click()}
                  style={{
                    border: `2px dashed ${dragging ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 16, padding: '52px 24px', textAlign: 'center', cursor: 'pointer',
                    background: dragging ? 'var(--accent-light)' : 'var(--bg-elevated)',
                    transition: 'all 0.2s ease',
                  }}>
                  <Upload size={40} style={{ color: dragging ? 'var(--accent)' : 'var(--text-faint)', margin: '0 auto 16px' }} />
                  <p className="font-bold" style={{ color: 'var(--text-primary)', marginBottom: 6 }}>גררי קובץ לכאן או לחצי לבחירה</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>קבצי .xlsx, .xls, .csv — כולל ייצוא מ-Easy Busy</p>
                  <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }}
                    onChange={e => e.target.files[0] && parseFile(e.target.files[0])} />
                </div>
                <div className="mt-4 rounded-xl p-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                  <p className="font-bold text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>💡 עמודות שמזוהות אוטומטית מ-Easy Busy:</p>
                  <div className="flex flex-wrap gap-2">
                    {['Name', 'MobileFirst', 'EmailAddress', 'DateOfBirth', 'LastVisit', 'NumberOfVisits', 'AvarageInvoice', 'Address'].map(c => (
                      <span key={c} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 5, background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{c}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 2: Mapping ── */}
            {step === 'map' && (
              <div className="space-y-4">
                <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: 'color-mix(in srgb,var(--teal) 8%,transparent)', border: '1px solid color-mix(in srgb,var(--teal) 25%,transparent)' }}>
                  <FileSpreadsheet size={18} style={{ color: 'var(--teal)', flexShrink: 0, marginTop: 2 }} />
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    נמצאו <strong style={{ color: 'var(--text-primary)' }}>{rows.length} שורות</strong> ו-<strong style={{ color: 'var(--text-primary)' }}>{headers.length} עמודות</strong>.
                    העמודות הממופות אוטומטית מסומנות ב-✅. שני הנ ל חובה לפחות: שם + טלפון.
                  </p>
                </div>
                <table className="w-full text-right">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <th className="pb-3 font-bold text-sm" style={{ color: 'var(--text-secondary)' }}>שדה במערכת</th>
                      <th className="pb-3 font-bold text-sm" style={{ color: 'var(--text-secondary)' }}>עמודה בקובץ</th>
                      <th className="pb-3 font-bold text-sm" style={{ color: 'var(--text-secondary)' }}>דוגמא</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CLIENT_FIELDS.map(f => {
                      const idx = mapping[f.key];
                      const sampleVal = idx !== undefined && rawRows[0]
                        ? (isSerial[f.key] ? xlDate(rawRows[0][idx]) : String(rows[0]?.[idx] ?? ''))
                        : '';
                      return (
                        <tr key={f.key} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td className="py-3 font-semibold text-sm pr-0" style={{ color: 'var(--text-primary)' }}>
                            {idx !== undefined ? '✅ ' : ''}{f.label}
                            {f.required && <span style={{ color: 'var(--accent)' }}> *</span>}
                          </td>
                          <td className="py-3">
                            <div className="relative">
                              <select
                                value={idx ?? ''}
                                onChange={e => {
                                  const v = e.target.value === '' ? undefined : Number(e.target.value);
                                  const newMap = { ...mapping, [f.key]: v };
                                  setMapping(newMap);
                                  detectSerialCols(headers, rawRows, newMap);
                                }}
                                style={{ width: '100%', appearance: 'none', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 12px', color: 'var(--text-primary)', fontSize: 13, cursor: 'pointer', fontFamily: 'Heebo,sans-serif' }}>
                                <option value="">-- לא ממופה --</option>
                                {headers.map((h, i) => (<option key={i} value={i}>{h}</option>))}
                              </select>
                              <ChevronDown size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                            </div>
                          </td>
                          <td className="py-3 text-sm" style={{ color: 'var(--text-muted)', direction: 'ltr', textAlign: 'left' }}>
                            {sampleVal || '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── STEP 3: Preview ── */}
            {step === 'preview' && (
              <div className="space-y-4">
                <div className="rounded-xl p-4" style={{ background: 'color-mix(in srgb,var(--green) 8%,transparent)', border: '1px solid color-mix(in srgb,var(--green) 25%,transparent)' }}>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    ✅ מוכן לייבוא <strong style={{ color: 'var(--green)' }}>{rows.length}</strong> לקוחות. תצוגה מקדימה של 5 ראשונות:
                  </p>
                </div>
                <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--border)' }}>
                  <table className="w-full text-right text-sm whitespace-nowrap">
                    <thead style={{ background: 'var(--bg-elevated)' }}>
                      <tr>
                        {mappedFields.map(f => <th key={f.key} className="p-3 font-bold" style={{ color: 'var(--text-secondary)' }}>{f.label}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {previewRows.map((r, i) => (
                        <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                          {mappedFields.map(f => (
                            <td key={f.key} className="p-3" style={{ color: 'var(--text-primary)' }} dir={f.key === 'phone' || f.key === 'email' ? 'ltr' : 'rtl'}>
                              {r[f.key] || '—'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {rows.length > 5 && <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>מוצגות 5 מתוך {rows.length} שורות</p>}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: '1px solid var(--border)' }}>
            <button onClick={() => {
              if (step === 'map') setStep('upload');
              else if (step === 'preview') setStep('map');
              else onClose();
            }} className="btn-ghost">
              {step === 'upload' ? 'ביטול' : '← חזור'}
            </button>
            {step === 'upload' && <p style={{ fontSize: 12, color: 'var(--text-faint)' }}>בחרי קובץ כדי להמשיך</p>}
            {step === 'map' && (
              <button className="btn-primary"
                onClick={() => setStep('preview')}
                disabled={mapping.name === undefined && mapping.phone === undefined}
                style={{ opacity: (mapping.name === undefined && mapping.phone === undefined) ? 0.5 : 1 }}>
                תצוגה מקדימה →
              </button>
            )}
            {step === 'preview' && (
              <button className="btn-primary" onClick={doImport}
                style={{ background: 'var(--green)', boxShadow: '0 2px 12px rgba(74,222,128,0.35)' }}>
                <Check size={14} /> ייבא {rows.length} לקוחות
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SEND GROUP MESSAGE MODAL
══════════════════════════════════════════════════════════ */
function SendGroupMessageModal({ selectedClients, onClose, onClearSelection }) {
  const [template, setTemplate] = useState('היי [שם_הלקוחה], מה שלומך? 🌸\nרציתי להציע לך...');
  const [sentStatus, setSentStatus] = useState({}); // client.id -> boolean

  const handleSendSingle = (client) => {
    const cleanPhone = client.phone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('0') ? '972' + cleanPhone.slice(1) : cleanPhone;
    const msgText = template.replace(/\[שם(?:[ _]ה?לקוחה?)?\]/g, client.name);
    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msgText)}`;
    window.open(url, '_blank');
    setSentStatus(prev => ({ ...prev, [client.id]: true }));
  };

  const handleSendAll = () => {
    let delay = 0;
    selectedClients.forEach(client => {
      setTimeout(() => {
        const cleanPhone = client.phone.replace(/\D/g, '');
        const formattedPhone = cleanPhone.startsWith('0') ? '972' + cleanPhone.slice(1) : cleanPhone;
        const msgText = template.replace(/\[שם(?:[ _]ה?לקוחה?)?\]/g, client.name);
        const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msgText)}`;
        window.open(url, '_blank');
        setSentStatus(prev => ({ ...prev, [client.id]: true }));
      }, delay);
      delay += 1200; // 1.2s delay to prevent browser blockages
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full" style={{ maxWidth: 560, margin: '0 16px' }}>
        <div className="card overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3">
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--accent-light)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mail size={16} style={{ color: 'var(--accent)' }} />
              </div>
              <h3 className="font-black" style={{ color: 'var(--text-primary)' }}>שליחת הודעה קבוצתית</h3>
            </div>
            <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }}>✕</button>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>תוכן ההודעה</label>
              <textarea className="input-dark resize-none font-sans" rows={5}
                value={template}
                onChange={e => setTemplate(e.target.value)}
                placeholder="הקלד את ההודעה כאן..."
                style={{ direction: 'rtl', width: '100%' }}
              />
              <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 4 }}>💡 השתמש בתג <b>[שם_הלקוחה]</b> כדי להחליף אוטומטית בשם הלקוחה.</p>
            </div>
            
            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>
                רשימת נמענים ({selectedClients.length})
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {selectedClients.map(client => (
                  <div key={client.id} className="flex items-center justify-between p-2.5 rounded-xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                    <div>
                      <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{client.name}</span>
                      <span className="text-xs block" style={{ color: 'var(--text-muted)', marginTop: 2 }} dir="ltr">{client.phone}</span>
                    </div>
                    <button 
                      onClick={() => handleSendSingle(client)}
                      className="btn-ghost"
                      style={{ fontSize: 12, padding: '4px 10px', height: 'auto', background: sentStatus[client.id] ? 'var(--green-light)' : 'transparent', color: sentStatus[client.id] ? 'var(--green)' : 'var(--text-secondary)', borderColor: sentStatus[client.id] ? 'var(--green-border)' : 'var(--border)' }}
                    >
                      {sentStatus[client.id] ? '✓ נפתח' : 'פתח צ\'אט'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="rounded-xl p-3 text-xs" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', color: 'var(--amber)', lineHeight: 1.5 }}>
              ⚠️ שים לב: פתיחת מספר צ'אטים במקביל תפתח כרטיסיות חדשות בדפדפן. אם הדפדפן חוסם חלונות קופצים (Pop-ups), יש לאשר פתיחת פופ-אפים מהאתר הנוכחי.
            </div>
          </div>
          <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: '1px solid var(--border)' }}>
            <button onClick={onClose} className="btn-ghost">סגור</button>
            <div className="flex gap-2">
              <button 
                onClick={handleSendAll}
                className="btn-primary" 
                style={{ background: '#25d366', color: '#fff', border: 'none', boxShadow: '0 2px 10px rgba(37,211,102,0.3)' }}
              >
                פתח את כל הצ'אטים
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════ */
export default function ClientsList() {
  const [clients,     setClients]     = useState(REAL_CLIENTS);
  const [search,      setSearch]      = useState('');
  const [filter,      setFilter]      = useState('all');
  const [showNew,     setShowNew]     = useState(false);
  const [showImport,  setShowImport]  = useState(false);
  const [selected,    setSelected]    = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showGroupMsg, setShowGroupMsg] = useState(false);
  const [groupClients, setGroupClients] = useState([]);

  useEffect(() => {
    fetchClients()
      .then(data => {
        if (data && data.length > 0) {
          setClients(data);
        }
      })
      .catch(err => console.error('Failed to fetch clients:', err));
  }, []);

  const addClient = (c)   => setClients(p => [c, ...p]);
  const addBulk   = (arr) => setClients(arr); // replace with imported

  const thisMonth = new Date().getMonth() + 1;

  const visible = clients.filter(c => {
    const matchSearch = 
      c.name.toLowerCase().includes(search.toLowerCase()) || 
      c.phone.includes(search) || 
      (c.email || '').toLowerCase().includes(search.toLowerCase());
    let matchFilter = true;
    if (filter === 'active')   matchFilter = c.status === 'active';
    if (filter === 'inactive') matchFilter = c.status === 'inactive';
    if (filter === 'birthday') {
      const bday = c.birthday ? parseInt(c.birthday.slice(5,7)) : 0;
      matchFilter = bday === thisMonth;
    }
    return matchSearch && matchFilter;
  });

  const handleSelectClient = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    const allVisibleSelected = visible.length > 0 && visible.every(c => selectedIds.has(c.id));
    if (allVisibleSelected) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        visible.forEach(c => next.delete(c.id));
        return next;
      });
    } else {
      setSelectedIds(prev => {
        const next = new Set(prev);
        visible.forEach(c => next.add(c.id));
        return next;
      });
    }
  };

  const stats = {
    total:    clients.length,
    active:   clients.filter(c => c.status === 'active').length,
    inactive: clients.filter(c => c.status === 'inactive').length,
    birthday: clients.filter(c => c.birthday && parseInt(c.birthday.slice(5,7)) === thisMonth).length,
  };

  return (
    <div dir="rtl" className="space-y-5">
      {showNew    && <NewClientModal   onClose={() => setShowNew(false)}    onSave={addClient} />}
      {showImport && <ExcelImportModal onClose={() => setShowImport(false)} onImport={addBulk} />}
      {selected   && <ClientPanel client={selected} onClose={() => setSelected(null)} />}
      {showGroupMsg && (
        <SendGroupMessageModal 
          selectedClients={groupClients} 
          onClose={() => setShowGroupMsg(false)} 
          onClearSelection={() => {
            setSelectedIds(new Set());
            setShowGroupMsg(false);
          }}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-black text-xl" style={{ color: 'var(--text-primary)' }}>לקוחות</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{clients.length} לקוחות רשומות</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowImport(true)} className="btn-ghost" style={{ gap: 6 }}>
            <FileSpreadsheet size={14} /> ייבא מאקסל
          </button>
          <button onClick={() => setShowNew(true)} className="btn-primary">
            <Plus size={15} /> לקוחה חדשה
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'סה"כ לקוחות',     val: stats.total,    color: 'var(--teal)',   key: 'all'      },
          { label: 'פעילות',           val: stats.active,   color: 'var(--green)',  key: 'active'   },
          { label: 'רדומות',           val: stats.inactive, color: 'var(--accent)', key: 'inactive' },
          { label: '🎂 יום הולדת החודש', val: stats.birthday, color: 'var(--amber)',  key: 'birthday' },
        ].map(s => (
          <button key={s.key} onClick={() => setFilter(s.key)}
            className="card p-4 text-center transition-all"
            style={{ cursor: 'pointer', border: filter === s.key ? `1.5px solid ${s.color}` : '1px solid var(--border)' }}>
            <p className="font-black text-3xl" style={{ color: s.color }}>{s.val}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
          </button>
        ))}
      </div>

      {/* Search + filter bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)', pointerEvents: 'none' }} />
          <input className="input-dark" style={{ paddingRight: 36 }}
            placeholder="חיפוש לפי שם, טלפון או אימייל…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex" style={{ gap: 3, background: 'var(--bg-surface)', borderRadius: 12, padding: 4, border: '1px solid var(--border)' }}>
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className="font-bold text-xs"
              style={{ padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'Heebo,sans-serif', background: filter === f.key ? 'var(--accent)' : 'transparent', color: filter === f.key ? '#fff' : 'var(--text-muted)', transition: 'all 0.15s ease', whiteSpace: 'nowrap' }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Users size={36} style={{ color: 'var(--text-faint)' }} />
            <p style={{ color: 'var(--text-muted)', fontWeight: 700 }}>לא נמצאו לקוחות</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" dir="rtl">
              <thead style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
                <tr>
                  <th className="py-3 px-4 w-1 text-right">
                    <input 
                      type="checkbox" 
                      checked={visible.length > 0 && visible.every(c => selectedIds.has(c.id))}
                      onChange={handleSelectAll}
                      style={{ cursor: 'pointer', width: 15, height: 15, accentColor: 'var(--accent)' }}
                    />
                  </th>
                  {['לקוחה', 'טלפון', 'מגדר', 'ביקור אחרון', 'ביקורים', 'ממוצע חשבונית', 'סה"כ הוצאה', 'יתרת לקוח', 'סטטוס', ''].map((h, i) => (
                    <th key={i} className="text-right text-xs font-bold py-3 px-4" style={{ color: 'var(--text-faint)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map(c => (
                  <tr key={c.id}
                    onClick={() => setSelected(c)}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'background 0.15s ease' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    {/* Checkbox */}
                    <td className="py-3 px-4 w-1" onClick={e => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        checked={selectedIds.has(c.id)}
                        onChange={() => handleSelectClient(c.id)}
                        style={{ cursor: 'pointer', width: 15, height: 15, accentColor: 'var(--accent)' }}
                      />
                    </td>
                    {/* Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center font-black text-sm flex-shrink-0"
                          style={{ width: 34, height: 34, borderRadius: 9, background: `hsl(${c.hue},55%,14%)`, color: `hsl(${c.hue},70%,65%)`, border: `1px solid hsl(${c.hue},40%,20%)` }}>
                          {c.initials}
                        </div>
                        <div>
                          <p className="font-bold text-sm" style={{ color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{c.name}</p>
                          {c.birthday && parseInt(c.birthday.slice(5,7)) === thisMonth && (
                            <p style={{ fontSize: 10, color: 'var(--amber)' }}>🎂 יום הולדת החודש</p>
                          )}
                        </div>
                      </div>
                    </td>
                    {/* Phone */}
                    <td className="py-3 px-4">
                      <span className="text-sm" dir="ltr" style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{c.phone || '—'}</span>
                    </td>
                    {/* Gender */}
                    <td className="py-3 px-4">
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{c.gender || '—'}</span>
                    </td>
                    {/* Last visit */}
                    <td className="py-3 px-4">
                      <span className="text-sm" style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{fmtDate(c.lastVisit)}</span>
                    </td>
                    {/* Visits */}
                    <td className="py-3 px-4">
                      <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{c.visits ?? 0}</span>
                    </td>
                    {/* Avg invoice */}
                    <td className="py-3 px-4">
                      <span className="text-sm" style={{ color: 'var(--teal)' }}>{c.avgInvoice ? `₪${c.avgInvoice}` : '—'}</span>
                    </td>
                    {/* Spent */}
                    <td className="py-3 px-4">
                      <span className="font-bold text-sm" style={{ color: 'var(--violet)' }}>{c.spent || '—'}</span>
                    </td>
                    {/* Balance */}
                    <td className="py-3 px-4">
                      <span className="font-bold text-sm" style={{ color: c.balance < 0 ? 'var(--red)' : c.balance > 0 ? 'var(--green)' : 'var(--text-secondary)' }}>
                        {c.balance !== undefined ? `₪${parseFloat(c.balance).toLocaleString('he-IL')}` : '—'}
                      </span>
                    </td>
                    {/* Status */}
                    <td className="py-3 px-4">
                      <span className={`badge ${c.status === 'active' ? 'badge-green' : 'badge-red'}`}>
                        {c.status === 'active' ? 'פעילה' : 'רדומה'}
                      </span>
                    </td>
                    {/* Arrow */}
                    <td className="py-3 px-4">
                      <ChevronRight size={15} style={{ color: 'var(--text-faint)' }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p style={{ fontSize: 12, color: 'var(--text-faint)', textAlign: 'center' }}>
        מוצגות {visible.length} מתוך {clients.length} לקוחות
      </p>

      {/* Floating Action Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 z-40 flex items-center justify-between gap-6 px-6 py-4 rounded-2xl shadow-2xl animate-fade-in"
          style={{ 
            background: 'var(--bg-surface)', 
            border: '1.5px solid var(--accent)', 
            width: '90%', 
            maxWidth: 600,
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}
        >
          <div className="flex items-center gap-3">
            <div className="font-black text-sm px-2.5 py-1 rounded-lg" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
              {selectedIds.size}
            </div>
            <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>לקוחות נבחרו</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                const selectedList = clients.filter(c => selectedIds.has(c.id));
                setGroupClients(selectedList);
                setShowGroupMsg(true);
              }}
              className="btn-primary"
              style={{ background: 'var(--accent)', color: '#fff', fontSize: 13, gap: 6 }}
            >
              <Mail size={14} /> שליחת הודעה
            </button>
            <button 
              onClick={() => setSelectedIds(new Set())}
              className="btn-ghost"
              style={{ fontSize: 13 }}
            >
              ביטול
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
