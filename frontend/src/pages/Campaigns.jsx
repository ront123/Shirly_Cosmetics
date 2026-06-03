import { useState } from 'react';
import { Send, Upload, Users, Sparkles } from 'lucide-react';

const AUDIENCES = [
  { key: 'inactive', label: 'לקוחות רדומות',     sub: 'לא ביקרו מעל חודשיים', count: 42, emoji: '😴' },
  { key: 'all',      label: 'כל הלקוחות',         sub: 'שליחה לכולן',           count: 147, emoji: '📣' },
  { key: 'recent',   label: 'ביקרו לאחרונה',      sub: 'ביקרו בחודש האחרון',   count: 38, emoji: '⭐' },
];

const PAST = [
  { name: 'מבצע קיץ 2026',        sent: 85,  opened: 72, date: '01/05/26' },
  { name: 'חזרי אלינו — אפריל',   sent: 40,  opened: 31, date: '15/04/26' },
];

export default function Campaigns() {
  const [msg,      setMsg]      = useState('');
  const [audience, setAudience] = useState('inactive');

  const selected = AUDIENCES.find(a => a.key === audience);

  return (
    <div dir="rtl" className="space-y-6">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: builder */}
        <div className="lg:col-span-2 space-y-4">

          {/* Audience */}
          <div className="card p-5">
            <h3 className="font-bold text-sm mb-4 flex items-center" style={{ gap: 8, color: 'var(--text-primary)' }}>
              <Users size={16} style={{ color: 'var(--accent)' }} />
              1. למי לשלוח?
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {AUDIENCES.map(a => (
                <button
                  key={a.key}
                  onClick={() => setAudience(a.key)}
                  className="text-right rounded-xl p-4 transition-all"
                  style={{
                    background:   audience === a.key ? 'var(--accent-light)' : 'var(--bg-elevated)',
                    border:       `1px solid ${audience === a.key ? 'var(--accent-border)' : 'var(--border)'}`,
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: 24, display: 'block', marginBottom: 8 }}>{a.emoji}</span>
                  <p className="font-bold text-sm" style={{ color: 'var(--text-primary)', marginBottom: 2 }}>{a.label}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{a.sub}</p>
                  <p className="font-black text-sm mt-2" style={{ color: 'var(--accent)' }}>{a.count} לקוחות</p>
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div className="card p-5">
            <h3 className="font-bold text-sm mb-4 flex items-center" style={{ gap: 8, color: 'var(--text-primary)' }}>
              <Sparkles size={16} style={{ color: 'var(--accent)' }} />
              2. תוכן ההודעה
            </h3>

            {/* Image drop */}
            <div
              className="flex flex-col items-center justify-center rounded-xl mb-4"
              style={{ border: '1.5px dashed var(--border-hover)', padding: '28px 16px', cursor: 'pointer', transition: 'all 0.15s ease' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-hover)'}
            >
              <Upload size={22} style={{ color: 'var(--text-faint)', marginBottom: 8 }} />
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>לחצי להוספת תמונה (אופציונלי)</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>PNG, JPG עד 5MB</p>
            </div>

            <textarea
              className="input-dark resize-none"
              rows={5}
              placeholder={'היי [שם_הלקוחה], התגעגענו! 🌸\nמגיע לך פינוק — קבלי 10% הנחה על הטיפול הבא.'}
              value={msg}
              onChange={e => setMsg(e.target.value)}
            />
            <p className="text-xs mt-2" style={{ color: 'var(--text-faint)' }}>
              💡 השתמשי ב-[שם_הלקוחה] והמערכת תחליף אוטומטית
            </p>
          </div>

          {/* Send */}
          <button
            className="w-full flex items-center justify-center font-bold text-base rounded-xl transition-all"
            style={{
              gap: 10, padding: '14px 0',
              background: '#25d366',
              color: '#fff',
              border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(37,211,102,0.3)',
              fontFamily: 'Heebo, sans-serif',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#1ebe59'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#25d366'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <Send size={18} />
            שלח קמפיין ל-{selected?.count} לקוחות ב-WhatsApp
          </button>
        </div>

        {/* Right: preview + history */}
        <div className="space-y-4">

          {/* Preview */}
          <div className="card p-5">
            <h3 className="font-bold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>תצוגה מקדימה — WhatsApp</h3>
            <div className="rounded-xl overflow-hidden" style={{ background: '#0b1f14' }}>
              <div className="flex items-center px-3 py-2" style={{ background: '#075e54', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#25d366', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#fff', fontWeight: 800 }}>ש</div>
                <span className="text-sm font-bold text-white">Shirly Cosmetics</span>
              </div>
              <div style={{ padding: 12 }}>
                <div style={{ maxWidth: '88%', marginRight: 'auto', background: '#1c3a27', borderRadius: '12px 2px 12px 12px', padding: '10px 12px' }}>
                  <p style={{ color: '#d4f8e4', fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {msg || 'היי דנה, התגעגענו! 🌸\nמגיע לך פינוק — קבלי 10% הנחה על הטיפול הבא.'}
                  </p>
                  <span style={{ fontSize: 10, color: '#5a8a6a', display: 'block', textAlign: 'left', marginTop: 4 }}>10:42 ✓✓</span>
                </div>
              </div>
            </div>
          </div>

          {/* History */}
          <div className="card p-5">
            <h3 className="font-bold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>קמפיינים אחרונים</h3>
            <div className="space-y-3">
              {PAST.map((p, i) => (
                <div key={i} className="rounded-xl p-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                  <p className="font-bold text-sm" style={{ color: 'var(--text-primary)', marginBottom: 6 }}>{p.name}</p>
                  <div className="flex gap-3">
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>נשלח: {p.sent}</span>
                    <span style={{ fontSize: 11, color: 'var(--green)' }}>נפתח: {p.opened}</span>
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 3 }}>{p.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
