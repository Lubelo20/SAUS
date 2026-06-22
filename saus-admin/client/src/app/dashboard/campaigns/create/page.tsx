'use client';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, Image as ImageIcon, Star, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { uploadFile } from '@/lib/upload';

const API = process.env.NEXT_PUBLIC_API_URL;

interface FormState {
  title: string; description: string; graphic: string;
  ctaLabel: string; ctaUrl: string;
  startDate: string; endDate: string;
  status: string; isFeatured: boolean;
}

export default function CreateCampaignPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<FormState>({
    title: '', description: '', graphic: '',
    ctaLabel: '', ctaUrl: '',
    startDate: '', endDate: '',
    status: 'DRAFT', isFeatured: false,
  });
  const graphicRef = useRef<HTMLInputElement>(null);

  function update(k: keyof FormState, v: any) { setForm(f => ({ ...f, [k]: v })); }

  async function save(status = form.status) {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.description.trim()) { toast.error('Description is required'); return; }
    setSaving(true);
    const token = localStorage.getItem('saus_token');
    try {
      const res = await fetch(`${API}/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, status }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success(status === 'ACTIVE' ? 'Campaign launched!' : 'Campaign saved as draft');
      router.push('/dashboard/campaigns');
    } catch (err: any) { toast.error(err.message || 'Failed to save campaign'); }
    setSaving(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/campaigns" className="btn-ghost btn-icon">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-navy">New Campaign</h1>
            <p className="text-xs text-gray-400">Create an awareness or advocacy campaign</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => save('DRAFT')} disabled={saving} className="btn-secondary btn-sm">
            <Save className="w-3.5 h-3.5" /> Save Draft
          </button>
          <button onClick={() => save('ACTIVE')} disabled={saving} className="btn-success btn-sm">
            Launch Campaign
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 items-start">
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-5 space-y-4">
            <div>
              <label className="label">Campaign Title *</label>
              <input value={form.title} onChange={e => update('title', e.target.value)}
                placeholder="e.g. #FeesMustFall 2025"
                className="input text-base font-semibold" />
            </div>
            <div>
              <label className="label">Description *</label>
              <textarea value={form.description} onChange={e => update('description', e.target.value)}
                rows={10} className="input resize-none"
                placeholder="Campaign details, goals, background, and call to action…" />
            </div>
          </div>

          <div className="card p-5 space-y-4">
            <h3 className="font-semibold text-navy text-sm flex items-center gap-2">
              <ExternalLink className="w-4 h-4" /> Call to Action
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Button Label</label>
                <input value={form.ctaLabel} onChange={e => update('ctaLabel', e.target.value)}
                  placeholder="e.g. Sign the Petition" className="input" />
              </div>
              <div>
                <label className="label">Button URL</label>
                <input value={form.ctaUrl} onChange={e => update('ctaUrl', e.target.value)}
                  placeholder="https://…" className="input" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-4 space-y-4">
            <h3 className="font-semibold text-navy text-sm">Campaign Settings</h3>
            <div>
              <label className="label">Status</label>
              <select value={form.status} onChange={e => update('status', e.target.value)} className="input">
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="ENDED">Ended</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="label">Start Date</label>
                <input type="date" value={form.startDate} onChange={e => update('startDate', e.target.value)} className="input" />
              </div>
              <div>
                <label className="label">End Date</label>
                <input type="date" value={form.endDate} onChange={e => update('endDate', e.target.value)} className="input" />
              </div>
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
          </div>

          <div className="card p-4 space-y-3">
            <h3 className="font-semibold text-navy text-sm">Campaign Graphic</h3>
            {form.graphic ? (
              <div className="relative rounded overflow-hidden">
                <img src={form.graphic} alt="Graphic" className="w-full h-40 object-cover" />
                <button onClick={() => update('graphic', '')}
                  className="absolute top-2 right-2 bg-red-saus text-white rounded px-2 py-0.5 text-xs">Remove</button>
              </div>
            ) : (
              <div onClick={() => !uploading && graphicRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-lg h-40 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-navy/30 hover:bg-navy-50 transition-colors">
                <ImageIcon className="w-6 h-6 text-gray-300" />
                <span className="text-xs text-gray-400">{uploading ? 'Uploading…' : 'Click to upload graphic'}</span>
              </div>
            )}
            <input ref={graphicRef} type="file" accept="image/*" className="hidden"
              onChange={async e => {
                const f = e.target.files?.[0];
                if (!f) return;
                try { setUploading(true); const url = await uploadFile(f); update('graphic', url); }
                catch { toast.error('Image upload failed'); }
                finally { setUploading(false); }
              }} />
            <input value={form.graphic} onChange={e => update('graphic', e.target.value)}
              placeholder="Or paste image URL…" className="input text-xs" />
          </div>

          <div className="flex flex-col gap-2">
            <button onClick={() => save('ACTIVE')} disabled={saving} className="btn-success w-full justify-center">
              Launch Campaign
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
