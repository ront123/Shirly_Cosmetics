import { useState, useEffect } from 'react';
import { Plus, Send, Calendar, Edit2, Trash2, CheckCircle, Clock, FileText, Search, Mail, Check, Users, Upload, Image } from 'lucide-react';
import { fetchClients } from '../utils/api';

const Instagram = ({ size = 18, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const STATUS_MAP = {
  sent:      { label: 'נשלח',    badge: 'badge-green',  icon: CheckCircle },
  scheduled: { label: 'מתוזמן',  badge: 'badge-violet', icon: Clock       },
  draft:     { label: 'טיוטה',   badge: 'badge-amber',  icon: FileText    },
};

const INIT = [
  { id: 1, name: 'מבצע קיץ 2026',       audience: 'כל הלקוחות',     count: 85,  status: 'sent',      date: '01/05/26', opened: 72 },
  { id: 2, name: 'חזרי אלינו — אפריל',  audience: 'לקוחות רדומות',  count: 40,  status: 'sent',      date: '15/04/26', opened: 31 },
  { id: 3, name: 'מבצע ספטמבר',          audience: 'כל הלקוחות',     count: 147, status: 'scheduled', date: '01/09/26', opened: 0  },
  { id: 4, name: 'קמפיין לידה',           audience: 'יום הולדת',      count: 9,   status: 'draft',     date: '03/06/26', opened: 0  },
];

/* ─── Modal: New Campaign ──────────────────────────────────────────────── */
function NewCampaignModal({ onClose, onSave, clients }) {
  const [step,     setStep]     = useState(1);
  const [name,     setName]     = useState('');
  const [audience, setAudience] = useState('');
  const [msg,      setMsg]      = useState('');
  const [sendMode, setSendMode] = useState('now');
  const [date,     setDate]     = useState('');
  const [time,     setTime]     = useState('10:00');

  // Manual list selection state (used in Step 1 if manual is chosen)
  const [selectedManualIds, setSelectedManualIds] = useState(new Set());
  const [clientSearch, setClientSearch] = useState('');

  // Resolved recipients state (used in Step 2 for editing the target recipients list)
  const [recipientIds, setRecipientIds] = useState(new Set());
  const [recipientSearch, setRecipientSearch] = useState('');
  const [lastResolvedAudience, setLastResolvedAudience] = useState('');

  const thisMonth = new Date().getMonth() + 1;
  const totalClients = clients.length;
  const inactiveCount = clients.filter(c => c.status === 'inactive').length;
  const recentCount = clients.filter(c => c.status === 'active').length;
  const birthdayCount = clients.filter(c => c.birthday && parseInt(c.birthday.slice(5, 7), 10) === thisMonth).length;

  const dynamicAudiences = [
    { key: 'all',      label: 'כל הלקוחות',        count: totalClients },
    { key: 'inactive', label: 'לקוחות רדומות',    count: inactiveCount },
    { key: 'recent',   label: 'ביקרו לאחרונה',     count: recentCount   },
    { key: 'birthday', label: 'יום הולדת החודש',   count: birthdayCount },
    { key: 'manual',   label: 'בחירה ידנית',       count: selectedManualIds.size }
  ];

  const sel = dynamicAudiences.find(a => a.key === audience);
  const canNext1 = name && audience && (audience !== 'manual' || selectedManualIds.size > 0);
  const canNext2 = recipientIds.size > 0;
  const canNext3 = msg.length >= 10;

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(clientSearch.toLowerCase()) || 
    c.phone.includes(clientSearch)
  );

  const selectedFiltered = filteredClients.filter(c => selectedManualIds.has(c.id));
  const unselectedFiltered = filteredClients.filter(c => !selectedManualIds.has(c.id));
  const displayedClients = [
    ...selectedFiltered,
    ...unselectedFiltered.slice(0, 50)
  ];

  const filteredRecipientClients = clients.filter(c => 
    c.name.toLowerCase().includes(recipientSearch.toLowerCase()) || 
    c.phone.includes(recipientSearch)
  );

  const selectedFilteredRecipients = filteredRecipientClients.filter(c => recipientIds.has(c.id));
  const unselectedFilteredRecipients = filteredRecipientClients.filter(c => !recipientIds.has(c.id));
  const displayedRecipients = [
    ...selectedFilteredRecipients,
    ...unselectedFilteredRecipients.slice(0, 50)
  ];

  const getInitialSelectedIds = () => {
    const thisMonth = new Date().getMonth() + 1;
    if (audience === 'all') {
      return new Set(clients.map(c => c.id));
    } else if (audience === 'inactive') {
      return new Set(clients.filter(c => c.status === 'inactive').map(c => c.id));
    } else if (audience === 'recent') {
      return new Set(clients.filter(c => c.status === 'active').map(c => c.id));
    } else if (audience === 'birthday') {
      return new Set(clients.filter(c => c.birthday && parseInt(c.birthday.slice(5, 7), 10) === thisMonth).map(c => c.id));
    } else if (audience === 'manual') {
      return new Set(selectedManualIds);
    }
    return new Set();
  };

  const nextStep = () => {
    if (step === 1) {
      if (audience !== lastResolvedAudience || recipientIds.size === 0) {
        setRecipientIds(getInitialSelectedIds());
        setLastResolvedAudience(audience);
      }
    }
    setStep(step + 1);
  };

  const save = () => {
    onSave({
      id: Date.now(), name,
      audience: sel?.label || '', count: recipientIds.size,
      status: sendMode === 'now' ? 'sent' : 'scheduled',
      date: sendMode === 'now' ? new Date().toLocaleDateString('he-IL') : `${date} ${time}`,
      opened: 0,
      messageText: msg,
      targetAudienceKey: audience,
      recipientIds: Array.from(recipientIds)
    });
    onClose();
  };

  const STEPS = ['שם וקהל', 'נמענים', 'הודעה', 'תזמון'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full" style={{ maxWidth: 560, margin: '0 16px' }}>
        <div className="card p-0 overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>

          {/* Modal header */}
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <h3 className="font-black" style={{ color: 'var(--text-primary)' }}>קמפיין חדש</h3>
            <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }}>✕</button>
          </div>

          {/* Step indicator */}
          <div className="flex px-6 pt-5 pb-0" style={{ gap: 0 }}>
            {STEPS.map((s, i) => {
              const num = i + 1;
              const done = step > num;
              const active = step === num;
              return (
                <div key={i} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center flex-shrink-0" style={{ gap: 4 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 800,
                      background: done ? 'var(--green)' : active ? 'var(--accent)' : 'var(--bg-elevated)',
                      color: done || active ? '#fff' : 'var(--text-faint)',
                      border: done || active ? 'none' : '1px solid var(--border)',
                    }}>
                      {done ? '✓' : num}
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: active ? 'var(--text-primary)' : 'var(--text-faint)', whiteSpace: 'nowrap' }}>{s}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{ flex: 1, height: 1, background: done ? 'var(--green)' : 'var(--border)', margin: '0 8px', marginBottom: 18 }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Step content */}
          <div className="px-6 py-5 space-y-4">

            {/* Step 1 */}
            {step === 1 && <>
              <div>
                <label className="block text-sm font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>שם הקמפיין *</label>
                <input className="input-dark" placeholder="לדוגמא: מבצע קיץ 2026" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>קהל יעד *</label>
                <div className="grid grid-cols-2 gap-2">
                  {dynamicAudiences.map(a => (
                    <button key={a.key} onClick={() => setAudience(a.key)}
                      className="flex items-center justify-between rounded-xl text-right transition-all"
                      style={{ padding: '10px 14px', cursor: 'pointer',
                        background: audience === a.key ? 'var(--accent-light)' : 'var(--bg-elevated)',
                        border: `1.5px solid ${audience === a.key ? 'var(--accent)' : 'var(--border)'}` }}>
                      <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{a.label}</span>
                      <span className="font-black text-sm" style={{ color: audience === a.key ? 'var(--accent)' : 'var(--text-muted)' }}>{a.count}</span>
                    </button>
                  ))}
                </div>
                {audience === 'manual' && (
                  <div className="space-y-3 mt-3 border-t pt-3" style={{ borderColor: 'var(--border)' }}>
                    <div className="relative">
                      <Search size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
                      <input 
                        className="input-dark" 
                        style={{ paddingRight: 32, fontSize: 13 }}
                        placeholder="חיפוש לקוחה..."
                        value={clientSearch}
                        onChange={e => setClientSearch(e.target.value)}
                      />
                    </div>
                    <div className="rounded-xl overflow-hidden max-h-48 overflow-y-auto space-y-1 p-2" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                      <label className="flex items-center gap-2.5 p-2 rounded-lg cursor-pointer hover:bg-black/10">
                        <input 
                          type="checkbox"
                          checked={filteredClients.length > 0 && filteredClients.every(c => selectedManualIds.has(c.id))}
                          onChange={() => {
                            const allSelected = filteredClients.every(c => selectedManualIds.has(c.id));
                            setSelectedManualIds(prev => {
                              const next = new Set(prev);
                              filteredClients.forEach(c => {
                                if (allSelected) next.delete(c.id);
                                else next.add(c.id);
                              });
                              return next;
                            });
                          }}
                          style={{ cursor: 'pointer', width: 14, height: 14, accentColor: 'var(--accent)' }}
                        />
                        <span className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>בחר הכל מסוננים</span>
                      </label>
                      
                      {displayedClients.map(c => (
                        <label key={c.id} className="flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-black/10">
                          <div className="flex items-center gap-2.5">
                            <input 
                              type="checkbox"
                              checked={selectedManualIds.has(c.id)}
                              onChange={() => {
                                setSelectedManualIds(prev => {
                                  const next = new Set(prev);
                                  if (next.has(c.id)) next.delete(c.id);
                                  else next.add(c.id);
                                  return next;
                                });
                              }}
                              style={{ cursor: 'pointer', width: 14, height: 14, accentColor: 'var(--accent)' }}
                            />
                            <span className="font-medium text-xs" style={{ color: 'var(--text-primary)' }}>{c.name}</span>
                          </div>
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }} dir="ltr">{c.phone}</span>
                        </label>
                      ))}

                      {unselectedFiltered.length > 50 && (
                        <div className="text-center p-2 text-xs" style={{ color: 'var(--text-faint)', borderTop: '1px solid var(--border)' }}>
                          מציג {displayedClients.length} מתוך {filteredClients.length} לקוחות. השתמש בחיפוש למציאת לקוחות נוספים.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>}

            {/* Step 2: Recipients list customization */}
            {step === 2 && <>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>עריכת רשימת נמענים לקמפיין</label>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                    נבחרו {recipientIds.size} לקוחות
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="relative">
                    <Search size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
                    <input 
                      className="input-dark" 
                      style={{ paddingRight: 32, fontSize: 13 }}
                      placeholder="חיפוש נמענים..."
                      value={recipientSearch}
                      onChange={e => setRecipientSearch(e.target.value)}
                    />
                  </div>
                  <div className="rounded-xl overflow-hidden max-h-60 overflow-y-auto space-y-1 p-2" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                    <label className="flex items-center gap-2.5 p-2 rounded-lg cursor-pointer hover:bg-black/10">
                      <input 
                        type="checkbox"
                        checked={filteredRecipientClients.length > 0 && filteredRecipientClients.every(c => recipientIds.has(c.id))}
                        onChange={() => {
                          const allSelected = filteredRecipientClients.every(c => recipientIds.has(c.id));
                          setRecipientIds(prev => {
                            const next = new Set(prev);
                            filteredRecipientClients.forEach(c => {
                              if (allSelected) next.delete(c.id);
                              else next.add(c.id);
                            });
                            return next;
                          });
                        }}
                        style={{ cursor: 'pointer', width: 14, height: 14, accentColor: 'var(--accent)' }}
                      />
                      <span className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>בחר הכל מסוננים</span>
                    </label>
                    
                    {displayedRecipients.map(c => (
                      <label key={c.id} className="flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-black/10">
                        <div className="flex items-center gap-2.5">
                          <input 
                            type="checkbox"
                            checked={recipientIds.has(c.id)}
                            onChange={() => {
                              setRecipientIds(prev => {
                                const next = new Set(prev);
                                if (next.has(c.id)) next.delete(c.id);
                                else next.add(c.id);
                                return next;
                              });
                            }}
                            style={{ cursor: 'pointer', width: 14, height: 14, accentColor: 'var(--accent)' }}
                          />
                          <span className="font-medium text-xs" style={{ color: 'var(--text-primary)' }}>{c.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xxs px-1.5 py-0.5 rounded-md" style={{ 
                            fontSize: 10,
                            background: c.status === 'active' ? 'var(--green-light)' : 'var(--border)', 
                            color: c.status === 'active' ? 'var(--green)' : 'var(--text-muted)' 
                          }}>
                            {c.status === 'active' ? 'פעילה' : 'לא פעילה'}
                          </span>
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }} dir="ltr">{c.phone}</span>
                        </div>
                      </label>
                    ))}

                    {unselectedFilteredRecipients.length > 50 && (
                      <div className="text-center p-2 text-xs" style={{ color: 'var(--text-faint)', borderTop: '1px solid var(--border)' }}>
                        מציג {displayedRecipients.length} מתוך {filteredRecipientClients.length} לקוחות. השתמש בחיפוש למציאת לקוחות נוספים.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>}

            {/* Step 3 */}
            {step === 3 && <>
              <div>
                <label className="block text-sm font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>תוכן ההודעה *</label>
                <textarea className="input-dark resize-none" rows={5}
                  placeholder={'היי [שם_הלקוחה], התגעגענו! 🌸\nמגיע לך פינוק — קבלי 10% הנחה על הטיפול הבא.'}
                  value={msg} onChange={e => setMsg(e.target.value)} />
                <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 4 }}>💡 [שם_הלקוחה] מוחלף אוטומטית</p>
              </div>
              {/* Mini preview */}
              <div style={{ background: '#0b1f14', borderRadius: 12, overflow: 'hidden' }}>
                <div className="flex items-center px-3 py-2" style={{ background: '#075e54', gap: 8 }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#25d366', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', fontWeight: 800 }}>ש</div>
                  <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>Shirly Cosmetics</span>
                </div>
                <div style={{ padding: '10px 12px' }}>
                  <div style={{ maxWidth: '85%', marginRight: 'auto', background: '#1c3a27', borderRadius: '10px 2px 10px 10px', padding: '8px 10px' }}>
                    <p style={{ color: '#d4f8e4', fontSize: 12, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                      {msg || 'ההודעה תופיע כאן...'}
                    </p>
                  </div>
                </div>
              </div>
            </>}

            {/* Step 4 */}
            {step === 4 && <>
              <div className="grid grid-cols-2 gap-3">
                {[{ key: 'now', label: 'שלח עכשיו', sub: 'שליחה מיידית', icon: Send }, { key: 'schedule', label: 'תזמן', sub: 'בחרי תאריך ושעה', icon: Calendar }].map(m => (
                  <button key={m.key} onClick={() => setSendMode(m.key)}
                    className="text-right rounded-xl p-4 transition-all"
                    style={{ cursor: 'pointer', background: sendMode === m.key ? 'var(--accent-light)' : 'var(--bg-elevated)', border: `1.5px solid ${sendMode === m.key ? 'var(--accent)' : 'var(--border)'}` }}>
                    <m.icon size={18} style={{ color: sendMode === m.key ? 'var(--accent)' : 'var(--text-muted)', marginBottom: 8 }} />
                    <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{m.label}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{m.sub}</p>
                  </button>
                ))}
              </div>
              {sendMode === 'schedule' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>תאריך</label>
                    <input type="date" className="input-dark" value={date} onChange={e => setDate(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>שעה</label>
                    <input type="time" className="input-dark" value={time} onChange={e => setTime(e.target.value)} />
                  </div>
                </div>
              )}
              {/* Summary */}
              <div className="rounded-xl p-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                <p className="font-bold text-sm mb-2" style={{ color: 'var(--text-primary)' }}>סיכום</p>
                {[
                  ['שם', name],
                  ['קהל', `${sel?.label} (${recipientIds.size} לקוחות)`],
                  ['שליחה', sendMode === 'now' ? 'מיידית' : `${date} ${time}`],
                ].map(([k, v], i) => (
                  <div key={i} className="flex justify-between py-1.5" style={{ borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{k}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{v}</span>
                  </div>
                ))}
              </div>
            </>}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: '1px solid var(--border)' }}>
            <button onClick={() => step > 1 ? setStep(step - 1) : onClose()} className="btn-ghost">
              {step === 1 ? 'ביטול' : '← חזור'}
            </button>
            {step < 4
              ? <button className="btn-primary" onClick={nextStep} disabled={(step === 1 && !canNext1) || (step === 2 && !canNext2) || (step === 3 && !canNext3)} style={{ opacity: ((step === 1 && !canNext1) || (step === 2 && !canNext2) || (step === 3 && !canNext3)) ? 0.5 : 1 }}>המשך →</button>
              : <button onClick={save} className="btn-primary" style={{ background: '#25d366', boxShadow: '0 2px 12px rgba(37,211,102,0.35)' }}>
                  <Send size={15} /> {sendMode === 'now' ? 'שלח עכשיו' : 'תזמן קמפיין'}
                </button>
            }
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Modal: WhatsApp Group Sender ─────────────────────────────────────────────── */
function SendGroupMessageModal({ selectedClients, messageTemplate, onClose }) {
  const [template, setTemplate] = useState(messageTemplate || '');
  const [sentStatus, setSentStatus] = useState({}); // client.id -> boolean

  const handleSendSingle = (client) => {
    const cleanPhone = client.phone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('0') ? '972' + cleanPhone.slice(1) : cleanPhone;
    const msgText = template.replace(/\[שם(?:[ _]ה?לקוחה?)?\]/g, client.name);
    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msgText)}`;
    window.open(url, '_blank');
    setSentStatus(prev => ({ ...prev, [client.id]: true }));
  };

  const handleSendAll = () => {
    let delay = 0;
    selectedClients.forEach(client => {
      setTimeout(() => {
        const cleanPhone = client.phone.replace(/\D/g, '');
        const formattedPhone = cleanPhone.startsWith('0') ? '972' + cleanPhone.slice(1) : cleanPhone;
        const msgText = template.replace(/\[שם(?:[ _]ה?לקוחה?)?\]/g, client.name);
        const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msgText)}`;
        window.open(url, '_blank');
        setSentStatus(prev => ({ ...prev, [client.id]: true }));
      }, delay);
      delay += 1200; // 1.2s delay to prevent browser blockages
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full" style={{ maxWidth: 560, margin: '0 16px' }}>
        <div className="card overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3">
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--accent-light)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mail size={16} style={{ color: 'var(--accent)' }} />
              </div>
              <h3 className="font-black" style={{ color: 'var(--text-primary)' }}>שליחת קמפיין ב-WhatsApp</h3>
            </div>
            <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }}>✕</button>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>תוכן ההודעה</label>
              <textarea className="input-dark resize-none font-sans" rows={5}
                value={template}
                onChange={e => setTemplate(e.target.value)}
                placeholder="הקלד את ההודעה כאן..."
                style={{ direction: 'rtl', width: '100%' }}
              />
              <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 4 }}>💡 השתמש בתג <b>[שם_הלקוחה]</b> כדי להחליף אוטומטית בשם הלקוחה.</p>
            </div>
            
            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>
                רשימת נמענים ({selectedClients.length})
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {selectedClients.map(client => (
                  <div key={client.id} className="flex items-center justify-between p-2.5 rounded-xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                    <div>
                      <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{client.name}</span>
                      <span className="text-xs block" style={{ color: 'var(--text-muted)', marginTop: 2 }} dir="ltr">{client.phone}</span>
                    </div>
                    <button 
                      onClick={() => handleSendSingle(client)}
                      className="btn-ghost"
                      style={{ fontSize: 12, padding: '4px 10px', height: 'auto', background: sentStatus[client.id] ? 'var(--green-light)' : 'transparent', color: sentStatus[client.id] ? 'var(--green)' : 'var(--text-secondary)', borderColor: sentStatus[client.id] ? 'var(--green-border)' : 'var(--border)' }}
                    >
                      {sentStatus[client.id] ? '✓ נפתח' : 'פתח צ\'אט'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="rounded-xl p-3 text-xs" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', color: 'var(--amber)', lineHeight: 1.5 }}>
              ⚠️ שים לב: פתיחת מספר צ'אטים במקביל תפתח כרטיסיות חדשות בדפדפן. אם הדפדפן חוסם חלונות קופצים (Pop-ups), יש לאשר פתיחת פופ-אפים מהאתר הנוכחי.
            </div>
          </div>
          <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: '1px solid var(--border)' }}>
            <button onClick={onClose} className="btn-ghost">סגור</button>
            <div className="flex gap-2">
              <button 
                onClick={handleSendAll}
                className="btn-primary" 
                style={{ background: '#25d366', color: '#fff', border: 'none', boxShadow: '0 2px 10px rgba(37,211,102,0.3)' }}
              >
                פתח את כל הצ'אטים
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Modal: New Instagram Story Campaign ─────────────────────────── */
function NewInstagramStoryModal({ onClose, onSave }) {
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [stickerText, setStickerText] = useState('');
  const [stickerColor, setStickerColor] = useState('neon-green'); // neon-green, hot-pink, amber, neon-cyan, white
  const [scheduleType, setScheduleType] = useState('recurring'); // recurring, once
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedHours, setSelectedHours] = useState([]);
  const [hourInput, setHourInput] = useState('10:00');
  const [singleDate, setSingleDate] = useState('');
  const [singleTime, setSingleTime] = useState('12:00');
  
  const DAYS_HE = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];

  const toggleDay = (d) => {
    setSelectedDays(prev => 
      prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]
    );
  };

  const addHour = () => {
    if (hourInput && !selectedHours.includes(hourInput)) {
      setSelectedHours(prev => [...prev, hourInput].sort());
    }
  };

  const removeHour = (h) => {
    setSelectedHours(prev => prev.filter(x => x !== h));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const canSave = name.trim() && image && stickerText.trim() && (
    scheduleType === 'once' ? (singleDate && singleTime) : (selectedDays.length > 0 && selectedHours.length > 0)
  );

  const save = () => {
    onSave({
      id: Date.now(),
      name: name.trim(),
      image,
      stickerText: stickerText.trim(),
      stickerColor,
      scheduleType,
      selectedDays,
      selectedHours,
      singleDate,
      singleTime,
      status: 'scheduled',
      isActive: true,
      publishedAt: null
    });
    onClose();
  };

  const stickerColorsMap = {
    'neon-green': { bg: '#25d366', text: '#000' },
    'hot-pink': { bg: '#e1306c', text: '#fff' },
    'amber': { bg: '#f59e0b', text: '#000' },
    'neon-cyan': { bg: '#00f2fe', text: '#000' },
    'white': { bg: '#ffffff', text: '#000' },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" dir="rtl"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full" style={{ maxWidth: 840, margin: '0 16px' }}>
        <div className="card overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3">
              <Instagram size={18} style={{ color: 'var(--accent)' }} />
              <h3 className="font-black" style={{ color: 'var(--text-primary)' }}>קמפיין סטורי מתוזמן חדש</h3>
            </div>
            <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }}>✕</button>
          </div>

          <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-x-reverse" style={{ borderColor: 'var(--border)' }}>
            
            {/* Form inputs side */}
            <div className="flex-1 p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>שם הקמפיין *</label>
                <input className="input-dark" placeholder="לדוגמא: מבצע שבועות 2026" value={name} onChange={e => setName(e.target.value)} />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>העלאת תמונת סטורי *</label>
                <label className="flex flex-col items-center justify-center rounded-xl transition-all cursor-pointer border border-dashed hover:bg-black/10"
                  style={{ height: 100, background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  <Upload size={20} style={{ color: 'var(--text-muted)', marginBottom: 6 }} />
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    {image ? 'לחצי להחלפת תמונה' : 'בחרי תמונה מהמחשב'}
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>טקסט מדבקה (Sticker Text) *</label>
                <input className="input-dark" placeholder="לדוגמא: מבצע טיפולי פנים רק היום! 🌸" value={stickerText} onChange={e => setStickerText(e.target.value)} />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>עיצוב מדבקה</label>
                <div className="flex gap-2">
                  {Object.keys(stickerColorsMap).map(k => (
                    <button key={k} onClick={() => setStickerColor(k)}
                      style={{
                        padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                        background: stickerColorsMap[k].bg,
                        color: stickerColorsMap[k].text,
                        border: stickerColor === k ? '2px solid var(--accent)' : '1px solid transparent',
                        boxShadow: stickerColor === k ? '0 0 8px var(--accent)' : 'none'
                      }}>
                      {k === 'neon-green' ? 'ירוק' : k === 'hot-pink' ? 'ורוד' : k === 'amber' ? 'כתום' : k === 'neon-cyan' ? 'תכלת' : 'לבן'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4" style={{ borderColor: 'var(--border)' }}>
                <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>תצורת תזמון</label>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button onClick={() => setScheduleType('recurring')}
                    className="font-bold text-xs py-2 px-3 rounded-lg border text-center transition-all"
                    style={{ cursor: 'pointer',
                      background: scheduleType === 'recurring' ? 'var(--accent-light)' : 'var(--bg-elevated)',
                      borderColor: scheduleType === 'recurring' ? 'var(--accent)' : 'var(--border)',
                      color: scheduleType === 'recurring' ? 'var(--accent)' : 'var(--text-muted)' }}>
                    תזמון מחזורי (ימי שבוע)
                  </button>
                  <button onClick={() => setScheduleType('once')}
                    className="font-bold text-xs py-2 px-3 rounded-lg border text-center transition-all"
                    style={{ cursor: 'pointer',
                      background: scheduleType === 'once' ? 'var(--accent-light)' : 'var(--bg-elevated)',
                      borderColor: scheduleType === 'once' ? 'var(--accent)' : 'var(--border)',
                      color: scheduleType === 'once' ? 'var(--accent)' : 'var(--text-muted)' }}>
                    חד-פעמי (תאריך ושעה)
                  </button>
                </div>

                {scheduleType === 'recurring' ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>ימים בשבוע *</label>
                      <div className="flex gap-1.5">
                        {DAYS_HE.map(d => (
                          <button key={d} onClick={() => toggleDay(d)}
                            style={{
                              width: 32, height: 32, borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Heebo',
                              background: selectedDays.includes(d) ? 'var(--accent)' : 'var(--bg-elevated)',
                              border: `1px solid ${selectedDays.includes(d) ? 'var(--accent)' : 'var(--border)'}`,
                              color: selectedDays.includes(d) ? '#fff' : 'var(--text-muted)'
                            }}>
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>שעות שליחה *</label>
                      <div className="flex gap-2">
                        <input type="time" className="input-dark" style={{ maxWidth: 100 }} value={hourInput} onChange={e => setHourInput(e.target.value)} />
                        <button className="btn-ghost" style={{ padding: '6px 12px' }} onClick={addHour}>+</button>
                      </div>
                      {selectedHours.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {selectedHours.map(h => (
                            <span key={h} className="badge badge-violet gap-1" style={{ padding: '4px 8px', fontSize: 11 }}>
                              {h}
                              <button onClick={() => removeHour(h)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 'bold' }}>✕</button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>תאריך *</label>
                      <input type="date" className="input-dark" value={singleDate} onChange={e => setSingleDate(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>שעה *</label>
                      <input type="time" className="input-dark" value={singleTime} onChange={e => setSingleTime(e.target.value)} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Instagram Mobile Story Preview Side */}
            <div className="w-full md:w-[320px] p-6 flex flex-col items-center justify-center" style={{ background: 'var(--bg-elevated)' }}>
              <span className="block text-xs font-bold mb-3 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>תצוגה מקדימה (סטורי)</span>
              
              <div className="relative overflow-hidden flex flex-col"
                style={{
                  width: 230, height: 410, borderRadius: 28,
                  border: '6px solid #1a1a2e',
                  background: '#090a10',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                }}>
                
                <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 70, height: 14, background: '#1a1a2e', borderRadius: '0 0 10px 10px', zIndex: 10 }} />

                <div className="absolute top-4 left-3 right-3 flex items-center justify-between" style={{ zIndex: 5 }}>
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center justify-center font-black"
                      style={{ width: 18, height: 18, borderRadius: '50%', background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', color: '#fff', fontSize: 7 }}>
                      ש
                    </div>
                    <span style={{ color: '#fff', fontSize: 9, fontWeight: 700, textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>shirly_cosmetics</span>
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 7, textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>12ש׳</span>
                  </div>
                  <div style={{ color: '#fff', fontSize: 10, letterSpacing: 1, textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>•••</div>
                </div>

                {image ? (
                  <img src={image} alt="Story Background" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center space-y-2" style={{ background: '#11131c' }}>
                    <Image size={24} style={{ color: 'var(--text-faint)' }} />
                    <span className="text-xxs" style={{ color: 'var(--text-muted)' }}>העלי תמונה להצגה כאן</span>
                  </div>
                )}

                {stickerText && (
                  <div className="absolute inset-0 flex items-center justify-center p-3 pointer-events-none" style={{ zIndex: 4 }}>
                    <div className="text-center font-bold px-3.5 py-2 rounded-xl text-xs break-words max-w-[90%]"
                      style={{
                        background: stickerColorsMap[stickerColor].bg,
                        color: stickerColorsMap[stickerColor].text,
                        boxShadow: '0 4px 15px rgba(0,0,0,0.25)',
                        transform: 'rotate(-4deg)',
                        fontFamily: 'Heebo, sans-serif'
                      }}>
                      {stickerText}
                    </div>
                  </div>
                )}

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between" style={{ zIndex: 5 }}>
                  <div className="flex-1 rounded-full px-3 py-1.5 flex items-center" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(5px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                    <span style={{ color: '#fff', fontSize: 9 }}>שלח הודעה...</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: '1px solid var(--border)' }}>
            <button onClick={onClose} className="btn-ghost">ביטול</button>
            <button onClick={save} className="btn-primary" disabled={!canSave} style={{ opacity: canSave ? 1 : 0.5 }}>
              תזמן סטורי
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ─── Main Campaigns Page ─────────────────────────────────────────────── */
export default function Campaigns() {
  const [activeTab, setActiveTab] = useState('whatsapp'); // whatsapp | instagram
  const [campaigns, setCampaigns] = useState(INIT);
  const [showModal, setShowModal] = useState(false);
  const [filter,    setFilter]    = useState('all');
  const [clients,   setClients]   = useState([]);
  
  // Instagram Stories Campaigns state
  const [instaCampaigns, setInstaCampaigns] = useState(() => {
    const saved = localStorage.getItem('instagram_campaigns');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse instagram campaigns:', e);
      }
    }
    return [];
  });
  const [showInstaModal, setShowInstaModal] = useState(false);
  const [selectedInstaForPreview, setSelectedInstaForPreview] = useState(null);

  // Group sending state
  const [groupClients, setGroupClients] = useState([]);
  const [groupMsgText, setGroupMsgText] = useState('');
  const [showGroupSender, setShowGroupSender] = useState(false);

  useEffect(() => {
    fetchClients()
      .then(data => {
        if (data && data.length > 0) {
          setClients(data);
        }
      })
      .catch(err => console.error('Failed to fetch clients:', err));
  }, []);

  // Live simulation of story posting
  useEffect(() => {
    const interval = setInterval(() => {
      setInstaCampaigns(prev => {
        let changed = false;
        const now = new Date();
        const currentHourMin = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        const daysMap = ['ש׳', 'א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳']; // Map so Sunday = index 1
        // JavaScript Date getDay(): Sunday = 0, Monday = 1, etc.
        const jsDays = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];
        const currentDayHe = jsDays[now.getDay()];

        const next = prev.map(c => {
          if (c.status !== 'scheduled' || !c.isActive) return c;

          let shouldPublish = false;
          if (c.scheduleType === 'once') {
            const target = new Date(`${c.singleDate}T${c.singleTime}`);
            if (now >= target) {
              shouldPublish = true;
            }
          } else {
            if (c.selectedDays.includes(currentDayHe) && c.selectedHours.includes(currentHourMin)) {
              shouldPublish = true;
            }
          }

          if (shouldPublish) {
            changed = true;
            return { ...c, status: 'published', publishedAt: now.toLocaleDateString('he-IL') + ' ' + currentHourMin };
          }
          return c;
        });

        if (changed) {
          localStorage.setItem('instagram_campaigns', JSON.stringify(next));
          return next;
        }
        return prev;
      });
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const handleSaveCampaign = (c) => {
    setCampaigns(prev => [c, ...prev]);

    if (c.status === 'sent') {
      let targetList = [];
      if (c.recipientIds && c.recipientIds.length > 0) {
        const idsSet = new Set(c.recipientIds);
        targetList = clients.filter(x => idsSet.has(x.id));
      } else {
        const thisMonth = new Date().getMonth() + 1;
        if (c.targetAudienceKey === 'all') {
          targetList = clients;
        } else if (c.targetAudienceKey === 'inactive') {
          targetList = clients.filter(x => x.status === 'inactive');
        } else if (c.targetAudienceKey === 'recent') {
          targetList = clients.filter(x => x.status === 'active');
        } else if (c.targetAudienceKey === 'birthday') {
          targetList = clients.filter(x => x.birthday && parseInt(x.birthday.slice(5, 7), 10) === thisMonth);
        } else if (c.targetAudienceKey === 'manual') {
          const manualIdsSet = new Set(c.manualClientIds || []);
          targetList = clients.filter(x => manualIdsSet.has(x.id));
        }
      }

      if (targetList.length > 0) {
        setGroupClients(targetList);
        setGroupMsgText(c.messageText || '');
        setShowGroupSender(true);
      }
    }
  };

  const handleSaveInstaCampaign = (c) => {
    setInstaCampaigns(prev => {
      const next = [c, ...prev];
      localStorage.setItem('instagram_campaigns', JSON.stringify(next));
      return next;
    });
  };

  const handleDeleteInstaCampaign = (id) => {
    setInstaCampaigns(prev => {
      const next = prev.filter(x => x.id !== id);
      localStorage.setItem('instagram_campaigns', JSON.stringify(next));
      return next;
    });
  };

  const handleToggleInstaCampaign = (id) => {
    setInstaCampaigns(prev => {
      const next = prev.map(x => x.id === id ? { ...x, isActive: !x.isActive } : x);
      localStorage.setItem('instagram_campaigns', JSON.stringify(next));
      return next;
    });
  };

  const handlePublishInstaCampaignNow = (id) => {
    setInstaCampaigns(prev => {
      const now = new Date();
      const currentHourMin = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const next = prev.map(x => x.id === id ? { 
        ...x, 
        status: 'published', 
        publishedAt: now.toLocaleDateString('he-IL') + ' ' + currentHourMin 
      } : x);
      localStorage.setItem('instagram_campaigns', JSON.stringify(next));
      return next;
    });
  };

  const FILTERS = [
    { key: 'all',      label: 'הכל'      },
    { key: 'sent',     label: 'נשלחו'    },
    { key: 'scheduled',label: 'מתוזמנים' },
    { key: 'draft',    label: 'טיוטות'   },
  ];

  const visible = filter === 'all' ? campaigns : campaigns.filter(c => c.status === filter);

  const stats = [
    { label: 'סה"כ נשלחו',   val: campaigns.filter(c=>c.status==='sent').length,      color: 'var(--green)'  },
    { label: 'מתוזמנים',     val: campaigns.filter(c=>c.status==='scheduled').length,  color: 'var(--violet)' },
    { label: 'טיוטות',       val: campaigns.filter(c=>c.status==='draft').length,      color: 'var(--amber)'  },
  ];

  const instaStats = [
    { label: 'סה"כ סטוריז',   val: instaCampaigns.length,                                    color: 'var(--accent)' },
    { label: 'מתוזמנים',     val: instaCampaigns.filter(c=>c.status==='scheduled').length,  color: 'var(--violet)' },
    { label: 'פורסמו',       val: instaCampaigns.filter(c=>c.status==='published').length,  color: 'var(--green)'  },
  ];

  return (
    <div dir="rtl" className="space-y-6">
      {showModal && <NewCampaignModal onClose={() => setShowModal(false)} onSave={handleSaveCampaign} clients={clients} />}
      {showInstaModal && <NewInstagramStoryModal onClose={() => setShowInstaModal(false)} onSave={handleSaveInstaCampaign} />}
      {showGroupSender && (
        <SendGroupMessageModal 
          selectedClients={groupClients} 
          messageTemplate={groupMsgText}
          onClose={() => setShowGroupSender(false)} 
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-black text-xl" style={{ color: 'var(--text-primary)' }}>קמפיינים</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {activeTab === 'whatsapp' ? 'ניהול הודעות WhatsApp ידניות' : 'ניהול ותזמון סטוריז באינסטגרם'}
          </p>
        </div>
        {activeTab === 'whatsapp' ? (
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={15} /> קמפיין חדש
          </button>
        ) : (
          <button className="btn-primary" onClick={() => setShowInstaModal(true)}>
            <Instagram size={15} /> סטורי מתוזמן חדש
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex" style={{ gap: 16, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
        <button onClick={() => { setActiveTab('whatsapp'); setFilter('all'); }}
          className="font-bold text-sm flex items-center gap-2 pb-2 transition-all"
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'Heebo, sans-serif',
            borderBottom: activeTab === 'whatsapp' ? '2px solid var(--accent)' : '2px solid transparent',
            color: activeTab === 'whatsapp' ? 'var(--text-primary)' : 'var(--text-muted)'
          }}>
          <Mail size={16} /> קמפיינים בוואטסאפ
        </button>
        <button onClick={() => { setActiveTab('instagram'); setFilter('all'); }}
          className="font-bold text-sm flex items-center gap-2 pb-2 transition-all"
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'Heebo, sans-serif',
            borderBottom: activeTab === 'instagram' ? '2px solid var(--accent)' : '2px solid transparent',
            color: activeTab === 'instagram' ? 'var(--text-primary)' : 'var(--text-muted)'
          }}>
          <Instagram size={16} /> סטוריז באינסטגרם
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {(activeTab === 'whatsapp' ? stats : instaStats).map((s, i) => (
          <div key={i} className="card p-5 text-center">
            <p className="font-black text-3xl" style={{ color: s.color }}>{s.val}</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* WhatsApp Campaigns Tab Content */}
      {activeTab === 'whatsapp' && (
        <>
          {/* Filter */}
          <div className="flex" style={{ gap: 3, background: 'var(--bg-surface)', borderRadius: 12, padding: 4, border: '1px solid var(--border)', alignSelf: 'flex-start' }}>
            {FILTERS.map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className="font-bold text-sm rounded-xl transition-all"
                style={{ padding: '8px 18px', border: 'none', cursor: 'pointer', fontFamily: 'Heebo, sans-serif',
                  background: filter === f.key ? 'var(--accent)'  : 'transparent',
                  color:      filter === f.key ? '#fff'            : 'var(--text-muted)',
                }}>
                {f.label}
              </button>
            ))}
          </div>

          {/* Campaign list */}
          {visible.length === 0 ? (
            <div className="card flex flex-col items-center justify-center py-20">
              <p className="font-semibold" style={{ color: 'var(--text-muted)' }}>אין קמפיינים בקטגוריה זו</p>
            </div>
          ) : (
            <div className="card p-0 overflow-x-auto">
              <table className="w-full text-right border-collapse whitespace-nowrap">
                <thead>
                  <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
                    <th className="font-bold p-4 text-sm" style={{ color: 'var(--text-secondary)' }}>שם הקמפיין</th>
                    <th className="font-bold p-4 text-sm" style={{ color: 'var(--text-secondary)' }}>סוג/קהל</th>
                    <th className="font-bold p-4 text-sm" style={{ color: 'var(--text-secondary)' }}>תאריך</th>
                    <th className="font-bold p-4 text-sm" style={{ color: 'var(--text-secondary)' }}>מספר נמענים</th>
                    <th className="font-bold p-4 text-sm" style={{ color: 'var(--text-secondary)' }}>נפתח</th>
                    <th className="font-bold p-4 text-sm" style={{ color: 'var(--text-secondary)' }}>אחוז פתיחה</th>
                    <th className="font-bold p-4 text-sm" style={{ color: 'var(--text-secondary)' }}>סטטוס</th>
                    <th className="font-bold p-4 text-sm w-1"></th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map(c => {
                    const st = STATUS_MAP[c.status];
                    const openRate = c.status === 'sent' ? Math.round(((c.opened || 0) / c.count) * 100) : null;
                    return (
                      <tr key={c.id} className="hover-bg-elevated transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
                        <td className="p-4 font-bold" style={{ color: 'var(--text-primary)' }}>{c.name}</td>
                        <td className="p-4" style={{ color: 'var(--text-muted)', fontSize: 13 }}>{c.audience}</td>
                        <td className="p-4" style={{ color: 'var(--text-muted)', fontSize: 13 }}>{c.date}</td>
                        <td className="p-4" style={{ color: 'var(--text-primary)', fontSize: 13 }}>{c.count}</td>
                        <td className="p-4" style={{ color: c.status === 'sent' ? 'var(--green)' : 'var(--text-muted)', fontSize: 13 }}>
                          {c.status === 'sent' ? c.opened : '-'}
                        </td>
                        <td className="p-4" style={{ color: c.status === 'sent' ? 'var(--teal)' : 'var(--text-muted)', fontSize: 13 }}>
                          {c.status === 'sent' ? `${openRate}%` : '-'}
                        </td>
                        <td className="p-4">
                          <span className={`badge ${st.badge}`}>{st.label}</span>
                        </td>
                        <td className="p-4 text-left">
                          <div className="flex items-center justify-end gap-2">
                            {c.status !== 'sent' && <button className="btn-ghost" style={{ padding: '6px 12px', fontSize: 13 }}><Edit2 size={13} /> ערוך</button>}
                            <button onClick={() => setCampaigns(p => p.filter(x => x.id !== c.id))}
                              style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent-light)', border: '1px solid var(--accent-border)', color: 'var(--accent)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Instagram Stories Tab Content */}
      {activeTab === 'instagram' && (
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Table area */}
          <div className="flex-1 space-y-4">
            <div className="card p-0 overflow-x-auto">
              <table className="w-full text-right border-collapse whitespace-nowrap">
                <thead>
                  <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
                    <th className="font-bold p-4 text-sm" style={{ color: 'var(--text-secondary)' }}>תמונה</th>
                    <th className="font-bold p-4 text-sm" style={{ color: 'var(--text-secondary)' }}>שם הקמפיין</th>
                    <th className="font-bold p-4 text-sm" style={{ color: 'var(--text-secondary)' }}>טקסט מדבקה</th>
                    <th className="font-bold p-4 text-sm" style={{ color: 'var(--text-secondary)' }}>תזמון</th>
                    <th className="font-bold p-4 text-sm" style={{ color: 'var(--text-secondary)' }}>סטטוס</th>
                    <th className="font-bold p-4 text-sm w-1"></th>
                  </tr>
                </thead>
                <tbody>
                  {instaCampaigns.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center p-12 text-sm" style={{ color: 'var(--text-muted)' }}>
                        אין קמפיינים מתוזמנים בסטורי באינסטגרם. לחצי על "סטורי מתוזמן חדש" כדי להתחיל.
                      </td>
                    </tr>
                  ) : (
                    instaCampaigns.map(c => {
                      const displayStickerColor = c.stickerColor || 'neon-green';
                      const colorMap = {
                        'neon-green': '#25d366',
                        'hot-pink': '#e1306c',
                        'amber': '#f59e0b',
                        'neon-cyan': '#00f2fe',
                        'white': '#ffffff',
                      };
                      return (
                        <tr key={c.id} 
                          onClick={() => setSelectedInstaForPreview(c)}
                          className="hover-bg-elevated transition-colors cursor-pointer" 
                          style={{ 
                            borderBottom: '1px solid var(--border)',
                            background: selectedInstaForPreview?.id === c.id ? 'var(--bg-hover)' : 'transparent'
                          }}>
                          <td className="p-3">
                            {c.image ? (
                              <img src={c.image} alt={c.name} style={{ width: 40, height: 60, borderRadius: 6, objectFit: 'cover', border: '1px solid var(--border)' }} />
                            ) : (
                              <div style={{ width: 40, height: 60, borderRadius: 6, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Image size={14} style={{ color: 'var(--text-muted)' }} />
                              </div>
                            )}
                          </td>
                          <td className="p-4 font-bold" style={{ color: 'var(--text-primary)' }}>{c.name}</td>
                          <td className="p-4">
                            <span className="text-xs px-2 py-1 rounded-md font-semibold" style={{ background: colorMap[displayStickerColor] + '18', color: colorMap[displayStickerColor], border: `1px solid ${colorMap[displayStickerColor]}35` }}>
                              {c.stickerText}
                            </span>
                          </td>
                          <td className="p-4" style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                            {c.scheduleType === 'once' ? (
                              <span>{c.singleDate} ב-{c.singleTime}</span>
                            ) : (
                              <span>
                                ימים: {c.selectedDays.join(', ')} בשעות: {c.selectedHours.join(', ')}
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            {c.status === 'published' ? (
                              <span className="badge badge-green">פורסם</span>
                            ) : c.status === 'scheduled' ? (
                              <span className={`badge ${c.isActive ? 'badge-violet' : 'badge-amber'}`}>
                                {c.isActive ? 'מתוזמן' : 'מושהה'}
                              </span>
                            ) : (
                              <span className="badge badge-amber">טיוטה</span>
                            )}
                          </td>
                          <td className="p-4 text-left" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-2">
                              {c.status === 'scheduled' && (
                                <button className="btn-ghost" 
                                  onClick={() => handleToggleInstaCampaign(c.id)}
                                  style={{ padding: '4px 10px', fontSize: 12, borderColor: c.isActive ? 'var(--amber-border)' : 'var(--green-border)', color: c.isActive ? 'var(--amber)' : 'var(--green)' }}>
                                  {c.isActive ? 'השהה' : 'הפעל'}
                                </button>
                              )}
                              {c.status !== 'published' && (
                                <button className="btn-ghost" 
                                  onClick={() => handlePublishInstaCampaignNow(c.id)}
                                  style={{ padding: '4px 10px', fontSize: 12, background: 'var(--green-light)', color: 'var(--green)', borderColor: 'var(--green-border)' }}>
                                  פרסם עכשיו
                                </button>
                              )}
                              <button onClick={() => {
                                handleDeleteInstaCampaign(c.id);
                                if (selectedInstaForPreview?.id === c.id) setSelectedInstaForPreview(null);
                              }}
                                style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent-light)', border: '1px solid var(--accent-border)', color: 'var(--accent)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Phone Frame preview */}
          <div className="w-full lg:w-[280px] flex-shrink-0 flex flex-col items-center">
            <div className="card p-5 w-full flex flex-col items-center sticky" style={{ top: 75, background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <span className="block text-xs font-bold mb-4 uppercase tracking-wider text-center" style={{ color: 'var(--text-muted)' }}>מציג סטורי פעיל</span>
              
              {selectedInstaForPreview ? (
                <div className="relative overflow-hidden flex flex-col"
                  style={{
                    width: 200, height: 350, borderRadius: 24,
                    border: '5px solid #1a1a2e',
                    background: '#090a10',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.4)'
                  }}>
                  
                  <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 60, height: 12, background: '#1a1a2e', borderRadius: '0 0 8px 8px', zIndex: 10 }} />

                  <div className="absolute top-3 left-2 right-2 flex items-center justify-between" style={{ zIndex: 5 }}>
                    <div className="flex items-center gap-1">
                      <div className="flex items-center justify-center font-black text-[6px]"
                        style={{ width: 14, height: 14, borderRadius: '50%', background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', color: '#fff' }}>
                        ש
                      </div>
                      <span style={{ color: '#fff', fontSize: 8, fontWeight: 700, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>shirly_cosmetics</span>
                      {selectedInstaForPreview.status === 'published' && (
                        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 6, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>· פורסם</span>
                      )}
                    </div>
                  </div>

                  <img src={selectedInstaForPreview.image} alt="Selected Story" className="w-full h-full object-cover" />

                  <div className="absolute inset-0 flex items-center justify-center p-2 pointer-events-none" style={{ zIndex: 4 }}>
                    <div className="text-center font-bold px-3 py-1.5 rounded-lg text-[10px] break-words max-w-[85%]"
                      style={{
                        background: {
                          'neon-green': '#25d366',
                          'hot-pink': '#e1306c',
                          'amber': '#f59e0b',
                          'neon-cyan': '#00f2fe',
                          'white': '#ffffff',
                        }[selectedInstaForPreview.stickerColor || 'neon-green'],
                        color: (selectedInstaForPreview.stickerColor === 'hot-pink') ? '#fff' : '#000',
                        boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
                        transform: 'rotate(-3deg)',
                        fontFamily: 'Heebo, sans-serif'
                      }}>
                      {selectedInstaForPreview.stickerText}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed rounded-2xl" 
                  style={{ width: 200, height: 350, borderColor: 'var(--border)', background: 'var(--bg-elevated)' }}>
                  <Instagram size={24} style={{ color: 'var(--text-faint)', marginBottom: 8 }} />
                  <p className="text-xs" style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>לחצי על אחד הקמפיינים בטבלה כדי לראות תצוגה מקדימה של הסטורי בנייד</p>
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
