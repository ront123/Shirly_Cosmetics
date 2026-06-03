import { useState } from 'react';
import { ChevronRight, ChevronLeft, Plus, Clock } from 'lucide-react';
import { format, addDays, startOfWeek } from 'date-fns';
import { he } from 'date-fns/locale';

const COLORS = {
  facial: { bg: 'rgba(232,184,48,0.15)', border: 'rgba(232,184,48,0.4)', text: '#e8b830' },
  laser: { bg: 'rgba(96,165,250,0.15)', border: 'rgba(96,165,250,0.4)', text: '#60a5fa' },
  glow: { bg: 'rgba(52,211,153,0.15)', border: 'rgba(52,211,153,0.4)', text: '#34d399' },
};

const sampleAppointments = [
  { day: 1, hour: 10, client: 'דנה ישראלי', treatment: 'טיפול פנים', therapist: 'שירלי', span: 2, color: COLORS.facial },
  { day: 3, hour: 11, client: 'מיכל לוי', treatment: 'לייזר רגליים', therapist: 'נועה', span: 1, color: COLORS.laser },
  { day: 1, hour: 14, client: 'אורית כהן', treatment: 'פנים זוהר', therapist: 'שירלי', span: 1, color: COLORS.glow },
];

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const startDate = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 6 }).map((_, i) => addDays(startDate, i));
  const hours = Array.from({ length: 11 }).map((_, i) => i + 9);

  return (
    <div dir="rtl" className="flex flex-col h-full rounded-2xl overflow-hidden" style={{ background: '#111009', border: '1px solid rgba(255,255,255,0.07)' }}>
      
      {/* Header */}
      <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-black" style={{ color: '#fdf8f5' }}>
            {format(currentDate, 'MMMM yyyy', { locale: he })}
          </h2>
          <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: '#1a1410' }}>
            <button onClick={() => setCurrentDate(addDays(currentDate, -7))}
              className="p-1.5 rounded-lg transition-colors" style={{ color: '#8a7060' }}
              onMouseEnter={e => e.target.style.color = '#e8b830'}
              onMouseLeave={e => e.target.style.color = '#8a7060'}>
              <ChevronRight size={18} />
            </button>
            <button onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors" style={{ color: '#8a7060' }}
              onMouseEnter={e => e.target.style.color = '#e8b830'}
              onMouseLeave={e => e.target.style.color = '#8a7060'}>
              היום
            </button>
            <button onClick={() => setCurrentDate(addDays(currentDate, 7))}
              className="p-1.5 rounded-lg transition-colors" style={{ color: '#8a7060' }}
              onMouseEnter={e => e.target.style.color = '#e8b830'}
              onMouseLeave={e => e.target.style.color = '#8a7060'}>
              <ChevronLeft size={18} />
            </button>
          </div>
        </div>
        
        <button className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} />
          תור חדש
        </button>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-[700px]">
          {/* Day headers */}
          <div className="grid grid-cols-7 sticky top-0 z-10" style={{ background: '#111009', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="py-4 px-2 w-16"></div>
            {weekDays.map((day, i) => {
              const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
              return (
                <div key={i} className="py-4 px-2 text-center">
                  <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#5a4a40' }}>
                    {format(day, 'EEEE', { locale: he })}
                  </p>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center mx-auto font-black text-base`}
                    style={isToday 
                      ? { background: 'linear-gradient(135deg, #e8b830, #c99a20)', color: '#0d0a09' }
                      : { color: '#fdf8f5' }}>
                    {format(day, 'd')}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time rows */}
          {hours.map((hour) => (
            <div key={hour} className="grid grid-cols-7" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="py-4 px-2 w-16 text-center flex-shrink-0" style={{ color: '#3a2e29' }}>
                <span className="text-xs font-semibold">{hour}:00</span>
              </div>
              {weekDays.map((_, i) => {
                const appt = sampleAppointments.find(a => a.hour === hour && a.day === i);
                return (
                  <div key={i} className="relative h-20 border-r transition-colors cursor-pointer"
                    style={{ borderColor: 'rgba(255,255,255,0.04)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(232,184,48,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    {appt && (
                      <div className="absolute inset-x-1 top-1 p-2 rounded-xl z-10 text-xs"
                        style={{ background: appt.color.bg, border: `1px solid ${appt.color.border}` }}>
                        <p className="font-bold truncate" style={{ color: appt.color.text }}>{appt.client}</p>
                        <p className="opacity-70 truncate" style={{ color: appt.color.text }}>{appt.treatment}</p>
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
