import { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Phone, Clock, User, X, Calendar } from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { he } from 'date-fns/locale';
import { fetchAppointments, fetchClients } from '../utils/api';
import ClientPanel from '../components/ClientPanel';

function getColorForTherapist(name = '') {
  const lowercaseName = name.toLowerCase();
  if (lowercaseName.includes('שירלי')) {
    return {
      bg: 'var(--red-light)',
      bdr: 'var(--red-border)',
      txt: 'var(--red)',
      solid: 'var(--red)'
    };
  }
  if (lowercaseName.includes('נועה')) {
    return {
      bg: 'var(--violet-light)',
      bdr: 'var(--violet-border)',
      txt: 'var(--violet)',
      solid: 'var(--violet)'
    };
  }
  if (lowercaseName.includes('דנה')) {
    return {
      bg: 'var(--teal-light)',
      bdr: 'var(--teal-border)',
      txt: 'var(--teal)',
      solid: 'var(--teal)'
    };
  }
  // Fallback hash color
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % 3;
  if (index === 0) {
    return { bg: 'var(--red-light)', bdr: 'var(--red-border)', txt: 'var(--red)', solid: 'var(--red)' };
  } else if (index === 1) {
    return { bg: 'var(--violet-light)', bdr: 'var(--violet-border)', txt: 'var(--violet)', solid: 'var(--violet)' };
  } else {
    return { bg: 'var(--teal-light)', bdr: 'var(--teal-border)', txt: 'var(--teal)', solid: 'var(--teal)' };
  }
}

const START_HOUR = 8;
const END_HOUR = 20;
const HOUR_HEIGHT = 80;

const getApptTimes = (appt) => {
  const start = new Date(appt.startTime).getTime();
  let end = appt.endTime ? new Date(appt.endTime).getTime() : NaN;
  if (isNaN(end)) {
    end = start + 60 * 60 * 1000; // default to 1 hour
  }
  return { start, end };
};

// Interval overlapping grouping algorithm
function getLaidOutAppointments(dayAppts) {
  if (dayAppts.length === 0) return [];
  
  // Sort by startTime
  const sorted = [...dayAppts].sort((a, b) => getApptTimes(a).start - getApptTimes(b).start);
  
  // Group overlapping appointments
  const groups = [];
  for (const appt of sorted) {
    const { start: apptStart, end: apptEnd } = getApptTimes(appt);
    
    let merged = false;
    for (const group of groups) {
      const groupStart = Math.min(...group.map(g => getApptTimes(g).start));
      const groupEnd = Math.max(...group.map(g => getApptTimes(g).end));
      
      if (apptStart < groupEnd && apptEnd > groupStart) {
        group.push(appt);
        merged = true;
        break;
      }
    }
    
    if (!merged) {
      groups.push([appt]);
    }
  }
  
  const result = [];
  for (const group of groups) {
    const groupSorted = [...group].sort((a, b) => getApptTimes(a).start - getApptTimes(b).start);
    const columns = [];
    
    for (const appt of groupSorted) {
      const { start: apptStart } = getApptTimes(appt);
      
      let placed = false;
      for (let c = 0; c < columns.length; c++) {
        const col = columns[c];
        const lastAppt = col[col.length - 1];
        const { end: lastEnd } = getApptTimes(lastAppt);
        
        if (apptStart >= lastEnd) {
          col.push(appt);
          placed = true;
          break;
        }
      }
      
      if (!placed) {
        columns.push([appt]);
      }
    }
    
    const totalCols = columns.length;
    columns.forEach((col, colIdx) => {
      col.forEach(appt => {
        result.push({
          ...appt,
          colIndex: colIdx,
          totalCols: totalCols
        });
      });
    });
  }
  
  return result;
}

