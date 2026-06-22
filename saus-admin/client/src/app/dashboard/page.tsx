'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BarChart2, Newspaper, CalendarDays, Megaphone, FileText, Image,
         Users, TrendingUp, Plus, ArrowRight, Clock, CheckCircle2,
         AlertCircle, FilePen } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API = process.env.NEXT_PUBLIC_API_URL;

const CHART_DATA = [
  { month: 'Sep', views: 1200 }, { month: 'Oct', views: 1800 }, { month: 'Nov', views: 1400 },
  { month: 'Dec', views: 900 },  { month: 'Jan', views: 2200 }, { month: 'Feb', views: 1700 },
  { month: 'Mar', views: 2800 }, { month: 'Apr', views: 2100 }, { month: 'May', views: 3200 },
];

const STATUS_ICON: Record<string, React.ReactNode> = {
  LOGIN:  <CheckCircle2 className="w-4 h-4 text-green" />,
  CREATE: <Plus className="w-4 h-4 text-blue-500" />,
  UPDATE: <FilePen className="w-4 h-4 text-gold" />,
  DELETE: <AlertCircle className="w-4 h-4 text-red-saus" />,
};

const STATUS_BADGE: Record<string, string> = {
  PUBLISHED: 'badge-published',
  DRAFT:     'badge-draft',
  SCHEDULED: 'badge-scheduled',
  ARCHIVED:  'badge-archived',
};

