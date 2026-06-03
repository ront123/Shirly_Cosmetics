import { useState } from 'react';
import { Send, Upload, Users, Sparkles, Plus, Clock, Calendar, Zap, ChevronLeft, Edit2, Trash2, Play, Pause, CheckCircle, AlertCircle } from 'lucide-react';

// ─── Sub-views ─────────────────────────────────────────────────────────────

function CampaignBuilder({ onSave }) {
  const [msg,      setMsg]      = useState('');
  const [audience, setAudience] = useState('inactive');
  const [sendMode, setSendMode] = useState('now'); // 'now' | 'schedule'
  const [schedDate,setSchedDate]= useState('');
  const [schedTime,setSchedTime]= useState('');
  const [name,     setName]     = useState('');

  const AUDIENCES = [
    { key: 'inactive', label: 'לקוחות רדומות',   sub: 'לא ביקרו +60 יום', count: 42, emoji: '😴' },
    { key: 'all',      label: 'כל הלקוחות',       sub: 'שליחה לכולן',      count: 147, emoji: '📣' },
    { key: 'recent',   label: 'ביקרו לאחרונה',    sub: 'בחודש האחרון',     count: 38, emoji: '⭐' },
    { key: 'birthday', label: 'יום הולדת החודש',  sub: 'לקוחות בחגיגה',    count: 9,  emoji: '🎂' },
  ];

  const selected = AUDIENCES.find(a => a.key === audience);

  const handleSave = (send) => {
    onSave({
      id: Date.now(),
      name: name || `קמפיין ${new Date().toLocaleDateString('he-IL')}`,
      audience: selected.label,
      count: selected.count,
      message: msg,
      status: sendMode === 'now' && send ? 'sent' : sendMode === 'schedule' ? 'scheduled' : 'draft',
      date: sendMode === 'schedule' ? `${schedDate} ${schedTime}` : new Date().toLocaleDateString('he-IL'),
      opened: 0,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

      {/* ── Left: Builder (3/5) ── */}
      <div className="lg:col-span-3 space-y-5">

        {/* Campaign name */}
        <div className="card p-5">
          <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-faint)' }}>שם הקמפיין</label>
          <input className="input-dark" placeholder="לדוגמא: מבצע קיץ 2026" value={name} onChange={e => setName(e.target.value)} />
        </div>

        {/* Audience */}
        <div className="card p-5">
          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-faint)' }}>
            <span style={{ color: 'var(--accent)' }}>01</span> &nbsp;קהל יעד
          </p>
          <div className="grid grid-cols-2 gap-3">
            {AUDIENCES.map(a => (
              <button key={a.key} onClick={() => setAudience(a.key)}
                className="text-right rounded-xl p-4 transition-all"
                style={{
                  background: audience === a.key ? 'var(--accent-light)' : 'var(--bg-elevated)',
                  border: `1.5px solid ${audience === a.key ? 'var(--accent)' : 'var(--border)'}`,
                  cursor: 'pointer',
                }}>
                <div className="flex items-center justify-between mb-2">
                  <span style={{ fontSize: 22 }}>{a.emoji}</span>
                  <span className="font-black text-sm" style={{ color: audience === a.key ? 'var(--accent)' : 'var(--text-muted)' }}>
                    {a.count}
                  </span>
                </div>
                <p className="font-bold text-sm" style={{ color: 'var(--text-primary)', marginBottom: 2 }}>{a.label}</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.sub}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Message */}
        <div className="card p-5">
          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-faint)' }}>
            <span style={{ color: 'var(--accent)' }}>02</span> &nbsp;תוכן ההודעה
          </p>

          {/* Image drop */}
          <div className="flex flex-col items-center justify-center rounded-xl mb-4"
            style={{ border: '1.5px dashed var(--border-hover)', padding: '20px 16px', cursor: 'pointer', transition: 'all 0.15s ease' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-hover)'}>
            <Upload size={20} style={{ color: 'var(--text-faint)', marginBottom: 6 }} />
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>לחצי להוספת תמונה</p>
            <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>PNG, JPG עד 5MB</p>
          </div>

          <textarea className="input-dark resize-none" rows={4}
            placeholder={'היי [שם_הלקוחה], התגעגענו! 🌸\nמגיע לך פינוק — קבלי 10% הנחה על הטיפול הבא.'}
            value={msg} onChange={e => setMsg(e.target.value)} />
          <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 6 }}>
            💡 [שם_הלקוחה] מוחלף אוטומטית בשם האמיתי של כל לקוחה
          </p>
        </div>

        {/* Send mode */}
        <div className="card p-5">
          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-faint)' }}>
            <span style={{ color: 'var(--accent)' }}>03</span> &nbsp;תזמון שליחה
          </p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[{ key: 'now', label: 'שלח עכשיו', icon: Send }, { key: 'schedule', label: 'תזמן לתאריך', icon: Calendar }].map(m => (
              <button key={m.key} onClick={() => setSendMode(m.key)}
                className="flex items-center justify-center rounded-xl transition-all"
                style={{ gap: 8, padding: '12px 16px', cursor: 'pointer',
                  background: sendMode === m.key ? 'var(--accent-light)' : 'var(--bg-elevated)',
                  border: `1.5px solid ${sendMode === m.key ? 'var(--accent)' : 'var(--border)'}`,
                  color: sendMode === m.key ? 'var(--accent)' : 'var(--text-muted)',
                  fontFamily: 'Heebo, sans-serif', fontWeight: 700, fontSize: 14 }}>
                <m.icon size={16} />
                {m.label}
              </button>
            ))}
          </div>
          {sendMode === 'schedule' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>תאריך</label>
                <input type="date" className="input-dark" value={schedDate} onChange={e => setSchedDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>שעה</label>
                <input type="time" className="input-dark" value={schedTime} onChange={e => setSchedTime(e.target.value)} />
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={() => handleSave(true)}
            className="flex-1 flex items-center justify-center font-bold rounded-xl transition-all"
            style={{ gap: 10, padding: '13px 0', background: '#25d366', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Heebo, sans-serif', fontSize: 15, boxShadow: '0 4px 20px rgba(37,211,102,0.3)' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <Send size={17} />
            {sendMode === 'now' ? `שלח ל-${selected?.count} לקוחות` : 'תזמן קמפיין'}
          </button>
          <button onClick={() => handleSave(false)} className="btn-ghost" style={{ padding: '13px 20px' }}>
            שמור טיוטה
          </button>
        </div>
      </div>

      {/* ── Right: WhatsApp Preview (2/5) ── */}
      <div className="lg:col-span-2">
        <div className="card p-5 sticky top-0">
          <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--text-faint)' }}>תצוגה מקדימה</p>

          {/* Phone frame */}
          <div className="rounded-2xl overflow-hidden" style={{ background: '#0b1f14', border: '1px solid rgba(255,255,255,0.06)' }}>
            {/* WA Header */}
            <div className="flex items-center px-3 py-2.5" style={{ background: '#075e54', gap: 8 }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#25d366', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#fff', fontWeight: 800 }}>ש</div>
              <div>
                <p className="text-sm font-bold text-white">Shirly Cosmetics</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>עסק מאומת ✓</p>
              </div>
            </div>

            {/* Chat bubble */}
            <div style={{ padding: '16px 12px', minHeight: 120 }}>
              <div style={{ maxWidth: '90%', marginRight: 'auto', background: '#1c3a27', borderRadius: '12px 2px 12px 12px', padding: '10px 12px' }}>
                <p style={{ color: '#d4f8e4', fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {msg || 'היי [שם_הלקוחה], התגעגענו! 🌸\nמגיע לך פינוק — קבלי 10% הנחה על הטיפול הבא.'}
                </p>
                <span style={{ fontSize: 10, color: '#5a8a6a', display: 'block', textAlign: 'left', marginTop: 6 }}>10:42 ✓✓</span>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="mt-4 space-y-2">
            {[
              { label: 'קהל יעד', val: selected?.label },
              { label: 'מספר נמענות', val: `${selected?.count} לקוחות` },
              { label: 'אמצעי שליחה', val: 'WhatsApp Business' },
              { label: 'תזמון', val: sendMode === 'now' ? 'שליחה מיידית' : schedDate ? `${schedDate} ${schedTime}` : 'לא נקבע' },
            ].map((r, i) => (
              <div key={i} className="flex items-center justify-between py-2"
                style={{ borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{r.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Saved Campaigns ────────────────────────────────────────────────────────

function SavedCampaigns({ campaigns, onDelete }) {
  const STATUS = {
    sent:      { label: 'נשלח',    cls: 'badge-green'  },
    scheduled: { label: 'מתוזמן',  cls: 'badge-violet' },
    draft:     { label: 'טיוטה',   cls: 'badge-amber'  },
  };

  if (campaigns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24" style={{ color: 'var(--text-faint)' }}>
        <Sparkles size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
        <p className="font-semibold">אין קמפיינים שמורים עדיין</p>
        <p style={{ fontSize: 13, marginTop: 6 }}>צרי קמפיין חדש ושמרי אותו כטיוטה</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {campaigns.map(c => (
        <div key={c.id} className="card p-5 flex items-center" style={{ gap: 16 }}>
          <div className="flex-1 min-w-0">
            <div className="flex items-center" style={{ gap: 10, marginBottom: 6 }}>
              <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>{c.name}</h3>
              <span className={`badge ${STATUS[c.status]?.cls}`}>{STATUS[c.status]?.label}</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
              {c.audience} · {c.count} לקוחות · {c.date}
            </p>
            {c.status === 'sent' && (
              <div className="flex items-center" style={{ gap: 16 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>נשלח: <strong style={{ color: 'var(--text-primary)' }}>{c.count}</strong></span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>נפתח: <strong style={{ color: 'var(--green)' }}>{c.opened || Math.floor(c.count * 0.75)}</strong></span>
              </div>
            )}
          </div>
          <div className="flex items-center flex-shrink-0" style={{ gap: 8 }}>
            {c.status === 'draft' && (
              <button className="btn-ghost" style={{ padding: '8px 14px', fontSize: 13 }}>
                <Edit2 size={14} /> ערוך
              </button>
            )}
            {c.status === 'scheduled' && (
              <button className="btn-ghost" style={{ padding: '8px 14px', fontSize: 13 }}>
                <Pause size={14} /> בטל תזמון
              </button>
            )}
            <button onClick={() => onDelete(c.id)}
              style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--accent-light)', border: '1px solid var(--accent-border)', color: 'var(--accent)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Automations ────────────────────────────────────────────────────────────

function Automations() {
  const [automations, setAutomations] = useState([
    { id: 1, name: 'תזכורת ללקוחות רדומות', trigger: 'לא ביקרה 60+ יום', action: 'שלח WhatsApp', time: 'יום ב׳ בשעה 10:00', active: true, sent: 128 },
    { id: 2, name: 'ברכת יום הולדת',         trigger: 'יום הולדת הלקוחה', action: 'שלח WhatsApp',  time: '09:00 ביום ההולדת', active: true, sent: 34 },
    { id: 3, name: 'תזכורת לפני תור',        trigger: '24 שעות לפני תור', action: 'שלח WhatsApp',  time: 'אוטומטי',           active: false, sent: 210 },
  ]);

  const [showNew, setShowNew] = useState(false);
  const [newAuto, setNewAuto] = useState({ name: '', trigger: '', days: 60, hour: '10:00', dayOfWeek: 'ב׳' });

  const TRIGGERS = [
    'לא ביקרה X ימים',
    'יום הולדת הלקוחה',
    'X ימים לפני תור',
    'X ימים אחרי תור',
    'לקוחה חדשה נרשמה',
  ];

  const toggle = (id) => setAutomations(automations.map(a => a.id === id ? { ...a, active: !a.active } : a));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>אוטומציות שולחות הודעות WhatsApp לפי כללים קבועים — ללא צורך בהפעלה ידנית.</p>
        <button className="btn-primary" onClick={() => setShowNew(!showNew)}>
          <Plus size={15} /> אוטומציה חדשה
        </button>
      </div>

      {/* New automation form */}
      {showNew && (
        <div className="card p-6" style={{ border: '1px solid var(--accent-border)', background: 'var(--accent-light)' }}>
          <h3 className="font-black mb-5" style={{ color: 'var(--text-primary)' }}>הגדרת אוטומציה חדשה</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>שם האוטומציה</label>
              <input className="input-dark" placeholder="לדוגמא: תזכורת לאחרי טיפול" value={newAuto.name} onChange={e => setNewAuto({...newAuto, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>תנאי הפעלה (Trigger)</label>
              <select className="input-dark" style={{ background: 'var(--bg-base)' }} value={newAuto.trigger} onChange={e => setNewAuto({...newAuto, trigger: e.target.value})}>
                <option value="">בחרי תנאי...</option>
                {TRIGGERS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {newAuto.trigger === 'לא ביקרה X ימים' && (
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>מספר ימים ללא ביקור</label>
                <input type="number" className="input-dark" value={newAuto.days} onChange={e => setNewAuto({...newAuto, days: e.target.value})} />
              </div>
            )}
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>שעת שליחה</label>
              <input type="time" className="input-dark" value={newAuto.hour} onChange={e => setNewAuto({...newAuto, hour: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>תוכן ההודעה</label>
              <textarea className="input-dark resize-none" rows={3} placeholder="היי [שם_הלקוחה], התגעגענו..." />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button className="btn-primary" onClick={() => {
              setAutomations([...automations, { id: Date.now(), name: newAuto.name || 'אוטומציה חדשה', trigger: newAuto.trigger, action: 'שלח WhatsApp', time: newAuto.hour, active: true, sent: 0 }]);
              setShowNew(false);
            }}>שמור אוטומציה</button>
            <button className="btn-ghost" onClick={() => setShowNew(false)}>ביטול</button>
          </div>
        </div>
      )}

      {/* Automation list */}
      <div className="space-y-3">
        {automations.map(a => (
          <div key={a.id} className="card p-5 flex items-center" style={{ gap: 14 }}>
            {/* Toggle */}
            <button onClick={() => toggle(a.id)}
              className="flex-shrink-0 flex items-center justify-center"
              style={{ width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                background: a.active ? 'var(--green)' : 'var(--bg-hover)', transition: 'all 0.2s ease', position: 'relative' }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff',
                position: 'absolute', transition: 'right 0.2s ease',
                right: a.active ? 3 : 23 }} />
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center" style={{ gap: 8, marginBottom: 4 }}>
                <Zap size={14} style={{ color: a.active ? 'var(--green)' : 'var(--text-faint)', flexShrink: 0 }} />
                <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{a.name}</h3>
                <span className={`badge ${a.active ? 'badge-green' : 'badge-red'}`} style={{ fontSize: 10 }}>
                  {a.active ? 'פעילה' : 'מושהית'}
                </span>
              </div>
              <div className="flex flex-wrap" style={{ gap: 12 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  🔔 תנאי: <strong style={{ color: 'var(--text-secondary)' }}>{a.trigger}</strong>
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  🕐 זמן שליחה: <strong style={{ color: 'var(--text-secondary)' }}>{a.time}</strong>
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  📤 נשלח: <strong style={{ color: 'var(--green)' }}>{a.sent}</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center flex-shrink-0" style={{ gap: 8 }}>
              <button className="btn-ghost" style={{ padding: '7px 12px', fontSize: 12 }}>
                <Edit2 size={13} /> ערוך
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

const TABS = [
  { key: 'new',        label: 'קמפיין חדש',     icon: Plus },
  { key: 'saved',      label: 'קמפיינים שמורים', icon: Calendar },
  { key: 'automation', label: 'אוטומציות',       icon: Zap },
];

const INIT_CAMPAIGNS = [
  { id: 1, name: 'מבצע קיץ 2026',       audience: 'כל הלקוחות',     count: 85,  status: 'sent',      date: '01/05/26', opened: 72  },
  { id: 2, name: 'חזרי אלינו — אפריל',  audience: 'לקוחות רדומות',  count: 40,  status: 'sent',      date: '15/04/26', opened: 31  },
  { id: 3, name: 'מבצע ספטמבר',          audience: 'כל הלקוחות',     count: 147, status: 'scheduled', date: '01/09/26', opened: 0   },
  { id: 4, name: 'קמפיין לידה',           audience: 'יום הולדת החודש', count: 9,  status: 'draft',     date: '03/06/26', opened: 0   },
];

export default function Campaigns() {
  const [tab,       setTab]       = useState('new');
  const [campaigns, setCampaigns] = useState(INIT_CAMPAIGNS);

  const handleSave = (camp) => {
    setCampaigns(prev => [camp, ...prev]);
    setTab('saved');
  };

  const handleDelete = (id) => setCampaigns(prev => prev.filter(c => c.id !== id));

  const counts = {
    sent:      campaigns.filter(c => c.status === 'sent').length,
    scheduled: campaigns.filter(c => c.status === 'scheduled').length,
    draft:     campaigns.filter(c => c.status === 'draft').length,
  };

  return (
    <div dir="rtl" className="space-y-6">

      {/* Page header */}
      <div>
        <h2 className="font-black text-xl" style={{ color: 'var(--text-primary)' }}>קמפיינים שיווקיים</h2>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>שליחת הודעות WhatsApp ידניות ואוטומטיות ללקוחות</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'קמפיינים שנשלחו', val: counts.sent,      color: 'var(--green)'  },
          { label: 'מתוזמנים',        val: counts.scheduled,  color: 'var(--violet)' },
          { label: 'טיוטות',          val: counts.draft,      color: 'var(--amber)'  },
        ].map((s, i) => (
          <div key={i} className="card p-4 text-center">
            <p className="font-black text-2xl" style={{ color: s.color }}>{s.val}</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex" style={{ gap: 3, background: 'var(--bg-surface)', borderRadius: 12, padding: 5, border: '1px solid var(--border)' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="flex-1 flex items-center justify-center font-bold text-sm rounded-xl transition-all"
            style={{ gap: 7, padding: '10px 0', cursor: 'pointer', border: 'none', fontFamily: 'Heebo, sans-serif',
              background: tab === t.key ? 'var(--accent)'  : 'transparent',
              color:      tab === t.key ? '#fff'            : 'var(--text-muted)',
              boxShadow:  tab === t.key ? '0 2px 10px rgba(244,63,94,0.3)' : 'none',
            }}>
            <t.icon size={15} />
            {t.label}
            {t.key === 'saved' && campaigns.length > 0 && (
              <span style={{ fontSize: 10, fontWeight: 800, background: tab === t.key ? 'rgba(255,255,255,0.25)' : 'var(--bg-elevated)', borderRadius: 99, padding: '1px 6px', color: tab === t.key ? '#fff' : 'var(--text-secondary)' }}>
                {campaigns.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'new'        && <CampaignBuilder onSave={handleSave} />}
      {tab === 'saved'      && <SavedCampaigns campaigns={campaigns} onDelete={handleDelete} />}
      {tab === 'automation' && <Automations />}
    </div>
  );
}
