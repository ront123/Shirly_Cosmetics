import { useState } from 'react';
import { Plus, Send, Calendar, Edit2, Trash2, CheckCircle, Clock, FileText } from 'lucide-react';

const STATUS_MAP = {
  sent:      { label: 'נשלח',    badge: 'badge-green',  icon: CheckCircle },
  scheduled: { label: 'מתוזמן',  badge: 'badge-violet', icon: Clock       },
  draft:     { label: 'טיוטה',   badge: 'badge-amber',  icon: FileText    },
};

const AUDIENCES = [
  { key: 'inactive', label: 'לקוחות רדומות',    count: 42  },
  { key: 'all',      label: 'כל הלקוחות',        count: 147 },
  { key: 'recent',   label: 'ביקרו לאחרונה',     count: 38  },
  { key: 'birthday', label: 'יום הולדת החודש',   count: 9   },
];

const INIT = [
  { id: 1, name: 'מבצע קיץ 2026',       audience: 'כל הלקוחות',     count: 85,  status: 'sent',      date: '01/05/26', opened: 72 },
  { id: 2, name: 'חזרי אלינו — אפריל',  audience: 'לקוחות רדומות',  count: 40,  status: 'sent',      date: '15/04/26', opened: 31 },
  { id: 3, name: 'מבצע ספטמבר',          audience: 'כל הלקוחות',     count: 147, status: 'scheduled', date: '01/09/26', opened: 0  },
  { id: 4, name: 'קמפיין לידה',           audience: 'יום הולדת',      count: 9,   status: 'draft',     date: '03/06/26', opened: 0  },
];

