'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Newspaper, CalendarDays, Megaphone,
  Image, FileText, Users, Settings, ChevronRight,
  Award, Bell, BarChart2, LogOut, ChevronDown, X,
} from 'lucide-react';

const NAV = [
  {
    label: 'Overview',
    items: [
      { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { href: '/dashboard/analytics', icon: BarChart2, label: 'Analytics' },
    ],
  },
  {
    label: 'Content',
    items: [
      { href: '/dashboard/news', icon: Newspaper, label: 'News & Statements',
        sub: [
          { href: '/dashboard/news', label: 'All Articles' },
          { href: '/dashboard/news/create', label: 'Write Article' },
          { href: '/dashboard/news/categories', label: 'Categories' },
        ],
      },
      { href: '/dashboard/events', icon: CalendarDays, label: 'Events' },
      { href: '/dashboard/campaigns', icon: Megaphone, label: 'Campaigns' },
      { href: '/dashboard/leadership', icon: Award, label: 'Leadership' },
      { href: '/dashboard/pages', icon: FileText, label: 'Pages' },
    ],
  },
  {
    label: 'Media & Files',
    items: [
      { href: '/dashboard/media', icon: Image, label: 'Media Library' },
      { href: '/dashboard/documents', icon: FileText, label: 'Documents & PDFs' },
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/dashboard/announcements', icon: Bell, label: 'Announcements' },
      { href: '/dashboard/users', icon: Users, label: 'Users & Roles' },
      { href: '/dashboard/settings', icon: Settings, label: 'Site Settings' },
    ],
  },
];

interface Props { onClose?: () => void; }

export default function Sidebar({ onClose }: Props) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [user, setUser] = useState<{ name?: string; role?: string }>({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem('saus_user');
      if (stored) setUser(JSON.parse(stored));
    } catch {}
  }, []);

  function isActive(href: string) {
    return pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
  }

  function toggleExpand(label: string) {
    setExpanded(prev => prev === label ? null : label);
  }

  function logout() {
    localStorage.removeItem('saus_token');
    localStorage.removeItem('saus_user');
    window.location.href = '/login';
  }

  return (
    <aside className="h-full flex flex-col bg-navy text-white select-none">
      {/* ── Top bar ── */}
      <div className="h-1 flex flex-shrink-0">
        <div className="flex-1 bg-navy-light" />
        <div className="flex-1 bg-green" />
        <div className="flex-1 bg-gold" />
        <div className="flex-1 bg-red-saus" />
      </div>

      {/* ── Logo ── */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full border-2 border-gold overflow-hidden flex-shrink-0 bg-white">
            <img src="/saus-logo.jpeg" alt="SAUS logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="font-serif font-bold text-base leading-tight">SAUS CMS</div>
            <div className="text-white/35 text-[10px] font-mono tracking-widest uppercase">Admin Portal</div>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1 rounded text-white/50 hover:text-white hover:bg-white/10">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {NAV.map(section => (
          <div key={section.label}>
            <div className="px-3 mb-1 text-[10px] font-semibold tracking-[0.15em] uppercase text-white/25">
              {section.label}
            </div>
            <div className="space-y-0.5">
              {section.items.map(item => (
                <div key={item.href}>
                  {item.sub ? (
                    <>
                      <button
                        onClick={() => toggleExpand(item.label)}
                        className={`sidebar-link w-full justify-between ${isActive(item.href) ? 'active' : ''}`}
                      >
                        <span className="flex items-center gap-3">
                          <item.icon className="icon" />
                          {item.label}
                        </span>
                        <ChevronDown className={`w-3.5 h-3.5 opacity-50 transition-transform ${expanded === item.label ? 'rotate-180' : ''}`} />
                      </button>
                      {expanded === item.label && (
                        <div className="ml-7 mt-0.5 space-y-0.5 border-l border-white/8 pl-3">
                          {item.sub.map(s => (
                            <Link key={s.href} href={s.href}
                              className={`block py-1.5 px-2 rounded text-xs font-medium transition-colors
                                ${pathname === s.href ? 'text-gold' : 'text-white/45 hover:text-white'}`}
                              onClick={onClose}>
                              {s.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link href={item.href}
                      className={`sidebar-link ${isActive(item.href) ? 'active' : ''}`}
                      onClick={onClose}>
                      <item.icon className="icon" />
                      {item.label}
                      {isActive(item.href) && <ChevronRight className="w-3 h-3 ml-auto opacity-40" />}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* ── User footer ── */}
      <div className="border-t border-white/8 p-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-white/5 transition-colors">
          <div className="w-8 h-8 rounded-full bg-navy-light border border-white/15 flex items-center justify-center text-xs font-bold text-gold flex-shrink-0">
            {user.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white truncate">{user.name || 'Admin User'}</div>
            <div className="text-[10px] text-white/35 font-mono uppercase tracking-wide truncate">{user.role || 'ADMIN'}</div>
          </div>
          <button onClick={logout} title="Sign out"
            className="p-1.5 rounded text-white/30 hover:text-red-400 hover:bg-red-900/20 transition-colors flex-shrink-0">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
