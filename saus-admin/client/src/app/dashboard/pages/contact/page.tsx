'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Save, ArrowLeft, ChevronRight } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL;

// ── Content shape — matches the spec's `content` JSON contract for slug "contact" exactly ──
interface ContactContent {
  hero: { ref: string; title: string; lead: string };
  secretariat: {
    email: string; phone: string; whatsapp: string; location: string; officeHours: string;
  };
  spokesperson: { name: string; role: string; phone: string };
}

function emptyContent(): ContactContent {
  return {
    hero: { ref: '', title: '', lead: '' },
    secretariat: { email: '', phone: '', whatsapp: '', location: '', officeHours: '' },
    spokesperson: { name: '', role: '', phone: '' },
  };
}

// Merge a fetched (possibly partial) content object onto the empty default so every
// field is defined and the form round-trips with the exact spec shape.
function normalize(raw: any): ContactContent {
  const base = emptyContent();
  if (!raw || typeof raw !== 'object') return base;
  return {
    hero: { ...base.hero, ...(raw.hero || {}) },
    secretariat: { ...base.secretariat, ...(raw.secretariat || {}) },
    spokesperson: { ...base.spokesperson, ...(raw.spokesperson || {}) },
  };
}

// ── Small UI helpers ──────────────────────────────────────────────
function Section({
  id, title, hint, open, onToggle, children,
}: {
  id: string; title: string; hint?: string;
  open: boolean; onToggle: (id: string) => void; children: React.ReactNode;
}) {
  return (
    <div className="card overflow-hidden">
      <button
        type="button"
        onClick={() => onToggle(id)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left"
      >
        <div>
          <h3 className="font-semibold text-navy text-sm">{title}</h3>
          {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
        </div>
        <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>
      {open && <div className="px-5 pb-5 pt-1 space-y-4 border-t border-gray-100">{children}</div>}
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} className="input" placeholder={placeholder} />
    </div>
  );
}

function Area({ label, value, onChange, rows = 3, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows}
        className="input resize-none" placeholder={placeholder} />
    </div>
  );
}

// ── Editor ────────────────────────────────────────────────────────
export default function ContactEditorPage() {
  const router = useRouter();
  const [title, setTitle] = useState('Contact');
  const [content, setContent] = useState<ContactContent>(emptyContent());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState<Record<string, boolean>>({ hero: true });

  function toggle(id: string) {
    setOpen(prev => ({ ...prev, [id]: !prev[id] }));
  }

  useEffect(() => {
    const token = localStorage.getItem('saus_token');
    fetch(`${API}/pages/contact`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async res => {
        if (res.status === 404) return null;            // start from empty default
        if (!res.ok) throw new Error('Failed to load page');
        return res.json();
      })
      .then(page => {
        if (page) {
          if (page.title) setTitle(page.title);
          setContent(normalize(page.content));
        }
      })
      .catch(() => toast.error('Failed to load Contact page'))
      .finally(() => setLoading(false));
  }, []);

  // generic immutable setters --------------------------------------
  function setHero<K extends keyof ContactContent['hero']>(k: K, v: string) {
    setContent(c => ({ ...c, hero: { ...c.hero, [k]: v } }));
  }
  function setSecretariat<K extends keyof ContactContent['secretariat']>(k: K, v: string) {
    setContent(c => ({ ...c, secretariat: { ...c.secretariat, [k]: v } }));
  }
  function setSpokesperson<K extends keyof ContactContent['spokesperson']>(k: K, v: string) {
    setContent(c => ({ ...c, spokesperson: { ...c.spokesperson, [k]: v } }));
  }

  async function save() {
    if (!title.trim()) return toast.error('Page title is required');
    setSaving(true);
    const token = localStorage.getItem('saus_token');
    try {
      const res = await fetch(`${API}/pages/contact`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, content }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Save failed');
      toast.success('Contact page saved');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex gap-2">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full bg-navy animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/dashboard/pages')} className="btn-ghost btn-icon">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-navy">Edit Contact Page</h1>
            <p className="text-xs text-gray-400">Structured content for the public Contact page</p>
          </div>
        </div>
        <button onClick={save} disabled={saving} className="btn-primary">
          <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      {/* Page title */}
      <div className="card p-5">
        <label className="label">Page Title</label>
        <input value={title} onChange={e => setTitle(e.target.value)} className="input"
          placeholder="Contact" />
        <p className="text-xs text-gray-400 mt-1">Stored on the Page record (not shown on the public layout).</p>
      </div>

      {/* ── HERO ── */}
      <Section id="hero" title="Hero" hint="Top banner — reference, title & lead paragraph"
        open={!!open.hero} onToggle={toggle}>
        <Field label="Reference" value={content.hero.ref} onChange={v => setHero('ref', v)}
          placeholder="SAUS/CONTACT/2026 · Secretariat" />
        <Field label="Title" value={content.hero.title} onChange={v => setHero('title', v)}
          placeholder="Contact the Secretariat" />
        <Area label="Lead" value={content.hero.lead} onChange={v => setHero('lead', v)} rows={3} />
      </Section>

      {/* ── SECRETARIAT ── */}
      <Section id="secretariat" title="Secretariat" hint="Direct contact details for the national Secretariat"
        open={!!open.secretariat} onToggle={toggle}>
        <Field label="Email" value={content.secretariat.email} onChange={v => setSecretariat('email', v)}
          placeholder="Secretariat@saus.org.za" />
        <Field label="Phone" value={content.secretariat.phone} onChange={v => setSecretariat('phone', v)}
          placeholder="+27 79 129 5948" />
        <Field label="WhatsApp" value={content.secretariat.whatsapp} onChange={v => setSecretariat('whatsapp', v)}
          placeholder="+27 79 129 5948" />
        <Field label="Location" value={content.secretariat.location} onChange={v => setSecretariat('location', v)}
          placeholder="Johannesburg, Gauteng, South Africa" />
        <Field label="Office Hours" value={content.secretariat.officeHours} onChange={v => setSecretariat('officeHours', v)}
          placeholder="Mon–Fri · 08:00–17:00" />
      </Section>

      {/* ── SPOKESPERSON ── */}
      <Section id="spokesperson" title="Spokesperson" hint="Official media spokesperson contact"
        open={!!open.spokesperson} onToggle={toggle}>
        <Field label="Name" value={content.spokesperson.name} onChange={v => setSpokesperson('name', v)}
          placeholder="Thato Masekoa" />
        <Field label="Role" value={content.spokesperson.role} onChange={v => setSpokesperson('role', v)}
          placeholder="SAUS Official Spokesperson" />
        <Field label="Phone" value={content.spokesperson.phone} onChange={v => setSpokesperson('phone', v)}
          placeholder="+27 79 129 5948" />
      </Section>

      {/* Footer save */}
      <div className="flex justify-end pb-6">
        <button onClick={save} disabled={saving} className="btn-primary">
          <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save Contact Page'}
        </button>
      </div>
    </div>
  );
}
