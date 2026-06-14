import { TrendingUp, TrendingDown, CalendarDays, Users, Banknote, Megaphone, Clock, ArrowLeft, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import REAL_APPOINTMENTS from '../data/appointments.json';

const stats = [
  { label: 'תורים היום',     value: '8',       change: '+2 מאתמול',  up: true,  icon: CalendarDays, color: 'var(--accent)',  bg: 'var(--accent-light)',  bdr: 'var(--accent-border)'  },
  { label: 'הכנסות החודש',   value: '₪24,500', change: '+12%',       up: true,  icon: Banknote,     color: 'var(--teal)',    bg: 'var(--teal-light)',    bdr: 'var(--teal-border)'    },
  { label: 'לקוחות פעילים',  value: '147',     change: '+14 החודש',  up: true,  icon: Users,        color: 'var(--violet)', bg: 'var(--violet-light)', bdr: 'var(--violet-border)' },
  { label: 'קמפיינים פעילים',value: '2',       change: '42 ייצאו בקרוב', up: null, icon: Megaphone, color: 'var(--amber)',   bg: 'var(--amber-light)',   bdr: 'var(--amber-border)'   },
];

const quickActions = [
  { label: 'שלח תזכורות ללקוחות', sub: '12 לקוחות לא ביקרו חודש+', emoji: '📩', color: 'var(--accent)'  },
  { label: 'צור קמפיין חדש',       sub: 'WhatsApp + אינסטגרם',       emoji: '🚀', color: 'var(--teal)'   },
  { label: 'הוסף סוג טיפול',        sub: 'הגדר מחיר ומשך',           emoji: '✨', color: 'var(--violet)' },
];

export default function Dashboard() {
  const [syncStatus, setSyncStatus] = useState(null);
  const [syncing, setSyncing] = useState(false);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const appointmentsToDisplay = REAL_APPOINTMENTS.length > 0
    ? REAL_APPOINTMENTS
        .filter(appt => appt.startTime.startsWith(todayStr))
        .map(appt => {
          const dateObj = new Date(appt.startTime);
          const timeStr = dateObj.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
          return {
            time: timeStr,
            client: appt.clientName,
            treatment: appt.treatmentName,
            therapist: appt.therapistName,
            status: appt.status === 'confirmed' || appt.status === 'scheduled' ? 'confirmed' : 'pending'
          };
        })
        .sort((a, b) => a.time.localeCompare(b.time))
    : [
        { time: '09:00', client: 'דנה ישראלי',   treatment: 'טיפול פנים קלאסי',  therapist: 'שירלי', status: 'confirmed' },
        { time: '10:30', client: 'מיכל לוי',     treatment: 'לייזר שיער — רגליים', therapist: 'נועה',  status: 'confirmed' },
        { time: '12:00', client: 'אורית כהן',    treatment: 'ניקוי פנים עמוק',    therapist: 'שירלי', status: 'pending'   },
        { time: '14:30', client: 'רחל אברמוב',   treatment: 'טיפול פנים זוהר',    therapist: 'דנה',   status: 'confirmed' },
      ];

  const fetchSyncStatus = async () => {
    try {
      // In dev, assuming backend is on port 5001
      const res = await fetch('http://localhost:5001/api/sync-status');
      if (res.ok) {
        const data = await res.json();
        setSyncStatus(data.data);
      }
    } catch (e) {
      console.error('Failed to fetch sync status', e);
    }
  };

  useEffect(() => {
    fetchSyncStatus();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch('http://localhost:5001/api/sync', { method: 'POST' });
      if (res.ok) {
        await fetchSyncStatus();
      }
    } catch (e) {
      console.error('Sync failed', e);
    }
    setSyncing(false);
  };

  return (
    <div dir="rtl" className="space-y-6">

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, border: `1px solid ${s.bdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.icon size={17} style={{ color: s.color }} />
              </div>
              {s.up !== null && (s.up
                ? <TrendingUp size={15} style={{ color: 'var(--green)' }} />
                : <TrendingDown size={15} style={{ color: 'var(--accent)' }} />
              )}
            </div>
            <p className="text-2xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
            <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            <p className="text-xs font-semibold" style={{ color: s.up ? 'var(--green)' : s.up === false ? 'var(--accent)' : 'var(--amber)' }}>{s.change}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Appointments */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>התורים הקרובים היום</h3>
            <button className="flex items-center gap-1 text-sm font-semibold" style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>
              לכל היומן <ArrowLeft size={14} />
            </button>
          </div>

          <div className="space-y-3">
            {appointmentsToDisplay.length > 0 ? (
              appointmentsToDisplay.map((a, i) => (
                <div
                  key={i}
                  className="flex items-center rounded-xl transition-all"
                  style={{ gap: 14, padding: '12px 14px', background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hover)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  {/* Time chip */}
                  <div className="flex items-center justify-center flex-shrink-0" style={{
                    width: 54, height: 46, borderRadius: 10,
                    background: 'var(--accent-light)', border: '1px solid var(--accent-border)',
                    flexDirection: 'column',
                  }}>
                    <Clock size={10} style={{ color: 'var(--accent)', marginBottom: 1 }} />
                    <span className="font-black text-xs" style={{ color: 'var(--accent)' }}>{a.time}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{a.client}</p>
                    <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>{a.treatment} · {a.therapist}</p>
                  </div>

                  <span className={`badge ${a.status === 'confirmed' ? 'badge-green' : 'badge-amber'}`}>
                    {a.status === 'confirmed' ? 'מאושר' : 'ממתין'}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-xs" style={{ color: 'var(--text-muted)' }}>
                אין תורים מתוזמנים להיום.
              </div>
            )}
          </div>
        </div>

        {/* Sidebar widgets */}
        <div className="space-y-4">

          {/* Quick actions */}
          <div className="card p-5">
            <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>פעולות מהירות</h3>
            <div className="space-y-2">
              {quickActions.map((q, i) => (
                <button
                  key={i}
                  className="w-full flex items-center rounded-xl text-right transition-all"
                  style={{ gap: 12, padding: '10px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.background = 'var(--bg-hover)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                >
                  <span style={{ fontSize: 20, lineHeight: 1 }}>{q.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{q.label}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{q.sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Alert */}
          <div className="card p-5" style={{ background: 'var(--accent-light)', borderColor: 'var(--accent-border)' }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--accent)' }}>⚡ התראה</p>
            <p className="font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>12 לקוחות לא ביקרו</p>
            <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>מעל חודש ללא ביקור. מומלץ לשלוח תזכורת.</p>
            <button className="btn-primary w-full justify-center text-xs py-2">שלח תזכורת עכשיו</button>
          </div>

          {/* Easybizy Sync Widget */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>סנכרון Easybizy</h3>
              <div className="flex items-center justify-center flex-shrink-0"
                style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--violet-light)', color: 'var(--violet)' }}>
                <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
              </div>
            </div>
            
            <div className="text-xs space-y-1.5 mb-4" style={{ color: 'var(--text-secondary)' }}>
              <p>סטטוס: {syncStatus?.last_sync ? 'פעיל' : 'ממתין לסנכרון ראשון'}</p>
              {syncStatus?.last_sync && (
                <p>סונכרן לאחרונה: {new Date(syncStatus.last_sync).toLocaleString('he-IL')}</p>
              )}
              {syncStatus?.total_synced > 0 && (
                <p>סה"כ יובאו: {syncStatus.total_synced} לקוחות</p>
              )}
              {syncStatus?.source && (
                <p>ערוץ סנכרון: {syncStatus.source === 'chrome_extension' ? '🔌 תוסף כרום' : '🔑 שרת API'}</p>
              )}
            </div>
            
            <button 
              onClick={handleSync} 
              disabled={syncing}
              className="w-full flex items-center justify-center rounded-xl font-bold transition-all mb-3"
              style={{ 
                padding: '9px 12px', 
                background: 'var(--bg-hover)', 
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                fontSize: 13,
                opacity: syncing ? 0.7 : 1,
                cursor: syncing ? 'wait' : 'pointer'
              }}
            >
              {syncing ? 'מסנכרן...' : 'סנכרן עכשיו משרת API'}
            </button>

            <div className="border-t pt-3 mt-1" style={{ borderColor: 'var(--border)' }}>
              <p className="text-[11px] font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>💡 סנכרון באמצעות תוסף דפדפן:</p>
              <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                ניתן לסנכרן ישירות מהלשונית של איזי ביזי באמצעות תוסף הכרום בתיקיית <code style={{ color: 'var(--accent)' }}>extension/</code>.
                יש לטעון אותה בכתובת <code style={{ color: 'var(--accent)' }}>chrome://extensions</code> במצב מפתח.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
