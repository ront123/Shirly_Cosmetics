export default function Dashboard() {
  const stats = [
    { label: 'תורים היום', value: '8', trend: '+2', positive: true },
    { label: 'הכנסות החודש', value: '₪24,500', trend: '+12%', positive: true },
    { label: 'לקוחות חדשים', value: '14', trend: '-2', positive: false },
    { label: 'קמפיינים פעילים', value: '2', trend: 'יציב', positive: true },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-6 border border-pink-100 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
            <div className="flex items-end justify-between">
              <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
              <span className={`text-sm font-medium ${stat.positive ? 'text-emerald-500' : 'text-rose-500'}`}>
                {stat.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-pink-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">התורים הקרובים</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-pink-200 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold">
                    1{i}:00
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">דנה ישראלי</h4>
                    <p className="text-sm text-slate-500">טיפול פנים קלאסי</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-medium">
                  אושר
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl p-6 shadow-md text-white">
          <h3 className="text-lg font-bold mb-2">פעולות מהירות</h3>
          <p className="text-pink-100 text-sm mb-6">מה תרצי לעשות עכשיו?</p>
          
          <div className="space-y-3">
            <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors py-3 px-4 rounded-xl text-right font-medium text-sm">
              שלחי תזכורת ללקוחות
            </button>
            <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors py-3 px-4 rounded-xl text-right font-medium text-sm">
              צרי קמפיין שיווקי חדש
            </button>
            <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors py-3 px-4 rounded-xl text-right font-medium text-sm">
              דוח חודשי
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
