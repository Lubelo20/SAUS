'use client';
import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Tag } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL;

interface Category { id: string; name: string; slug: string; description?: string; color?: string; _count?: { articles: number }; }

export default function NewsCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', color: '#0A1628' });

  async function fetchCategories() {
    const token = localStorage.getItem('saus_token');
    try {
      const res = await fetch(`${API}/news/categories/all`, { headers: { Authorization: `Bearer ${token}` } });
      setCategories(await res.json());
    } catch { toast.error('Failed to load categories'); }
    setLoading(false);
  }

  useEffect(() => { fetchCategories(); }, []);

  async function createCategory() {
    if (!form.name.trim()) return toast.error('Name is required');
    setSaving(true);
    const token = localStorage.getItem('saus_token');
    try {
      const res = await fetch(`${API}/news/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success('Category created');
      setForm({ name: '', description: '', color: '#0A1628' });
      setShowForm(false);
      fetchCategories();
    } catch (err: any) { toast.error(err.message || 'Failed to create category'); }
    setSaving(false);
  }

  async function deleteCategory(id: string, name: string) {
    if (!confirm(`Delete category "${name}"? Articles in this category will become uncategorised.`)) return;
    setDeleting(id);
    const token = localStorage.getItem('saus_token');
    try {
      await fetch(`${API}/news/categories/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      toast.success('Category deleted');
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch { toast.error('Failed to delete category'); }
    setDeleting(null);
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/news" className="btn-ghost btn-icon"><ArrowLeft className="w-4 h-4" /></Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-navy">News Categories</h1>
          <p className="text-sm text-gray-400 mt-0.5">{categories.length} categories</p>
        </div>
        <button onClick={() => setShowForm(f => !f)} className="btn-primary btn-sm">
          <Plus className="w-3.5 h-3.5" /> New Category
        </button>
      </div>

      {showForm && (
        <div className="card p-5 space-y-4 border-l-4 border-navy">
          <h3 className="font-semibold text-navy text-sm">New Category</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Press Release" className="input" autoFocus />
            </div>
            <div>
              <label className="label">Accent Colour</label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.color}
                  onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                  className="w-10 h-9 rounded border border-gray-200 cursor-pointer p-0.5" />
                <input value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                  className="input flex-1 font-mono text-sm" placeholder="#0A1628" />
              </div>
            </div>
          </div>
          <div>
            <label className="label">Description</label>
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Optional description…" className="input" />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowForm(false)} className="btn-secondary btn-sm">Cancel</button>
            <button onClick={createCategory} disabled={saving} className="btn-primary btn-sm">
              {saving ? 'Saving…' : 'Create Category'}
            </button>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="flex gap-2">
              {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-navy animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
            </div>
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <Tag className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-sm text-gray-400">No categories yet</p>
            <button onClick={() => setShowForm(true)} className="btn-primary btn-sm">Create first category</button>
          </div>
        ) : (
          <div className="overflow-x-auto"><table className="w-full table-base">
            <thead>
              <tr>
                <th>Category</th>
                <th className="hidden sm:table-cell">Description</th>
                <th className="w-20 text-center">Articles</th>
                <th className="w-16 text-center">Delete</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(c => (
                <tr key={c.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: c.color || '#0A1628' }} />
                      <div>
                        <div className="font-medium text-navy text-sm">{c.name}</div>
                        <div className="text-xs text-gray-400 font-mono">{c.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell text-sm text-gray-500 max-w-xs truncate">
                    {c.description || <span className="text-gray-300">—</span>}
                  </td>
                  <td className="text-center text-sm text-gray-600">{c._count?.articles ?? 0}</td>
                  <td className="text-center">
                    <button onClick={() => deleteCategory(c.id, c.name)} disabled={deleting === c.id}
                      className="btn-ghost btn-icon text-red-400 hover:bg-red-50 hover:text-red-saus mx-auto">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>
    </div>
  );
}
