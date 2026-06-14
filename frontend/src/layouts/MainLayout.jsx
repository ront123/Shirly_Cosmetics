import { Outlet, NavLink } from 'react-router-dom';
import { CalendarDays, Users, MessageCircle, BarChart3, Settings, Menu, Sparkles, Bell, Package, TrendingDown, UserCheck, Zap, X } from 'lucide-react';
import { useState } from 'react';

/* ─── New Appointment Modal ──────────────────────────────── */
const TREATMENTS = [
  'טיפול פנים',
  'ניקוי עמוק',
  'פנים זוהר',
  'לייזר שיער',
  'לייזר פנים',
  'מיקרונידלינג',
  'פילינג כימי',
  'הסרת שיער',
  'עיצוב גבות',
  'טיפול גוף',
];

function NewAppointmentModal({ onClose }) {
  const [form, setForm] = useState({
    client: '', phone: '', treatment: '', date: '', time: '10:00', notes: '',
  });
  const [saved, setSaved] = useState(false);

  const canSave = form.client && form.treatment && form.date && form.time;

  const save = () => {
    if (!canSave) return;
    setSaved(true);
    setTimeout(onClose, 1200);
  };

  if (saved) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}>
      <div className="card p-10 text-center" style={{ background: 'var(--bg-surface)', maxWidth: 320, margin: '0 16px' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
        <p className="font-black text-lg" style={{ color: 'var(--text-primary)' }}>התור נקבע!</p>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>
          {form.client} · {form.treatment} · {form.date} {form.time}
        </p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" dir="rtl"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full" style={{ maxWidth: 500, margin: '0 16px' }}>
        <div className="card overflow-hidden" style={{ background: 'var(--bg-surface)' }}>

          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3">
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--accent-light)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CalendarDays size={16} style={{ color: 'var(--accent)' }} />
              </div>
              <h3 className="font-black" style={{ color: 'var(--text-primary)' }}>תור חדש</h3>
            </div>
            <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }}>✕</button>
          </div>

          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>שם לקוחה <span style={{color:'var(--accent)'}}>*</span></label>
              <input className="input-dark" placeholder="שם מלא" value={form.client} onChange={e => setForm(f => ({...f, client: e.target.value}))} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>טלפון</label>
              <input className="input-dark" placeholder="050-0000000" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>סוג טיפול <span style={{color:'var(--accent)'}}>*</span></label>
              <select className="input-dark" value={form.treatment}
                onChange={e => setForm(f => ({...f, treatment: e.target.value}))}
                style={{ appearance: 'none', cursor: 'pointer' }}>
                <option value="">-- בחרי טיפול --</option>
                {TREATMENTS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>תאריך <span style={{color:'var(--accent)'}}>*</span></label>
                <input type="date" className="input-dark" value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))} />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>שעה <span style={{color:'var(--accent)'}}>*</span></label>
                <input type="time" className="input-dark" value={form.time} onChange={e => setForm(f => ({...f, time: e.target.value}))} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>הערות</label>
              <textarea className="input-dark resize-none" rows={2} placeholder="הערות לתור..." value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} />
            </div>
          </div>

          <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: '1px solid var(--border)' }}>
            <button onClick={onClose} className="btn-ghost">ביטול</button>
            <button onClick={save} className="btn-primary"
              disabled={!canSave} style={{ opacity: canSave ? 1 : 0.5 }}>
              <CalendarDays size={14} /> קבע תור
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const navItems = [
  { name: 'דשבורד',        icon: BarChart3,    path: '/'           },
  { name: 'יומן תורים',   icon: CalendarDays, path: '/calendar'   },
  { name: 'לקוחות',        icon: Users,        path: '/clients'    },
  { name: 'עובדים',        icon: UserCheck,    path: '/staff'      },
  { name: 'מוצרים',        icon: Package,      path: '/products'   },
  { name: 'קמפיינים',      icon: MessageCircle,path: '/campaigns'  },
  { name: 'אוטומציות',     icon: Zap,          path: '/automations'},
  { name: 'הוצאות',        icon: TrendingDown, path: '/expenses'   },
  { name: 'דוחות',         icon: BarChart3,    path: '/reports'    },
  { name: 'הגדרות',        icon: Settings,     path: '/settings'   },
];

export default function MainLayout() {
  const [open, setOpen] = useState(true);
  const [showAppt, setShowAppt] = useState(false);

  return (
    <div className="h-screen w-full flex overflow-hidden" style={{ background: 'var(--bg-base)', direction: 'rtl' }}>

      {/* ── Sidebar ── */}
      <aside
        className="flex flex-col flex-shrink-0 transition-all duration-300"
        style={{
          width: open ? 220 : 64,
          background: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border)',
          minHeight: '100vh',
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {/* Logo row */}
        <div className="flex items-center h-14 px-4 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border)', gap: 10 }}>
          <div className="flex items-center justify-center flex-shrink-0"
            style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--accent)', boxShadow: '0 2px 10px rgba(244,63,94,0.4)' }}>
            <Sparkles size={16} color="#fff" />
          </div>

          {open && (
            <span className="font-black text-base gradient-text tracking-tight flex-1" style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>
              Shirly Cosmetics
            </span>
          )}

          <button onClick={() => setOpen(!open)}
            className="flex items-center justify-center flex-shrink-0"
            style={{ marginRight: open ? 0 : 'auto', marginLeft: open ? 0 : 'auto', width: 28, height: 28, borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.15s ease' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
            <Menu size={14} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map(item => (
            <NavLink key={item.path} to={item.path} end={item.path === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              style={{ overflow: 'hidden', whiteSpace: 'nowrap', justifyContent: open ? 'flex-start' : 'center' }}>
              <item.icon size={18} style={{ flexShrink: 0 }} />
              {open && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="p-3 flex-shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex items-center" style={{ gap: 10, justifyContent: open ? 'flex-start' : 'center' }}>
            <div className="flex items-center justify-center flex-shrink-0 font-black text-sm"
              style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--accent-light)', border: '1px solid var(--accent-border)', color: 'var(--accent)' }}>
              ש
            </div>
            {open && (
              <div style={{ minWidth: 0 }}>
                <p className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>שירלי סוני</p>
                <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>מנהלת קליניקה</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col" style={{ minWidth: 0 }}>
        {/* Top bar */}
        <header className="flex items-center justify-between flex-shrink-0"
          style={{ height: 56, padding: '0 24px', borderBottom: '1px solid var(--border)', background: 'rgba(13,13,18,0.9)', backdropFilter: 'blur(16px)', position: 'sticky', top: 0, zIndex: 10 }}>
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            {new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          {showAppt && <NewAppointmentModal onClose={() => setShowAppt(false)} />}
          <div className="flex items-center flex-shrink-0" style={{ gap: 10 }}>
            <button className="relative flex items-center justify-center flex-shrink-0"
              style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <Bell size={16} />
              <span className="absolute" style={{ top: 7, left: 7, width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', border: '1.5px solid var(--bg-surface)' }} />
            </button>
            <button onClick={() => setShowAppt(true)} className="btn-primary flex-shrink-0">+ תור חדש</button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
          <div className="min-h-full p-6 w-full max-w-7xl mx-auto" style={{ boxSizing: 'border-box' }}>
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
