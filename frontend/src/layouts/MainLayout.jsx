import { Outlet, NavLink } from 'react-router-dom';
import { CalendarDays, Users, MessageCircle, BarChart3, Settings, Menu, Sparkles, Bell, Package, TrendingDown, UserCheck, Zap } from 'lucide-react';
import { useState } from 'react';

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

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-base)', direction: 'rtl' }}>

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
          <div className="flex items-center flex-shrink-0" style={{ gap: 10 }}>
            <button className="relative flex items-center justify-center flex-shrink-0"
              style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <Bell size={16} />
              <span className="absolute" style={{ top: 7, left: 7, width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', border: '1.5px solid var(--bg-surface)' }} />
            </button>
            <button className="btn-primary flex-shrink-0">+ תור חדש</button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="min-h-full p-6" style={{ maxWidth: '100%', boxSizing: 'border-box' }}>
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
