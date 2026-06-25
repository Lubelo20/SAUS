'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  Save, ArrowLeft, Plus, Trash2, ChevronUp, ChevronDown, ChevronRight,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL;

// ── Content shape — matches the spec's `content` JSON contract for slug "about" exactly ──
interface Stat { num: string; label: string; }
interface ProfileRow { field: string; details: string; }
interface ValueCard { title: string; text: string; }
interface TimelineItem { year: string; title: string; body: string; }
interface ContinentalCard { title: string; text: string; }

interface AboutContent {
  hero: { ref: string; title: string; lead: string };
  stats: Stat[];
  profile: { ref: string; title: string; lead: string; rows: ProfileRow[] };
  mission: string;
  vision: string;
  values: { ref: string; title: string; lead: string; cards: ValueCard[] };
  history: { ref: string; title: string; lead: string; intro: string; timeline: TimelineItem[] };
  continental: {
    ref: string; title: string; lead: string;
    cards: ContinentalCard[];
    quote: { text: string; cite: string };
  };
}

function emptyContent(): AboutContent {
  return {
    hero: { ref: '', title: '', lead: '' },
    stats: [
      { num: '', label: '' },
      { num: '', label: '' },
      { num: '', label: '' },
      { num: '', label: '' },
    ],
    profile: { ref: '', title: '', lead: '', rows: [] },
    mission: '',
    vision: '',
    values: { ref: '', title: '', lead: '', cards: [] },
    history: { ref: '', title: '', lead: '', intro: '', timeline: [] },
    continental: { ref: '', title: '', lead: '', cards: [], quote: { text: '', cite: '' } },
  };
}

