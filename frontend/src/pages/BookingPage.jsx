import { useState } from 'react';
import { Calendar as CalendarIcon, Clock, User, ChevronLeft } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { he } from 'date-fns/locale';

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  // Dummy data
  const treatments = [
    { id: 1, name: 'טיפול פנים קלאסי', duration: 60, price: 350 },
    { id: 2, name: 'טיפול פנים זוהר', duration: 45, price: 280 },
    { id: 3, name: 'הסרת שיער בלייזר - רגליים', duration: 30, price: 150 },
  ];

  const upcomingDates = Array.from({ length: 14 }).map((_, i) => addDays(new Date(), i + 1));
  const availableSlots = ['10:00', '11:30', '13:00', '15:45', '17:00'];

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-between text-sm font-medium text-slate-400 mb-8 px-4">
        <span className={step >= 1 ? 'text-pink-600' : ''}>1. בחירת טיפול</span>
        <span className="text-slate-300"><ChevronLeft size={16} /></span>
        <span className={step >= 2 ? 'text-pink-600' : ''}>2. מועד פנוי</span>
        <span className="text-slate-300"><ChevronLeft size={16} /></span>
        <span className={step >= 3 ? 'text-pink-600' : ''}>3. פרטים</span>
      </div>

      {step === 1 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
          <h2 className="text-xl font-bold text-slate-800 mb-4">איזה טיפול תרצי לקבוע?</h2>
          {treatments.map((t) => (
            <div 
              key={t.id}
              onClick={() => { setSelectedTreatment(t); setStep(2); }}
              className="bg-white p-5 rounded-2xl border border-pink-100 shadow-sm hover:border-pink-300 hover:shadow-md transition-all cursor-pointer flex justify-between items-center"
            >
              <div>
                <h3 className="font-bold text-slate-800 text-lg">{t.name}</h3>
                <p className="text-sm text-slate-500 mt-1">{t.duration} דקות</p>
              </div>
              <span className="font-semibold text-pink-600">₪{t.price}</span>
            </div>
          ))}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800">בחירת מועד</h2>
            <button onClick={() => setStep(1)} className="text-sm text-pink-600 font-medium">חזור</button>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-600 mb-3 flex items-center gap-2">
              <CalendarIcon size={16} /> בחר/י תאריך:
            </p>
            <div className="flex overflow-x-auto gap-3 pb-4 snap-x">
              {upcomingDates.map((date, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedDate(date)}
                  className={`snap-center flex-shrink-0 w-20 h-24 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                    selectedDate === date 
                      ? 'bg-pink-600 border-pink-600 text-white shadow-md shadow-pink-200' 
                      : 'bg-white border-pink-100 text-slate-600 hover:border-pink-300'
                  }`}
                >
                  <span className="text-xs font-medium uppercase mb-1 opacity-80">
                    {format(date, 'EEEE', { locale: he })}
                  </span>
                  <span className="text-2xl font-bold">{format(date, 'd')}</span>
                  <span className="text-xs mt-1 opacity-80">{format(date, 'MMM', { locale: he })}</span>
                </button>
              ))}
            </div>
          </div>

          {selectedDate && (
            <div className="animate-in fade-in">
              <p className="text-sm font-medium text-slate-600 mb-3 flex items-center gap-2">
                <Clock size={16} /> שעות פנויות:
              </p>
              <div className="grid grid-cols-3 gap-3">
                {availableSlots.map((time, i) => (
                  <button
                    key={i}
                    onClick={() => { setSelectedTime(time); setStep(3); }}
                    className="bg-white py-3 rounded-xl border border-pink-100 text-slate-700 font-medium hover:border-pink-600 hover:text-pink-600 transition-colors"
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800">פרטים אחרונים</h2>
            <button onClick={() => setStep(2)} className="text-sm text-pink-600 font-medium">חזור</button>
          </div>

          <div className="bg-pink-50/50 p-4 rounded-xl border border-pink-100 mb-6">
            <p className="font-semibold text-slate-800">{selectedTreatment?.name}</p>
            <p className="text-sm text-slate-600 mt-1">
              {selectedDate ? format(selectedDate, 'EEEE, d בMMMM', { locale: he }) : ''} בשעה {selectedTime}
            </p>
          </div>

          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('התור נקבע בהצלחה!'); }}>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">שם מלא</label>
              <input type="text" required className="w-full p-3 rounded-xl border border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all" placeholder="לדוגמא: דנה ישראלי" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">מספר טלפון (לשליחת אישור)</label>
              <input type="tel" required className="w-full p-3 rounded-xl border border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all" placeholder="050-0000000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">הערות (אופציונלי)</label>
              <textarea className="w-full p-3 rounded-xl border border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all" rows="2" placeholder="יש משהו שכדאי שנדע?"></textarea>
            </div>
            
            <button type="submit" className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-pink-200 transition-transform active:scale-[0.98] mt-6">
              אשרי את התור
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
