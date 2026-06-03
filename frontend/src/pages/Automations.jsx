import { useState } from 'react';
import { Plus, Zap, Edit2, Trash2, Clock, Users, Star, CalendarDays, RefreshCw } from 'lucide-react';

const TRIGGER_OPTIONS = [
  { key: 'inactive',  label: 'לא ביקרה X ימים',       icon: Clock,       color: 'var(--accent)' },
  { key: 'birthday',  label: 'יום הולדת הלקוחה',       icon: Star,        color: 'var(--amber)'  },
  { key: 'before',    label: 'X ימים לפני תור',         icon: CalendarDays,color: 'var(--violet)' },
  { key: 'after',     label: 'X ימים אחרי תור',         icon: RefreshCw,   color: 'var(--teal)'   },
  { key: 'new',       label: 'לקוחה חדשה נרשמה',       icon: Users,       color: 'var(--green)'  },
];

const INIT_AUTOS = [
  {
    id: 1, name: 'תזכורת לקוחות רדומות',
    trigger: 'inactive', days: 60,
    hour: '10:00', days_of_week: ['ב׳'],
    message: 'היי [שם_הלקוחה], התגעגענו! 🌸 קבלי 10% הנחה על הטיפול הבא.',
    active: true, sent: 128,
  },
  {
    id: 2, name: 'ברכת יום הולדת',
    trigger: 'birthday', days: null,
    hour: '09:00', days_of_week: [],
    message: '🎂 יום הולדת שמח [שם_הלקוחה]! מגיע לך פינוק — צרי קשר לתיאום טיפול מתנה.',
    active: true, sent: 34,
  },
  {
    id: 3, name: 'תזכורת לפני תור',
    trigger: 'before', days: 1,
    hour: '17:00', days_of_week: [],
    message: 'היי [שם_הלקוחה], תזכורת לתורך מחר 📅 נתראה!',
    active: false, sent: 210,
  },
];

const DAYS_HE = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳'];

function AutoCard({ auto, onToggle, onDelete }) {
  const trigger = TRIGGER_OPTIONS.find(t => t.key === auto.trigger);
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card overflow-hidden" style={{ transition: 'all 0.2s ease' }}>
      <div className="p-5 flex items-center" style={{ gap: 14 }}>
        {/* Icon */}
        <div className="flex-shrink-0 flex items-center justify-center"
          style={{ width: 42, height: 42, borderRadius: 12, background: `color-mix(in srgb, ${trigger?.color} 15%, transparent)` }}>
          {trigger && <trigger.icon size={18} style={{ color: trigger.color }} />}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center" style={{ gap: 8, marginBottom: 4 }}>
            <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{auto.name}</h3>
            <span className={`badge ${auto.active ? 'badge-green' : ''}`}
              style={!auto.active ? { background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' } : {}}>
              {auto.active ? 'פעילה' : 'מושהית'}
            </span>
          </div>
          <div className="flex flex-wrap items-center" style={{ gap: 10 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              🔔 {trigger?.label}{auto.days ? ` (${auto.days})` : ''}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>🕐 {auto.hour}</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              📤 <strong style={{ color: 'var(--green)' }}>{auto.sent}</strong> נשלחו
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center flex-shrink-0" style={{ gap: 8 }}>
          {/* Toggle */}
          <button onClick={() => onToggle(auto.id)}
            style={{
              width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', position: 'relative',
              background: auto.active ? 'var(--green)' : 'var(--bg-hover)', transition: 'background 0.2s',
            }}>
            <div style={{
              width: 18, height: 18, borderRadius: '50%', background: '#fff',
              position: 'absolute', top: 3, transition: 'right 0.2s',
              right: auto.active ? 3 : 23,
            }} />
          </button>

          <button onClick={() => setExpanded(!expanded)} className="btn-ghost" style={{ padding: '6px 10px', fontSize: 12 }}>
            {expanded ? 'סגור' : 'פרטים'}
          </button>

          <button onClick={() => onDelete(auto.id)}
            style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent-light)', border: '1px solid var(--accent-border)', color: 'var(--accent)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Expanded: message preview */}
      {expanded && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '14px 20px', background: 'var(--bg-elevated)' }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-faint)' }}>תוכן ההודעה</p>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{auto.message}</p>
        </div>
      )}
    </div>
  );
}

