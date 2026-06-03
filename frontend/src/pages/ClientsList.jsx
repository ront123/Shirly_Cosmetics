import { useState } from 'react';
import { Search, Plus, Phone, Calendar as CalendarIcon, User, MoreVertical } from 'lucide-react';

export default function ClientsList() {
  const [searchTerm, setSearchTerm] = useState('');

  // Dummy clients
  const clients = [
    { id: 1, name: 'דנה ישראלי', phone: '050-1234567', lastVisit: '2026-05-10', totalVisits: 5, status: 'active' },
    { id: 2, name: 'מיכל לוי', phone: '052-9876543', lastVisit: '2026-04-22', totalVisits: 12, status: 'inactive' },
    { id: 3, name: 'אורית כהן', phone: '054-5555555', lastVisit: '2026-06-01', totalVisits: 2, status: 'active' },
  ];

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-pink-100 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-6 border-b border-pink-100 bg-white">
        <h2 className="text-xl font-bold text-slate-800">ניהול לקוחות</h2>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="חיפוש לקוח..."
              className="pl-4 pr-10 py-2 rounded-xl border border-pink-100 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none w-64 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm shadow-pink-200">
            <Plus size={16} />
            לקוחה חדשה
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-right">
          <thead className="bg-slate-50 sticky top-0 border-b border-pink-100">
            <tr>
              <th className="py-4 px-6 text-sm font-semibold text-slate-600">שם הלקוחה</th>
              <th className="py-4 px-6 text-sm font-semibold text-slate-600">טלפון</th>
              <th className="py-4 px-6 text-sm font-semibold text-slate-600">ביקור אחרון</th>
              <th className="py-4 px-6 text-sm font-semibold text-slate-600">סה"כ ביקורים</th>
              <th className="py-4 px-6 text-sm font-semibold text-slate-600">סטטוס</th>
              <th className="py-4 px-6 text-sm font-semibold text-slate-600"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-pink-50">
            {clients.map(client => (
              <tr key={client.id} className="hover:bg-pink-50/50 transition-colors group cursor-pointer">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
                      <User size={18} />
                    </div>
                    <span className="font-semibold text-slate-800">{client.name}</span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone size={14} className="text-slate-400" />
                    <span dir="ltr">{client.phone}</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-slate-600">
                  <div className="flex items-center gap-2">
                    <CalendarIcon size={14} className="text-slate-400" />
                    {client.lastVisit}
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-medium">
                    {client.totalVisits}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    client.status === 'active' 
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      : 'bg-rose-50 text-rose-600 border border-rose-100'
                  }`}>
                    {client.status === 'active' ? 'פעילה' : 'לא ביקרה לאחרונה'}
                  </span>
                </td>
                <td className="py-4 px-6 text-left">
                  <button className="p-2 text-slate-400 hover:text-pink-600 rounded-lg hover:bg-white opacity-0 group-hover:opacity-100 transition-all">
                    <MoreVertical size={18} />
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
