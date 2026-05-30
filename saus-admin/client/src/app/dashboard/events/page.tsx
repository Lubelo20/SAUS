'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, Pencil, Trash2, Eye, Clock, MapPin, Calendar } from 'lucide-react';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import toast from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL;

const STATUS_BADGE: Record<string, string> = {
  PUBLISHED: 'badge-published', DRAFT: 'badge-draft',
  ARCHIVED: 'badge-archived', CANCELLED: 'badge-archived',
};

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('saus_token');
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (status) params.set('status', status);
    if (search) params.set('search', search);
    try {
      const res = await fetch(`${API}/events?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setEvents(data.data || []);
      setTotal(data.total || 0);
    } catch { toast.error('Failed to load events'); }
    setLoading(false);
  }, [page, search, status]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  async function deleteEvent(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    const token = localStorage.getItem('saus_token');
    try {
      await fetch(`${API}/events/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      toast.success('Event deleted');
      fetchEvents();
    } catch { toast.error('Failed to delete'); }
    setDeleting(null);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-navy">Events</h1>
          <p className="text-sm text-gray-400 mt-0.5">{total} total events</p>
        </div>
        <Link href="/dashboard/events/create" className="btn-primary self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Add Event
        </Link>
      </div>

      <div className="card p-3 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search events…" className="input pl-8 h-8 text-sm" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
            className="input h-8 text-sm w-36">
            {['', 'PUBLISHED', 'DRAFT', 'ARCHIVED'].map(s => (
              <option key={s} value={s}>{s || 'All Status'}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="flex gap-2">
              {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-navy animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
            </div>
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-sm text-gray-400">No events found</p>
            <Link href="/dashboard/events/create" className="btn-primary btn-sm">Create first event</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-base">
              <thead>
                <tr>
                  <th>#</th><th>Event</th>
                  <th className="hidden md:table-cell">Date</th>
                  <th className="hidden lg:table-cell">Location</th>
                  <th>Status</th>
                  <th className="w-24 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev, i) => (
                  <tr key={ev.id}>
                    <td className="text-gray-400 font-mono text-xs">{(page-1)*20 + i + 1}</td>
                    <td>
                      <div className="font-medium text-navy text-sm line-clamp-1">{ev.title}</div>
                      {ev.startDate && (
                        <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {isPast(new Date(ev.startDate)) ? 'Past event' : formatDistanceToNow(new Date(ev.startDate), { addSuffix: true })}
                        </div>
                      )}
                    </td>
                    <td className="hidden md:table-cell text-sm text-gray-500">
                      {ev.startDate ? format(new Date(ev.startDate), 'dd MMM yyyy') : '—'}
                    </td>
                    <td className="hidden lg:table-cell">
                      {(ev.city || ev.province) ? (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <MapPin className="w-3 h-3" />{[ev.city, ev.province].filter(Boolean).join(', ')}
                        </span>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td><span className={STATUS_BADGE[ev.status] || 'badge-draft'}>{ev.status}</span></td>
                    <td>
                      <div className="flex items-center justify-center gap-1">
                        <Link href={`/dashboard/events/${ev.id}`} className="btn-ghost btn-icon" title="View"><Eye className="w-3.5 h-3.5" /></Link>
                        <Link href={`/dashboard/events/${ev.id}/edit`} className="btn-ghost btn-icon" title="Edit"><Pencil className="w-3.5 h-3.5" /></Link>
                        <button onClick={() => deleteEvent(ev.id, ev.title)} disabled={deleting === ev.id}
                          className="btn-ghost btn-icon text-red-400 hover:bg-red-50 hover:text-red-saus"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {total > 20 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Page {page} of {Math.ceil(total / 20)}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="btn-secondary btn-sm">Previous</button>
            <button onClick={() => setPage(p => p+1)} disabled={page >= Math.ceil(total/20)} className="btn-secondary btn-sm">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
