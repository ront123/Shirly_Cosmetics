import { Outlet } from 'react-router-dom';
import { CalendarDays, Users, MessageCircle, BarChart3, Settings, Menu } from 'lucide-react';
import { useState } from 'react';

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { name: 'דשבורד', icon: BarChart3, path: '/' },
    { name: 'יומן תורים', icon: CalendarDays, path: '/calendar' },
    { name: 'לקוחות', icon: Users, path: '/clients' },
    { name: 'קמפיינים שיווקיים', icon: MessageCircle, path: '/campaigns' },
    { name: 'הגדרות', icon: Settings, path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-pink-50/30 flex text-slate-800" dir="rtl">
      {/* Sidebar */}
      <aside className={`bg-white border-l border-pink-100 shadow-sm transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} flex flex-col`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-pink-100">
          {sidebarOpen && <h1 className="font-bold text-xl text-pink-600 tracking-tight">Shirly Cosmetics</h1>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-pink-50 rounded-lg text-pink-500">
            <Menu size={20} />
          </button>
        </div>
        
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.path}
              className="flex items-center px-3 py-3 rounded-xl hover:bg-pink-50 text-slate-600 hover:text-pink-600 transition-colors group"
            >
              <item.icon size={20} className="group-hover:scale-110 transition-transform" />
              {sidebarOpen && <span className="mr-3 font-medium">{item.name}</span>}
            </a>
          ))}
        </nav>

        <div className="p-4 border-t border-pink-100">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-pink-200 flex items-center justify-center text-pink-700 font-bold">
              ש
            </div>
            {sidebarOpen && (
              <div className="mr-3">
                <p className="text-sm font-medium">שירלי</p>
                <p className="text-xs text-slate-500">מנהלת קליניקה</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-pink-100 flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-slate-800">שלום שירלי 👋</h2>
          <div className="flex items-center gap-4">
            <button className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm shadow-pink-200">
              + תור חדש
            </button>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
