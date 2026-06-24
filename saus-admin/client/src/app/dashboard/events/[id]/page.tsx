'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Pencil, Trash2, Star, Calendar, MapPin, Clock, ExternalLink } from 'lucide-react';
import { format, isPast } from 'date-fns';
import DOMPurify from 'isomorphic-dompurify';
import toast from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL;

const STATUS_BADGE: Record<string, string> = {
  PUBLISHED: 'badge-published', DRAFT: 'badge-draft',
  ARCHIVED: 'badge-archived', CANCELLED: 'badge-archived',
};

export default function ViewEventPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('saus_token');
    fetch(`${API}/events/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setEvent(d); setLoading(false); })
      .catch(() => { toast.error('Failed to load event'); setLoading(false); });
  }, [id]);

  async function handleDelete() {
    if (!confirm(`Delete "${event?.title}"? This cannot be undone.`)) return;
    const token = localStorage.getItem('saus_token');
    try {
      await fetch(`${API}/events/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      toast.success('Event deleted');
      router.push('/dashboard/events');
    } catch { toast.error('Failed to delete event'); }
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Loading…</div>;
  if (!event || event.error) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <p className="text-gray-400 text-sm">Event not found.</p>
      <Link href="/dashboard/events" className="btn-secondary btn-sm">← Back to Events</Link>
    </div>
  );

  const past = event.startDate && isPast(new Date(event.startDate));

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/events" className="btn-ghost btn-icon"><ArrowLeft className="w-4 h-4" /></Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-navy truncate">{event.title}</h1>
          <p className="text-xs text-gray-400 mt-0.5 font-mono truncate">{event.slug}</p>
        </div>
        <Link href={`/dashboard/events/${id}/edit`} className="btn-secondary btn-sm">
          <Pencil className="w-3.5 h-3.5" /> Edit
        </Link>
        <button onClick={handleDelete} className="btn-danger btn-sm">
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-5 items-start">
        <div className="lg:col-span-2 space-y-4">
          {event.bannerImage && (
            <div className="card overflow-hidden">
              <img src={event.bannerImage} alt={event.title} className="w-full h-52 object-cover" />
            </div>
          )}
          {past && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-2.5 text-amber-700 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 flex-shrink-0" /> This event has already taken place.
            </div>
          )}
          <div className="card p-6">
            {event.shortDescription && (
              <p className="text-gray-500 text-sm italic mb-4 pb-4 border-b border-gray-100">{event.shortDescription}</p>
            )}
            {event.description ? (
              <div className="prose prose-sm max-w-none text-navy leading-relaxed"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(event.description || '') }} />
            ) : (
              <p className="text-gray-400 text-sm italic">No description provided.</p>
            )}
            {event.registrationUrl && (
              <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer"
                className="btn-primary btn-sm mt-6 inline-flex">
                Register / RSVP <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-4 space-y-3">
            <h3 className="font-semibold text-navy text-sm">Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">Status</span>
                <span className={STATUS_BADGE[event.status] || 'badge-draft'}>{event.status}</span>
              </div>
              {event.isFeatured && (
                <div className="flex items-center gap-1.5 text-gold text-xs font-semibold">
                  <Star className="w-3.5 h-3.5" /> Featured
                </div>
              )}
              {event.startDate && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Start</span>
                  <span className="text-navy flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(event.startDate), 'dd MMM yyyy, HH:mm')}
                  </span>
                </div>
              )}
              {event.endDate && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">End</span>
                  <span className="text-navy">{format(new Date(event.endDate), 'dd MMM yyyy, HH:mm')}</span>
                </div>
              )}
              {(event.venue || event.city) && (
                <div className="flex justify-between text-xs gap-2">
                  <span className="text-gray-400 flex items-center gap-1"><MapPin className="w-3 h-3" /> Venue</span>
                  <span className="text-navy text-right">
                    {[event.venue, event.city, event.province].filter(Boolean).join(', ')}
                  </span>
                </div>
              )}
              {event.rsvpEnabled && (
                <div className="text-xs text-green font-medium">RSVP enabled</div>
              )}
              {event.category && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Category</span>
                  <span className="font-medium text-navy">{event.category.name}</span>
                </div>
              )}
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Author</span>
                <span className="font-medium text-navy">{event.createdBy?.name || '—'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Created</span>
                <span className="text-navy">{format(new Date(event.createdAt), 'dd MMM yyyy')}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Link href={`/dashboard/events/${id}/edit`} className="btn-primary w-full justify-center">
              <Pencil className="w-3.5 h-3.5" /> Edit Event
            </Link>
            <button onClick={handleDelete}
              className="btn-ghost w-full justify-center text-red-saus hover:bg-red-50 text-sm">
              <Trash2 className="w-3.5 h-3.5" /> Delete Event
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
