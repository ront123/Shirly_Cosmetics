import { useState } from 'react';
import { Plus, UserCheck, Phone, Clock, Award } from 'lucide-react';

const initialStaff = [
  { id: 1, name: 'שירלי סוני', role: 'מנהלת קליניקה', phone: '050-1111111', color: '#f43f5e', treatments: ['טיפולי פנים','לייזר'], hours: 'א׳–ו׳ 09:00–19:00', appointments: 28 },
  { id: 2, name: 'נועה לוי', role: 'מטפלת לייזר', phone: '052-2222222', color: '#a78bfa', treatments: ['לייזר','הסרת שיער'], hours: 'א׳–ה׳ 10:00–18:00', appointments: 19 },
  { id: 3, name: 'דנה כהן', role: 'מטפלת פנים', phone: '054-3333333', color: '#2dd4bf', treatments: ['טיפולי פנים','ניקוי'], hours: 'ב׳–ו׳ 09:00–17:00', appointments: 21 },
];

export default function Staff() {
  const [staff] = useState(initialStaff);
  const [showModal, setShowModal] = useState(false);

  return (
    <div dir="rtl" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-black text-xl" style={{ color: 'var(--text-primary)' }}>עובדים</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>ניהול צוות הקליניקה</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={15} /> עובד/ת חדש/ה
        </button>
      </div>

      {/* Staff cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {staff.map(s => (
          <div key={s.id} className="card p-6 relative overflow-hidden">
            {/* Accent line */}
            <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 3, background: s.color }} />

            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center" style={{ gap: 12 }}>
                <div className="flex items-center justify-center font-black text-lg"
                  style={{ width: 48, height: 48, borderRadius: 12, background: `${s.color}18`, color: s.color, border: `1px solid ${s.color}35` }}>
                  {s.name[0]}
                </div>
                <div>
                  <h3 className="font-black" style={{ color: 'var(--text-primary)' }}>{s.name}</h3>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.role}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center" style={{ gap: 8 }}>
                <Phone size={13} style={{ color: 'var(--text-faint)', flexShrink: 0 }} />
                <span className="text-sm" dir="ltr" style={{ color: 'var(--text-secondary)' }}>{s.phone}</span>
              </div>
              <div className="flex items-center" style={{ gap: 8 }}>
                <Clock size={13} style={{ color: 'var(--text-faint)', flexShrink: 0 }} />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{s.hours}</span>
              </div>
              <div className="flex items-center" style={{ gap: 8 }}>
                <Award size={13} style={{ color: 'var(--text-faint)', flexShrink: 0 }} />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{s.appointments} תורים החודש</span>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold mb-2" style={{ color: 'var(--text-faint)' }}>התמחויות:</p>
              <div className="flex flex-wrap" style={{ gap: 5 }}>
                {s.treatments.map((t, i) => (
                  <span key={i} className="badge" style={{ background: `${s.color}12`, color: s.color, border: `1px solid ${s.color}25`, fontSize: 11 }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Add card */}
        <button onClick={() => setShowModal(true)}
          className="card flex flex-col items-center justify-center cursor-pointer transition-all"
          style={{ minHeight: 200, border: '1.5px dashed var(--border)', background: 'transparent' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-light)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent'; }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
            <Plus size={18} style={{ color: 'var(--text-muted)' }} />
          </div>
          <p className="font-semibold text-sm" style={{ color: 'var(--text-muted)' }}>הוסף עובד/ת</p>
        </button>
      </div>
    </div>
  );
}