/* ─── Modal: New Campaign ──────────────────────────────────────────────── */
function NewCampaignModal({ onClose, onSave }) {
  const [step,     setStep]     = useState(1);
  const [name,     setName]     = useState('');
  const [audience, setAudience] = useState('');
  const [msg,      setMsg]      = useState('');
  const [sendMode, setSendMode] = useState('now');
  const [date,     setDate]     = useState('');
  const [time,     setTime]     = useState('10:00');

  const sel = AUDIENCES.find(a => a.key === audience);
  const canNext1 = name && audience;
  const canNext2 = msg.length >= 10;

  const save = () => {
    onSave({
      id: Date.now(), name,
      audience: sel?.label || '', count: sel?.count || 0,
      status: sendMode === 'now' ? 'sent' : 'scheduled',
      date: sendMode === 'now' ? new Date().toLocaleDateString('he-IL') : `${date} ${time}`,
      opened: 0,
    });
    onClose();
  };

  const STEPS = ['שם וקהל', 'הודעה', 'תזמון'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full" style={{ maxWidth: 560, margin: '0 16px' }}>
        <div className="card p-0 overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>

          {/* Modal header */}
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <h3 className="font-black" style={{ color: 'var(--text-primary)' }}>קמפיין חדש</h3>
            <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }}>✕</button>
          </div>

          {/* Step indicator */}
          <div className="flex px-6 pt-5 pb-0" style={{ gap: 0 }}>
            {STEPS.map((s, i) => {
              const num = i + 1;
              const done = step > num;
              const active = step === num;
              return (
                <div key={i} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center flex-shrink-0" style={{ gap: 4 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 800,
                      background: done ? 'var(--green)' : active ? 'var(--accent)' : 'var(--bg-elevated)',
                      color: done || active ? '#fff' : 'var(--text-faint)',
                      border: done || active ? 'none' : '1px solid var(--border)',
                    }}>
                      {done ? '✓' : num}
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: active ? 'var(--text-primary)' : 'var(--text-faint)', whiteSpace: 'nowrap' }}>{s}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{ flex: 1, height: 1, background: done ? 'var(--green)' : 'var(--border)', margin: '0 8px', marginBottom: 18 }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Step content */}
          <div className="px-6 py-5 space-y-4">

            {/* Step 1 */}
            {step === 1 && <>
              <div>
                <label className="block text-sm font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>שם הקמפיין *</label>
                <input className="input-dark" placeholder="לדוגמא: מבצע קיץ 2026" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>קהל יעד *</label>
                <div className="grid grid-cols-2 gap-2">
                  {AUDIENCES.map(a => (
                    <button key={a.key} onClick={() => setAudience(a.key)}
                      className="flex items-center justify-between rounded-xl text-right transition-all"
                      style={{ padding: '10px 14px', cursor: 'pointer',
                        background: audience === a.key ? 'var(--accent-light)' : 'var(--bg-elevated)',
                        border: `1.5px solid ${audience === a.key ? 'var(--accent)' : 'var(--border)'}` }}>
                      <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{a.label}</span>
                      <span className="font-black text-sm" style={{ color: audience === a.key ? 'var(--accent)' : 'var(--text-muted)' }}>{a.count}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>}

            {/* Step 2 */}
            {step === 2 && <>
              <div>
                <label className="block text-sm font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>תוכן ההודעה *</label>
                <textarea className="input-dark resize-none" rows={5}
                  placeholder={'היי [שם_הלקוחה], התגעגענו! 🌸\nמגיע לך פינוק — קבלי 10% הנחה על הטיפול הבא.'}
                  value={msg} onChange={e => setMsg(e.target.value)} />
                <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 4 }}>💡 [שם_הלקוחה] מוחלף אוטומטית</p>
              </div>
              {/* Mini preview */}
              <div style={{ background: '#0b1f14', borderRadius: 12, overflow: 'hidden' }}>
                <div className="flex items-center px-3 py-2" style={{ background: '#075e54', gap: 8 }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#25d366', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', fontWeight: 800 }}>ש</div>
                  <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>Shirly Cosmetics</span>
                </div>
                <div style={{ padding: '10px 12px' }}>
                  <div style={{ maxWidth: '85%', marginRight: 'auto', background: '#1c3a27', borderRadius: '10px 2px 10px 10px', padding: '8px 10px' }}>
                    <p style={{ color: '#d4f8e4', fontSize: 12, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                      {msg || 'ההודעה תופיע כאן...'}
                    </p>
                  </div>
                </div>
              </div>
            </>}

            {/* Step 3 */}
            {step === 3 && <>
              <div className="grid grid-cols-2 gap-3">
                {[{ key: 'now', label: 'שלח עכשיו', sub: 'שליחה מיידית', icon: Send }, { key: 'schedule', label: 'תזמן', sub: 'בחרי תאריך ושעה', icon: Calendar }].map(m => (
                  <button key={m.key} onClick={() => setSendMode(m.key)}
                    className="text-right rounded-xl p-4 transition-all"
                    style={{ cursor: 'pointer', background: sendMode === m.key ? 'var(--accent-light)' : 'var(--bg-elevated)', border: `1.5px solid ${sendMode === m.key ? 'var(--accent)' : 'var(--border)'}` }}>
                    <m.icon size={18} style={{ color: sendMode === m.key ? 'var(--accent)' : 'var(--text-muted)', marginBottom: 8 }} />
                    <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{m.label}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{m.sub}</p>
                  </button>
                ))}
              </div>
              {sendMode === 'schedule' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>תאריך</label>
                    <input type="date" className="input-dark" value={date} onChange={e => setDate(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>שעה</label>
                    <input type="time" className="input-dark" value={time} onChange={e => setTime(e.target.value)} />
                  </div>
                </div>
              )}
              {/* Summary */}
              <div className="rounded-xl p-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                <p className="font-bold text-sm mb-2" style={{ color: 'var(--text-primary)' }}>סיכום</p>
                {[
                  ['שם', name],
                  ['קהל', `${sel?.label} (${sel?.count} לקוחות)`],
                  ['שליחה', sendMode === 'now' ? 'מיידית' : `${date} ${time}`],
                ].map(([k, v], i) => (
                  <div key={i} className="flex justify-between py-1.5" style={{ borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{k}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{v}</span>
                  </div>
                ))}
              </div>
            </>}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: '1px solid var(--border)' }}>
            <button onClick={() => step > 1 ? setStep(step - 1) : onClose()} className="btn-ghost">
              {step === 1 ? 'ביטול' : '← חזור'}
            </button>
            {step < 3
              ? <button className="btn-primary" onClick={() => setStep(step + 1)} disabled={step === 1 && !canNext1} style={{ opacity: step === 1 && !canNext1 ? 0.5 : 1 }}>המשך →</button>
              : <button onClick={save} className="btn-primary" style={{ background: '#25d366', boxShadow: '0 2px 12px rgba(37,211,102,0.35)' }}>
                  <Send size={15} /> {sendMode === 'now' ? 'שלח עכשיו' : 'תזמן קמפיין'}
                </button>
            }
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Campaigns Page ─────────────────────────────────────────────── */
export default function Campaigns() {
  const [campaigns, setCampaigns] = useState(INIT);
  const [showModal, setShowModal] = useState(false);
  const [filter,    setFilter]    = useState('all');

  const FILTERS = [
    { key: 'all',      label: 'הכל'      },
    { key: 'sent',     label: 'נשלחו'    },
    { key: 'scheduled',label: 'מתוזמנים' },
    { key: 'draft',    label: 'טיוטות'   },
  ];

  const visible = filter === 'all' ? campaigns : campaigns.filter(c => c.status === filter);

  const stats = [
    { label: 'סה"כ נשלחו',   val: campaigns.filter(c=>c.status==='sent').length,      color: 'var(--green)'  },
    { label: 'מתוזמנים',     val: campaigns.filter(c=>c.status==='scheduled').length,  color: 'var(--violet)' },
    { label: 'טיוטות',       val: campaigns.filter(c=>c.status==='draft').length,      color: 'var(--amber)'  },
  ];

  return (
    <div dir="rtl" className="space-y-6">
      {showModal && <NewCampaignModal onClose={() => setShowModal(false)} onSave={c => setCampaigns(p => [c, ...p])} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-black text-xl" style={{ color: 'var(--text-primary)' }}>קמפיינים</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>ניהול הודעות WhatsApp ידניות</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={15} /> קמפיין חדש
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="card p-5 text-center">
            <p className="font-black text-3xl" style={{ color: s.color }}>{s.val}</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex" style={{ gap: 3, background: 'var(--bg-surface)', borderRadius: 12, padding: 4, border: '1px solid var(--border)', alignSelf: 'flex-start' }}>
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className="font-bold text-sm rounded-xl transition-all"
            style={{ padding: '8px 18px', border: 'none', cursor: 'pointer', fontFamily: 'Heebo, sans-serif',
              background: filter === f.key ? 'var(--accent)'  : 'transparent',
              color:      filter === f.key ? '#fff'            : 'var(--text-muted)',
            }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Campaign list */}
      {visible.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20">
          <p className="font-semibold" style={{ color: 'var(--text-muted)' }}>אין קמפיינים בקטגוריה זו</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map(c => {
            const st = STATUS_MAP[c.status];
            const openRate = c.status === 'sent' ? Math.round(((c.opened || 0) / c.count) * 100) : null;
            return (
              <div key={c.id} className="card p-5 flex items-center" style={{ gap: 16 }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center" style={{ gap: 8, marginBottom: 6 }}>
                    <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>{c.name}</h3>
                    <span className={`badge ${st.badge}`}>{st.label}</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: c.status === 'sent' ? 8 : 0 }}>
                    {c.audience} · {c.count} נמענות · {c.date}
                  </p>
                  {c.status === 'sent' && (
                    <div className="flex items-center" style={{ gap: 16 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>נשלח: <strong style={{ color: 'var(--text-primary)' }}>{c.count}</strong></span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>נפתח: <strong style={{ color: 'var(--green)' }}>{c.opened}</strong></span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>אחוז פתיחה: <strong style={{ color: 'var(--teal)' }}>{openRate}%</strong></span>
                    </div>
                  )}
                </div>
                <div className="flex items-center flex-shrink-0" style={{ gap: 8 }}>
                  {c.status !== 'sent' && <button className="btn-ghost" style={{ padding: '7px 14px', fontSize: 13 }}><Edit2 size={13} /> ערוך</button>}
                  <button onClick={() => setCampaigns(p => p.filter(x => x.id !== c.id))}
                    style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--accent-light)', border: '1px solid var(--accent-border)', color: 'var(--accent)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
