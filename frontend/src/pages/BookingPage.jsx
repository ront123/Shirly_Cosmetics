import { useState } from 'react';
import { ChevronLeft, Clock, Check } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { he } from 'date-fns/locale';

const TREATMENTS = [
  { id: 1, name: 'טיפול פנים קלאסי', duration: 60, price: 350, emoji: '✨' },
  { id: 2, name: 'טיפול פנים זוהר',   duration: 45, price: 280, emoji: '🌟' },
  { id: 3, name: 'ניקוי פנים עמוק',   duration: 60, price: 320, emoji: '💎' },
  { id: 4, name: 'הסרת שיער לייזר',   duration: 30, price: 150, emoji: '⚡' },
];

const SLOTS = ['09:00', '10:00', '11:30', '13:00', '15:00', '16:30', '17:00'];
const STEPS = ['בחירת טיפול', 'בחירת מועד', 'אישור'];

const upcomingDates = Array.from({ length: 14 }).map((_, i) => addDays(new Date(), i + 1));

export default function BookingPage() {
  const [step,      setStep]      = useState(1);
  const [treatment, setTreatment] = useState(null);
  const [date,      setDate]      = useState(null);
  const [time,      setTime]      = useState(null);
  const [done,      setDone]      = useState(false);

  if (done) return (
    <div className="flex flex-col items-center justify-center text-center" style={{ paddingTop: 80 }}>
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 40px rgba(244,63,94,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        <Check size={36} color="#fff" strokeWidth={3} />
      </div>
      <h2 className="font-black text-2xl mb-2" style={{ color: 'var(--text-primary)' }}>התור נקבע! 🎉</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 4 }}>{treatment?.name}</p>
      <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
        {date && format(date, 'EEEE, d בMMMM', { locale: he })} · {time}
      </p>
      <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 16 }}>
        אישור יישלח אליך בוואטסאפ בקרוב ✉️
      </p>
    </div>
  );

  return (
    <div className="space-y-6" style={{ paddingTop: 16 }}>

      {/* Step indicator */}
      <div className="flex items-center justify-center" style={{ gap: 8, marginBottom: 8 }}>
        {STEPS.map((s, i) => {
          const num = i + 1;
          const active = step === num;
          const done   = step > num;
          return (
            <div key={i} className="flex items-center" style={{ gap: 6 }}>
              <div className="flex items-center" style={{ gap: 6 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 800,
                  background: done ? 'var(--green)' : active ? 'var(--accent)' : 'var(--bg-elevated)',
                  color:      done || active ? '#fff' : 'var(--text-faint)',
                  border:     done || active ? 'none' : '1px solid var(--border)',
                  boxShadow:  active ? '0 2px 10px rgba(244,63,94,0.4)' : 'none',
                  transition: 'all 0.2s ease',
                }}>
                  {done ? <Check size={12} strokeWidth={3} /> : num}
                </div>
                <span className="hidden sm:block text-xs font-semibold" style={{ color: active ? 'var(--text-primary)' : 'var(--text-faint)' }}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ width: 24, height: 1, background: step > num ? 'var(--green)' : 'var(--border)' }} />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Step 1: Treatment ── */}
      {step === 1 && (
        <div className="space-y-3">
          <h2 className="font-black text-xl" style={{ color: 'var(--text-primary)', marginBottom: 16 }}>איזה טיפול תרצי? ✨</h2>
          {TREATMENTS.map(t => (
            <button key={t.id} onClick={() => { setTreatment(t); setStep(2); }}
              className="w-full flex items-center justify-between rounded-2xl text-right transition-all"
              style={{ padding: '14px 16px', background: 'var(--bg-surface)', border: '1px solid var(--border)', cursor: 'pointer', gap: 14 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--bg-elevated)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-surface)'; }}
            >
              <div className="flex items-center" style={{ gap: 14 }}>
                <span style={{ fontSize: 28, lineHeight: 1 }}>{t.emoji}</span>
                <div>
                  <p className="font-bold text-base" style={{ color: 'var(--text-primary)', marginBottom: 3 }}>{t.name}</p>
                  <div className="flex items-center" style={{ gap: 5 }}>
                    <Clock size={11} style={{ color: 'var(--text-faint)' }} />
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.duration} דקות</span>
                  </div>
                </div>
              </div>
              <span className="font-black text-lg" style={{ color: 'var(--accent)', flexShrink: 0 }}>₪{t.price}</span>
            </button>
          ))}
        </div>
      )}

      {/* ── Step 2: Date & Time ── */}
      {step === 2 && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-black text-xl" style={{ color: 'var(--text-primary)' }}>בחרי מועד 📅</h2>
            <button onClick={() => setStep(1)} className="flex items-center font-semibold text-sm" style={{ gap: 4, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>
              <ChevronLeft size={15} />חזור
            </button>
          </div>

          {/* Recap chip */}
          <div className="flex items-center rounded-xl" style={{ gap: 10, padding: '10px 14px', background: 'var(--accent-light)', border: '1px solid var(--accent-border)' }}>
            <span style={{ fontSize: 20 }}>{treatment?.emoji}</span>
            <div>
              <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{treatment?.name}</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{treatment?.duration} דקות · ₪{treatment?.price}</p>
            </div>
          </div>

          {/* Date scroller */}
          <div>
            <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>בחרי תאריך:</p>
            <div className="flex" style={{ gap: 10, overflowX: 'auto', paddingBottom: 6, scrollbarWidth: 'none' }}>
              {upcomingDates.map((d, i) => {
                const sel = date && format(d, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
                return (
                  <button key={i} onClick={() => setDate(d)}
                    className="flex-shrink-0 flex flex-col items-center justify-center rounded-2xl transition-all"
                    style={{
                      width: 58, height: 76,
                      background: sel ? 'var(--accent)' : 'var(--bg-surface)',
                      border: `1px solid ${sel ? 'var(--accent)' : 'var(--border)'}`,
                      color: sel ? '#fff' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      boxShadow: sel ? '0 4px 14px rgba(244,63,94,0.4)' : 'none',
                      gap: 2,
                    }}
                  >
                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>{format(d, 'EEE', { locale: he })}</span>
                    <span style={{ fontSize: 22, fontWeight: 900, lineHeight: 1 }}>{format(d, 'd')}</span>
                    <span style={{ fontSize: 10, opacity: 0.7 }}>{format(d, 'MMM', { locale: he })}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time slots */}
          {date && (
            <div>
              <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>שעות פנויות:</p>
              <div className="grid grid-cols-4" style={{ gap: 8 }}>
                {SLOTS.map((t, i) => (
                  <button key={i} onClick={() => { setTime(t); setStep(3); }}
                    className="font-bold text-sm rounded-xl transition-all"
                    style={{ padding: '11px 0', background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', cursor: 'pointer' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                  >{t}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Step 3: Confirm ── */}
      {step === 3 && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-black text-xl" style={{ color: 'var(--text-primary)' }}>פרטים אחרונים 🌸</h2>
            <button onClick={() => setStep(2)} className="flex items-center font-semibold text-sm" style={{ gap: 4, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>
              <ChevronLeft size={15} />חזור
            </button>
          </div>

          {/* Summary */}
          <div className="rounded-2xl" style={{ padding: '14px 16px', background: 'var(--accent-light)', border: '1px solid var(--accent-border)' }}>
            <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{treatment?.name}</p>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 3 }}>
              {date && format(date, 'EEEE, d בMMMM', { locale: he })} · {time}
            </p>
            <p className="font-black text-xl" style={{ color: 'var(--accent)', marginTop: 8 }}>₪{treatment?.price}</p>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={e => { e.preventDefault(); setDone(true); }}>
            <div>
              <label className="block text-sm font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>שם מלא *</label>
              <input type="text" required className="input-dark" placeholder="לדוגמא: ישראל ישראלי" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>מספר טלפון *</label>
              <input type="tel" required className="input-dark" placeholder="050-0000000" dir="ltr" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>הערות (אופציונלי)</label>
              <textarea className="input-dark resize-none" rows={2} placeholder="יש משהו שכדאי שנדע?" />
            </div>
            <button type="submit" className="btn-primary w-full justify-center text-base" style={{ padding: '14px 0', marginTop: 4, fontSize: 15 }}>
              אשרי את התור ✨
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
