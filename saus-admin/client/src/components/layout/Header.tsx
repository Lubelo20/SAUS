'use client';
import { useState } from 'react';
import { Bell, Search, Menu, Plus, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const BREADCRUMBS: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/news': 'News & Statements',
  '/dashboard/news/create': 'Write Article',
  '/dashboard/news/categories': 'News Categories',
  '/dashboard/events': 'Events',
  '/dashboard/campaigns': 'Campaigns',
  '/dashboard/media': 'Media Library',
  '/dashboard/documents': 'Documents & PDFs',
  '/dashboard/users': 'Users & Roles',
  '/dashboard/settings': 'Site Settings',
  '/dashboard/leadership': 'Leadership',
  '/dashboard/announcements': 'Announcements',
};

function resolveBreadcrumb(pathname: string): string {
  if (BREADCRUMBS[pathname]) return BREADCRUMBS[pathname];
  if (/^\/dashboard\/news\/[^/]+\/edit$/.test(pathname)) return 'Edit Article';
  if (/^\/dashboard\/news\/[^/]+$/.test(pathname)) return 'View Article';
  if (/^\/dashboard\/campaigns\/[^/]+\/edit$/.test(pathname)) return 'Edit Campaign';
  if (/^\/dashboard\/campaigns\/[^/]+$/.test(pathname)) return 'View Campaign';
  if (/^\/dashboard\/events\/[^/]+\/edit$/.test(pathname)) return 'Edit Event';
  if (/^\/dashboard\/events\/[^/]+$/.test(pathname)) return 'View Event';
  return 'Dashboard';
}

const QUICK_ACTIONS = [
  { label: 'Write Article', href: '/dashboard/news/create' },
  { label: 'Add Event', href: '/dashboard/events/create' },
  { label: 'Upload Media', href: '/dashboard/media' },
  { label: 'New Campaign', href: '/dashboard/campaigns/create' },
];

interface Props { onMenuClick: () => void; }

export default function Header({ onMenuClick }: Props) {
  const pathname = usePathname();
  const [showQuick, setShowQuick] = useState(false);
  const title = resolveBreadcrumb(pathname);

  return (
    <header className="bg-white border-b border-gray-100 flex flex-col flex-shrink-0">
      {/* SA-flag accent stripe (echoes the public-site topbar) */}
      <div className="h-[3px] flex flex-shrink-0">
        <div className="flex-1 bg-green" />
        <div className="flex-1 bg-gold" />
        <div className="flex-1 bg-red-saus" />
      </div>
      <div className="h-14 flex items-center gap-4 px-4 lg:px-6">
      {/* Mobile menu trigger */}
      <button onClick={onMenuClick}
        className="lg:hidden p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-navy transition-colors">
        <Menu className="w-5 h-5" />
      </button>

      {/* Page title */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 hidden sm:block font-mono">SAUS/CMS</span>
        <span className="text-gray-300 hidden sm:block">/</span>
        <h1 className="font-semibold text-navy text-sm">{title}</h1>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-sm hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input placeholder="Search content…"
            className="w-full pl-8 pr-4 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-md
                       focus:outline-none focus:ring-2 focus:ring-navy/15 focus:border-navy/30 transition-colors" />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Quick Add */}
        <div className="relative">
          <button onClick={() => setShowQuick(!showQuick)}
            className="btn-primary btn-sm hidden sm:flex">
            <Plus className="w-3.5 h-3.5" />
            Create
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>
          {showQuick && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg border border-gray-100 shadow-card-hover py-1 z-50 animate-fade-in">
              {QUICK_ACTIONS.map(a => (
                <Link key={a.href} href={a.href} onClick={() => setShowQuick(false)}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-navy transition-colors">
                  {a.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-navy transition-colors">
          <Bell className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-saus rounded-full" />
        </button>

        {/* Gold accent indicator */}
        <div className="h-6 w-px bg-gray-200" />
        <div className="flex gap-0.5">
          <div className="w-2 h-2 rounded-sm bg-navy" />
          <div className="w-2 h-2 rounded-sm bg-green" />
          <div className="w-2 h-2 rounded-sm bg-gold" />
        </div>
      </div>
      </div>
    </header>
  );
}