// Merge a fetched (possibly partial) content object onto the empty default so every
// field is defined and the form round-trips with the exact spec shape.
function normalize(raw: any): AboutContent {
  const base = emptyContent();
  if (!raw || typeof raw !== 'object') return base;
  return {
    hero: { ...base.hero, ...(raw.hero || {}) },
    stats: Array.isArray(raw.stats) && raw.stats.length
      ? raw.stats.map((s: any) => ({ num: s?.num ?? '', label: s?.label ?? '' }))
      : base.stats,
    profile: {
      ...base.profile, ...(raw.profile || {}),
      rows: Array.isArray(raw.profile?.rows)
        ? raw.profile.rows.map((r: any) => ({ field: r?.field ?? '', details: r?.details ?? '' }))
        : [],
    },
    mission: raw.mission ?? '',
    vision: raw.vision ?? '',
    values: {
      ...base.values, ...(raw.values || {}),
      cards: Array.isArray(raw.values?.cards)
        ? raw.values.cards.map((c: any) => ({ title: c?.title ?? '', text: c?.text ?? '' }))
        : [],
    },
    history: {
      ...base.history, ...(raw.history || {}),
      timeline: Array.isArray(raw.history?.timeline)
        ? raw.history.timeline.map((t: any) => ({ year: t?.year ?? '', title: t?.title ?? '', body: t?.body ?? '' }))
        : [],
    },
    continental: {
      ...base.continental, ...(raw.continental || {}),
      cards: Array.isArray(raw.continental?.cards)
        ? raw.continental.cards.map((c: any) => ({ title: c?.title ?? '', text: c?.text ?? '' }))
        : [],
      quote: { ...base.continental.quote, ...(raw.continental?.quote || {}) },
    },
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
export default function AboutEditorPage() {
  const router = useRouter();
  const [title, setTitle] = useState('About SAUS');
  const [content, setContent] = useState<AboutContent>(emptyContent());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState<Record<string, boolean>>({ hero: true });

  function toggle(id: string) {
    setOpen(prev => ({ ...prev, [id]: !prev[id] }));
  }

  useEffect(() => {
    const token = localStorage.getItem('saus_token');
    fetch(`${API}/pages/about`, { headers: { Authorization: `Bearer ${token}` } })
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
      .catch(() => toast.error('Failed to load About page'))
      .finally(() => setLoading(false));
  }, []);

  // generic immutable setters --------------------------------------
  function setHero<K extends keyof AboutContent['hero']>(k: K, v: string) {
    setContent(c => ({ ...c, hero: { ...c.hero, [k]: v } }));
  }
  function setProfile<K extends keyof AboutContent['profile']>(k: K, v: any) {
    setContent(c => ({ ...c, profile: { ...c.profile, [k]: v } }));
  }
  function setValues<K extends keyof AboutContent['values']>(k: K, v: any) {
    setContent(c => ({ ...c, values: { ...c.values, [k]: v } }));
  }
  function setHistory<K extends keyof AboutContent['history']>(k: K, v: any) {
    setContent(c => ({ ...c, history: { ...c.history, [k]: v } }));
  }
  function setContinental<K extends keyof AboutContent['continental']>(k: K, v: any) {
    setContent(c => ({ ...c, continental: { ...c.continental, [k]: v } }));
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
      const res = await fetch(`${API}/pages/about`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, content }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Save failed');
      toast.success('About page saved');
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
            <h1 className="text-xl font-bold text-navy">Edit About Page</h1>
            <p className="text-xs text-gray-400">Structured content for the public About page</p>
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
          placeholder="About SAUS" />
        <p className="text-xs text-gray-400 mt-1">Stored on the Page record (not shown on the public layout).</p>
      </div>

      {/* ── HERO ── */}
      <Section id="hero" title="Hero" hint="Top banner — reference, title & lead paragraph"
        open={!!open.hero} onToggle={toggle}>
        <Field label="Reference" value={content.hero.ref} onChange={v => setHero('ref', v)}
          placeholder="SAUS/ABOUT/2026 · Institutional Overview" />
        <Field label="Title" value={content.hero.title} onChange={v => setHero('title', v)}
          placeholder="About the South African Union of Students" />
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

      {/* ── PROFILE ── */}
      <Section id="profile" title="Institutional Profile" hint="Reference, title, lead & the profile table rows"
        open={!!open.profile} onToggle={toggle}>
        <Field label="Reference" value={content.profile.ref} onChange={v => setProfile('ref', v)}
          placeholder="SAUS/PROFILE/2026" />
        <Field label="Title" value={content.profile.title} onChange={v => setProfile('title', v)}
          placeholder="Institutional Profile" />
        <Area label="Lead" value={content.profile.lead} onChange={v => setProfile('lead', v)} rows={2} />

        <div>
          <label className="label">Profile Rows</label>
          <div className="space-y-3">
            {content.profile.rows.map((r, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                <div className="w-48 flex-shrink-0">
                  <input value={r.field} className="input" placeholder="Full Designation"
                    onChange={e => setProfile('rows',
                      content.profile.rows.map((x, k) => k === i ? { ...x, field: e.target.value } : x))} />
                </div>
                <div className="flex-1">
                  <textarea value={r.details} rows={2} className="input resize-none"
                    placeholder="South African Union of Students (SAUS)"
                    onChange={e => setProfile('rows',
                      content.profile.rows.map((x, k) => k === i ? { ...x, details: e.target.value } : x))} />
                </div>
                <RowTools i={i} count={content.profile.rows.length}
                  onMove={(idx, dir) => setProfile('rows', move(content.profile.rows, idx, dir))}
                  onRemove={idx => setProfile('rows', content.profile.rows.filter((_, k) => k !== idx))} />
              </div>
            ))}
          </div>
          <button type="button" className="btn-secondary btn-sm mt-3"
            onClick={() => setProfile('rows', [...content.profile.rows, { field: '', details: '' }])}>
            <Plus className="w-3.5 h-3.5" /> Add Row
          </button>
        </div>
      </Section>

      {/* ── MISSION & VISION ── */}
      <Section id="missionVision" title="Mission & Vision" hint="Two standalone paragraphs"
        open={!!open.missionVision} onToggle={toggle}>
        <Area label="Mission" value={content.mission} rows={4}
          onChange={v => setContent(c => ({ ...c, mission: v }))} />
        <Area label="Vision" value={content.vision} rows={4}
          onChange={v => setContent(c => ({ ...c, vision: v }))} />
      </Section>

      {/* ── VALUES ── */}
      <Section id="values" title="Core Values" hint="Reference, title, lead & value cards"
        open={!!open.values} onToggle={toggle}>
        <Field label="Reference" value={content.values.ref} onChange={v => setValues('ref', v)}
          placeholder="SAUS/VALUES/2026" />
        <Field label="Title" value={content.values.title} onChange={v => setValues('title', v)}
          placeholder="Core Values" />
        <Area label="Lead" value={content.values.lead} onChange={v => setValues('lead', v)} rows={2} />

        <div>
          <label className="label">Value Cards</label>
          <div className="space-y-3">
            {content.values.cards.map((card, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                <div className="flex-1 space-y-2">
                  <input value={card.title} className="input" placeholder="Non-Racial"
                    onChange={e => setValues('cards',
                      content.values.cards.map((x, k) => k === i ? { ...x, title: e.target.value } : x))} />
                  <textarea value={card.text} rows={2} className="input resize-none"
                    placeholder="Opposing all forms of racial discrimination…"
                    onChange={e => setValues('cards',
                      content.values.cards.map((x, k) => k === i ? { ...x, text: e.target.value } : x))} />
                </div>
                <RowTools i={i} count={content.values.cards.length}
                  onMove={(idx, dir) => setValues('cards', move(content.values.cards, idx, dir))}
                  onRemove={idx => setValues('cards', content.values.cards.filter((_, k) => k !== idx))} />
              </div>
            ))}
          </div>
          <button type="button" className="btn-secondary btn-sm mt-3"
            onClick={() => setValues('cards', [...content.values.cards, { title: '', text: '' }])}>
            <Plus className="w-3.5 h-3.5" /> Add Value
          </button>
        </div>
      </Section>

      {/* ── HISTORY ── */}
      <Section id="history" title="Historical Background" hint="Reference, title, lead, intro & timeline items"
        open={!!open.history} onToggle={toggle}>
        <Field label="Reference" value={content.history.ref} onChange={v => setHistory('ref', v)}
          placeholder="SAUS/HISTORY/2026" />
        <Field label="Title" value={content.history.title} onChange={v => setHistory('title', v)}
          placeholder="Historical Background" />
        <Area label="Lead" value={content.history.lead} onChange={v => setHistory('lead', v)} rows={2} />
        <Area label="Intro" value={content.history.intro} onChange={v => setHistory('intro', v)} rows={3} />

        <div>
          <label className="label">Timeline</label>
          <div className="space-y-3">
            {content.history.timeline.map((t, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <input value={t.year} className="input w-32" placeholder="1960s"
                      onChange={e => setHistory('timeline',
                        content.history.timeline.map((x, k) => k === i ? { ...x, year: e.target.value } : x))} />
                    <input value={t.title} className="input flex-1" placeholder="Emergence of Student Structures"
                      onChange={e => setHistory('timeline',
                        content.history.timeline.map((x, k) => k === i ? { ...x, title: e.target.value } : x))} />
                  </div>
                  <textarea value={t.body} rows={2} className="input resize-none" placeholder="Body…"
                    onChange={e => setHistory('timeline',
                      content.history.timeline.map((x, k) => k === i ? { ...x, body: e.target.value } : x))} />
                </div>
                <RowTools i={i} count={content.history.timeline.length}
                  onMove={(idx, dir) => setHistory('timeline', move(content.history.timeline, idx, dir))}
                  onRemove={idx => setHistory('timeline', content.history.timeline.filter((_, k) => k !== idx))} />
              </div>
            ))}
          </div>
          <button type="button" className="btn-secondary btn-sm mt-3"
            onClick={() => setHistory('timeline', [...content.history.timeline, { year: '', title: '', body: '' }])}>
            <Plus className="w-3.5 h-3.5" /> Add Timeline Item
          </button>
        </div>
      </Section>

      {/* ── CONTINENTAL ── */}
      <Section id="continental" title="Continental Presence" hint="Reference, title, lead, cards & pull-quote"
        open={!!open.continental} onToggle={toggle}>
        <Field label="Reference" value={content.continental.ref} onChange={v => setContinental('ref', v)}
          placeholder="SAUS/CONTINENTAL/2026" />
        <Field label="Title" value={content.continental.title} onChange={v => setContinental('title', v)}
          placeholder="Continental Presence" />
        <Area label="Lead" value={content.continental.lead} onChange={v => setContinental('lead', v)} rows={2} />

        <div>
          <label className="label">Cards</label>
          <div className="space-y-3">
            {content.continental.cards.map((card, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                <div className="flex-1 space-y-2">
                  <input value={card.title} className="input" placeholder="Pan-African Solidarity"
                    onChange={e => setContinental('cards',
                      content.continental.cards.map((x, k) => k === i ? { ...x, title: e.target.value } : x))} />
                  <textarea value={card.text} rows={2} className="input resize-none" placeholder="Card text…"
                    onChange={e => setContinental('cards',
                      content.continental.cards.map((x, k) => k === i ? { ...x, text: e.target.value } : x))} />
                </div>
                <RowTools i={i} count={content.continental.cards.length}
                  onMove={(idx, dir) => setContinental('cards', move(content.continental.cards, idx, dir))}
                  onRemove={idx => setContinental('cards', content.continental.cards.filter((_, k) => k !== idx))} />
              </div>
            ))}
          </div>
          <button type="button" className="btn-secondary btn-sm mt-3"
            onClick={() => setContinental('cards', [...content.continental.cards, { title: '', text: '' }])}>
            <Plus className="w-3.5 h-3.5" /> Add Card
          </button>
        </div>

        <div className="pt-2 border-t border-gray-100 space-y-4">
          <Area label="Quote — Text" rows={3} value={content.continental.quote.text}
            onChange={v => setContinental('quote', { ...content.continental.quote, text: v })} />
          <Field label="Quote — Citation" value={content.continental.quote.cite}
            onChange={v => setContinental('quote', { ...content.continental.quote, cite: v })}
            placeholder="SAUS 9th National Congress — Continental Solidarity Resolution, 2025" />
        </div>
      </Section>

      {/* Footer save */}
      <div className="flex justify-end pb-6">
        <button onClick={save} disabled={saving} className="btn-primary">
          <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save About Page'}
        </button>
      </div>
    </div>
  );
}
