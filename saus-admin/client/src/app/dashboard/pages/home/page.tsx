'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  Save, ArrowLeft, Plus, Trash2, ChevronUp, ChevronDown, ChevronRight,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL;

// ── Content shape — matches the spec's `content` JSON contract for slug "home" exactly ──
interface Stat { num: string; label: string; }
interface Pillar { title: string; text: string; }
interface CampaignCard { title: string; text: string; }

interface HomeContent {
  hero: { ref: string; title: string; lead: string };
  stats: Stat[];
  mandate: {
    ref: string; title: string; lead: string;
    pillars: Pillar[];
    quote: { text: string; cite: string };
  };
  campaigns: { ref: string; title: string; lead: string; cards: CampaignCard[] };
  eventsCta: { ref: string; title: string; lead: string };
}

function emptyContent(): HomeContent {
  return {
    hero: { ref: '', title: '', lead: '' },
    stats: [
      { num: '', label: '' },
      { num: '', label: '' },
      { num: '', label: '' },
      { num: '', label: '' },
    ],
    mandate: {
      ref: '', title: '', lead: '',
      pillars: [
        { title: '', text: '' },
        { title: '', text: '' },
        { title: '', text: '' },
        { title: '', text: '' },
      ],
      quote: { text: '', cite: '' },
    },
    campaigns: {
      ref: '', title: '', lead: '',
      cards: [
        { title: '', text: '' },
        { title: '', text: '' },
        { title: '', text: '' },
      ],
    },
    eventsCta: { ref: '', title: '', lead: '' },
  };
}

