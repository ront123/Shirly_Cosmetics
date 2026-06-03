import { useState } from 'react';
import { Plus, TrendingDown, Search } from 'lucide-react';

const CATEGORIES = ['שכירות', 'ציוד', 'מוצרים', 'שיווק', 'אחר'];

const initialExpenses = [
  { id: 1, description: 'שכירות קליניקה', amount: 3500, category: 'שכירות', date: '2026-06-01' },
  { id: 2, description: 'ציוד לייזר', amount: 1800, category: 'ציוד', date: '2026-05-20' },
  { id: 3, description: 'פרסום אינסטגרם', amount: 500, category: 'שיווק', date: '2026-06-01' },
  { id: 4, description: 'רכישת מוצרי טיפוח', amount: 1400, category: 'מוצרים', date: '2026-05-28' },
];

export default function Expenses() {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newExp, setNewExp] = useState({ description: '', amount: '', category: 'אחר', date: new Date().toISOString().split('T')[0] });

  const totalThisMonth = expenses
    .filter(e => e.date.startsWith('2026-06'))
    .reduce((s, e) => s + e.amount, 0);

  const filtered = expenses.filter(e => e.description.includes(search) || e.category.includes(search));

  const addExpense = (e) => {
    e.preventDefault();
    setExpenses([...expenses, { ...newExp, id: Date.now(), amount: parseFloat(newExp.amount) }]);
    setShowModal(false);
    setNewExp({ description: '', amount: '', category: 'אחר', date: new Date().toISOString().split('T')[0] });
  };

  return (
    <div dir="rtl" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-black text-xl" style={{ color: 'var(--text-primary)' }}>הוצאות</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>מעקב הוצאות הקליניקה</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={15} /> הוצאה חדשה
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <TrendingDown size={16} style={{ color: 'var(--accent)', marginBottom: 10 }} />
          <p className="font-black text-xl" style={{ color: 'var(--text-primary)' }}>₪{totalThisMonth.toLocaleString()}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>הוצאות החודש</p>
        </div>
        {CATEGORIES.slice(0, 3).map((cat, i) => {
          const total = expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0);
          return (
            <div key={i} className="stat-card">
              <p className="text-xs font-bold mb-2" style={{ color: 'var(--text-muted)' }}>{cat}</p>
              <p className="font-black text-xl" style={{ color: 'var(--text-primary)' }}>₪{total.toLocaleString()}</p>
            </div>
          );
        })}
      </div>

      {/* Search + Table */}
      <div className="relative mb-4" style={{ maxWidth: 360 }}>
        <Search size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)', pointerEvents: 'none' }} />
        <input className="input-dark" style={{ paddingRight: 36 }} placeholder="חיפוש הוצאה…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card overflow-hidden">
        <table className="w-full" dir="rtl">
          <thead style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
            <tr>
              {['תיאור', 'קטגוריה', 'תאריך', 'סכום'].map((h, i) => (
                <th key={i} className="text-right text-xs font-bold uppercase tracking-wider py-3 px-5" style={{ color: 'var(--text-faint)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(exp => (
              <tr key={exp.id} className="group transition-colors"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td className="py-4 px-5 font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{exp.description}</td>
                <td className="py-4 px-5"><span className="badge badge-violet">{exp.category}</span></td>
                <td className="py-4 px-5 text-sm" style={{ color: 'var(--text-secondary)' }}>{exp.date}</td>
                <td className="py-4 px-5 font-black text-sm" style={{ color: 'var(--accent)' }}>₪{exp.amount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="card p-6 w-full" style={{ maxWidth: 420, background: 'var(--bg-surface)' }}>
            <h3 className="font-black text-lg mb-5" style={{ color: 'var(--text-primary)' }}>הוצאה חדשה</h3>
            <form onSubmit={addExpense} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>תיאור</label>
                <input className="input-dark" required value={newExp.description} onChange={e => setNewExp({...newExp, description: e.target.value})} placeholder="תיאור ההוצאה" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>סכום (₪)</label>
                <input className="input-dark" type="number" required value={newExp.amount} onChange={e => setNewExp({...newExp, amount: e.target.value})} placeholder="0" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>קטגוריה</label>
                <select className="input-dark" value={newExp.category} onChange={e => setNewExp({...newExp, category: e.target.value})}
                  style={{ background: 'var(--bg-base)' }}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>תאריך</label>
                <input className="input-dark" type="date" value={newExp.date} onChange={e => setNewExp({...newExp, date: e.target.value})} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1 justify-center">שמור</button>
                <button type="button" className="btn-ghost flex-1 justify-center" onClick={() => setShowModal(false)}>ביטול</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
