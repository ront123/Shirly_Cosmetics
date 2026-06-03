import { useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { format, addDays, startOfWeek } from 'date-fns';
import { he } from 'date-fns/locale';

const COLORS = [
  { bg: 'var(--accent-light)',  bdr: 'var(--accent-border)',  txt: 'var(--accent)'  },
  { bg: 'var(--violet-light)', bdr: 'var(--violet-border)', txt: 'var(--violet)' },
  { bg: 'var(--teal-light)',   bdr: 'var(--teal-border)',   txt: 'var(--teal)'   },
];

const sampleAppointments = [
  { day: 1, hour: 10, client: 'דנה ישראלי',  treatment: 'טיפול פנים', color: COLORS[0] },
  { day: 3, hour: 11, client: 'מיכל לוי',    treatment: 'לייזר רגליים', color: COLORS[1] },
  { day: 1, hour: 14, client: 'אורית כהן',   treatment: 'פנים זוהר',  color: COLORS[2] },
  { day: 4, hour: 9,  client: 'רחל אברמוב',  treatment: 'ניקוי עמוק', color: COLORS[0] },
];

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const startDate = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 6 }).map((_, i) => addDays(startDate, i));
  const hours = Array.from({ length: 11 }).map((_, i) => i + 9);

  const isToday = (day) => format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  return (
    <div dir="rtl" className="flex flex-col h-full rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>

      {/* Header */}
      <div className="flex items-center p-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)', gap: 12 }}>
        <h2 className="font-black text-base" style={{ color: 'var(--text-primary)' }}>
          {format(currentDate, 'MMMM yyyy', { locale: he })}
        </h2>
        <div className="flex items-center" style={{ gap: 2, background: 'var(--bg-elevated)', borderRadius: 10, padding: 3 }}>
          <button onClick={() => setCurrentDate(addDays(currentDate, -7))} className="btn-ghost" style={{ padding: '5px 8px', border: 'none', borderRadius: 7 }}>
            <ChevronRight size={16} />
          </button>
          <button onClick={() => setCurrentDate(new Date())} className="btn-ghost" style={{ padding: '5px 10px', border: 'none', borderRadius: 7, fontSize: 12 }}>
            היום
          </button>
          <button onClick={() => setCurrentDate(addDays(currentDate, 7))} className="btn-ghost" style={{ padding: '5px 8px', border: 'none', borderRadius: 7 }}>
            <ChevronLeft size={16} />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto">
        <div style={{ minWidth: 640 }}>

          {/* Day headers */}
          <div className="grid grid-cols-7 sticky top-0 z-10" style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
            <div style={{ width: 56 }} />
            {weekDays.map((day, i) => (
              <div key={i} className="text-center py-3">
                <p className="text-xs font-bold uppercase" style={{ color: 'var(--text-faint)', marginBottom: 6 }}>
                  {format(day, 'EEEE', { locale: he })}
                </p>
                <div
                  className="flex items-center justify-center mx-auto font-black text-base"
                  style={{
                    width: 34, height: 34, borderRadius: 9,
                    background: isToday(day) ? 'var(--accent)' : 'transparent',
                    color: isToday(day) ? '#fff' : 'var(--text-primary)',
                    boxShadow: isToday(day) ? '0 2px 10px rgba(244,63,94,0.4)' : 'none',
                  }}
                >
                  {format(day, 'd')}
                </div>
              </div>
            ))}
          </div>

          {/* Time rows */}
          {hours.map((hour) => (
            <div key={hour} className="grid grid-cols-7" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="flex items-start justify-center pt-2" style={{ width: 56 }}>
                <span className="text-xs font-semibold" style={{ color: 'var(--text-faint)' }}>{hour}:00</span>
              </div>
              {weekDays.map((_, i) => {
                const appt = sampleAppointments.find(a => a.hour === hour && a.day === i);
                return (
                  <div
                    key={i}
                    className="relative"
                    style={{ height: 72, borderRight: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'background 0.15s ease' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {appt && (
                      <div
                        className="absolute"
                        style={{
                          inset: '4px 4px 4px 4px',
                          borderRadius: 8,
                          background: appt.color.bg,
                          border: `1px solid ${appt.color.bdr}`,
                          padding: '5px 8px',
                        }}
                      >
                        <p className="font-bold truncate" style={{ fontSize: 11, color: appt.color.txt }}>{appt.client}</p>
                        <p className="truncate" style={{ fontSize: 10, color: appt.color.txt, opacity: 0.7, marginTop: 1 }}>{appt.treatment}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
