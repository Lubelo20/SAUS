'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  Save, ArrowLeft, Plus, Trash2, ChevronUp, ChevronDown, ChevronRight,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL;

// ── Content shape — matches the spec's `content` JSON contract for slug "nsfas" exactly ──
interface TitleTextItem { title: string; text: string; }
interface LabelValueItem { label: string; value: string; }
interface TextItem { text: string; }

interface TitleTextSection { ref: string; title: string; lead: string; items: TitleTextItem[]; }
interface DatesSection { ref: string; title: string; lead: string; items: LabelValueItem[]; }
interface TipsSection { ref: string; title: string; lead: string; items: TextItem[]; }

interface NsfasContent {
  hero: { ref: string; title: string; lead: string };
  covers: TitleTextSection;
  qualify: TitleTextSection;
  documents: TitleTextSection;
  steps: TitleTextSection;
  dates: DatesSection;
  tips: TipsSection;
  help: TitleTextSection;
}

function emptyContent(): NsfasContent {
  return {
    hero: { ref: '', title: '', lead: '' },
    covers: { ref: '', title: '', lead: '', items: [] },
    qualify: { ref: '', title: '', lead: '', items: [] },
    documents: { ref: '', title: '', lead: '', items: [] },
    steps: { ref: '', title: '', lead: '', items: [] },
    dates: { ref: '', title: '', lead: '', items: [] },
    tips: { ref: '', title: '', lead: '', items: [] },
    help: { ref: '', title: '', lead: '', items: [] },
  };
}

// helpers to merge each section type from a (possibly partial) payload ──
function titleTextSection(base: TitleTextSection, raw: any): TitleTextSection {
  return {
    ...base, ...(raw || {}),
    items: Array.isArray(raw?.items)
      ? raw.items.map((it: any) => ({ title: it?.title ?? '', text: it?.text ?? '' }))
      : [],
  };
}

