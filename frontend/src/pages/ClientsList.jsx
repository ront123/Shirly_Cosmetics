import { useState } from 'react';
import { Search, Plus, Phone, Calendar, MoreVertical, TrendingUp } from 'lucide-react';

export default function ClientsList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const clients = [
    { id: 1, name: 'דנה ישראלי', phone: '050-1234567', lastVisit: '2026-05-10', totalVisits: 5, totalSpent: '₪1,750', status: 'active' },
    { id: 2, name: 'מיכל לוי', phone: '052-9876543', lastVisit: '2026-04-22', totalVisits: 12, totalSpent: '₪4,200', status: 'inactive' },
    { id: 3, name: 'אורית כהן', phone: '054-5555555', lastVisit: '2026-06-01', totalVisits: 2, totalSpent: '₪700', status: 'active' },
    { id: 4, name: 'רחל אברמוב', phone: '053-1111111', lastVisit: '2026-05-28', totalVisits: 7, totalSpent: '₪2,450', status: 'active' },
    { id: 5, name: 'שרה ברגמן', phone: '050-9999999', lastVisit: '2026-03-15', totalVisits: 20, totalSpent: '₪7,000', status: 'inactive' },
  ];

  const filtered = clients.filter(c => {
    const matchSearch = c.name.includes(searchTerm) || c.phone.includes(searchTerm);
    const matchFilter = activeFilter === 'all' || c.status === activeFilter;
    return matchSearch && matchFilter;
  });

  const filters = [
    { key: 'all', label: 'כולן' },
    { key: 'active', label: 'פעילות' },
    { key: 'inactive', label: 'רדומות' },
  ];

  return (
    <div dir="rtl" className="flex flex-col h-full rounded-2xl overflow-hidden" style={{ background: '#111009', border: '1px solid rgba(255,255,255,0.07)' }}>
      
      {/* Header */}
      <div className="p-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-black" style={{ color: '#fdf8f5' }}>לקוחות</h2>
            <p className="text-sm mt-0.5" style={{ color: '#5a4a40' }}>{clients.length} לקוחות רשומות</p>
          </div>
          <button className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} />
            לקוחה חדשה
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#5a4a40' }} />
            <input 
              className="input-dark pr-9"
              placeholder="חיפוש לפי שם או טלפון..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: '#1a1410' }}>
            {filters.map(f => (
              <button key={f.key} onClick={() => setActiveFilter(f.key)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={activeFilter === f.key 
                  ? { background: 'linear-gradient(135deg, #e8b830, #c99a20)', color: '#0d0a09' }
                  : { color: '#5a4a40' }}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full" dir="rtl">
          <thead className="sticky top-0 z-10" style={{ background: '#111009', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <tr>
              <th className="text-right py-3 px-5 text-xs font-bold uppercase tracking-wider" style={{ color: '#3a2e29' }}>לקוחה</th>
              <th className="text-right py-3 px-5 text-xs font-bold uppercase tracking-wider" style={{ color: '#3a2e29' }}>טלפון</th>
              <th className="text-right py-3 px-5 text-xs font-bold uppercase tracking-wider" style={{ color: '#3a2e29' }}>ביקור אחרון</th>
              <th className="text-right py-3 px-5 text-xs font-bold uppercase tracking-wider" style={{ color: '#3a2e29' }}>ביקורים</th>
              <th className="text-right py-3 px-5 text-xs font-bold uppercase tracking-wider" style={{ color: '#3a2e29' }}>סה"כ הוצאה</th>
              <th className="text-right py-3 px-5 text-xs font-bold uppercase tracking-wider" style={{ color: '#3a2e29' }}>סטטוס</th>
              <th className="py-3 px-5"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((client, i) => (
              <tr key={client.id} className="group cursor-pointer transition-colors"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(232,184,48,0.03)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                
                <td className="py-4 px-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0"
                      style={{ background: `hsl(${i * 40 + 30}, 70%, 15%)`, color: `hsl(${i * 40 + 30}, 70%, 65%)`, border: `1px solid hsl(${i * 40 + 30}, 40%, 20%)` }}>
                      {client.name[0]}
                    </div>
                    <span className="font-bold text-sm" style={{ color: '#fdf8f5' }}>{client.name}</span>
                  </div>
                </td>
                <td className="py-4 px-5">
                  <div className="flex items-center gap-2">
                    <Phone size={13} style={{ color: '#5a4a40' }} />
                    <span className="text-sm" dir="ltr" style={{ color: '#8a7060' }}>{client.phone}</span>
                  </div>
                </td>
                <td className="py-4 px-5">
                  <div className="flex items-center gap-2">
                    <Calendar size={13} style={{ color: '#5a4a40' }} />
                    <span className="text-sm" style={{ color: '#8a7060' }}>{client.lastVisit}</span>
                  </div>
                </td>
                <td className="py-4 px-5">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={13} style={{ color: '#5a4a40' }} />
                    <span className="font-bold text-sm" style={{ color: '#fdf8f5' }}>{client.totalVisits}</span>
                  </div>
                </td>
                <td className="py-4 px-5">
                  <span className="font-bold text-sm" style={{ color: '#e8b830' }}>{client.totalSpent}</span>
                </td>
                <td className="py-4 px-5">
                  <span className={client.status === 'active' ? 'badge-green' : 'badge-red'}>
                    {client.status === 'active' ? 'פעילה' : 'רדומה'}
                  </span>
                </td>
                <td className="py-4 px-5">
                  <button className="p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    style={{ color: '#5a4a40', background: '#1a1410' }}>
                    <MoreVertical size={16} />
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