/* ─── New Automation Modal ─────────────────────────────────────────────── */
function NewAutoModal({ onClose, onSave }) {
  const [form, setForm] = useState({ name: '', trigger: '', days: 7, hour: '10:00', days_of_week: [], message: '' });

  const sel = TRIGGER_OPTIONS.find(t => t.key === form.trigger);
  const canSave = form.name && form.trigger && form.message.length > 5;

  const toggleDay = (d) => setForm(f => ({
    ...f,
    days_of_week: f.days_of_week.includes(d) ? f.days_of_week.filter(x => x !== d) : [...f.days_of_week, d],
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full" style={{ maxWidth: 640, margin: '0 16px' }}>
        <div className="card overflow-hidden" style={{ background: 'var(--bg-surface)' }}>

          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <h3 className="font-black" style={{ color: 'var(--text-primary)' }}>אוטומציה חדשה</h3>
            <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }}>✕</button>
          </div>

          <div className="px-6 py-5 space-y-5" style={{ maxHeight: '75vh', overflowY: 'auto' }}>

            <div>
              <label className="block text-sm font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>שם האוטומציה</label>
              <input className="input-dark" placeholder="לדוגמא: תזכורת לאחרי טיפול" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>תנאי הפעלה</label>
              <div className="grid grid-cols-2 gap-2">
                {TRIGGER_OPTIONS.map(t => (
                  <button key={t.key} onClick={() => setForm({...form, trigger: t.key})}
                    className="flex flex-col items-start rounded-xl transition-all"
                    style={{ padding: '12px 14px', cursor: 'pointer',
                      background: form.trigger === t.key ? `color-mix(in srgb, ${t.color} 12%, var(--bg-elevated))` : 'var(--bg-elevated)',
                      border: `1.5px solid ${form.trigger === t.key ? t.color : 'var(--border)'}` }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `color-mix(in srgb, ${t.color} 15%, transparent)`, marginBottom: 8 }}>
                      <t.icon size={14} style={{ color: t.color }} />
                    </div>
                    <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Trigger Explanations */}
            {form.trigger && (
              <div className="rounded-xl p-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                {form.trigger === 'inactive' && <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>💡 המערכת תסרוק מדי יום לקוחות שלא הגיעו לטיפול יותר מ-{form.days} ימים ותשלח להן הודעה. יש לבחור באילו ימים בשבוע מותר לשלוח הודעות.</p>}
                {form.trigger === 'birthday' && <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>💡 המערכת שולפת אוטומטית את תאריך הלידה מטופס הלקוחה, ושולחת הודעת מזל טוב בבוקר יום ההולדת (לפי השעה שמוגדרת למטה). ניתן לראות מי חוגגת בעמוד הלקוחות.</p>}
                {form.trigger === 'before' && <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>💡 שליחת תזכורת אוטומטית {form.days} ימים לפני מועד התור שנקבע ביומן.</p>}
                {form.trigger === 'after' && <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>💡 שליחת הודעת פולו-אפ (מעקב) {form.days} ימים לאחר סיום הטיפול.</p>}
                {form.trigger === 'new' && <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>💡 נשלח אוטומטית מיד כשלקוחה חדשה מוזנת למערכת.</p>}
              </div>
            )}

            {(form.trigger === 'inactive' || form.trigger === 'before' || form.trigger === 'after') && (
              <div>
                <label className="block text-sm font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>מספר ימים</label>
                <input type="number" className="input-dark" min={1} max={365} value={form.days} onChange={e => setForm({...form, days: e.target.value})} />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>שעת שליחה</label>
                <input type="time" className="input-dark" value={form.hour} onChange={e => setForm({...form, hour: e.target.value})} />
              </div>
              {form.trigger === 'inactive' && (
                <div>
                  <label className="block text-sm font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>ימים בשבוע</label>
                  <div className="flex flex-wrap" style={{ gap: 4 }}>
                    {DAYS_HE.map(d => (
                      <button key={d} onClick={() => toggleDay(d)}
                        style={{ width: 30, height: 30, borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Heebo',
                          background: form.days_of_week.includes(d) ? 'var(--accent)' : 'var(--bg-elevated)',
                          border: `1px solid ${form.days_of_week.includes(d) ? 'var(--accent)' : 'var(--border)'}`,
                          color: form.days_of_week.includes(d) ? '#fff' : 'var(--text-muted)' }}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>תוכן ההודעה</label>
              <textarea className="input-dark resize-none" rows={4}
                placeholder="היי [שם_הלקוחה], ..."
                value={form.message} onChange={e => setForm({...form, message: e.target.value})} />
              <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 4 }}>💡 [שם_הלקוחה] מוחלף אוטומטית</p>
            </div>
          </div>

          <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: '1px solid var(--border)' }}>
            <button onClick={onClose} className="btn-ghost">ביטול</button>
            <button onClick={() => { onSave({ ...form, id: Date.now(), active: true, sent: 0 }); onClose(); }}
              className="btn-primary" disabled={!canSave} style={{ opacity: canSave ? 1 : 0.5 }}>
              <Zap size={14} /> שמור אוטומציה
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main ─────────────────────────────────────────────────────────────── */
export default function Automations() {
  const [autos,     setAutos]     = useState(INIT_AUTOS);
  const [showModal, setShowModal] = useState(false);

  const toggle    = (id) => setAutos(a => a.map(x => x.id === id ? { ...x, active: !x.active } : x));
  const deleteAuto= (id) => setAutos(a => a.filter(x => x.id !== id));
  const addAuto   = (a)  => setAutos(p => [{ ...a }, ...p]);

  const active   = autos.filter(a => a.active);
  const inactive = autos.filter(a => !a.active);
  const totalSent = autos.reduce((s, a) => s + a.sent, 0);

  return (
    <div dir="rtl" className="space-y-6">
      {showModal && <NewAutoModal onClose={() => setShowModal(false)} onSave={addAuto} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-black text-xl" style={{ color: 'var(--text-primary)' }}>אוטומציות</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>הודעות WhatsApp שנשלחות אוטומטית לפי כללים</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={15} /> אוטומציה חדשה
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'אוטומציות פעילות',   val: active.length,   color: 'var(--green)'  },
          { label: 'מושהיות',             val: inactive.length, color: 'var(--text-muted)' },
          { label: 'סה"כ הודעות שנשלחו', val: totalSent,       color: 'var(--teal)'   },
        ].map((s, i) => (
          <div key={i} className="card p-5 text-center">
            <p className="font-black text-3xl" style={{ color: s.color }}>{s.val}</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Explanation banner */}
      <div className="rounded-xl flex items-start" style={{ gap: 12, padding: '14px 18px', background: 'color-mix(in srgb, var(--violet) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--violet) 30%, transparent)' }}>
        <Zap size={18} style={{ color: 'var(--violet)', flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          אוטומציות בודקות מדי יום אם קיימות לקוחות שעומדות בתנאי — ושולחות להן הודעה אוטומטית ב-WhatsApp. לא נדרשת כל פעולה ידנית.
        </p>
      </div>

      {/* Active */}
      {active.length > 0 && (
        <div>
          <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--text-muted)' }}>פעילות ({active.length})</h3>
          <div className="space-y-3">
            {active.map(a => <AutoCard key={a.id} auto={a} onToggle={toggle} onDelete={deleteAuto} />)}
          </div>
        </div>
      )}

      {/* Inactive */}
      {inactive.length > 0 && (
        <div>
          <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--text-muted)' }}>מושהיות ({inactive.length})</h3>
          <div className="space-y-3">
            {inactive.map(a => <AutoCard key={a.id} auto={a} onToggle={toggle} onDelete={deleteAuto} />)}
          </div>
        </div>
      )}

      {autos.length === 0 && (
        <div className="card flex flex-col items-center justify-center py-20">
          <Zap size={36} style={{ color: 'var(--text-faint)', marginBottom: 12 }} />
          <p className="font-semibold" style={{ color: 'var(--text-muted)' }}>אין אוטומציות עדיין</p>
          <p style={{ fontSize: 13, color: 'var(--text-faint)', marginTop: 6 }}>צרי אוטומציה חדשה כדי להתחיל</p>
        </div>
      )}
    </div>
  );
}
