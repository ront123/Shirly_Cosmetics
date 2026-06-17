import { useState } from 'react';
import { Plus, Phone, Clock, Award, Trash2 } from 'lucide-react';

/* ─── Modal: New Staff Member ────────────────────────────────────────── */
function NewStaffModal({ onClose, onSave }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [hours, setHours] = useState('א׳–ה׳ 09:00–18:00');
  const [color, setColor] = useState('#6366f1');
  const [treatmentsInput, setTreatmentsInput] = useState('');

  const colors = ['#f43f5e', '#a78bfa', '#2dd4bf', '#f59e0b', '#6366f1', '#10b981'];

  const canSave = name.trim() && role.trim() && phone.trim();

  const handleSave = () => {
    const treatments = treatmentsInput
      ? treatmentsInput.split(',').map(t => t.trim()).filter(Boolean)
      : [];
    onSave({
      id: Date.now(),
      name: name.trim(),
      role: role.trim(),
      phone: phone.trim(),
      color,
      hours: hours.trim(),
      treatments,
      appointments: 0
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full" style={{ maxWidth: 460, margin: '0 16px' }}>
        <div className="card overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <h3 className="font-black" style={{ color: 'var(--text-primary)' }}>עובד/ת חדש/ה</h3>
            <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }}>✕</button>
          </div>

          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>שם מלא *</label>
              <input className="input-dark" placeholder="לדוגמא: שירלי סוני" value={name} onChange={e => setName(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>תפקיד *</label>
              <input className="input-dark" placeholder="לדוגמא: קוסמטיקאית פרא-רפואית" value={role} onChange={e => setRole(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>טלפון *</label>
                <input className="input-dark" placeholder="050-0000000" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>שעות/ימי עבודה</label>
                <input className="input-dark" placeholder="א׳–ה׳ 09:00–18:00" value={hours} onChange={e => setHours(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>התמחויות (מופרדות בפסיקים)</label>
              <input className="input-dark" placeholder="לדוגמא: טיפולי פנים, לייזר, עיצוב גבות" value={treatmentsInput} onChange={e => setTreatmentsInput(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>צבע נושא לעובד</label>
              <div className="flex gap-3">
                {colors.map(c => (
                  <button key={c} onClick={() => setColor(c)}
                    style={{
                      width: 32, height: 32, borderRadius: '50%', background: c,
                      border: color === c ? '2px solid #fff' : 'none',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: color === c ? `0 0 10px ${c}` : 'none',
                      transition: 'all 0.2s'
                    }}>
                    {color === c && <span style={{ color: '#fff', fontSize: 12, fontWeight: 900 }}>✓</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: '1px solid var(--border)' }}>
            <button onClick={onClose} className="btn-ghost">ביטול</button>
            <button onClick={handleSave} className="btn-primary" disabled={!canSave} style={{ opacity: canSave ? 1 : 0.5 }}>
              שמור עובד/ת
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ─── Main Staff Page ────────────────────────────────────────────────── */
export default function Staff() {
  const [staff, setStaff] = useState(() => {
    const saved = localStorage.getItem('clinic_staff');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse staff from localStorage:', e);
      }
    }
    return [];
  });
  
  const [showModal, setShowModal] = useState(false);

  const addStaff = (newMember) => {
    setStaff(prev => {
      const next = [newMember, ...prev];
      localStorage.setItem('clinic_staff', JSON.stringify(next));
      return next;
    });
  };

  const deleteStaff = (id) => {
    setStaff(prev => {
      const next = prev.filter(x => x.id !== id);
      localStorage.setItem('clinic_staff', JSON.stringify(next));
      return next;
    });
  };

  return (
    <div dir="rtl" className="space-y-6">
      {showModal && <NewStaffModal onClose={() => setShowModal(false)} onSave={addStaff} />}

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

      {/* Staff content */}
      {staff.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--accent-light)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Plus size={20} style={{ color: 'var(--accent)' }} />
          </div>
          <p className="font-bold text-base mb-1" style={{ color: 'var(--text-primary)' }}>אין עובדים רשומים עדיין</p>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>הוסיפי את העובד/ת הראשון/ה כדי לנהל את צוות הקליניקה</p>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={15} /> הוסף עובד/ת ראשון/ה
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {staff.map(s => (
            <div key={s.id} className="card p-6 relative overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              {/* Accent line */}
              <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 3, background: s.color }} />

              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center" style={{ gap: 12 }}>
                  <div className="flex items-center justify-center font-black text-lg"
                    style={{ width: 48, height: 48, borderRadius: 12, background: `${s.color}18`, color: s.color, border: `1px solid ${s.color}35` }}>
                    {s.name ? s.name[0] : '?'}
                  </div>
                  <div>
                    <h3 className="font-black" style={{ color: 'var(--text-primary)' }}>{s.name}</h3>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.role}</p>
                  </div>
                </div>
                
                <button onClick={() => deleteStaff(s.id)}
                  title="מחק עובד/ת"
                  style={{ 
                    width: 28, height: 28, borderRadius: 8, 
                    background: 'var(--red-light)', border: '1px solid var(--red-border)', 
                    color: 'var(--red)', cursor: 'pointer', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--red)'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--red-light)'; e.currentTarget.style.color = 'var(--red)'; }}>
                  <Trash2 size={13} />
                </button>
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
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{s.appointments || 0} תורים החודש</span>
                </div>
              </div>

              {s.treatments && s.treatments.length > 0 && (
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
              )}
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
      )}
    </div>
  );
}