function getStatusBadge(status) {
  if (status === 'confirmed') return { label: 'אושר', className: 'badge-green' };
  if (status === 'cancelled') return { label: 'בוטל', className: 'badge-red' };
  return { label: 'נקבע', className: 'badge-amber' };
}

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedTherapist, setSelectedTherapist] = useState('all');
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'day'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'scheduled', 'confirmed', 'cancelled'
  
  const startDate = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 6 }).map((_, i) => addDays(startDate, i));
  const hours = Array.from({ length: (END_HOUR - START_HOUR + 1) }).map((_, i) => i + START_HOUR);

  const isToday = (day) => format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    fetchAppointments()
      .then(data => setAppointments(data))
      .catch(err => console.error('Failed to fetch appointments:', err));

    fetchClients()
      .then(data => setClients(data))
      .catch(err => console.error('Failed to fetch clients:', err));
  }, []);

  // Base list of appointments (live or fallback)
  const baseAppointments = appointments.length > 0 
    ? appointments 
    : [
        { id: 's1', clientName: 'דנה ישראלי', treatmentName: 'טיפול פנים קלאסי', therapistName: 'שירלי סוני', startTime: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 1)).setHours(10, 0, 0, 0), status: 'confirmed' },
        { id: 's2', clientName: 'מיכל לוי', treatmentName: 'לייזר שיער — רגליים', therapistName: 'נועה לוי', startTime: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 3)).setHours(11, 0, 0, 0), status: 'scheduled' },
        { id: 's3', clientName: 'אורית כהן', treatmentName: 'ניקוי פנים עמוק', therapistName: 'שירלי סוני', startTime: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 1)).setHours(12, 0, 0, 0), status: 'confirmed' },
        { id: 's4', clientName: 'רחל אברמוב', treatmentName: 'טיפול פנים זוהר', therapistName: 'דנה כהן', startTime: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 4)).setHours(9, 0, 0, 0), status: 'scheduled' }
      ];

  // Dynamically extract unique therapist names
  const uniqueTherapists = [...new Set(baseAppointments.map(a => a.therapistName))].filter(Boolean);

  // Apply filters
  const filteredAppointments = baseAppointments.filter(appt => {
    const matchTherapist = selectedTherapist === 'all' || appt.therapistName === selectedTherapist;
    const matchStatus = statusFilter === 'all' || appt.status === statusFilter;
    return matchTherapist && matchStatus;
  });

  // Calculate columns based on viewMode
  let columnsData = [];
  if (viewMode === 'week') {
    columnsData = weekDays.map(day => {
      const dayAppts = filteredAppointments.filter(a => isSameDay(new Date(a.startTime), day));
      return {
        title: format(day, 'EEEE', { locale: he }),
        dateNumber: format(day, 'd'),
        isToday: isToday(day),
        appointments: getLaidOutAppointments(dayAppts),
        isTherapistHeader: false
      };
    });
  } else {
    // Daily view: columns represent therapists
    if (selectedTherapist !== 'all') {
      const dayAppts = filteredAppointments.filter(a => isSameDay(new Date(a.startTime), currentDate));
      columnsData = [
        {
          title: selectedTherapist,
          dateNumber: format(currentDate, 'd'),
          isToday: isSameDay(currentDate, new Date()),
          appointments: getLaidOutAppointments(dayAppts),
          isTherapistHeader: true
        }
      ];
    } else {
      columnsData = uniqueTherapists.map(t => {
        const dayAppts = filteredAppointments.filter(a => 
          isSameDay(new Date(a.startTime), currentDate) && a.therapistName === t
        );
        return {
          title: t,
          dateNumber: format(currentDate, 'd'),
          isToday: isSameDay(currentDate, new Date()),
          appointments: getLaidOutAppointments(dayAppts),
          isTherapistHeader: true
        };
      });
    }
  }

  const handlePrevDate = () => {
    if (viewMode === 'day') {
      setCurrentDate(prev => addDays(prev, -1));
    } else {
      setCurrentDate(prev => addDays(prev, -7));
    }
  };

  const handleNextDate = () => {
    if (viewMode === 'day') {
      setCurrentDate(prev => addDays(prev, 1));
    } else {
      setCurrentDate(prev => addDays(prev, 7));
    }
  };

  const getHeaderTitle = () => {
    if (viewMode === 'day') {
      return format(currentDate, 'EEEE, d בMMMM yyyy', { locale: he });
    } else {
      const weekEnd = addDays(startDate, 5);
      return `${format(startDate, 'd')} - ${format(weekEnd, 'd בMMMM yyyy', { locale: he })}`;
    }
  };

  return (
    <div dir="rtl" className="flex flex-col h-full rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>

      {/* Header controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-4 flex-shrink-0 gap-4" style={{ borderBottom: '1px solid var(--border)' }}>
        
        {/* Right side: Selected Date range & Navigations */}
        <div className="flex items-center gap-4">
          <h2 className="font-black text-base" style={{ color: 'var(--text-primary)', minWidth: 150 }}>
            {getHeaderTitle()}
          </h2>
          <div className="flex items-center" style={{ gap: 2, background: 'var(--bg-elevated)', borderRadius: 10, padding: 3 }}>
            <button onClick={handlePrevDate} className="btn-ghost" style={{ padding: '5px 8px', border: 'none', borderRadius: 7 }}>
              <ChevronRight size={16} />
            </button>
            <button onClick={() => setCurrentDate(new Date())} className="btn-ghost" style={{ padding: '5px 10px', border: 'none', borderRadius: 7, fontSize: 12 }}>
              היום
            </button>
            <button onClick={handleNextDate} className="btn-ghost" style={{ padding: '5px 8px', border: 'none', borderRadius: 7 }}>
              <ChevronLeft size={16} />
            </button>
          </div>
        </div>

        {/* Left side: View selector, Status filter, Therapist tabs */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* View Modes (Day / Week) */}
          <div className="flex items-center" style={{ gap: 2, background: 'var(--bg-elevated)', borderRadius: 10, padding: 3 }}>
            <button
              onClick={() => setViewMode('day')}
              className="btn-ghost"
              style={{
                padding: '5px 12px',
                fontSize: 12,
                fontWeight: 700,
                borderRadius: 7,
                border: 'none',
                background: viewMode === 'day' ? 'var(--accent)' : 'transparent',
                color: viewMode === 'day' ? '#fff' : 'var(--text-secondary)',
                transition: 'all 0.15s ease'
              }}
            >
              יומי
            </button>
            <button
              onClick={() => setViewMode('week')}
              className="btn-ghost"
              style={{
                padding: '5px 12px',
                fontSize: 12,
                fontWeight: 700,
                borderRadius: 7,
                border: 'none',
                background: viewMode === 'week' ? 'var(--accent)' : 'transparent',
                color: viewMode === 'week' ? '#fff' : 'var(--text-secondary)',
                transition: 'all 0.15s ease'
              }}
            >
              שבועי
            </button>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{
                appearance: 'none',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '6px 30px 6px 12px',
                color: 'var(--text-primary)',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'Heebo,sans-serif'
              }}
            >
              <option value="all">סטטוס: הכל</option>
              <option value="scheduled">נקבע</option>
              <option value="confirmed">אושר</option>
              <option value="cancelled">בוטל</option>
            </select>
            <ChevronLeft size={12} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%) rotate(-90deg)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          </div>

          {/* Therapist Tabs */}
          <div className="flex items-center gap-1.5 p-1" style={{ background: 'var(--bg-elevated)', borderRadius: 10 }}>
            <button
              onClick={() => setSelectedTherapist('all')}
              style={{
                padding: '5px 12px',
                fontSize: 12,
                fontWeight: 700,
                borderRadius: 7,
                border: 'none',
                cursor: 'pointer',
                background: selectedTherapist === 'all' ? 'var(--accent)' : 'transparent',
                color: selectedTherapist === 'all' ? '#fff' : 'var(--text-secondary)',
                transition: 'all 0.15s ease',
              }}
            >
              כל הצוות
            </button>
            {uniqueTherapists.map(t => (
              <button
                key={t}
                onClick={() => setSelectedTherapist(t)}
                style={{
                  padding: '5px 12px',
                  fontSize: 12,
                  fontWeight: 700,
                  borderRadius: 7,
                  border: 'none',
                  cursor: 'pointer',
                  background: selectedTherapist === t ? getColorForTherapist(t).solid : 'transparent',
                  color: selectedTherapist === t ? '#fff' : 'var(--text-secondary)',
                  transition: 'all 0.15s ease',
                }}
              >
                {t}
              </button>
            ))}
          </div>

        </div>

      </div>

      {/* Grid container */}
      <div className="flex-1 overflow-auto">
        <div style={{ minWidth: 640 }}>

          {/* Grid Columns Headers */}
          <div className="grid sticky top-0 z-20" style={{
            gridTemplateColumns: `56px repeat(${columnsData.length}, 1fr)`,
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border)'
          }}>
            <div style={{ width: 56 }} />
            {columnsData.map((col, idx) => (
              <div key={idx} className="text-center py-3">
                {col.isTherapistHeader ? (
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-bold uppercase" style={{ color: 'var(--text-faint)', marginBottom: 4 }}>
                      מטפלת
                    </span>
                    <span className="font-bold text-xs px-2.5 py-1 rounded" style={{
                      background: getColorForTherapist(col.title).bg,
                      border: `1px solid ${getColorForTherapist(col.title).bdr}`,
                      color: getColorForTherapist(col.title).txt
                    }}>
                      {col.title}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-bold uppercase" style={{ color: 'var(--text-faint)', marginBottom: 4 }}>
                      {col.title}
                    </span>
                    <span className="flex items-center justify-center font-black text-sm" style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: col.isToday ? 'var(--accent)' : 'transparent',
                      color: col.isToday ? '#fff' : 'var(--text-primary)',
                      boxShadow: col.isToday ? '0 2px 8px rgba(99,102,241,0.35)' : 'none'
                    }}>
                      {col.dateNumber}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Hours and columns alignment */}
          <div className="flex" style={{ position: 'relative' }}>
            
            {/* Hour Labels */}
            <div style={{ width: 56, flexShrink: 0, background: 'var(--bg-surface)', zIndex: 5 }}>
              {hours.map((hour) => (
                <div key={hour} className="flex items-start justify-center pt-2" style={{ height: HOUR_HEIGHT }}>
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-faint)' }}>{hour}:00</span>
                </div>
              ))}
            </div>

            {/* Columns grid */}
            <div className="flex-1 grid" style={{
              gridTemplateColumns: `repeat(${columnsData.length}, 1fr)`,
              position: 'relative',
              height: hours.length * HOUR_HEIGHT,
              borderRight: '1px solid var(--border)'
            }}>
              
              {/* Background horizontal grid lines */}
              <div className="absolute inset-0 z-0 pointer-events-none">
                {hours.map((hour, idx) => (
                  <div key={hour} style={{
                    position: 'absolute',
                    top: idx * HOUR_HEIGHT,
                    left: 0,
                    right: 0,
                    height: HOUR_HEIGHT,
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                  }} />
                ))}
              </div>

              {/* Day/Therapist columns */}
              {columnsData.map((col, colIdx) => (
                <div key={colIdx} className="relative z-10" style={{
                  height: '100%',
                  borderLeft: '1px solid rgba(255,255,255,0.04)'
                }}>
                  {col.appointments.map((appt) => {
                    const { start, end } = getApptTimes(appt);
                    const calendarStart = new Date(new Date(appt.startTime).setHours(START_HOUR, 0, 0, 0)).getTime();
                    
                    // Positioning Math
                    const topPx = ((start - calendarStart) / (1000 * 60)) * (HOUR_HEIGHT / 60);
                    const heightPx = Math.max(((end - start) / (1000 * 60)) * (HOUR_HEIGHT / 60), 24);
                    
                    const apptColor = getColorForTherapist(appt.therapistName);
                    
                    // Columns overlaps divisions (RTL right spacing)
                    const widthPct = 100 / appt.totalCols;
                    const rightPct = appt.colIndex * widthPct;
                    
                    const formatHour = (d) => format(new Date(d), 'HH:mm');
                    const timeStr = `${formatHour(appt.startTime)} - ${formatHour(appt.endTime || new Date(new Date(appt.startTime).getTime() + 60*60*1000))}`;
                    
                    return (
                      <div
                        key={appt.id}
                        onClick={(e) => { e.stopPropagation(); setSelectedAppt(appt); }}
                        className="absolute overflow-hidden transition-all duration-150 hover:z-20"
                        style={{
                          top: topPx + 2,
                          height: heightPx - 4,
                          right: `${rightPct}%`,
                          width: `calc(${widthPct}% - 4px)`,
                          borderRadius: 6,
                          background: apptColor.bg,
                          border: `1px solid ${apptColor.bdr}`,
                          borderRight: `3px solid ${apptColor.solid}`,
                          padding: '4px 6px',
                          cursor: 'pointer',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                      >
                        <div className="flex flex-col h-full justify-between min-w-0">
                          <div className="min-w-0">
                            <p className="font-bold truncate" style={{ fontSize: 11, color: apptColor.txt, lineHeight: 1.2 }}>
                              {appt.clientName}
                            </p>
                            <p className="truncate opacity-80" style={{ fontSize: 9, color: apptColor.txt, marginTop: 1 }}>
                              {appt.treatmentName}
                            </p>
                          </div>
                          <span style={{ fontSize: 8, color: apptColor.txt, opacity: 0.6, alignSelf: 'flex-start', marginTop: 2 }}>
                            {timeStr}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}

            </div>

          </div>

        </div>
      </div>

      {/* Appointment Detail Modal */}
      {selectedAppt && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSelectedAppt(null)}>
          <div className="card overflow-hidden w-full max-w-lg"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4), 0 12px 24px -10px rgba(0,0,0,0.3)'
            }}
            onClick={e => e.stopPropagation()}>
            
            {/* Header */}
            <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3">
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: getColorForTherapist(selectedAppt.therapistName).bg,
                  border: `1px solid ${getColorForTherapist(selectedAppt.therapistName).bdr}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Calendar size={18} style={{ color: getColorForTherapist(selectedAppt.therapistName).txt }} />
                </div>
                <h3 className="font-black text-xl" style={{ color: 'var(--text-primary)' }}>פרטי פגישה</h3>
              </div>
              <button onClick={() => setSelectedAppt(null)} className="btn-ghost" style={{ padding: '8px 10px', borderRadius: 8 }}>
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Treatment Badge & Therapist */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="badge font-bold" style={{
                    background: getColorForTherapist(selectedAppt.therapistName).bg,
                    border: `1px solid ${getColorForTherapist(selectedAppt.therapistName).bdr}`,
                    color: getColorForTherapist(selectedAppt.therapistName).txt,
                    padding: '6px 14px',
                    fontSize: 13,
                    borderRadius: 8
                  }}>
                    {selectedAppt.treatmentName}
                  </span>
                  
                  {/* Status Badge */}
                  <span className={`badge font-bold ${getStatusBadge(selectedAppt.status).className}`}>
                    {getStatusBadge(selectedAppt.status).label}
                  </span>
                </div>
                
                <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                  מטפלת: <strong style={{ color: getColorForTherapist(selectedAppt.therapistName).txt }}>{selectedAppt.therapistName || 'שירלי'}</strong>
                </span>
              </div>

              {/* Details List */}
              <div className="space-y-5" style={{ padding: '4px 0' }}>
                {/* Client Name */}
                <div className="flex items-center gap-4">
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <User size={16} style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: 'var(--text-faint)', fontWeight: 700, marginBottom: 2 }}>שם לקוחה</p>
                    <p className="font-black text-base" style={{ color: 'var(--text-primary)' }}>{selectedAppt.clientName}</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-4">
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Phone size={16} style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: 'var(--text-faint)', fontWeight: 700, marginBottom: 2 }}>טלפון</p>
                    {selectedAppt.clientPhone ? (
                      <a href={`tel:${selectedAppt.clientPhone}`} className="font-bold text-base hover:underline" style={{ color: 'var(--accent)' }} dir="ltr">
                        {selectedAppt.clientPhone}
                      </a>
                    ) : (
                      <p className="font-semibold text-base" style={{ color: 'var(--text-muted)' }}>—</p>
                    )}
                  </div>
                </div>

                {/* Time */}
                <div className="flex items-center gap-4">
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Clock size={16} style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: 'var(--text-faint)', fontWeight: 700, marginBottom: 2 }}>מועד הפגישה</p>
                    <p className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
                      {format(new Date(selectedAppt.startTime), 'EEEE, d בMMMM yyyy', { locale: he })} בשעה {format(new Date(selectedAppt.startTime), 'HH:mm')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="rounded-xl p-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: 11, color: 'var(--text-faint)', fontWeight: 700, marginBottom: 6 }}>הערות לפגישה</p>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{selectedAppt.notes || 'אין הערות לפגישה זו'}</p>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between p-5" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
              <button onClick={() => setSelectedAppt(null)} className="btn-ghost" style={{ padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 700 }}>סגור</button>
              <button className="btn-primary" style={{ padding: '10px 22px', borderRadius: 10, fontSize: 14, fontWeight: 800 }}
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
