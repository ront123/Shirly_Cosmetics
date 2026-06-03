import { useState } from 'react';
import { ChevronRight, ChevronLeft, Plus } from 'lucide-react';
import { format, addDays, startOfWeek } from 'date-fns';
import { he } from 'date-fns/locale';

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Dummy data for therapists
  const therapists = [
    { id: 1, name: 'שירלי (מנהלת)' },
    { id: 2, name: 'דנה (מטפלת פנים)' },
    { id: 3, name: 'נועה (לייזר)' }
  ];

  // Generate week days
  const startDate = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 6 }).map((_, i) => addDays(startDate, i)); // Sun-Fri
  
  const hours = Array.from({ length: 11 }).map((_, i) => i + 9); // 9:00 to 19:00

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-pink-100 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-pink-100">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-slate-800">
            {format(currentDate, 'MMMM yyyy', { locale: he })}
          </h2>
          <div className="flex gap-1">
            <button 
              onClick={() => setCurrentDate(addDays(currentDate, -7))}
              className="p-1.5 rounded-lg hover:bg-pink-50 text-slate-600"
            >
              <ChevronRight size={20} />
            </button>
            <button 
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1.5 rounded-lg hover:bg-pink-50 text-sm font-medium text-slate-600"
            >
              היום
            </button>
            <button 
              onClick={() => setCurrentDate(addDays(currentDate, 7))}
              className="p-1.5 rounded-lg hover:bg-pink-50 text-slate-600"
            >
              <ChevronLeft size={20} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            <Plus size={16} />
            תור חדש
          </button>
        </div>
      </div>

      {/* Calendar Grid (Week View for multiple therapists or general) */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-[800px]">
          {/* Header row */}
          <div className="grid grid-cols-7 border-b border-pink-50 bg-slate-50/50 sticky top-0 z-10">
            <div className="p-3 border-l border-pink-50 w-20 flex-shrink-0"></div>
            {weekDays.map((day, i) => (
              <div key={i} className="p-3 border-l border-pink-50 text-center">
                <p className="text-xs font-medium text-slate-500 uppercase">
                  {format(day, 'EEEE', { locale: he })}
                </p>
                <p className={`text-lg font-bold mt-1 ${format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? 'text-pink-600' : 'text-slate-800'}`}>
                  {format(day, 'd')}
                </p>
              </div>
            ))}
          </div>

          {/* Time slots */}
          <div className="relative">
            {hours.map((hour) => (
              <div key={hour} className="grid grid-cols-7 border-b border-pink-50 group">
                <div className="p-3 border-l border-pink-50 w-20 flex-shrink-0 text-xs font-medium text-slate-400 text-center sticky right-0 bg-white group-hover:text-pink-600 transition-colors">
                  {hour}:00
                </div>
                {weekDays.map((day, i) => (
                  <div key={i} className="p-2 border-l border-pink-50 h-24 hover:bg-pink-50/30 transition-colors cursor-pointer relative">
                    {/* Dummy Appointment */}
                    {hour === 11 && i === 1 && (
                      <div className="absolute top-2 right-2 left-2 p-2 bg-pink-100 border border-pink-200 rounded-lg shadow-sm z-10">
                        <p className="text-xs font-bold text-pink-800">טיפול פנים קלאסי</p>
                        <p className="text-xs text-pink-700 mt-1">אורית כהן • שירלי</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
