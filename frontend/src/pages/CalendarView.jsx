import { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Phone, Clock, User, X, Calendar } from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { he } from 'date-fns/locale';
import { fetchAppointments, fetchClients } from '../utils/api';
import ClientPanel from '../components/ClientPanel';

const COLORS = [
  { bg: 'var(--accent-light)',  bdr: 'var(--accent-border)',  txt: 'var(--accent)'  },
  { bg: 'var(--violet-light)', bdr: 'var(--violet-border)', txt: 'var(--violet)' },
  { bg: 'var(--teal-light)',   bdr: 'var(--teal-border)',   txt: 'var(--teal)'   },
];

function getColorForTreatment(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLORS.length;
  return COLORS[index];
}

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  
  const startDate = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 6 }).map((_, i) => addDays(startDate, i));
  const hours = Array.from({ length: 11 }).map((_, i) => i + 9);

  const isToday = (day) => format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    fetchAppointments()
      .then(data => setAppointments(data))
      .catch(err => console.error('Failed to fetch appointments:', err));

    fetchClients()
      .then(data => setClients(data))
      .catch(err => console.error('Failed to fetch clients:', err));
  }, []);

  // Fallback to sample appointments if none synced yet
  const appointmentsToDisplay = appointments.length > 0 
    ? appointments 
    : [
        { id: 's1', clientName: 'דנה ישראלי', treatmentName: 'טיפול פנים קלאסי', startTime: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 1)).setHours(10, 0, 0, 0) },
        { id: 's2', clientName: 'מיכל לוי', treatmentName: 'לייזר שיער — רגליים', startTime: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 3)).setHours(11, 0, 0, 0) },
        { id: 's3', clientName: 'אורית כהן', treatmentName: 'ניקוי פנים עמוק', startTime: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 1)).setHours(14, 0, 0, 0) },
        { id: 's4', clientName: 'רחל אברמוב', treatmentName: 'טיפול פנים זוהר', startTime: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 4)).setHours(9, 0, 0, 0) }
      ];

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
                    boxShadow: isToday(day) ? '0 2px 10px rgba(99,102,241,0.4)' : 'none',
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
              {weekDays.map((day, i) => {
                const appt = appointmentsToDisplay.find(a => {
                  const apptDate = new Date(a.startTime);
                  return isSameDay(apptDate, day) && apptDate.getHours() === hour;
                });
                
                const apptColor = appt ? getColorForTreatment(appt.treatmentName) : null;
                
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
                        onClick={(e) => { e.stopPropagation(); setSelectedAppt(appt); }}
                        style={{
                          inset: '4px 4px 4px 4px',
                          borderRadius: 8,
                          background: apptColor.bg,
                          border: `1px solid ${apptColor.bdr}`,
                          padding: '5px 8px',
                          cursor: 'pointer',
                        }}
                      >
                        <p className="font-bold truncate" style={{ fontSize: 11, color: apptColor.txt }}>{appt.clientName}</p>
                        <p className="truncate" style={{ fontSize: 10, color: apptColor.txt, opacity: 0.7, marginTop: 1 }}>{appt.treatmentName}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Appointment Detail Modal */}
      {selectedAppt && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSelectedAppt(null)}>
          <div className="card overflow-hidden w-full max-w-md"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3), 0 10px 10px -5px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()}>
            
            {/* Header */}
            <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2">
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent-light)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Calendar size={16} style={{ color: 'var(--accent)' }} />
                </div>
                <h3 className="font-black text-lg" style={{ color: 'var(--text-primary)' }}>פרטי פגישה</h3>
              </div>
              <button onClick={() => setSelectedAppt(null)} className="btn-ghost" style={{ padding: '6px 8px', borderRadius: 8 }}>
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              {/* Treatment Badge */}
              <div className="flex items-center justify-between">
                <span className="badge font-bold" style={{
                  background: getColorForTreatment(selectedAppt.treatmentName).bg,
                  border: `1px solid ${getColorForTreatment(selectedAppt.treatmentName).bdr}`,
                  color: getColorForTreatment(selectedAppt.treatmentName).txt,
                  padding: '4px 12px',
                  fontSize: 12
                }}>
                  {selectedAppt.treatmentName}
                </span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>מטפלת: {selectedAppt.therapistName || 'שירלי'}</span>
              </div>

              {/* Details List */}
              <div className="space-y-3">
                {/* Client Name */}
                <div className="flex items-start gap-3">
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <User size={13} style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 10, color: 'var(--text-faint)' }}>שם לקוחה</p>
                    <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{selectedAppt.clientName}</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-3">
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Phone size={13} style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 10, color: 'var(--text-faint)' }}>טלפון</p>
                    {selectedAppt.clientPhone ? (
                      <a href={`tel:${selectedAppt.clientPhone}`} className="font-semibold text-sm hover:underline" style={{ color: 'var(--accent)' }} dir="ltr">
                        {selectedAppt.clientPhone}
                      </a>
                    ) : (
                      <p className="font-semibold text-sm" style={{ color: 'var(--text-muted)' }}>—</p>
                    )}
                  </div>
                </div>

                {/* Time */}
                <div className="flex items-start gap-3">
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Clock size={13} style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 10, color: 'var(--text-faint)' }}>מועד הפגישה</p>
                    <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                      {format(new Date(selectedAppt.startTime), 'EEEE, d בMMMM yyyy', { locale: he })} בשעה {format(new Date(selectedAppt.startTime), 'HH:mm')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="rounded-xl p-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: 10, color: 'var(--text-faint)', marginBottom: 4 }}>הערות לפגישה</p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{selectedAppt.notes || 'אין הערות לפגישה זו'}</p>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between p-4" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
              <button onClick={() => setSelectedAppt(null)} className="btn-ghost" style={{ padding: '8px 16px' }}>סגור</button>
              <button className="btn-primary" style={{ padding: '8px 16px' }}
                onClick={() => {
                  const matchedClient = clients.find(c => 
                    (selectedAppt.clientId && c.id === selectedAppt.clientId) ||
                    (c.phone && selectedAppt.clientPhone && c.phone.replace(/\D/g, '') === selectedAppt.clientPhone.replace(/\D/g, '')) ||
                    (c.name && selectedAppt.clientName && c.name.trim().toLowerCase() === selectedAppt.clientName.trim().toLowerCase())
                  );
                  if (matchedClient) {
                    setSelectedClient(matchedClient);
                    setSelectedAppt(null);
                  } else {
                    alert('לא נמצא כרטיס לקוחה תואם במערכת');
                  }
                }}>
                פתח כרטיס לקוחה
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Client Profile Slide-over Drawer */}
      {selectedClient && (
        <ClientPanel client={selectedClient} onClose={() => setSelectedClient(null)} />
      )}
    </div>
  );
}
