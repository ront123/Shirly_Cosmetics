import { TrendingUp, TrendingDown, CalendarDays, Users, Banknote, Megaphone, ArrowLeft, Clock } from 'lucide-react';

export default function Dashboard() {
  const stats = [
    { label: 'תורים היום', value: '8', change: '+2 מאתמול', positive: true, icon: CalendarDays, color: '#e8b830' },
    { label: 'הכנסות החודש', value: '₪24,500', change: '+12%', positive: true, icon: Banknote, color: '#34d399' },
    { label: 'לקוחות פעילים', value: '147', change: '+14 החודש', positive: true, icon: Users, color: '#60a5fa' },
    { label: 'קמפיינים פעילים', value: '2', change: '42 ייצאו בקרוב', positive: null, icon: Megaphone, color: '#f87171' },
  ];

  const upcomingAppointments = [
    { time: '09:00', client: 'דנה ישראלי', treatment: 'טיפול פנים קלאסי', therapist: 'שירלי', duration: '60 דק\'', status: 'confirmed' },
    { time: '10:30', client: 'מיכל לוי', treatment: 'לייזר שיער - רגליים', therapist: 'נועה', duration: '45 דק\'', status: 'confirmed' },
    { time: '12:00', client: 'אורית כהן', treatment: 'ניקוי פנים עמוק', therapist: 'שירלי', duration: '60 דק\'', status: 'pending' },
    { time: '14:30', client: 'רחל אברמוב', treatment: 'טיפול פנים זוהר', therapist: 'דנה', duration: '45 דק\'', status: 'confirmed' },
  ];

  const quickActions = [
    { label: 'שלח תזכורות ללקוחות', desc: '12 לקוחות לא ביקרו חודש+', color: '#e8b830', emoji: '📩' },
    { label: 'צור קמפיין חדש', desc: 'WhatsApp + אינסטגרם', color: '#34d399', emoji: '🚀' },
    { label: 'הוסף סוג טיפול', desc: 'הגדר מחיר ומשך', color: '#60a5fa', emoji: '✨' },
  ];

  return (
    <div className="space-y-6" dir="rtl">

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="stat-card group cursor-default">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" 
                style={{ background: `${stat.color}15`, border: `1px solid ${stat.color}25` }}>
                <stat.icon size={18} style={{ color: stat.color }} />
              </div>
              {stat.positive !== null && (
                stat.positive 
                  ? <TrendingUp size={16} style={{ color: '#34d399' }} />
                  : <TrendingDown size={16} style={{ color: '#f87171' }} />
              )}
            </div>
            <h3 className="text-2xl font-black mb-1" style={{ color: '#fdf8f5' }}>{stat.value}</h3>
            <p className="text-sm font-medium mb-1" style={{ color: '#8a7060' }}>{stat.label}</p>
            <p className="text-xs font-medium" style={{ color: stat.positive ? '#34d399' : stat.positive === false ? '#f87171' : '#e8b830' }}>
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Upcoming appointments */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-lg" style={{ color: '#fdf8f5' }}>התורים הקרובים היום</h3>
            <button className="flex items-center gap-1 text-sm font-medium" style={{ color: '#e8b830' }}>
              לכל היומן <ArrowLeft size={14} />
            </button>
          </div>

          <div className="space-y-3">
            {upcomingAppointments.map((appt, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl transition-all group"
                style={{ background: '#1a1410', border: '1px solid rgba(255,255,255,0.05)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(232,184,48,0.2)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'}>
                
                <div className="text-center flex-shrink-0">
                  <div className="w-14 h-14 rounded-xl flex flex-col items-center justify-center"
                    style={{ background: 'rgba(232,184,48,0.1)', border: '1px solid rgba(232,184,48,0.2)' }}>
                    <Clock size={12} style={{ color: '#e8b830', marginBottom: '2px' }} />
                    <span className="font-black text-sm" style={{ color: '#e8b830' }}>{appt.time}</span>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate" style={{ color: '#fdf8f5' }}>{appt.client}</p>
                  <p className="text-sm truncate" style={{ color: '#8a7060' }}>{appt.treatment} · {appt.therapist}</p>
                </div>

                <div className="flex-shrink-0 flex flex-col items-end gap-2">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)', color: '#5a4a40' }}>
                    {appt.duration}
                  </span>
                  <span className={appt.status === 'confirmed' ? 'badge-green' : 'badge-gold'}>
                    {appt.status === 'confirmed' ? 'מאושר' : 'ממתין'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions + Alerts */}
        <div className="space-y-4">
          {/* Quick actions */}
          <div className="card p-5">
            <h3 className="font-bold mb-4" style={{ color: '#fdf8f5' }}>פעולות מהירות</h3>
            <div className="space-y-2">
              {quickActions.map((action, i) => (
                <button key={i} className="w-full flex items-center gap-3 p-3 rounded-xl text-right transition-all"
                  style={{ background: '#1a1410', border: '1px solid rgba(255,255,255,0.05)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = `${action.color}30`; e.currentTarget.style.background = `${action.color}08`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.background = '#1a1410'; }}>
                  <span className="text-xl">{action.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: '#fdf8f5' }}>{action.label}</p>
                    <p className="text-xs truncate" style={{ color: '#5a4a40' }}>{action.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Alert card */}
          <div className="p-5 rounded-2xl relative overflow-hidden" 
            style={{ background: 'linear-gradient(135deg, #1a1208 0%, #1e1509 100%)', border: '1px solid rgba(232,184,48,0.2)' }}>
            <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg, transparent, #e8b830, transparent)' }}></div>
            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#e8b830' }}>⚡ התראה</p>
            <p className="font-semibold text-sm mb-1" style={{ color: '#fdf8f5' }}>12 לקוחות לא ביקרו</p>
            <p className="text-xs mb-4" style={{ color: '#8a7060' }}>מעל חודש ללא ביקור, מומלץ לשלוח תזכורת</p>
            <button className="btn-primary text-xs py-2 px-4 w-full">שלח תזכורת עכשיו</button>
          </div>
        </div>
      </div>
    </div>
  );
}
