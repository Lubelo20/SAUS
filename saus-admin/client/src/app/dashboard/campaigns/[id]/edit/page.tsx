'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Save, ArrowLeft, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadFile } from '@/lib/upload';

const API = process.env.NEXT_PUBLIC_API_URL;

interface FormState {
  title: string; description: string; graphic: string;
  ctaLabel: string; ctaUrl: string;
  startDate: string; endDate: string;
  status: string; isFeatured: boolean;
}

export default function EditCampaignPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const graphicRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<FormState>({
    title: '', description: '', graphic: '',
    ctaLabel: '', ctaUrl: '',
    startDate: '', endDate: '',
    status: 'DRAFT', isFeatured: false,
  });

  function update(k: keyof FormState, v: any) { setForm(prev => ({ ...prev, [k]: v })); }

  useEffect(() => {
    const token = localStorage.getItem('saus_token');
    fetch(`${API}/campaigns/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(c => {
        setForm({
          title: c.title || '',
          description: c.description || '',
          graphic: c.graphic || '',
          ctaLabel: c.ctaLabel || '',
          ctaUrl: c.ctaUrl || '',
          startDate: c.startDate ? c.startDate.slice(0, 10) : '',
          endDate: c.endDate ? c.endDate.slice(0, 10) : '',
          status: c.status || 'DRAFT',
          isFeatured: c.isFeatured || false,
        });
        setLoading(false);
      })
      .catch(() => { toast.error('Failed to load campaign'); setLoading(false); });
  }, [id]);

  async function save(status?: string) {
    if (!form.title.trim()) return toast.error('Title is required');
    setSaving(true);
    const token = localStorage.getItem('saus_token');
    try {
      const res = await fetch(`${API}/campaigns/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, status: status || form.status }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success('Campaign updated');
      router.push(`/dashboard/campaigns/${id}`);
    } catch (err: any) { toast.error(err.message || 'Failed to save'); }
    setSaving(false);
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Loading…</div>;

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="btn-ghost btn-icon"><ArrowLeft className="w-4 h-4" /></button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-navy">Edit Campaign</h1>
          <p className="text-xs text-gray-400 font-mono truncate max-w-xs">{form.title || 'Untitled'}</p>
        </div>
        <button onClick={() => save('DRAFT')} disabled={saving} className="btn-secondary btn-sm">
          <Save className="w-3.5 h-3.5" /> Save Draft
        </button>
        <button onClick={() => save('ACTIVE')} disabled={saving} className="btn-success btn-sm">
          Launch
        </button>
      </div>

      <div className="card p-6 space-y-5">
        <div>
          <label className="label">Campaign Title *</label>
          <input value={form.title} onChange={e => update('title', e.target.value)}
            className="input text-base" placeholder="e.g. #FeesMustFall 2025" />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea value={form.description} onChange={e => update('description', e.target.value)}
            rows={8} className="input resize-none" placeholder="Campaign details, goals, call to action…" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">CTA Button Label</label>
            <input value={form.ctaLabel} onChange={e => update('ctaLabel', e.target.value)}
              className="input" placeholder="e.g. Sign the Petition" />
          </div>
          <div>
            <label className="label">CTA URL</label>
            <input value={form.ctaUrl} onChange={e => update('ctaUrl', e.target.value)}
              className="input" placeholder="https://…" type="url" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Start Date</label>
            <input type="date" value={form.startDate} onChange={e => update('startDate', e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">End Date</label>
            <input type="date" value={form.endDate} onChange={e => update('endDate', e.target.value)} className="input" />
          </div>
        </div>

        <div>
          <label className="label">Status</label>
          <select value={form.status} onChange={e => update('status', e.target.value)} className="input w-48">
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        <label className="flex items-center gap-2.5 cursor-pointer">
          <div className={`relative w-9 h-5 rounded-full transition-colors ${form.isFeatured ? 'bg-gold' : 'bg-gray-200'}`}
            onClick={() => update('isFeatured', !form.isFeatured)}>
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.isFeatured ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </div>
          <span className="text-sm font-medium text-navy flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-gold" /> Featured Campaign
          </span>
        </label>

        <div>
          <label className="label">Campaign Graphic</label>
          {form.graphic ? (
            <div className="relative rounded overflow-hidden mb-2">
              <img src={form.graphic} alt="Graphic" className="w-full h-40 object-cover" />
              <button onClick={() => update('graphic', '')}
                className="absolute top-2 right-2 bg-red-saus text-white rounded px-2 py-0.5 text-xs">Remove</button>
            </div>
          ) : (
            <div onClick={() => !uploading && graphicRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-lg h-32 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-navy/30 transition-colors mb-2">
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
      </div>

      <div className="flex gap-2 justify-end">
        <button onClick={() => save('ACTIVE')} disabled={saving} className="btn-success">
          Launch Campaign
        </button>
        <button onClick={() => save()} disabled={saving} className="btn-secondary">
          <Save className="w-3.5 h-3.5" /> Save Changes
        </button>
      </div>
    </div>
  );
}