interface Stats {
  news: { total: number; published: number; draft: number };
  events: { total: number; upcoming: number };
  campaigns: { total: number; active: number };
  documents: number; media: number; users: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [recentNews, setRecentNews] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('saus_token');
    fetch(`${API}/dashboard/stats`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setStats(d.stats); setActivity(d.recentActivity); setRecentNews(d.recentNews); })
      .catch(() => {});
  }, []);

  const STAT_CARDS = [
    { label: 'News Articles', value: stats?.news.total ?? '—', sub: `${stats?.news.published ?? 0} published`,
      icon: Newspaper, color: 'text-navy', bg: 'bg-navy-50', href: '/dashboard/news' },
    { label: 'Upcoming Events', value: stats?.events.upcoming ?? '—', sub: `${stats?.events.total ?? 0} total events`,
      icon: CalendarDays, color: 'text-gold', bg: 'bg-gold-50', href: '/dashboard/events' },
    { label: 'Active Campaigns', value: stats?.campaigns.active ?? '—', sub: `${stats?.campaigns.total ?? 0} total`,
      icon: Megaphone, color: 'text-green', bg: 'bg-green-50', href: '/dashboard/campaigns' },
    { label: 'Documents', value: stats?.documents ?? '—', sub: 'PDFs & policies',
      icon: FileText, color: 'text-red-saus', bg: 'bg-red-50', href: '/dashboard/documents' },
    { label: 'Media Items', value: stats?.media ?? '—', sub: 'Gallery & images',
      icon: Image, color: 'text-blue-600', bg: 'bg-blue-50', href: '/dashboard/media' },
    { label: 'Active Users', value: stats?.users ?? '—', sub: 'CMS accounts',
      icon: Users, color: 'text-purple-600', bg: 'bg-purple-50', href: '/dashboard/users' },
  ];

  const QUICK_ACTIONS = [
    { label: 'Write Article',   icon: Newspaper,    href: '/dashboard/news/create',      color: 'hover:border-navy/30 hover:bg-navy-50' },
    { label: 'Add Event',       icon: CalendarDays, href: '/dashboard/events/create',     color: 'hover:border-gold/30 hover:bg-gold-50' },
    { label: 'Upload Media',    icon: Image,        href: '/dashboard/media',             color: 'hover:border-green/30 hover:bg-green-50' },
    { label: 'New Campaign',    icon: Megaphone,    href: '/dashboard/campaigns/create',  color: 'hover:border-red-saus/30 hover:bg-red-50' },
    { label: 'Upload Document', icon: FileText,     href: '/dashboard/documents',         color: 'hover:border-blue-300 hover:bg-blue-50' },
    { label: 'Manage Users',    icon: Users,        href: '/dashboard/users',             color: 'hover:border-purple-300 hover:bg-purple-50' },
  ];

  return (
    <div className="space-y-6">
      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono tracking-[0.15em] uppercase text-navy/40 mb-1">SAUS/CMS/DASHBOARD</div>
          <h1 className="text-2xl font-bold text-navy">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            South African Union of Students — Content Management System
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/news/create" className="btn-primary btn-sm">
            <Plus className="w-3.5 h-3.5" /> New Article
          </Link>
          <Link href="/dashboard/analytics" className="btn-secondary btn-sm">
            <BarChart2 className="w-3.5 h-3.5" /> Analytics
          </Link>
        </div>
      </div>

      {/* ── SA stripe ── */}
      <div className="h-0.5 flex rounded-full overflow-hidden">
        <div className="flex-1 bg-navy" /><div className="flex-1 bg-green" />
        <div className="flex-1 bg-gold" /><div className="flex-1 bg-red-saus" />
      </div>

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {STAT_CARDS.map(card => (
          <Link key={card.label} href={card.href}
            className="card p-4 hover:shadow-card-hover transition-all duration-200 group">
            <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>
              <card.icon className={`w-4.5 h-4.5 ${card.color}`} style={{ width: 18, height: 18 }} />
            </div>
            <div className="text-2xl font-bold text-navy">{card.value}</div>
            <div className="text-xs font-semibold text-navy/70 mt-0.5">{card.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{card.sub}</div>
            <ArrowRight className="w-3 h-3 text-gray-300 mt-2 group-hover:text-navy group-hover:translate-x-0.5 transition-all" />
          </Link>
        ))}
      </div>

      {/* ── Chart + Recent News ── */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Chart */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-navy text-sm">Website Traffic</h3>
              <p className="text-xs text-gray-400">Monthly page views</p>
            </div>
            <div className="flex items-center gap-1.5 text-green text-xs font-semibold">
              <TrendingUp className="w-3.5 h-3.5" /> +14.2% vs last period
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0A1628" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#0A1628" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,.08)' }}
                  labelStyle={{ fontWeight: 600, color: '#0A1628' }} />
                <Area type="monotone" dataKey="views" stroke="#0A1628" strokeWidth={2}
                  fill="url(#colorViews)" dot={false} activeDot={{ r: 4, fill: '#0A1628' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent News */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-navy text-sm">Recent Articles</h3>
            <Link href="/dashboard/news" className="text-xs text-navy/50 hover:text-navy transition-colors">View all</Link>
          </div>
          <div className="space-y-3">
            {recentNews.length === 0 && (
              <div className="text-xs text-gray-400 text-center py-6">No articles yet</div>
            )}
            {recentNews.map(article => (
              <Link key={article.id} href={`/dashboard/news/${article.id}`}
                className="block group">
                <div className="flex items-start gap-2">
                  <Newspaper className="w-3.5 h-3.5 text-gray-300 mt-0.5 flex-shrink-0 group-hover:text-navy transition-colors" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-navy truncate group-hover:text-green transition-colors">
                      {article.title}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={STATUS_BADGE[article.status] || 'badge-draft'} style={{ fontSize: 9 }}>
                        {article.status}
                      </span>
                      <span className="text-gray-400 text-[11px] flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        {formatDistanceToNow(new Date(article.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Quick Actions + Activity ── */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Quick Actions */}
        <div className="card p-5">
          <h3 className="font-semibold text-navy text-sm mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_ACTIONS.map(action => (
              <Link key={action.label} href={action.href}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-100
                            text-center transition-all duration-200 group ${action.color}`}>
                <action.icon className="w-5 h-5 text-gray-400 group-hover:text-navy transition-colors" />
                <span className="text-xs font-medium text-gray-500 group-hover:text-navy transition-colors leading-tight">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-navy text-sm">Recent Activity</h3>
            <span className="text-xs text-gray-400 font-mono">Audit Log</span>
          </div>
          <div className="space-y-3">
            {activity.length === 0 && (
              <div className="text-xs text-gray-400 text-center py-6">No recent activity</div>
            )}
            {activity.map((log: any) => (
              <div key={log.id} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-navy flex-shrink-0">
                  {log.user?.name?.charAt(0) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {STATUS_ICON[log.action] || <CheckCircle2 className="w-4 h-4 text-gray-300" />}
                    <span className="text-sm text-navy font-medium">{log.user?.name || 'System'}</span>
                    <span className="text-xs text-gray-400 capitalize">{log.action.toLowerCase()}</span>
                    <span className="text-xs font-mono text-gray-400">{log.resource}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
