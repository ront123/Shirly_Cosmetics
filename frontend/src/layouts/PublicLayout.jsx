import { Outlet } from 'react-router-dom';

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-pink-50/30 font-sans text-slate-800" dir="rtl">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-pink-100 sticky top-0 z-10 text-center py-4">
        <h1 className="text-2xl font-bold text-pink-600 tracking-tight">Shirly Cosmetics</h1>
        <p className="text-sm text-slate-500 mt-1">יופי, אסתטיקה וטיפוח אישי</p>
      </header>
      
      {/* Content */}
      <main className="max-w-md mx-auto p-4 sm:p-6 pb-20">
        <Outlet />
      </main>

      <footer className="text-center py-6 text-sm text-slate-400">
        מופעל על ידי מערכת Shirly Cosmetics
      </footer>
    </div>
  );
}
