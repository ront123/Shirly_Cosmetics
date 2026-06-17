import { useState, useEffect } from 'react';
import { Plus, Send, Calendar, Edit2, Trash2, CheckCircle, Clock, FileText, Search, Mail, Check, Users } from 'lucide-react';
import { fetchClients } from '../utils/api';

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

/* ─── Main Campaigns Page ─────────────────────────────────────────────── */
export default function Campaigns() {
  const [campaigns, setCampaigns] = useState(INIT);
  const [showModal, setShowModal] = useState(false);
  const [filter,    setFilter]    = useState('all');
  const [clients,   setClients]   = useState([]);
  
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

  return (
    <div dir="rtl" className="space-y-6">
      {showModal && <NewCampaignModal onClose={() => setShowModal(false)} onSave={handleSaveCampaign} clients={clients} />}
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
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>ניהול הודעות WhatsApp ידניות</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={15} /> קמפיין חדש
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="card p-5 text-center">
            <p className="font-black text-3xl" style={{ color: s.color }}>{s.val}</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>

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
    </div>
  );
}
