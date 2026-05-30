'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import toast from 'react-hot-toast';
import { Save, Eye, ArrowLeft, Star, Bold, Italic, UnderlineIcon,
         Heading2, Heading3, List, ListOrdered, Quote, Undo, Redo,
         Link2, Image as ImageIcon, AlignLeft } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL;

interface FormState {
  title: string; excerpt: string; coverImage: string;
  status: string; isFeatured: boolean; scheduledAt: string;
  seoTitle: string; seoDescription: string; categoryId: string;
}

export default function CreateArticlePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'write' | 'seo'>('write');
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState<FormState>({
    title: '', excerpt: '', coverImage: '',
    status: 'DRAFT', isFeatured: false, scheduledAt: '',
    seoTitle: '', seoDescription: '', categoryId: '',
  });
  const coverRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Image,
      Placeholder.configure({ placeholder: 'Start writing your article here…' }),
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[360px] px-6 py-5 focus:outline-none text-navy leading-relaxed',
      },
    },
  });

  useEffect(() => {
    const token = localStorage.getItem('saus_token');
    fetch(`${API}/news/categories/all`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { if (Array.isArray(d)) setCategories(d); }).catch(() => {});
  }, []);

  function update(k: keyof FormState, v: any) {
    setForm(prev => ({ ...prev, [k]: v }));
  }

  async function save(status?: string) {
    if (!form.title.trim()) return toast.error('Title is required');
    const content = editor?.getHTML() || '';
    if (content.length < 10) return toast.error('Content is required');

    setSaving(true);
    const token = localStorage.getItem('saus_token');
    try {
      const res = await fetch(`${API}/news`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, content, status: status || form.status }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success(status === 'PUBLISHED' ? 'Article published!' : 'Article saved as draft');
      router.push('/dashboard/news');
    } catch (err: any) {
      toast.error(err.message);
    }
    setSaving(false);
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="btn-ghost btn-icon">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-navy">Write Article</h1>
            <p className="text-xs text-gray-400">News, statements & media advisories</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => save('DRAFT')} disabled={saving} className="btn-secondary btn-sm">
            <Save className="w-3.5 h-3.5" /> Save Draft
          </button>
          <button onClick={() => save('PUBLISHED')} disabled={saving} className="btn-success btn-sm">
            <Eye className="w-3.5 h-3.5" /> Publish
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 items-start">
        {/* ── Editor column ── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Title */}
          <div className="card p-5">
            <input
              value={form.title} onChange={e => update('title', e.target.value)}
              placeholder="Article title…"
              className="w-full text-2xl font-bold text-navy placeholder:text-gray-300 border-0 focus:outline-none bg-transparent"
            />
            <textarea
              value={form.excerpt} onChange={e => update('excerpt', e.target.value)}
              placeholder="Brief excerpt or summary (optional)…"
              rows={2}
              className="w-full text-sm text-gray-500 placeholder:text-gray-300 border-0 focus:outline-none bg-transparent mt-2 resize-none"
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-gray-200 pb-0">
            {(['write', 'seo'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px
                  ${activeTab === tab ? 'border-navy text-navy' : 'border-transparent text-gray-400 hover:text-navy'}`}>
                {tab === 'write' ? 'Write Content' : 'SEO Settings'}
              </button>
            ))}
          </div>

          {activeTab === 'write' && (
            <div className="card overflow-hidden">
              {/* Toolbar */}
              {editor && (
                <div className="flex items-center gap-0.5 px-3 py-2 border-b border-gray-100 bg-gray-50 flex-wrap">
                  {[
                    { icon: Bold,         cmd: () => editor.chain().focus().toggleBold().run(),        active: editor.isActive('bold') },
                    { icon: Italic,       cmd: () => editor.chain().focus().toggleItalic().run(),      active: editor.isActive('italic') },
                    { icon: UnderlineIcon,cmd: () => editor.chain().focus().toggleUnderline().run(),   active: editor.isActive('underline') },
                  ].map(({ icon: Icon, cmd, active }, i) => (
                    <button key={i} onMouseDown={e => { e.preventDefault(); cmd(); }}
                      className={`p-1.5 rounded transition-colors ${active ? 'bg-navy text-white' : 'text-gray-500 hover:bg-gray-200'}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </button>
                  ))}
                  <div className="w-px h-4 bg-gray-300 mx-1" />
                  {[
                    { icon: Heading2, cmd: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }) },
                    { icon: Heading3, cmd: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive('heading', { level: 3 }) },
                  ].map(({ icon: Icon, cmd, active }, i) => (
                    <button key={i} onMouseDown={e => { e.preventDefault(); cmd(); }}
                      className={`p-1.5 rounded transition-colors ${active ? 'bg-navy text-white' : 'text-gray-500 hover:bg-gray-200'}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </button>
                  ))}
                  <div className="w-px h-4 bg-gray-300 mx-1" />
                  {[
                    { icon: List, cmd: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList') },
                    { icon: ListOrdered, cmd: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList') },
                    { icon: Quote, cmd: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive('blockquote') },
                  ].map(({ icon: Icon, cmd, active }, i) => (
                    <button key={i} onMouseDown={e => { e.preventDefault(); cmd(); }}
                      className={`p-1.5 rounded transition-colors ${active ? 'bg-navy text-white' : 'text-gray-500 hover:bg-gray-200'}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </button>
                  ))}
                  <div className="w-px h-4 bg-gray-300 mx-1" />
                  <button onMouseDown={e => { e.preventDefault(); editor.chain().focus().undo().run(); }}
                    className="p-1.5 rounded text-gray-500 hover:bg-gray-200 transition-colors">
                    <Undo className="w-3.5 h-3.5" />
                  </button>
                  <button onMouseDown={e => { e.preventDefault(); editor.chain().focus().redo().run(); }}
                    className="p-1.5 rounded text-gray-500 hover:bg-gray-200 transition-colors">
                    <Redo className="w-3.5 h-3.5" />
                  </button>
                  <span className="ml-auto text-xs text-gray-400 font-mono">
                    {editor.storage.characterCount?.words?.() ?? 0} words
                  </span>
                </div>
              )}
              <EditorContent editor={editor} />
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="card p-5 space-y-4">
              <h3 className="font-semibold text-navy text-sm">Search Engine Optimisation</h3>
              <div>
                <label className="label">SEO Title</label>
                <input value={form.seoTitle} onChange={e => update('seoTitle', e.target.value)}
                  placeholder="Overrides article title in search results"
                  className="input" maxLength={60} />
                <p className="text-xs text-gray-400 mt-1">{form.seoTitle.length}/60 characters</p>
              </div>
              <div>
                <label className="label">Meta Description</label>
                <textarea value={form.seoDescription} onChange={e => update('seoDescription', e.target.value)}
                  placeholder="Brief description shown in search results…"
                  rows={3} className="input resize-none" maxLength={160} />
                <p className="text-xs text-gray-400 mt-1">{form.seoDescription.length}/160 characters</p>
              </div>
              {/* Preview */}
              <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
                <p className="text-[11px] text-gray-400 mb-2 font-mono uppercase tracking-wide">Search Preview</p>
                <p className="text-blue-600 text-sm font-medium">{form.seoTitle || form.title || 'Article Title'}</p>
                <p className="text-green-700 text-xs">saus.org.za/news/article-slug</p>
                <p className="text-gray-500 text-sm mt-0.5">{form.seoDescription || form.excerpt || 'Article description will appear here…'}</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Sidebar column ── */}
        <div className="space-y-4">
          {/* Publish settings */}
          <div className="card p-4 space-y-4">
            <h3 className="font-semibold text-navy text-sm">Publish Settings</h3>
            <div>
              <label className="label">Status</label>
              <select value={form.status} onChange={e => update('status', e.target.value)} className="input">
                <option value="DRAFT">Draft</option>
                <option value="PENDING_REVIEW">Pending Review</option>
                <option value="PUBLISHED">Published</option>
                <option value="SCHEDULED">Scheduled</option>
              </select>
            </div>
            {form.status === 'SCHEDULED' && (
              <div>
                <label className="label">Publish Date</label>
                <input type="datetime-local" value={form.scheduledAt}
                  onChange={e => update('scheduledAt', e.target.value)} className="input" />
              </div>
            )}
            <label className="flex items-center gap-2.5 cursor-pointer">
              <div className={`relative w-9 h-5 rounded-full transition-colors ${form.isFeatured ? 'bg-gold' : 'bg-gray-200'}`}
                onClick={() => update('isFeatured', !form.isFeatured)}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.isFeatured ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-sm font-medium text-navy flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-gold" /> Featured Article
              </span>
            </label>
          </div>

          {/* Category */}
          <div className="card p-4">
            <label className="label">Category</label>
            <select value={form.categoryId} onChange={e => update('categoryId', e.target.value)} className="input">
              <option value="">— Select category —</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Cover Image */}
          <div className="card p-4 space-y-3">
            <h3 className="font-semibold text-navy text-sm">Cover Image</h3>
            {form.coverImage ? (
              <div className="relative rounded overflow-hidden">
                <img src={form.coverImage} alt="Cover" className="w-full h-32 object-cover" />
                <button onClick={() => update('coverImage', '')}
                  className="absolute top-2 right-2 bg-red-saus text-white rounded px-2 py-0.5 text-xs">
                  Remove
                </button>
              </div>
            ) : (
              <div
                onClick={() => coverRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-lg h-32 flex flex-col items-center
                           justify-center gap-2 cursor-pointer hover:border-navy/30 hover:bg-navy-50 transition-colors">
                <ImageIcon className="w-6 h-6 text-gray-300" />
                <span className="text-xs text-gray-400">Click to upload cover image</span>
              </div>
            )}
            <input ref={coverRef} type="file" accept="image/*" className="hidden"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) update('coverImage', URL.createObjectURL(file));
              }} />
            <input value={form.coverImage} onChange={e => update('coverImage', e.target.value)}
              placeholder="Or paste image URL…" className="input text-xs" />
          </div>

          {/* Save buttons */}
          <div className="flex flex-col gap-2">
            <button onClick={() => save('PUBLISHED')} disabled={saving}
              className="btn-success w-full justify-center">
              Publish Article
            </button>
            <button onClick={() => save('DRAFT')} disabled={saving}
              className="btn-secondary w-full justify-center">
              <Save className="w-3.5 h-3.5" /> Save as Draft
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
