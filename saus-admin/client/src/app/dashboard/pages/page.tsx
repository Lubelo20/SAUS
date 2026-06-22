'use client';
import Link from 'next/link';
import { FileText, Home, Mail, GraduationCap, ChevronRight, Lock } from 'lucide-react';

const PAGES = [
  {
    slug: 'about',
    title: 'About',
    desc: 'Institutional overview, profile, mission, vision, values, history & continental presence',
    icon: FileText,
    href: '/dashboard/pages/about',
    ready: true,
  },
  {
    slug: 'home',
    title: 'Home',
    desc: 'Landing page hero, stats, mandate, priority campaigns & events CTA',
    icon: Home,
    href: '/dashboard/pages/home',
    ready: true,
  },
  {
    slug: 'contact',
    title: 'Contact',
    desc: 'Contact details, office bearers and enquiry information',
    icon: Mail,
    href: '/dashboard/pages/contact',
    ready: true,
  },
  {
    slug: 'nsfas',
    title: 'NSFAS',
    desc: 'NSFAS financial-aid guide and eligibility content',
    icon: GraduationCap,
    href: '/dashboard/pages/nsfas',
    ready: true,
  },
];

export default function PagesListPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-navy">Pages</h1>
        <p className="text-sm text-gray-400 mt-0.5">Edit the content of the public website pages</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {PAGES.map(page => {
          const Card = (
            <div
              className={`card p-5 flex items-start gap-4 transition-colors h-full
                ${page.ready ? 'hover:border-navy/30 cursor-pointer' : 'opacity-60'}`}
            >
              <div className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0
                ${page.ready ? 'bg-navy-50 text-navy' : 'bg-gray-100 text-gray-400'}`}>
                <page.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-navy text-sm">{page.title}</h3>
                  {!page.ready && (
                    <span className="badge-archived inline-flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Coming soon
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">{page.desc}</p>
              </div>
              {page.ready && <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" />}
            </div>
          );

          return page.ready ? (
            <Link key={page.slug} href={page.href}>{Card}</Link>
          ) : (
            <div key={page.slug} aria-disabled>{Card}</div>
          );
        })}
      </div>
    </div>
  );
}
