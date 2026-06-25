'use client';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, Image as ImageIcon, Star, Link2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { uploadFile } from '@/lib/upload';

const API = process.env.NEXT_PUBLIC_API_URL;

const PROVINCES = ['Eastern Cape','Free State','Gauteng','KwaZulu-Natal','Limpopo','Mpumalanga','Northern Cape','North West','Western Cape'];

interface FormState {
  title: string; shortDescription: string; description: string; bannerImage: string;
  venue: string; address: string; city: string; province: string;
  startDate: string; endDate: string; registrationUrl: string;
  rsvpEnabled: boolean; isFeatured: boolean; status: string;
}

export default function CreateEventPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<FormState>({
    title: '', shortDescription: '', description: '', bannerImage: '',
    venue: '', address: '', city: '', province: '',
    startDate: '', endDate: '', registrationUrl: '',
    rsvpEnabled: false, isFeatured: false, status: 'DRAFT',
  });
  const bannerRef = useRef<HTMLInputElement>(null);

  function update(k: keyof FormState, v: any) { setForm(f => ({ ...f, [k]: v })); }

  async function save(status = form.status) {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.startDate) { toast.error('Start date is required'); return; }
    setSaving(true);
    const token = localStorage.getItem('saus_token');
    try {
      const res = await fetch(`${API}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, status }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success(status === 'PUBLISHED' ? 'Event published!' : 'Event saved as draft');
      router.push('/dashboard/events');
    } catch (err: any) { toast.error(err.message || 'Failed to save event'); }
    setSaving(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/events" className="btn-ghost btn-icon">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-navy">Add Event</h1>
            <p className="text-xs text-gray-400">Create a new SAUS event or conference</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => save('DRAFT')} disabled={saving} className="btn-secondary btn-sm">
            <Save className="w-3.5 h-3.5" /> Save Draft
          </button>
          <button onClick={() => save('PUBLISHED')} disabled={saving} className="btn-success btn-sm">
            Publish Event
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 items-start">
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-5 space-y-4">
            <div>
              <label className="label">Event Title *</label>
              <input value={form.title} onChange={e => update('title', e.target.value)}
                placeholder="e.g. SAUS National Conference 2025"
                className="input text-base font-semibold" />
            </div>
            <div>
              <label className="label">Short Description</label>
              <textarea value={form.shortDescription} onChange={e => update('shortDescription', e.target.value)}
                rows={2} className="input resize-none" placeholder="Brief one-line summary…" />
            </div>
            <div>
              <label className="label">Full Description *</label>
              <textarea value={form.description} onChange={e => update('description', e.target.value)}
                rows={8} className="input resize-none"
                placeholder="Detailed event information, agenda, speakers, requirements…" />
            </div>
          </div>

          <div className="card p-5 space-y-4">
            <h3 className="font-semibold text-navy text-sm">Location</h3>
            <div>
              <label className="label">Venue Name</label>
              <input value={form.venue} onChange={e => update('venue', e.target.value)}
                placeholder="e.g. Sandton Convention Centre" className="input" />
            </div>
            <div>
              <label className="label">Address</label>
              <input value={form.address} onChange={e => update('address', e.target.value)}
                placeholder="Street address" className="input" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">City</label>
                <input value={form.city} onChange={e => update('city', e.target.value)}
                  placeholder="e.g. Johannesburg" className="input" />
              </div>
              <div>
                <label className="label">Province</label>
                <select value={form.province} onChange={e => update('province', e.target.value)} className="input">
                  <option value="">— Select province —</option>
                  {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="card p-5 space-y-4">
            <h3 className="font-semibold text-navy text-sm flex items-center gap-2">
              <Link2 className="w-4 h-4" /> Registration
            </h3>
            <div>
              <label className="label">Registration URL</label>
              <input value={form.registrationUrl} onChange={e => update('registrationUrl', e.target.value)}
                placeholder="https://forms.google.com/…" className="input" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-4 space-y-4">
            <h3 className="font-semibold text-navy text-sm">Event Settings</h3>
            <div>
              <label className="label">Status</label>
              <select value={form.status} onChange={e => update('status', e.target.value)} className="input">
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            <div>
              <label className="label">Start Date & Time *</label>
              <input type="datetime-local" value={form.startDate}
                onChange={e => update('startDate', e.target.value)} className="input" />
            </div>
            <div>
              <label className="label">End Date & Time</label>
              <input type="datetime-local" value={form.endDate}
                onChange={e => update('endDate', e.target.value)} className="input" />
            </div>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <div className={`relative w-9 h-5 rounded-full transition-colors ${form.isFeatured ? 'bg-gold' : 'bg-gray-200'}`}
                onClick={() => update('isFeatured', !form.isFeatured)}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.isFeatured ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-sm font-medium text-navy flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-gold" /> Featured
              </span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <div className={`relative w-9 h-5 rounded-full transition-colors ${form.rsvpEnabled ? 'bg-green-600' : 'bg-gray-200'}`}
                onClick={() => update('rsvpEnabled', !form.rsvpEnabled)}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.rsvpEnabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-sm font-medium text-navy">RSVP Required</span>
            </label>
          </div>

          <div className="card p-4 space-y-3">
            <h3 className="font-semibold text-navy text-sm">Banner Image</h3>
            {form.bannerImage ? (
              <div className="relative rounded overflow-hidden">
                <img src={form.bannerImage} alt="Banner" className="w-full h-40 object-cover" />
                <button onClick={() => update('bannerImage', '')}
                  className="absolute top-2 right-2 bg-red-saus text-white rounded px-2 py-0.5 text-xs">Remove</button>
              </div>
            ) : (
              <div onClick={() => !uploading && bannerRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-lg h-40 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-navy/30 hover:bg-navy-50 transition-colors">
                <ImageIcon className="w-6 h-6 text-gray-300" />
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

          <div className="flex flex-col gap-2">
            <button onClick={() => save('PUBLISHED')} disabled={saving} className="btn-success w-full justify-center">
              Publish Event
            </button>
            <button onClick={() => save('DRAFT')} disabled={saving} className="btn-secondary w-full justify-center">
              <Save className="w-3.5 h-3.5" /> Save as Draft
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
