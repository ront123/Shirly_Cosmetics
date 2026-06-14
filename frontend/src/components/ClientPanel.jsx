import { Phone, Mail, Calendar, Star, TrendingUp, MapPin } from 'lucide-react';

function fmtDate(d) {
  if (!d) return '—';
  const dt = new Date(d);
  if (isNaN(dt)) return d;
  return dt.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

export default function ClientPanel({ client, onClose }) {
  if (!client) return null;
  
  const rows = [
    { icon: Phone,    label: 'טלפון',         val: client.phone       || '—' },
    { icon: Mail,     label: 'אימייל',         val: client.email       || '—' },
    { icon: Calendar, label: 'ביקור אחרון',    val: fmtDate(client.lastVisit) },
    { icon: Calendar, label: 'תור הבא',        val: fmtDate(client.nextMeeting) },
    { icon: Star,     label: 'יום הולדת',      val: fmtDate(client.birthday) },
    { icon: TrendingUp,label:'ביקורים',        val: client.visits      ?? '—' },
    { icon: TrendingUp,label:'ממוצע חשבונית',  val: client.avgInvoice ? `₪${client.avgInvoice}` : '—' },
    { icon: MapPin,   label: 'כתובת',          val: client.address     || '—' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-start" dir="rtl"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="flex flex-col h-full" style={{
        width: 360, background: 'var(--bg-surface)', borderLeft: '1px solid var(--border)',
        animation: 'slideInRight 0.2s ease'
      }}>
        {/* Header */}
        <div className="p-6 flex items-center gap-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center justify-center font-black text-xl flex-shrink-0"
            style={{ width: 52, height: 52, borderRadius: 14, background: `hsl(${client.hue},55%,14%)`, color: `hsl(${client.hue},70%,65%)`, border: `1px solid hsl(${client.hue},40%,20%)` }}>
            {client.initials}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-black text-base truncate" style={{ color: 'var(--text-primary)' }}>{client.name}</h3>
            <span className={`badge ${client.status === 'active' ? 'badge-green' : 'badge-red'}`}>
              {client.status === 'active' ? 'פעילה' : 'רדומה'}
            </span>
          </div>
          <button onClick={onClose}
            style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }}>✕</button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 p-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="rounded-xl p-4 text-center" style={{ background: 'var(--bg-elevated)' }}>
            <p className="font-black text-2xl" style={{ color: 'var(--violet)' }}>{client.spent || '₪0'}</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>סה"כ הוצאה</p>
          </div>
          <div className="rounded-xl p-4 text-center" style={{ background: 'var(--bg-elevated)' }}>
            <p className="font-black text-2xl" style={{ color: 'var(--teal)' }}>{client.visits ?? 0}</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>ביקורים</p>
          </div>
        </div>

        {/* Fields */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {rows.map((r, i) => (
            <div key={i} className="flex items-start gap-3">
              <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <r.icon size={14} style={{ color: 'var(--text-muted)' }} />
              </div>
              <div>
                <p style={{ fontSize: 11, color: 'var(--text-faint)', marginBottom: 2 }}>{r.label}</p>
                <p className="font-semibold text-sm" dir={r.label === 'טלפון' || r.label === 'אימייל' ? 'ltr' : 'rtl'}
                  style={{ color: 'var(--text-primary)' }}>{r.val}</p>
              </div>
            </div>
          ))}
          {client.notes && (
            <div className="rounded-xl p-3" style={{ background: 'var(--bg-elevated)' }}>
              <p style={{ fontSize: 11, color: 'var(--text-faint)', marginBottom: 4 }}>הערות</p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{client.notes}</p>
            </div>
          )}
        </div>

        <div className="p-4" style={{ borderTop: '1px solid var(--border)' }}>
          <button className="btn-primary w-full">+ קבע תור חדש</button>
        </div>
      </div>
    </div>
  );
}