// Merge a fetched (possibly partial) content object onto the empty default so every
// field is defined and the form round-trips with the exact spec shape.
function normalize(raw: any): NsfasContent {
  const base = emptyContent();
  if (!raw || typeof raw !== 'object') return base;
  return {
    hero: { ...base.hero, ...(raw.hero || {}) },
    covers: titleTextSection(base.covers, raw.covers),
    qualify: titleTextSection(base.qualify, raw.qualify),
    documents: titleTextSection(base.documents, raw.documents),
    steps: titleTextSection(base.steps, raw.steps),
    dates: {
      ...base.dates, ...(raw.dates || {}),
      items: Array.isArray(raw.dates?.items)
        ? raw.dates.items.map((it: any) => ({ label: it?.label ?? '', value: it?.value ?? '' }))
        : [],
    },
    tips: {
      ...base.tips, ...(raw.tips || {}),
      items: Array.isArray(raw.tips?.items)
        ? raw.tips.items.map((it: any) => ({ text: it?.text ?? '' }))
        : [],
    },
    help: titleTextSection(base.help, raw.help),
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
export default function NsfasEditorPage() {
  const router = useRouter();
  const [title, setTitle] = useState('NSFAS Guide');
  const [content, setContent] = useState<NsfasContent>(emptyContent());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState<Record<string, boolean>>({ hero: true });

  function toggle(id: string) {
    setOpen(prev => ({ ...prev, [id]: !prev[id] }));
  }

  useEffect(() => {
    const token = localStorage.getItem('saus_token');
    fetch(`${API}/pages/nsfas`, { headers: { Authorization: `Bearer ${token}` } })
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
      .catch(() => toast.error('Failed to load NSFAS page'))
      .finally(() => setLoading(false));
  }, []);

  // generic immutable setters --------------------------------------
  function setHero<K extends keyof NsfasContent['hero']>(k: K, v: string) {
    setContent(c => ({ ...c, hero: { ...c.hero, [k]: v } }));
  }
  function setSection<S extends 'covers' | 'qualify' | 'documents' | 'steps' | 'dates' | 'tips' | 'help'>(
    section: S, k: keyof NsfasContent[S], v: any,
  ) {
    setContent(c => ({ ...c, [section]: { ...c[section], [k]: v } }));
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
      const res = await fetch(`${API}/pages/nsfas`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, content }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Save failed');
      toast.success('NSFAS page saved');
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

  // ── reusable renderer for the {title,text} sections (covers/qualify/documents/steps/help) ──
  function TitleTextEditor({
    id, title: secTitle, hint, section, itemLabel, titlePlaceholder, textPlaceholder, titleHint,
  }: {
    id: string; title: string; hint?: string;
    section: 'covers' | 'qualify' | 'documents' | 'steps' | 'help';
    itemLabel: string; titlePlaceholder?: string; textPlaceholder?: string; titleHint?: string;
  }) {
    const sec = content[section];
    return (
      <Section id={id} title={secTitle} hint={hint} open={!!open[id]} onToggle={toggle}>
        <Field label="Reference" value={sec.ref} onChange={v => setSection(section, 'ref', v)}
          placeholder="SAUS/NSFAS/2026" />
        <Field label="Title" value={sec.title} onChange={v => setSection(section, 'title', v)} />
        <Area label="Lead" value={sec.lead} onChange={v => setSection(section, 'lead', v)} rows={2} />

        <div>
          <label className="label">{titleHint || itemLabel + 's'}</label>
          <div className="space-y-3">
            {sec.items.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                <div className="flex-1 space-y-2">
                  <input value={item.title} className="input" placeholder={titlePlaceholder}
                    onChange={e => setSection(section, 'items',
                      sec.items.map((x, k) => k === i ? { ...x, title: e.target.value } : x))} />
                  <textarea value={item.text} rows={2} className="input resize-none" placeholder={textPlaceholder}
                    onChange={e => setSection(section, 'items',
                      sec.items.map((x, k) => k === i ? { ...x, text: e.target.value } : x))} />
                </div>
                <RowTools i={i} count={sec.items.length}
                  onMove={(idx, dir) => setSection(section, 'items', move(sec.items, idx, dir))}
                  onRemove={idx => setSection(section, 'items', sec.items.filter((_, k) => k !== idx))} />
              </div>
            ))}
          </div>
          <button type="button" className="btn-secondary btn-sm mt-3"
            onClick={() => setSection(section, 'items', [...sec.items, { title: '', text: '' }])}>
            <Plus className="w-3.5 h-3.5" /> Add {itemLabel}
          </button>
        </div>
      </Section>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/dashboard/pages')} className="btn-ghost btn-icon">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-navy">Edit NSFAS Page</h1>
            <p className="text-xs text-gray-400">Structured content for the public NSFAS financial-aid guide</p>
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
          placeholder="NSFAS Guide" />
        <p className="text-xs text-gray-400 mt-1">Stored on the Page record (not shown on the public layout).</p>
      </div>

      {/* ── HERO ── */}
      <Section id="hero" title="Hero" hint="Top banner — reference, title & lead paragraph"
        open={!!open.hero} onToggle={toggle}>
        <Field label="Reference" value={content.hero.ref} onChange={v => setHero('ref', v)}
          placeholder="SAUS/NSFAS/2026 · Financial Aid Guide" />
        <Field label="Title" value={content.hero.title} onChange={v => setHero('title', v)}
          placeholder="NSFAS Financial Aid Guide" />
        <Area label="Lead" value={content.hero.lead} onChange={v => setHero('lead', v)} rows={3} />
      </Section>

      {/* ── COVERS ── */}
      <TitleTextEditor id="covers" title="What NSFAS Covers" hint="Reference, title, lead & coverage cards"
        section="covers" itemLabel="Card" titlePlaceholder="Tuition Fees"
        textPlaceholder="Full payment of registration and tuition fees…" />

      {/* ── QUALIFY ── */}
      <TitleTextEditor id="qualify" title="Do You Qualify?" hint="Reference, title, lead & eligibility criteria"
        section="qualify" itemLabel="Criterion" titleHint="Criteria" titlePlaceholder="Household Income"
        textPlaceholder="Combined household income below R350,000 per year…" />

      {/* ── DOCUMENTS ── */}
      <TitleTextEditor id="documents" title="Required Documents" hint="Reference, title, lead & required documents"
        section="documents" itemLabel="Document" titlePlaceholder="ID Document"
        textPlaceholder="Certified copy of your South African ID…" />

      {/* ── STEPS ── */}
      <TitleTextEditor id="steps" title="Application Steps" hint="Reference, title, lead & ordered application steps"
        section="steps" itemLabel="Step" titlePlaceholder="Create a myNSFAS Account"
        textPlaceholder="Register at www.nsfas.org.za…" />

      {/* ── DATES ── */}
      <Section id="dates" title="Important Dates" hint="Reference, title, lead & key date rows"
        open={!!open.dates} onToggle={toggle}>
        <Field label="Reference" value={content.dates.ref} onChange={v => setSection('dates', 'ref', v)}
          placeholder="SAUS/NSFAS/2026" />
        <Field label="Title" value={content.dates.title} onChange={v => setSection('dates', 'title', v)} />
        <Area label="Lead" value={content.dates.lead} onChange={v => setSection('dates', 'lead', v)} rows={2} />

        <div>
          <label className="label">Dates</label>
          <div className="space-y-3">
            {content.dates.items.map((d, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                <div className="w-48 flex-shrink-0">
                  <input value={d.label} className="input" placeholder="Applications Open"
                    onChange={e => setSection('dates', 'items',
                      content.dates.items.map((x, k) => k === i ? { ...x, label: e.target.value } : x))} />
                </div>
                <div className="flex-1">
                  <input value={d.value} className="input" placeholder="November 2025"
                    onChange={e => setSection('dates', 'items',
                      content.dates.items.map((x, k) => k === i ? { ...x, value: e.target.value } : x))} />
                </div>
                <RowTools i={i} count={content.dates.items.length}
                  onMove={(idx, dir) => setSection('dates', 'items', move(content.dates.items, idx, dir))}
                  onRemove={idx => setSection('dates', 'items', content.dates.items.filter((_, k) => k !== idx))} />
              </div>
            ))}
          </div>
          <button type="button" className="btn-secondary btn-sm mt-3"
            onClick={() => setSection('dates', 'items', [...content.dates.items, { label: '', value: '' }])}>
            <Plus className="w-3.5 h-3.5" /> Add Date
          </button>
        </div>
      </Section>

      {/* ── TIPS ── */}
      <Section id="tips" title="Tips & Common Mistakes" hint="Reference, title, lead & tip list"
        open={!!open.tips} onToggle={toggle}>
        <Field label="Reference" value={content.tips.ref} onChange={v => setSection('tips', 'ref', v)}
          placeholder="SAUS/NSFAS/2026" />
        <Field label="Title" value={content.tips.title} onChange={v => setSection('tips', 'title', v)} />
        <Area label="Lead" value={content.tips.lead} onChange={v => setSection('tips', 'lead', v)} rows={2} />

        <div>
          <label className="label">Tips</label>
          <div className="space-y-3">
            {content.tips.items.map((t, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                <div className="flex-1">
                  <textarea value={t.text} rows={2} className="input resize-none"
                    placeholder="Apply early — don't wait for the deadline…"
                    onChange={e => setSection('tips', 'items',
                      content.tips.items.map((x, k) => k === i ? { ...x, text: e.target.value } : x))} />
                </div>
                <RowTools i={i} count={content.tips.items.length}
                  onMove={(idx, dir) => setSection('tips', 'items', move(content.tips.items, idx, dir))}
                  onRemove={idx => setSection('tips', 'items', content.tips.items.filter((_, k) => k !== idx))} />
              </div>
            ))}
          </div>
          <button type="button" className="btn-secondary btn-sm mt-3"
            onClick={() => setSection('tips', 'items', [...content.tips.items, { text: '' }])}>
            <Plus className="w-3.5 h-3.5" /> Add Tip
          </button>
        </div>
      </Section>

      {/* ── HELP ── */}
      <TitleTextEditor id="help" title="Get Help" hint="Reference, title, lead & support contacts"
        section="help" itemLabel="Contact" titleHint="Contacts" titlePlaceholder="NSFAS Contact Centre"
        textPlaceholder="0800 067 327 · info@nsfas.org.za" />

      {/* Footer save */}
      <div className="flex justify-end pb-6">
        <button onClick={save} disabled={saving} className="btn-primary">
          <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save NSFAS Page'}
        </button>
      </div>
    </div>
  );
}
