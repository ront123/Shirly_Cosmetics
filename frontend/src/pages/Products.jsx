import { useState } from 'react';
import { Plus, Package, Search, Edit2, Trash2, Tag } from 'lucide-react';

const CATEGORIES = ['כולם', 'טיפולי פנים', 'לייזר', 'מוצרי טיפוח', 'ציוד'];

const initialProducts = [
  { id: 1, name: 'סרום ויטמין C', category: 'מוצרי טיפוח', price: 280, cost: 120, stock: 15, sku: 'SKN-001' },
  { id: 2, name: 'קרם לחות SPF50', category: 'מוצרי טיפוח', price: 190, cost: 80, stock: 22, sku: 'SKN-002' },
  { id: 3, name: 'מסכת פחם פעיל', category: 'מוצרי טיפוח', price: 95, cost: 35, stock: 40, sku: 'SKN-003' },
  { id: 4, name: 'ג\'ל אלוורה', category: 'מוצרי טיפוח', price: 65, cost: 22, stock: 50, sku: 'SKN-004' },
];

export default function Products() {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('כולם');
  const [showModal, setShowModal] = useState(false);

  const filtered = products.filter(p =>
    (catFilter === 'כולם' || p.category === catFilter) &&
    p.name.includes(search)
  );

  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);

  return (
    <div dir="rtl" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-black text-xl" style={{ color: 'var(--text-primary)' }}>מוצרים ושירותים</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>ניהול מלאי ומחירים</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={15} /> מוצר חדש
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card">
          <Package size={16} style={{ color: 'var(--violet)', marginBottom: 10 }} />
          <p className="font-black text-xl" style={{ color: 'var(--text-primary)' }}>{products.length}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>סה"כ מוצרים</p>
        </div>
        <div className="stat-card">
          <Tag size={16} style={{ color: 'var(--teal)', marginBottom: 10 }} />
          <p className="font-black text-xl" style={{ color: 'var(--text-primary)' }}>₪{totalValue.toLocaleString()}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>שווי מלאי</p>
        </div>
        <div className="stat-card">
          <Package size={16} style={{ color: 'var(--amber)', marginBottom: 10 }} />
          <p className="font-black text-xl" style={{ color: 'var(--accent)' }}>
            {products.filter(p => p.stock < 10).length}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>מלאי נמוך</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center" style={{ gap: 10 }}>
        <div className="relative flex-1">
          <Search size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)', pointerEvents: 'none' }} />
          <input className="input-dark" style={{ paddingRight: 36 }} placeholder="חיפוש מוצר…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex" style={{ gap: 3, background: 'var(--bg-elevated)', borderRadius: 10, padding: 4 }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCatFilter(c)}
              className="font-bold text-xs"
              style={{ padding: '6px 10px', borderRadius: 7, border: 'none', cursor: 'pointer', fontFamily: 'Heebo, sans-serif', whiteSpace: 'nowrap',
                background: catFilter === c ? 'var(--accent)' : 'transparent',
                color: catFilter === c ? '#fff' : 'var(--text-muted)',
                transition: 'all 0.15s ease' }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full" dir="rtl">
          <thead style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
            <tr>
              {['מוצר', 'קטגוריה', 'מחיר מכירה', 'מחיר עלות', 'מלאי', 'SKU', ''].map((h, i) => (
                <th key={i} className="text-right text-xs font-bold uppercase tracking-wider py-3 px-5" style={{ color: 'var(--text-faint)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="group transition-colors"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td className="py-4 px-5 font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{p.name}</td>
                <td className="py-4 px-5">
                  <span className="badge badge-violet">{p.category}</span>
                </td>
                <td className="py-4 px-5 font-black text-sm" style={{ color: 'var(--teal)' }}>₪{p.price}</td>
                <td className="py-4 px-5 text-sm" style={{ color: 'var(--text-muted)' }}>₪{p.cost}</td>
                <td className="py-4 px-5">
                  <span className={`badge ${p.stock < 10 ? 'badge-red' : 'badge-green'}`}>{p.stock} יח'</span>
                </td>
                <td className="py-4 px-5 text-sm font-mono" style={{ color: 'var(--text-faint)' }}>{p.sku}</td>
                <td className="py-4 px-5">
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ gap: 6 }}>
                    <button style={{ padding: 6, borderRadius: 7, background: 'var(--bg-hover)', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                      <Edit2 size={13} />
                    </button>
                    <button style={{ padding: 6, borderRadius: 7, background: 'var(--accent-light)', border: '1px solid var(--accent-border)', color: 'var(--accent)', cursor: 'pointer' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
