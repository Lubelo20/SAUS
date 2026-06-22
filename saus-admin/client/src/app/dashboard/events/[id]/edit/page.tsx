'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Save, ArrowLeft, Star, Calendar, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadFile } from '@/lib/upload';

const API = process.env.NEXT_PUBLIC_API_URL;

interface FormState {
  title: string; shortDescription: string; description: string; bannerImage: string;
  venue: string; address: string; city: string; province: string;
  startDate: string; endDate: string;
  registrationUrl: string; rsvpEnabled: boolean;
  isFeatured: boolean; status: string;
}

export default function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const bannerRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<FormState>({
    title: '', shortDescription: '', description: '', bannerImage: '',
    venue: '', address: '', city: '', province: '',
    startDate: '', endDate: '',
    registrationUrl: '', rsvpEnabled: false,
    isFeatured: false, status: 'DRAFT',
  });

  function update(k: keyof FormState, v: any) { setForm(prev => ({ ...prev, [k]: v })); }

  useEffect(() => {
    const token = localStorage.getItem('saus_token');
    fetch(`${API}/events/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(ev => {
        setForm({
          title: ev.title || '',
          shortDescription: ev.shortDescription || '',
          description: ev.description || '',
          bannerImage: ev.bannerImage || '',
          venue: ev.venue || '',
          address: ev.address || '',
          city: ev.city || '',
          province: ev.province || '',
          startDate: ev.startDate ? ev.startDate.slice(0, 16) : '',
          endDate: ev.endDate ? ev.endDate.slice(0, 16) : '',
          registrationUrl: ev.registrationUrl || '',
          rsvpEnabled: ev.rsvpEnabled || false,
          isFeatured: ev.isFeatured || false,
          status: ev.status || 'DRAFT',
        });
        setLoading(false);
      })
      .catch(() => { toast.error('Failed to load event'); setLoading(false); });
  }, [id]);

  async function save(status?: string) {
    if (!form.title.trim()) return toast.error('Title is required');
    if (!form.startDate) return toast.error('Start date is required');
    setSaving(true);
    const token = localStorage.getItem('saus_token');
    try {
      const res = await fetch(`${API}/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, status: status || form.status }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success('Event updated');
      router.push(`/dashboard/events/${id}`);
    } catch (err: any) { toast.error(err.message || 'Failed to save'); }
    setSaving(false);
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Loading…</div>;

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="btn-ghost btn-icon"><ArrowLeft className="w-4 h-4" /></button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-navy">Edit Event</h1>
          <p className="text-xs text-gray-400 font-mono truncate max-w-xs">{form.title || 'Untitled'}</p>
        </div>
        <button onClick={() => save('DRAFT')} disabled={saving} className="btn-secondary btn-sm">
          <Save className="w-3.5 h-3.5" /> Save Draft
        </button>
        <button onClick={() => save('PUBLISHED')} disabled={saving} className="btn-success btn-sm">
          Publish
        </button>
      </div>

      <div className="card p-6 space-y-5">
        <div>
          <label className="label">Event Title *</label>
          <input value={form.title} onChange={e => update('title', e.target.value)}
            className="input text-base" placeholder="e.g. SAUS National Conference 2025" />
        </div>

        <div>
          <label className="label">Short Description</label>
          <textarea value={form.shortDescription} onChange={e => update('shortDescription', e.target.value)}
            rows={2} className="input resize-none" placeholder="Brief event description…" />
        </div>

        <div>
          <label className="label">Full Description</label>
          <textarea value={form.description} onChange={e => update('description', e.target.value)}
            rows={6} className="input resize-none" placeholder="Detailed event information…" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label"><Calendar className="inline w-3 h-3 mr-1" />Start Date & Time *</label>
            <input type="datetime-local" value={form.startDate} onChange={e => update('startDate', e.target.value)} className="input" />
          </div>
          <div>
            <label className="label"><Calendar className="inline w-3 h-3 mr-1" />End Date & Time</label>
            <input type="datetime-local" value={form.endDate} onChange={e => update('endDate', e.target.value)} className="input" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label"><MapPin className="inline w-3 h-3 mr-1" />Venue Name</label>
            <input value={form.venue} onChange={e => update('venue', e.target.value)}
              className="input" placeholder="e.g. Sandton Convention Centre" />
          </div>
          <div>
            <label className="label">Address</label>
            <input value={form.address} onChange={e => update('address', e.target.value)}
              className="input" placeholder="Street address" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">City</label>
            <input value={form.city} onChange={e => update('city', e.target.value)}
              className="input" placeholder="e.g. Johannesburg" />
          </div>
          <div>
            <label className="label">Province</label>
            <select value={form.province} onChange={e => update('province', e.target.value)} className="input">
              <option value="">— Select —</option>
              {['Gauteng','Western Cape','KwaZulu-Natal','Eastern Cape','Limpopo',
                'Mpumalanga','North West','Free State','Northern Cape'].map(p =>
                <option key={p} value={p}>{p}</option>
              )}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Registration URL</label>
          <input value={form.registrationUrl} onChange={e => update('registrationUrl', e.target.value)}
            className="input" placeholder="https://…" type="url" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Status</label>
            <select value={form.status} onChange={e => update('status', e.target.value)} className="input">
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <div className={`relative w-9 h-5 rounded-full transition-colors ${form.isFeatured ? 'bg-gold' : 'bg-gray-200'}`}
              onClick={() => update('isFeatured', !form.isFeatured)}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.isFeatured ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-sm font-medium text-navy flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-gold" /> Featured Event
            </span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <div className={`relative w-9 h-5 rounded-full transition-colors ${form.rsvpEnabled ? 'bg-green' : 'bg-gray-200'}`}
              onClick={() => update('rsvpEnabled', !form.rsvpEnabled)}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.rsvpEnabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-sm font-medium text-navy">RSVP Enabled</span>
          </label>
        </div>

        <div>
          <label className="label">Banner Image</label>
          {form.bannerImage ? (
            <div className="relative rounded overflow-hidden mb-2">
              <img src={form.bannerImage} alt="Banner" className="w-full h-40 object-cover" />
              <button onClick={() => update('bannerImage', '')}
                className="absolute top-2 right-2 bg-red-saus text-white rounded px-2 py-0.5 text-xs">Remove</button>
            </div>
          ) : (
            <div onClick={() => !uploading && bannerRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-lg h-32 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-navy/30 transition-colors mb-2">
              <span className="text-xs text-gray-400">{uploading ? 'Uploading…' : 'Click to upload banner'}</span>
            </div>
          )}
          <input ref={bannerRef} type="file" accept="image/*" className="hidden"
            onChange={async e => {
              const f = e.target.files?.[0];
              if (!f) return;
              try { setUploading(true); const url = await uploadFile(f); update('bannerImage', url); }
              catch { toast.error('Image upload failed'); }
              finally { setUploading(false); }
            }} />
          <input value={form.bannerImage} onChange={e => update('bannerImage', e.target.value)}
            placeholder="Or paste image URL…" className="input text-xs" />
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <button onClick={() => save('PUBLISHED')} disabled={saving} className="btn-success">
          Publish Event
        </button>
        <button onClick={() => save()} disabled={saving} className="btn-secondary">
          <Save className="w-3.5 h-3.5" /> Save Changes
        </button>
      </div>
    </div>
  );
}
