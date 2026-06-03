import { Outlet, NavLink } from 'react-router-dom';
import { CalendarDays, Users, MessageCircle, BarChart3, Settings, Menu, Sparkles, Bell } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { name: 'דשבורד', icon: BarChart3, path: '/' },
  { name: 'יומן תורים', icon: CalendarDays, path: '/calendar' },
  { name: 'לקוחות', icon: Users, path: '/clients' },
  { name: 'קמפיינים', icon: MessageCircle, path: '/campaigns' },
  { name: 'הגדרות', icon: Settings, path: '/settings' },
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
        }}
      >
        {/* Logo row */}
        <div
          className="flex items-center h-14 px-4"
          style={{ borderBottom: '1px solid var(--border)', gap: 10 }}
        >
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: 32, height: 32,
              borderRadius: 9,
              background: 'var(--accent)',
              boxShadow: '0 2px 10px rgba(244,63,94,0.4)',
            }}
          >
            <Sparkles size={16} color="#fff" />
          </div>

          {open && (
            <span className="font-black text-base gradient-text tracking-tight" style={{ whiteSpace: 'nowrap' }}>
              Shirly Cosmetics
            </span>
          )}

          <button
            onClick={() => setOpen(!open)}
            className="flex items-center justify-center flex-shrink-0"
            style={{
              marginRight: 'auto',
              width: 28, height: 28,
              borderRadius: 7,
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <Menu size={14} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
            >
              <item.icon size={18} style={{ flexShrink: 0 }} />
              {open && <span>{item.name}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="p-3" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex items-center" style={{ gap: 10 }}>
            <div
              className="flex items-center justify-center flex-shrink-0 font-black text-sm"
              style={{
                width: 34, height: 34, borderRadius: 9,
                background: 'var(--accent-light)',
                border: '1px solid var(--accent-border)',
                color: 'var(--accent)',
              }}
            >
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
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header
          className="flex items-center justify-between px-6 flex-shrink-0"
          style={{
            height: 56,
            borderBottom: '1px solid var(--border)',
            background: 'rgba(13,13,18,0.85)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            {new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>

          <div className="flex items-center" style={{ gap: 10 }}>
            <button
              className="relative flex items-center justify-center"
              style={{
                width: 36, height: 36, borderRadius: 9,
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              <Bell size={16} />
              <span
                className="absolute"
                style={{
                  top: 7, left: 7,
                  width: 7, height: 7,
                  borderRadius: '50%',
                  background: 'var(--accent)',
                  border: '1.5px solid var(--bg-surface)',
                }}
              />
            </button>
            <button className="btn-primary">
              + תור חדש
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
