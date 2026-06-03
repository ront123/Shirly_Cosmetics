import { useState } from 'react';
import { TrendingUp, TrendingDown, Banknote, ShoppingBag, Users, CalendarDays, ArrowLeft, Download } from 'lucide-react';

const months = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];

const monthlyRevenue = [12000,14500,11000,18000,16500,24500,0,0,0,0,0,0];
const monthlyExpenses = [4000,5000,3800,6000,5500,7200,0,0,0,0,0,0];

const topTreatments = [
  { name: 'טיפול פנים קלאסי', count: 48, revenue: '₪16,800' },
  { name: 'לייזר שיער — רגליים', count: 31, revenue: '₪4,650' },
  { name: 'ניקוי פנים עמוק', count: 24, revenue: '₪7,680' },
  { name: 'טיפול פנים זוהר', count: 19, revenue: '₪5,320' },
];

const topClients = [
  { name: 'שרה ברגמן', visits: 20, total: '₪7,000' },
  { name: 'מיכל לוי', visits: 12, total: '₪4,200' },
  { name: 'רחל אברמוב', visits: 7, total: '₪2,450' },
  { name: 'דנה ישראלי', visits: 5, total: '₪1,750' },
];

const maxRevenue = Math.max(...monthlyRevenue.filter(v => v > 0));

export default function Reports() {
  const [period, setPeriod] = useState('month');

  const PERIODS = [
    { key: 'week', label: 'שבוע' },
    { key: 'month', label: 'חודש' },
    { key: 'year', label: 'שנה' },
  ];

  const kpis = [
    { label: 'הכנסות החודש', value: '₪24,500', change: '+12%', up: true, icon: Banknote, color: 'var(--teal)' },
    { label: 'הוצאות החודש', value: '₪7,200', change: '+5%', up: false, icon: TrendingDown, color: 'var(--accent)' },
    { label: 'רווח נקי', value: '₪17,300', change: '+17%', up: true, icon: TrendingUp, color: 'var(--green)' },
    { label: 'תורים שהושלמו', value: '68', change: '+8 מהחודש', up: true, icon: CalendarDays, color: 'var(--violet)' },
  ];

  return (
    <div dir="rtl" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-black text-xl" style={{ color: 'var(--text-primary)' }}>דוחות ואנליטיקה</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>סיכום ביצועי הקליניקה</p>
        </div>
        <div className="flex items-center" style={{ gap: 10 }}>
          <div className="flex" style={{ gap: 3, background: 'var(--bg-elevated)', borderRadius: 10, padding: 4 }}>
            {PERIODS.map(p => (
              <button key={p.key} onClick={() => setPeriod(p.key)}
                className="font-bold text-xs"
                style={{ padding: '6px 14px', borderRadius: 7, border: 'none', cursor: 'pointer', fontFamily: 'Heebo, sans-serif',
                  background: period === p.key ? 'var(--accent)' : 'transparent',
                  color: period === p.key ? '#fff' : 'var(--text-muted)',
                  transition: 'all 0.15s ease' }}>
                {p.label}
              </button>
            ))}
          </div>
          <button className="btn-ghost flex items-center" style={{ gap: 6 }}>
            <Download size={15} /> ייצוא Excel
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <div key={i} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <div style={{ width: 36, height: 36, borderRadius: 9, background: `color-mix(in srgb, ${k.color} 15%, transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <k.icon size={16} style={{ color: k.color }} />
              </div>
              <span className="text-xs font-bold" style={{ color: k.up ? 'var(--green)' : 'var(--accent)' }}>{k.change}</span>
            </div>
            <p className="font-black text-xl" style={{ color: 'var(--text-primary)' }}>{k.value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{k.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar chart */}
        <div className="lg:col-span-2 card p-6">
          <h3 className="font-bold mb-5" style={{ color: 'var(--text-primary)' }}>הכנסות מול הוצאות — 2026</h3>
          <div className="flex items-end justify-between" style={{ gap: 6, height: 160 }}>
            {months.map((m, i) => {
              const rev = monthlyRevenue[i];
              const exp = monthlyExpenses[i];
              const future = rev === 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center" style={{ gap: 3 }}>
                  <div className="flex items-end w-full" style={{ gap: 2, height: 130 }}>
                    <div className="flex-1 rounded-t-md transition-all"
                      style={{ height: future ? 4 : `${(rev / maxRevenue) * 100}%`,
                        background: future ? 'var(--border)' : 'var(--teal)',
                        opacity: future ? 0.3 : 1, minHeight: 4 }} />
                    <div className="flex-1 rounded-t-md transition-all"
                      style={{ height: future ? 4 : `${(exp / maxRevenue) * 100}%`,
                        background: future ? 'var(--border)' : 'var(--accent)',
                        opacity: future ? 0.3 : 0.7, minHeight: 4 }} />
                  </div>
                  <span className="text-center" style={{ fontSize: 9, color: 'var(--text-faint)' }}>{m.slice(0,3)}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center mt-4" style={{ gap: 20 }}>
            <div className="flex items-center" style={{ gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--teal)' }}></div>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>הכנסות</span>
            </div>
            <div className="flex items-center" style={{ gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--accent)', opacity: 0.7 }}></div>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>הוצאות</span>
            </div>
          </div>
        </div>

        {/* Payment methods */}
        <div className="card p-6">
          <h3 className="font-bold mb-5" style={{ color: 'var(--text-primary)' }}>אמצעי תשלום</h3>
          <div className="space-y-3">
            {[
              { label: 'אשראי', pct: 58, color: 'var(--violet)' },
              { label: 'מזומן', pct: 28, color: 'var(--teal)' },
              { label: 'העברה', pct: 14, color: 'var(--amber)' },
            ].map((p, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{p.label}</span>
                  <span className="text-sm font-black" style={{ color: p.color }}>{p.pct}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: 'var(--bg-elevated)' }}>
                  <div style={{ width: `${p.pct}%`, height: '100%', borderRadius: 3, background: p.color, transition: 'width 0.5s ease' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top treatments */}
        <div className="card p-6">
          <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>טיפולים מובילים</h3>
          <div className="space-y-3">
            {topTreatments.map((t, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                <div className="flex items-center" style={{ gap: 10 }}>
                  <span className="font-black text-sm" style={{ color: 'var(--text-faint)', width: 20 }}>#{i+1}</span>
                  <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{t.name}</span>
                </div>
                <div className="flex items-center" style={{ gap: 14 }}>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.count} ביקורים</span>
                  <span className="font-black text-sm" style={{ color: 'var(--teal)' }}>{t.revenue}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top clients */}
        <div className="card p-6">
          <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>לקוחות מובילות</h3>
          <div className="space-y-3">
            {topClients.map((c, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                <div className="flex items-center" style={{ gap: 10 }}>
                  <div className="flex items-center justify-center font-black text-xs"
                    style={{ width: 32, height: 32, borderRadius: 8, background: `hsl(${i * 60 + 200},50%,14%)`, color: `hsl(${i * 60 + 200},60%,60%)` }}>
                    {c.name[0]}
                  </div>
                  <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{c.name}</span>
                </div>
                <div className="flex items-center" style={{ gap: 14 }}>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{c.visits} ביקורים</span>
                  <span className="font-black text-sm" style={{ color: 'var(--violet)' }}>{c.total}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