// Merge a fetched (possibly partial) content object onto the empty default so every
// field is defined and the form round-trips with the exact spec shape.
function normalize(raw: any): HomeContent {
  const base = emptyContent();
  if (!raw || typeof raw !== 'object') return base;
  return {
    hero: { ...base.hero, ...(raw.hero || {}) },
    stats: Array.isArray(raw.stats) && raw.stats.length
      ? raw.stats.map((s: any) => ({ num: s?.num ?? '', label: s?.label ?? '' }))
      : base.stats,
    mandate: {
      ...base.mandate, ...(raw.mandate || {}),
      pillars: Array.isArray(raw.mandate?.pillars) && raw.mandate.pillars.length
        ? raw.mandate.pillars.map((p: any) => ({ title: p?.title ?? '', text: p?.text ?? '' }))
        : base.mandate.pillars,
      quote: { ...base.mandate.quote, ...(raw.mandate?.quote || {}) },
    },
    campaigns: {
      ...base.campaigns, ...(raw.campaigns || {}),
      cards: Array.isArray(raw.campaigns?.cards) && raw.campaigns.cards.length
        ? raw.campaigns.cards.map((c: any) => ({ title: c?.title ?? '', text: c?.text ?? '' }))
        : base.campaigns.cards,
    },
    eventsCta: { ...base.eventsCta, ...(raw.eventsCta || {}) },
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

// Toolbar for a repeatable-list row: move up/down + remove
function RowTools({ i, count, onMove, onRemove }: {
  i: number; count: number; onMove?: (i: number, dir: -1 | 1) => void; onRemove: (i: number) => void;
}) {
  return (
    <div className="flex items-center gap-1 flex-shrink-0">
      {onMove && (
        <>
          <button type="button" onClick={() => onMove(i, -1)} disabled={i === 0}
            className="btn-ghost btn-icon disabled:opacity-30" title="Move up">
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button type="button" onClick={() => onMove(i, 1)} disabled={i === count - 1}
            className="btn-ghost btn-icon disabled:opacity-30" title="Move down">
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </>
      )}
      <button type="button" onClick={() => onRemove(i)}
        className="btn-ghost btn-icon text-red-400 hover:bg-red-50 hover:text-red-saus" title="Remove">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ── Editor ────────────────────────────────────────────────────────
export default function HomeEditorPage() {
  const router = useRouter();
  const [title, setTitle] = useState('Home');
  const [content, setContent] = useState<HomeContent>(emptyContent());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState<Record<string, boolean>>({ hero: true });

  function toggle(id: string) {
    setOpen(prev => ({ ...prev, [id]: !prev[id] }));
  }

  useEffect(() => {
    const token = localStorage.getItem('saus_token');
    fetch(`${API}/pages/home`, { headers: { Authorization: `Bearer ${token}` } })
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
      .catch(() => toast.error('Failed to load Home page'))
      .finally(() => setLoading(false));
  }, []);

  // generic immutable setters --------------------------------------
  function setHero<K extends keyof HomeContent['hero']>(k: K, v: string) {
    setContent(c => ({ ...c, hero: { ...c.hero, [k]: v } }));
  }
  function setMandate<K extends keyof HomeContent['mandate']>(k: K, v: any) {
    setContent(c => ({ ...c, mandate: { ...c.mandate, [k]: v } }));
  }
  function setCampaigns<K extends keyof HomeContent['campaigns']>(k: K, v: any) {
    setContent(c => ({ ...c, campaigns: { ...c.campaigns, [k]: v } }));
  }
  function setEventsCta<K extends keyof HomeContent['eventsCta']>(k: K, v: string) {
    setContent(c => ({ ...c, eventsCta: { ...c.eventsCta, [k]: v } }));
  }

  // list helpers (work on a copy) ----------------------------------
  function move<T>(arr: T[], i: number, dir: -1 | 1): T[] {
    const j = i + dir;
    if (j < 0 || j >= arr.length) return arr;
    const next = arr.slice();
    [next[i], next[j]] = [next[j], next[i]];
    return next;
  }

  async function save() {
    if (!title.trim()) return toast.error('Page title is required');
    setSaving(true);
    const token = localStorage.getItem('saus_token');
    try {
      const res = await fetch(`${API}/pages/home`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, content }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Save failed');
      toast.success('Home page saved');
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
            <h1 className="text-xl font-bold text-navy">Edit Home Page</h1>
            <p className="text-xs text-gray-400">Structured content for the public landing page</p>
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
          placeholder="Home" />
        <p className="text-xs text-gray-400 mt-1">Stored on the Page record (not shown on the public layout).</p>
      </div>

      {/* ── HERO ── */}
      <Section id="hero" title="Hero" hint="Top banner — reference, title & lead paragraph"
        open={!!open.hero} onToggle={toggle}>
        <Field label="Reference" value={content.hero.ref} onChange={v => setHero('ref', v)}
          placeholder="SAUS/OFFICIAL/2026 · National Representative Body" />
        <Field label="Title" value={content.hero.title} onChange={v => setHero('title', v)}
          placeholder="Empowering Student Voices. Advancing Higher Education." />
        <Area label="Lead" value={content.hero.lead} onChange={v => setHero('lead', v)} rows={3} />
      </Section>

      {/* ── STATS ── */}
      <Section id="stats" title="Stats" hint="Key figures shown under the hero"
        open={!!open.stats} onToggle={toggle}>
        <div className="space-y-3">
          {content.stats.map((s, i) => (
            <div key={i} className="flex items-end gap-3 p-3 rounded-lg bg-gray-50">
              <div className="w-32">
                <label className="label">Number</label>
                <input value={s.num} className="input" placeholder="26"
                  onChange={e => setContent(c => {
                    const stats = c.stats.slice(); stats[i] = { ...stats[i], num: e.target.value }; return { ...c, stats };
                  })} />
              </div>
              <div className="flex-1">
                <label className="label">Label</label>
                <input value={s.label} className="input" placeholder="Public Universities Represented"
                  onChange={e => setContent(c => {
                    const stats = c.stats.slice(); stats[i] = { ...stats[i], label: e.target.value }; return { ...c, stats };
                  })} />
              </div>
              <RowTools i={i} count={content.stats.length}
                onMove={(idx, dir) => setContent(c => ({ ...c, stats: move(c.stats, idx, dir) }))}
                onRemove={idx => setContent(c => ({ ...c, stats: c.stats.filter((_, k) => k !== idx) }))} />
            </div>
          ))}
        </div>
        <button type="button" className="btn-secondary btn-sm"
          onClick={() => setContent(c => ({ ...c, stats: [...c.stats, { num: '', label: '' }] }))}>
          <Plus className="w-3.5 h-3.5" /> Add Stat
        </button>
      </Section>

      {/* ── MANDATE ── */}
      <Section id="mandate" title="Mandate" hint="Reference, title, lead, pillar cards & pull-quote"
        open={!!open.mandate} onToggle={toggle}>
        <Field label="Reference" value={content.mandate.ref} onChange={v => setMandate('ref', v)}
          placeholder="SAUS/MANDATE/2026" />
        <Field label="Title" value={content.mandate.title} onChange={v => setMandate('title', v)}
          placeholder="What We Stand For" />
        <Area label="Lead" value={content.mandate.lead} onChange={v => setMandate('lead', v)} rows={2} />

        <div>
          <label className="label">Pillars</label>
          <div className="space-y-3">
            {content.mandate.pillars.map((p, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                <div className="flex-1 space-y-2">
                  <input value={p.title} className="input" placeholder="Mission"
                    onChange={e => setMandate('pillars',
                      content.mandate.pillars.map((x, k) => k === i ? { ...x, title: e.target.value } : x))} />
                  <textarea value={p.text} rows={2} className="input resize-none"
                    placeholder="To consolidate and strengthen students' views…"
                    onChange={e => setMandate('pillars',
                      content.mandate.pillars.map((x, k) => k === i ? { ...x, text: e.target.value } : x))} />
                </div>
                <RowTools i={i} count={content.mandate.pillars.length}
                  onMove={(idx, dir) => setMandate('pillars', move(content.mandate.pillars, idx, dir))}
                  onRemove={idx => setMandate('pillars', content.mandate.pillars.filter((_, k) => k !== idx))} />
              </div>
            ))}
          </div>
          <button type="button" className="btn-secondary btn-sm mt-3"
            onClick={() => setMandate('pillars', [...content.mandate.pillars, { title: '', text: '' }])}>
            <Plus className="w-3.5 h-3.5" /> Add Pillar
          </button>
        </div>

        <div className="pt-2 border-t border-gray-100 space-y-4">
          <Area label="Quote — Text" rows={3} value={content.mandate.quote.text}
            onChange={v => setMandate('quote', { ...content.mandate.quote, text: v })} />
          <Field label="Quote — Citation" value={content.mandate.quote.cite}
            onChange={v => setMandate('quote', { ...content.mandate.quote, cite: v })}
            placeholder="South African Union of Students — Constitutional Mandate" />
        </div>
      </Section>

      {/* ── CAMPAIGNS ── */}
      <Section id="campaigns" title="Campaigns" hint="Reference, title, lead & campaign cards"
        open={!!open.campaigns} onToggle={toggle}>
        <Field label="Reference" value={content.campaigns.ref} onChange={v => setCampaigns('ref', v)}
          placeholder="SAUS/CAMPAIGNS/2025–2026" />
        <Field label="Title" value={content.campaigns.title} onChange={v => setCampaigns('title', v)}
          placeholder="Priority Campaign Areas" />
        <Area label="Lead" value={content.campaigns.lead} onChange={v => setCampaigns('lead', v)} rows={2} />

        <div>
          <label className="label">Campaign Cards</label>
          <div className="space-y-3">
            {content.campaigns.cards.map((card, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                <div className="flex-1 space-y-2">
                  <input value={card.title} className="input" placeholder="NSFAS Reform"
                    onChange={e => setCampaigns('cards',
                      content.campaigns.cards.map((x, k) => k === i ? { ...x, title: e.target.value } : x))} />
                  <textarea value={card.text} rows={2} className="input resize-none"
                    placeholder="Redesigning the National Student Financial Aid Scheme…"
                    onChange={e => setCampaigns('cards',
                      content.campaigns.cards.map((x, k) => k === i ? { ...x, text: e.target.value } : x))} />
                </div>
                <RowTools i={i} count={content.campaigns.cards.length}
                  onMove={(idx, dir) => setCampaigns('cards', move(content.campaigns.cards, idx, dir))}
                  onRemove={idx => setCampaigns('cards', content.campaigns.cards.filter((_, k) => k !== idx))} />
              </div>
            ))}
          </div>
          <button type="button" className="btn-secondary btn-sm mt-3"
            onClick={() => setCampaigns('cards', [...content.campaigns.cards, { title: '', text: '' }])}>
            <Plus className="w-3.5 h-3.5" /> Add Campaign
          </button>
        </div>
      </Section>

      {/* ── EVENTS CTA ── */}
      <Section id="eventsCta" title="Events CTA" hint="Reference, title & lead for the upcoming engagements call-to-action"
        open={!!open.eventsCta} onToggle={toggle}>
        <Field label="Reference" value={content.eventsCta.ref} onChange={v => setEventsCta('ref', v)}
          placeholder="SAUS/EVENTS/2026" />
        <Field label="Title" value={content.eventsCta.title} onChange={v => setEventsCta('title', v)}
          placeholder="Upcoming Engagements" />
        <Area label="Lead" value={content.eventsCta.lead} onChange={v => setEventsCta('lead', v)} rows={2} />
      </Section>

      {/* Footer save */}
      <div className="flex justify-end pb-6">
        <button onClick={save} disabled={saving} className="btn-primary">
          <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save Home Page'}
        </button>
      </div>
    </div>
  );
}
