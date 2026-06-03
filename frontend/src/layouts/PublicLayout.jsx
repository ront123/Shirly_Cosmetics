import { Outlet } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function PublicLayout() {
  return (
    <div className="min-h-screen" style={{ background: '#0d0a09', direction: 'rtl' }}>
      
      {/* Decorative background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full opacity-10" 
          style={{ background: 'radial-gradient(circle, #e8b830, transparent)', filter: 'blur(80px)' }}></div>
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full opacity-10" 
          style={{ background: 'radial-gradient(circle, #b87333, transparent)', filter: 'blur(60px)' }}></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 text-center py-4 px-4" 
        style={{ background: 'rgba(13,10,9,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center justify-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" 
            style={{ background: 'linear-gradient(135deg, #e8b830, #c99a20)' }}>
            <Sparkles size={16} color="#0d0a09" />
          </div>
          <h1 className="text-xl font-black gradient-text">Shirly Cosmetics</h1>
        </div>
        <p className="text-xs mt-1" style={{ color: '#5a4a40' }}>יופי, אסתטיקה וטיפוח אישי</p>
      </header>

      {/* Content */}
      <main className="max-w-md mx-auto p-4 sm:p-6 pb-20 relative z-10">
        <Outlet />
      </main>

      <footer className="text-center py-6 text-xs" style={{ color: '#3a2e29' }}>
        © 2026 Shirly Cosmetics · כל הזכויות שמורות
      </footer>
    </div>
  );
}
