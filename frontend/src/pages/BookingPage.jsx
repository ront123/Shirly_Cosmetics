import { useState } from 'react';
import { ChevronLeft, Clock, Check } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { he } from 'date-fns/locale';

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const treatments = [
    { id: 1, name: 'טיפול פנים קלאסי', duration: 60, price: 350, emoji: '✨' },
    { id: 2, name: 'טיפול פנים זוהר', duration: 45, price: 280, emoji: '🌟' },
    { id: 3, name: 'ניקוי פנים עמוק', duration: 60, price: 320, emoji: '💎' },
    { id: 4, name: 'הסרת שיער - לייזר', duration: 30, price: 150, emoji: '⚡' },
  ];

  const upcomingDates = Array.from({ length: 14 }).map((_, i) => addDays(new Date(), i + 1));
  const availableSlots = ['09:00', '10:00', '11:30', '13:00', '15:00', '16:30', '17:00'];

  const steps = ['בחירת טיפול', 'בחירת מועד', 'אישור'];

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{ background: 'linear-gradient(135deg, #e8b830, #c99a20)', boxShadow: '0 0 40px rgba(232,184,48,0.4)' }}>
          <Check size={40} color="#0d0a09" strokeWidth={3} />
        </div>
        <h2 className="text-2xl font-black mb-2" style={{ color: '#fdf8f5' }}>התור נקבע! 🎉</h2>
        <p className="text-sm mb-1" style={{ color: '#8a7060' }}>
          {selectedTreatment?.name}
        </p>
        <p className="text-sm" style={{ color: '#8a7060' }}>
          {selectedDate && format(selectedDate, 'EEEE, d בMMMM', { locale: he })} · {selectedTime}
        </p>
        <p className="text-xs mt-4 px-6" style={{ color: '#5a4a40' }}>
          נשלח לך אישור בוואטסאפ בקרוב
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-4">
      
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all`}
                style={step > i + 1 
                  ? { background: '#34d399', color: '#0d0a09' }
                  : step === i + 1 
                    ? { background: 'linear-gradient(135deg, #e8b830, #c99a20)', color: '#0d0a09' }
                    : { background: '#1a1410', color: '#3a2e29', border: '1px solid rgba(255,255,255,0.07)' }}>
                {step > i + 1 ? <Check size={12} strokeWidth={3} /> : i + 1}
              </div>
              <span className="text-xs font-medium hidden sm:block" style={{ color: step === i + 1 ? '#e8b830' : '#3a2e29' }}>
                {s}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="w-8 h-px" style={{ background: step > i + 1 ? '#34d399' : '#1a1410' }}></div>
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Treatment */}
      {step === 1 && (
        <div className="space-y-3">
          <h2 className="text-xl font-black mb-5" style={{ color: '#fdf8f5' }}>איזה טיפול תרצי? ✨</h2>
          {treatments.map((t) => (
            <button key={t.id} onClick={() => { setSelectedTreatment(t); setStep(2); }}
              className="w-full flex items-center justify-between p-4 rounded-2xl text-right transition-all"
              style={{ background: '#161210', border: '1px solid rgba(255,255,255,0.07)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(232,184,48,0.35)'; e.currentTarget.style.background = '#1a1410'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = '#161210'; }}>
              <div className="flex items-center gap-4">
                <span className="text-3xl">{t.emoji}</span>
                <div>
                  <h3 className="font-bold" style={{ color: '#fdf8f5' }}>{t.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock size={12} style={{ color: '#5a4a40' }} />
                    <span className="text-xs" style={{ color: '#5a4a40' }}>{t.duration} דקות</span>
                  </div>
                </div>
              </div>
              <span className="font-black text-lg" style={{ color: '#e8b830' }}>₪{t.price}</span>
            </button>
          ))}
        </div>
      )}

      {/* Step 2: Date & Time */}
      {step === 2 && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black" style={{ color: '#fdf8f5' }}>בחרי מועד 📅</h2>
            <button onClick={() => setStep(1)} className="flex items-center gap-1 text-sm font-medium" style={{ color: '#e8b830' }}>
              <ChevronLeft size={16} />
              חזור
            </button>
          </div>

          {/* Recap */}
          <div className="p-3 rounded-xl flex items-center gap-3" style={{ background: 'rgba(232,184,48,0.08)', border: '1px solid rgba(232,184,48,0.2)' }}>
            <span className="text-xl">{selectedTreatment?.emoji}</span>
            <div>
              <p className="font-bold text-sm" style={{ color: '#fdf8f5' }}>{selectedTreatment?.name}</p>
              <p className="text-xs" style={{ color: '#8a7060' }}>{selectedTreatment?.duration} דקות · ₪{selectedTreatment?.price}</p>
            </div>
          </div>

          {/* Dates */}
          <div>
            <p className="text-sm font-semibold mb-3" style={{ color: '#8a7060' }}>בחרי תאריך:</p>
            <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
              {upcomingDates.map((date, i) => {
                const isSelected = selectedDate && format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                return (
                  <button key={i} onClick={() => setSelectedDate(date)}
                    className="flex-shrink-0 w-16 h-20 rounded-2xl flex flex-col items-center justify-center transition-all"
                    style={isSelected 
                      ? { background: 'linear-gradient(135deg, #e8b830, #c99a20)', color: '#0d0a09', boxShadow: '0 4px 15px rgba(232,184,48,0.4)' }
                      : { background: '#161210', border: '1px solid rgba(255,255,255,0.07)', color: '#8a7060' }}>
                    <span className="text-xs font-bold uppercase">{format(date, 'EEE', { locale: he })}</span>
                    <span className="text-xl font-black">{format(date, 'd')}</span>
                    <span className="text-xs">{format(date, 'MMM', { locale: he })}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Times */}
          {selectedDate && (
            <div>
              <p className="text-sm font-semibold mb-3" style={{ color: '#8a7060' }}>שעות פנויות:</p>
              <div className="grid grid-cols-4 gap-2">
                {availableSlots.map((time, i) => (
                  <button key={i} onClick={() => { setSelectedTime(time); setStep(3); }}
                    className="py-3 rounded-xl font-bold text-sm transition-all"
                    style={{ background: '#161210', border: '1px solid rgba(255,255,255,0.07)', color: '#fdf8f5' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(232,184,48,0.5)'; e.currentTarget.style.color = '#e8b830'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#fdf8f5'; }}>
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Details */}
      {step === 3 && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black" style={{ color: '#fdf8f5' }}>פרטים אחרונים 🌸</h2>
            <button onClick={() => setStep(2)} className="flex items-center gap-1 text-sm font-medium" style={{ color: '#e8b830' }}>
              <ChevronLeft size={16} />
              חזור
            </button>
          </div>

          {/* Summary */}
          <div className="p-4 rounded-2xl" style={{ background: 'rgba(232,184,48,0.07)', border: '1px solid rgba(232,184,48,0.2)' }}>
            <p className="font-bold" style={{ color: '#fdf8f5' }}>{selectedTreatment?.name}</p>
            <p className="text-sm mt-1" style={{ color: '#8a7060' }}>
              {selectedDate && format(selectedDate, 'EEEE, d בMMMM', { locale: he })} · {selectedTime}
            </p>
            <p className="font-black text-lg mt-2" style={{ color: '#e8b830' }}>₪{selectedTreatment?.price}</p>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: '#8a7060' }}>שם מלא *</label>
              <input type="text" required className="input-dark" placeholder="לדוגמא: דנה ישראלי" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: '#8a7060' }}>מספר טלפון *</label>
              <input type="tel" required className="input-dark" placeholder="050-0000000" dir="ltr" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: '#8a7060' }}>הערות (אופציונלי)</label>
              <textarea className="input-dark resize-none" rows="2" placeholder="יש משהו שכדאי שנדע?"></textarea>
            </div>

            <button type="submit" className="w-full py-4 rounded-2xl font-black text-lg mt-2 transition-all"
              style={{ background: 'linear-gradient(135deg, #e8b830, #c99a20)', color: '#0d0a09', boxShadow: '0 6px 25px rgba(232,184,48,0.4)' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              אשרי את התור ✨
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
