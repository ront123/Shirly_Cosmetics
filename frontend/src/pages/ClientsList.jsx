import { useState } from 'react';
import { Search, Plus, Phone, Calendar, MoreVertical, TrendingUp } from 'lucide-react';

const clients = [
  { id: 1, name: 'דנה ישראלי',  initials: 'ד', phone: '050-1234567', lastVisit: '2026-05-10', visits: 5,  spent: '₪1,750', status: 'active',   hue: 340 },
  { id: 2, name: 'מיכל לוי',    initials: 'מ', phone: '052-9876543', lastVisit: '2026-04-22', visits: 12, spent: '₪4,200', status: 'inactive', hue: 200 },
  { id: 3, name: 'אורית כהן',   initials: 'א', phone: '054-5555555', lastVisit: '2026-06-01', visits: 2,  spent: '₪700',   status: 'active',   hue: 270 },
  { id: 4, name: 'רחל אברמוב',  initials: 'ר', phone: '053-1111111', lastVisit: '2026-05-28', visits: 7,  spent: '₪2,450', status: 'active',   hue: 160 },
  { id: 5, name: 'שרה ברגמן',   initials: 'ש', phone: '050-9999999', lastVisit: '2026-03-15', visits: 20, spent: '₪7,000', status: 'inactive', hue: 40  },
];

const FILTERS = [
  { key: 'all',      label: 'כולן'    },
  { key: 'active',   label: 'פעילות'  },
  { key: 'inactive', label: 'רדומות'  },
];

export default function ClientsList() {
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('all');

  const visible = clients.filter(c =>
    (c.name.includes(search) || c.phone.includes(search)) &&
    (filter === 'all' || c.status === filter)
  );

  return (
    <div dir="rtl" className="flex flex-col h-full rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>

      {/* Header */}
      <div className="p-5 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-black text-lg" style={{ color: 'var(--text-primary)' }}>לקוחות</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{clients.length} לקוחות רשומות</p>
          </div>
          <button className="btn-primary"><Plus size={15} /> לקוחה חדשה</button>
        </div>

        <div className="flex items-center" style={{ gap: 10 }}>
          {/* Search */}
          <div className="relative flex-1">
            <Search size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)', pointerEvents: 'none' }} />
            <input className="input-dark" style={{ paddingRight: 36 }} placeholder="חיפוש לפי שם או טלפון…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {/* Filter tabs */}
          <div className="flex" style={{ gap: 3, background: 'var(--bg-elevated)', borderRadius: 10, padding: 4 }}>
            {FILTERS.map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className="font-bold text-xs"
                style={{
                  padding: '6px 12px', borderRadius: 7, border: 'none', cursor: 'pointer',
                  fontFamily: 'Heebo, sans-serif',
                  background: filter === f.key ? 'var(--accent)'  : 'transparent',
                  color:      filter === f.key ? '#fff'            : 'var(--text-muted)',
                  transition: 'all 0.15s ease',
                }}
              >{f.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full" dir="rtl">
          <thead className="sticky top-0 z-10" style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
            <tr>
              {['לקוחה','טלפון','ביקור אחרון','ביקורים','סה"כ הוצאה','סטטוס',''].map((h, i) => (
                <th key={i} className="text-right text-xs font-bold uppercase tracking-wider py-3 px-5" style={{ color: 'var(--text-faint)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map(c => (
              <tr key={c.id} className="group"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'background 0.15s ease' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* Name */}
                <td className="py-4 px-5">
                  <div className="flex items-center" style={{ gap: 10 }}>
                    <div className="flex items-center justify-center font-black text-sm flex-shrink-0"
                      style={{ width: 36, height: 36, borderRadius: 9, background: `hsl(${c.hue},55%,14%)`, color: `hsl(${c.hue},70%,65%)`, border: `1px solid hsl(${c.hue},40%,20%)` }}>
                      {c.initials}
                    </div>
                    <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{c.name}</span>
                  </div>
                </td>
                {/* Phone */}
                <td className="py-4 px-5">
                  <div className="flex items-center" style={{ gap: 6 }}>
                    <Phone size={13} style={{ color: 'var(--text-faint)', flexShrink: 0 }} />
                    <span className="text-sm" dir="ltr" style={{ color: 'var(--text-secondary)' }}>{c.phone}</span>
                  </div>
                </td>
                {/* Last visit */}
                <td className="py-4 px-5">
                  <div className="flex items-center" style={{ gap: 6 }}>
                    <Calendar size={13} style={{ color: 'var(--text-faint)', flexShrink: 0 }} />
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{c.lastVisit}</span>
                  </div>
                </td>
                {/* Visits */}
                <td className="py-4 px-5">
                  <div className="flex items-center" style={{ gap: 6 }}>
                    <TrendingUp size={13} style={{ color: 'var(--text-faint)', flexShrink: 0 }} />
                    <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{c.visits}</span>
                  </div>
                </td>
                {/* Spent */}
                <td className="py-4 px-5">
                  <span className="font-bold text-sm" style={{ color: 'var(--violet)' }}>{c.spent}</span>
                </td>
                {/* Status */}
                <td className="py-4 px-5">
                  <span className={`badge ${c.status === 'active' ? 'badge-green' : 'badge-red'}`}>
                    {c.status === 'active' ? 'פעילה' : 'רדומה'}
                  </span>
                </td>
                {/* Actions */}
                <td className="py-4 px-5">
                  <button className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--bg-hover)', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <MoreVertical size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
