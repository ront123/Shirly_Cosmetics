import { useState } from 'react';
import { MessageCircle, Image as ImageIcon, Send, Filter, Users } from 'lucide-react';

export default function Campaigns() {
  const [message, setMessage] = useState('');
  
  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-pink-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800">קמפיינים שיווקיים (WhatsApp)</h2>
          <p className="text-slate-500 text-sm mt-1">שליחת הודעות תזכורת ומבצעים אוטומטית ללקוחות</p>
        </div>
        <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm shadow-emerald-200">
          <Send size={18} />
          שליחת קמפיין
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Campaign Builder */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-6">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Filter size={18} className="text-pink-600" />
              1. למי לשלוח? (קהל יעד)
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <label className="border border-pink-100 p-4 rounded-xl cursor-pointer hover:bg-pink-50 transition-colors flex items-start gap-3">
                <input type="radio" name="audience" className="mt-1 accent-pink-600" defaultChecked />
                <div>
                  <p className="font-semibold text-slate-800">לקוחות רדומים</p>
                  <p className="text-sm text-slate-500 mt-1">לא ביקרו בקליניקה מעל לחודשיים</p>
                </div>
              </label>

              <label className="border border-pink-100 p-4 rounded-xl cursor-pointer hover:bg-pink-50 transition-colors flex items-start gap-3">
                <input type="radio" name="audience" className="mt-1 accent-pink-600" />
                <div>
                  <p className="font-semibold text-slate-800">כל הלקוחות</p>
                  <p className="text-sm text-slate-500 mt-1">הודעה כללית לכל המאגר</p>
                </div>
              </label>
            </div>
            <p className="text-sm text-pink-600 mt-3 flex items-center gap-1 font-medium">
              <Users size={14} /> הקמפיין יישלח לכ-42 לקוחות מתאימים.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-6">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <MessageCircle size={18} className="text-pink-600" />
              2. תוכן ההודעה
            </h3>
            
            <div className="space-y-4">
              <div className="border-2 border-dashed border-pink-200 rounded-xl p-8 flex flex-col items-center justify-center text-slate-500 hover:bg-pink-50 hover:border-pink-300 transition-colors cursor-pointer">
                <ImageIcon size={32} className="text-pink-400 mb-2" />
                <p className="font-medium">לחצי כאן להוספת תמונה (אופציונלי)</p>
                <p className="text-xs mt-1">מומלץ להעלות תמונה מרובעת</p>
              </div>

              <div>
                <textarea 
                  className="w-full p-4 rounded-xl border border-pink-100 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all resize-none"
                  rows="5"
                  placeholder="היי [שם_הלקוחה], התגעגענו! מגיע לך פינוק..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                ></textarea>
                <p className="text-xs text-slate-400 mt-2">תוכלי להשתמש במילה [שם_הלקוחה] והמערכת תחליף אותה אוטומטית בשם האמיתי.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div className="bg-slate-100 rounded-2xl p-6 relative overflow-hidden flex flex-col border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-6 text-center">תצוגה מקדימה - WhatsApp</h3>
          
          <div className="bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-cover flex-1 rounded-xl shadow-inner p-4 flex flex-col relative">
            <div className="bg-white p-3 rounded-lg rounded-tr-none shadow-sm max-w-[85%] self-end relative">
              <p className="text-sm text-slate-800 whitespace-pre-wrap">
                {message || "היי דנה, התגעגענו! קבלי קופון 50 שקלים לטיפול פנים קלאסי."}
              </p>
              <span className="text-[10px] text-slate-400 block text-left mt-1">10:42</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
