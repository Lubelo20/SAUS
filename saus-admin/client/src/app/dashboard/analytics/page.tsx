'use client';
import { useEffect, useState } from 'react';
import { BarChart2, TrendingUp, Newspaper, CalendarDays, Image, FileText } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const API = process.env.NEXT_PUBLIC_API_URL;

const MONTHLY = [
  { month: 'Sep', news: 4, events: 2, campaigns: 1 },
  { month: 'Oct', news: 6, events: 3, campaigns: 2 },
  { month: 'Nov', news: 5, events: 1, campaigns: 1 },
  { month: 'Dec', news: 2, events: 1, campaigns: 0 },
  { month: 'Jan', news: 8, events: 4, campaigns: 3 },
  { month: 'Feb', news: 7, events: 2, campaigns: 2 },
  { month: 'Mar', news: 10, events: 5, campaigns: 3 },
  { month: 'Apr', news: 9, events: 3, campaigns: 2 },
  { month: 'May', news: 12, events: 6, campaigns: 4 },
];

const TRAFFIC = [
  { month: 'Sep', views: 1200 }, { month: 'Oct', views: 1800 }, { month: 'Nov', views: 1400 },
  { month: 'Dec', views: 900 },  { month: 'Jan', views: 2200 }, { month: 'Feb', views: 1700 },
  { month: 'Mar', views: 2800 }, { month: 'Apr', views: 2100 }, { month: 'May', views: 3200 },
];

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('saus_token');
    fetch(`${API}/dashboard/stats`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setStats(d.stats))
      .catch(() => {});
  }, []);

  const SUMMARY = [
    { label: 'Total Articles', value: stats?.news?.total ?? '—', icon: Newspaper, color: 'text-navy', bg: 'bg-navy-50' },
    { label: 'Published', value: stats?.news?.published ?? '—', icon: TrendingUp, color: 'text-green', bg: 'bg-green-50' },
    { label: 'Events', value: stats?.events?.total ?? '—', icon: CalendarDays, color: 'text-gold', bg: 'bg-gold-50' },
    { label: 'Media Files', value: stats?.media ?? '—', icon: Image, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Documents', value: stats?.documents ?? '—', icon: FileText, color: 'text-red-saus', bg: 'bg-red-50' },
    { label: 'Campaigns', value: stats?.campaigns?.total ?? '—', icon: BarChart2, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[10px] font-mono tracking-[0.15em] uppercase text-navy/40 mb-1">SAUS/CMS/ANALYTICS</div>
        <h1 className="text-2xl font-bold text-navy">Analytics</h1>
        <p className="text-sm text-gray-400 mt-0.5">Content performance overview</p>
      </div>

      <div className="h-0.5 flex rounded-full overflow-hidden">
        <div className="flex-1 bg-navy" /><div className="flex-1 bg-green" />
        <div className="flex-1 bg-gold" /><div className="flex-1 bg-red-saus" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {SUMMARY.map(s => (
          <div key={s.label} className="card p-4">
            <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <div className="text-2xl font-bold text-navy">{s.value}</div>
            <div className="text-xs font-semibold text-navy/70 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="font-semibold text-navy text-sm mb-1">Website Traffic</h3>
          <p className="text-xs text-gray-400 mb-4">Monthly page views</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={TRAFFIC} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gTraffic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0A1628" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#0A1628" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #e5e7eb' }} />
                <Area type="monotone" dataKey="views" stroke="#0A1628" strokeWidth={2} fill="url(#gTraffic)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-navy text-sm mb-1">Content Published</h3>
          <p className="text-xs text-gray-400 mb-4">By content type per month</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #e5e7eb' }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="news" name="News" fill="#0A1628" radius={[2,2,0,0]} />
                <Bar dataKey="events" name="Events" fill="#C9A227" radius={[2,2,0,0]} />
                <Bar dataKey="campaigns" name="Campaigns" fill="#00692F" radius={[2,2,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card p-4 bg-navy-50 border border-navy/10">
        <p className="text-xs text-navy/60">
          Traffic data shown is illustrative. Connect Google Analytics (Settings → SEO) to display live data.
        </p>
      </div>
    </div>
  );
}
