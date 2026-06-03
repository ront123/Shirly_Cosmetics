import { Outlet } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function PublicLayout() {
  return (
    <div dir="rtl" className="min-h-screen" style={{ background: 'var(--bg-base)' }}>

      {/* Subtle ambient glow */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -100, right: '20%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(244,63,94,0.07), transparent)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: '20%', left: '10%', width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.07), transparent)', filter: 'blur(50px)' }} />
      </div>

      {/* Header */}
      <header
        className="sticky top-0 z-50 text-center"
        style={{ padding: '14px 16px', background: 'rgba(13,13,18,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-center" style={{ gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 10px rgba(244,63,94,0.35)' }}>
            <Sparkles size={15} color="#fff" />
          </div>
          <h1 className="font-black text-lg gradient-text">Shirly Cosmetics</h1>
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 3 }}>יופי, אסתטיקה וטיפוח אישי</p>
      </header>

      {/* Page */}
      <main className="relative z-10" style={{ maxWidth: 440, margin: '0 auto', padding: '20px 16px 80px' }}>
        <Outlet />
      </main>

      <footer className="text-center" style={{ paddingBottom: 24, fontSize: 11, color: 'var(--text-faint)' }}>
        © 2026 Shirly Cosmetics · כל הזכויות שמורות
      </footer>
    </div>
  );
}
