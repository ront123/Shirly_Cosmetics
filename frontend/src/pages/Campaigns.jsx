import { useState } from 'react';
import { Send, Upload, Users, Sparkles } from 'lucide-react';

export default function Campaigns() {
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState('inactive');

  const audiences = [
    { key: 'inactive', label: 'לקוחות רדומות', desc: 'לא ביקרו מעל חודשיים', count: 42, emoji: '😴' },
    { key: 'all', label: 'כל הלקוחות', desc: 'שליחה לכולן', count: 147, emoji: '📣' },
    { key: 'recent', label: 'ביקרו לאחרונה', desc: 'ביקרו בחודש האחרון', count: 38, emoji: '⭐' },
  ];

  const pastCampaigns = [
    { name: 'מבצע קיץ 2026', sent: 85, opened: 72, date: '2026-05-01', status: 'sent' },
    { name: 'חזרי אלינו - אפריל', sent: 40, opened: 31, date: '2026-04-15', status: 'sent' },
  ];

  return (
    <div dir="rtl" className="space-y-6">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Builder */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Audience selector */}
          <div className="card p-5">
            <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: '#fdf8f5' }}>
              <Users size={18} style={{ color: '#e8b830' }} />
              1. למי לשלוח?
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {audiences.map((a) => (
                <button key={a.key} onClick={() => setAudience(a.key)}
                  className="p-4 rounded-xl text-right transition-all"
                  style={audience === a.key 
                    ? { background: 'rgba(232,184,48,0.1)', border: '1px solid rgba(232,184,48,0.35)' }
                    : { background: '#1a1410', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span className="text-2xl mb-2 block">{a.emoji}</span>
                  <p className="font-bold text-sm" style={{ color: '#fdf8f5' }}>{a.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#5a4a40' }}>{a.desc}</p>
                  <p className="text-sm font-black mt-2" style={{ color: '#e8b830' }}>{a.count} לקוחות</p>
                </button>
              ))}
            </div>
          </div>

          {/* Message builder */}
          <div className="card p-5">
            <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: '#fdf8f5' }}>
              <Sparkles size={18} style={{ color: '#e8b830' }} />
              2. תוכן ההודעה
            </h3>
            
            {/* Image upload */}
            <div className="mb-4 flex items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all"
              style={{ borderColor: 'rgba(232,184,48,0.2)', background: 'rgba(232,184,48,0.03)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(232,184,48,0.45)'; e.currentTarget.style.background = 'rgba(232,184,48,0.07)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(232,184,48,0.2)'; e.currentTarget.style.background = 'rgba(232,184,48,0.03)'; }}>
              <div className="text-center">
                <Upload size={24} className="mx-auto mb-2" style={{ color: '#5a4a40' }} />
                <p className="text-sm font-medium" style={{ color: '#8a7060' }}>לחצי להוספת תמונה</p>
                <p className="text-xs mt-1" style={{ color: '#3a2e29' }}>PNG, JPG עד 5MB</p>
              </div>
            </div>

            {/* Message text */}
            <div className="relative">
              <textarea 
                className="input-dark resize-none"
                rows={5}
                placeholder="היי [שם_הלקוחה], התגעגענו! 🌸&#10;מגיע לך פינוק..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <p className="text-xs mt-2" style={{ color: '#3a2e29' }}>
                💡 השתמשי ב-[שם_הלקוחה] והמערכת תחליף אוטומטית
              </p>
            </div>
          </div>

          {/* Send button */}
          <button className="w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-base transition-all"
            style={{ background: 'linear-gradient(135deg, #25d366, #128c7e)', color: '#fff', boxShadow: '0 4px 20px rgba(37,211,102,0.3)' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <Send size={20} />
            שלח קמפיין ל-{audiences.find(a => a.key === audience)?.count} לקוחות
          </button>
        </div>

        {/* Right side: preview + history */}
        <div className="space-y-4">
          
          {/* WhatsApp Preview */}
          <div className="card p-5">
            <h3 className="font-bold mb-4 text-sm" style={{ color: '#fdf8f5' }}>תצוגה מקדימה</h3>
            <div className="rounded-xl overflow-hidden" style={{ background: '#0a1a0f' }}>
              <div className="h-8 flex items-center px-3 gap-2" style={{ background: '#075e54' }}>
                <div className="w-5 h-5 rounded-full" style={{ background: '#25d366' }}></div>
                <span className="text-xs text-white font-medium">Shirly Cosmetics</span>
              </div>
              <div className="p-4">
                <div className="p-3 rounded-xl rounded-tl-none text-sm max-w-[90%] ml-auto" style={{ background: '#1c3a28' }}>
                  <p style={{ color: '#d4f8e5', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                    {message || "היי דנה, התגעגענו! 🌸\nמגיע לך פינוק - קבלי 10% הנחה על הטיפול הבא."}
                  </p>
                  <span className="text-xs block text-left mt-1" style={{ color: '#5a8a6a' }}>10:42 ✓✓</span>
                </div>
              </div>
            </div>
          </div>

          {/* Past campaigns */}
          <div className="card p-5">
            <h3 className="font-bold mb-4 text-sm" style={{ color: '#fdf8f5' }}>קמפיינים אחרונים</h3>
            <div className="space-y-3">
              {pastCampaigns.map((c, i) => (
                <div key={i} className="p-3 rounded-xl" style={{ background: '#1a1410' }}>
                  <p className="font-semibold text-sm" style={{ color: '#fdf8f5' }}>{c.name}</p>
                  <div className="flex gap-3 mt-2 text-xs" style={{ color: '#5a4a40' }}>
                    <span>נשלח ל-{c.sent}</span>
                    <span style={{ color: '#34d399' }}>נפתח: {c.opened}</span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: '#3a2e29' }}>{c.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
