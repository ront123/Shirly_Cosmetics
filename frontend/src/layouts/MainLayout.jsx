import { Outlet, NavLink } from 'react-router-dom';
import { CalendarDays, Users, MessageCircle, BarChart3, Settings, Menu, Sparkles, Bell, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { name: 'דשבורד', icon: BarChart3, path: '/' },
    { name: 'יומן תורים', icon: CalendarDays, path: '/calendar' },
    { name: 'לקוחות', icon: Users, path: '/clients' },
    { name: 'קמפיינים', icon: MessageCircle, path: '/campaigns' },
    { name: 'הגדרות', icon: Settings, path: '/settings' },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: '#0d0a09', direction: 'rtl' }}>
      
      {/* Sidebar */}
      <aside className={`
        flex flex-col border-l transition-all duration-300 relative
        ${sidebarOpen ? 'w-64' : 'w-20'}
      `} style={{ 
        background: '#0f0c0a', 
        borderColor: 'rgba(255,255,255,0.07)',
        minHeight: '100vh'
      }}>
        
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #e8b830, #c99a20)' }}>
                <Sparkles size={16} color="#0d0a09" />
              </div>
              <span className="font-black text-lg gradient-text tracking-tight">Shirly</span>
            </div>
          )}
          {!sidebarOpen && (
            <div className="w-8 h-8 rounded-xl flex items-center justify-center mx-auto" style={{ background: 'linear-gradient(135deg, #e8b830, #c99a20)' }}>
              <Sparkles size={16} color="#0d0a09" />
            </div>
          )}
          {sidebarOpen && (
            <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg transition-colors" style={{ color: '#5a4a40' }}
              onMouseEnter={e => e.target.style.color = '#e8b830'}
              onMouseLeave={e => e.target.style.color = '#5a4a40'}
            >
              <Menu size={18} />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {!sidebarOpen && (
            <button onClick={() => setSidebarOpen(true)} className="w-full flex justify-center p-2.5 rounded-lg mb-2 transition-colors" style={{ color: '#5a4a40' }}>
              <Menu size={18} />
            </button>
          )}
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon size={20} style={{ flexShrink: 0 }} />
              {sidebarOpen && <span className="me-3 font-medium text-sm">{item.name}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #e8b830, #c99a20)', color: '#0d0a09' }}>
              ש
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: '#fdf8f5' }}>שירלי סוני</p>
                <p className="text-xs truncate" style={{ color: '#5a4a40' }}>מנהלת קליניקה</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-6 flex-shrink-0" 
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(13,10,9,0.8)', backdropFilter: 'blur(20px)' }}>
          <div>
            <p className="text-xs font-medium mb-0.5" style={{ color: '#5a4a40' }}>
              {new Date().toLocaleDateString('he-IL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p className="font-bold" style={{ color: '#fdf8f5' }}>שלום שירלי! ✨</p>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl transition-colors" style={{ background: '#161210', border: '1px solid rgba(255,255,255,0.07)', color: '#8a7060' }}>
              <Bell size={18} />
              <span className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full" style={{ background: '#e8b830' }}></span>
            </button>
            <button className="btn-primary flex items-center gap-2 text-sm">
              + תור חדש
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
