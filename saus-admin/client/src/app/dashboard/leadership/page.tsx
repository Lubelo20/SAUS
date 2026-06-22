'use client';
import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Award, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL;
const UPLOADS = (API || 'http://localhost:4000/api').replace(/\/api\/?$/, '');

export default function LeadershipPage() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', position: '', university: '', email: '', photo: '', bio: '', necYear: '', order: 0, isActive: true });
  const [saving, setSaving] = useState(false);

  async function fetchLeaders() {
    setLoading(true);
    const token = localStorage.getItem('saus_token');
    try {
      const res = await fetch(`${API}/leadership`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setLeaders(data.data || data || []);
    } catch { toast.error('Failed to load leadership'); }
    setLoading(false);
  }

  useEffect(() => { fetchLeaders(); }, []);

  function openNew() {
    setEditing(null);
    setForm({ name: '', position: '', university: '', email: '', photo: '', bio: '', necYear: '9th', order: leaders.length + 1, isActive: true });
    setShowForm(true);
  }

  function openEdit(leader: any) {
    setEditing(leader);
    setForm({
      name: leader.name, position: leader.position || '', university: leader.university || '',
      email: leader.email || '', photo: leader.photo || '', bio: leader.bio || '',
      necYear: leader.necYear || '9th', order: leader.order, isActive: leader.isActive,
    });
    setShowForm(true);
  }

  async function save() {
    setSaving(true);
    const token = localStorage.getItem('saus_token');
    try {
      const method = editing ? 'PUT' : 'POST';
      const url = editing ? `${API}/leadership/${editing.id}` : `${API}/leadership`;
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      toast.success(editing ? 'Leader updated' : 'Leader added');
      setShowForm(false);
      fetchLeaders();
    } catch { toast.error('Failed to save'); }
    setSaving(false);
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Remove ${name}?`)) return;
    const token = localStorage.getItem('saus_token');
    try {
      await fetch(`${API}/leadership/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      toast.success('Removed');
      fetchLeaders();
    } catch { toast.error('Failed to remove'); }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-navy">Leadership</h1>
          <p className="text-sm text-gray-400 mt-0.5">NEC members and office bearers</p>
        </div>
        <button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" /> Add Leader</button>
      </div>

      {showForm && (
        <div className="card p-6 space-y-4 border-l-4 border-navy">
          <h3 className="font-semibold text-navy">{editing ? 'Edit Leader' : 'Add New Leader'}</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="label">Full Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} className="input" placeholder="e.g. Siyabonga Moses Nkambako" /></div>
            <div><label className="label">Position / Title *</label>
              <input value={form.position} onChange={e => setForm(f => ({...f, position: e.target.value}))} className="input" placeholder="e.g. President" /></div>
            <div><label className="label">University / Institution</label>
              <input value={form.university} onChange={e => setForm(f => ({...f, university: e.target.value}))} className="input" placeholder="e.g. University of Limpopo" /></div>
            <div><label className="label">Email Address</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} className="input" placeholder="name@saus.org.za" /></div>
            <div><label className="label">Photo URL</label>
              <input value={form.photo} onChange={e => setForm(f => ({...f, photo: e.target.value}))} className="input" placeholder="https://… or /uploads/photo.jpg" /></div>
            <div><label className="label">NEC Year</label>
              <input value={form.necYear} onChange={e => setForm(f => ({...f, necYear: e.target.value}))} className="input" placeholder="e.g. 9th" /></div>
            <div className="sm:col-span-2"><label className="label">Biography</label>
              <textarea value={form.bio} onChange={e => setForm(f => ({...f, bio: e.target.value}))}
                rows={3} className="input resize-none" placeholder="Brief biography…" /></div>
            <div><label className="label">Display Order</label>
              <input type="number" value={form.order} onChange={e => setForm(f => ({...f, order: +e.target.value}))} className="input" /></div>
            <div className="flex items-center gap-3 pt-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({...f, isActive: e.target.checked}))}
                  className="w-4 h-4 accent-navy" />
                <span className="text-sm font-medium text-navy">Active / Visible on website</span>
              </label>
            </div>
          </div>
          {form.photo && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <img src={form.photo.startsWith('http') ? form.photo : `${UPLOADS}/uploads/${form.photo}`}
                alt={form.name} className="w-12 h-12 rounded-full object-cover border-2 border-gold" />
              <span className="text-xs text-gray-500">Photo preview</span>
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={save} disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save'}</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="flex gap-2">
              {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-navy animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
            </div>
          </div>
        ) : leaders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <Award className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-sm text-gray-400">No leaders added yet</p>
            <button onClick={openNew} className="btn-primary btn-sm">Add first leader</button>
          </div>
        ) : (
          <table className="w-full table-base">
            <thead>
              <tr>
                <th className="w-8"></th>
                <th>#</th>
                <th>Name</th>
                <th className="hidden md:table-cell">Position</th>
                <th className="hidden lg:table-cell">University</th>
                <th>Status</th>
                <th className="w-24 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaders.map((l, i) => (
                <tr key={l.id}>
                  <td><GripVertical className="w-4 h-4 text-gray-300" /></td>
                  <td className="text-gray-400 font-mono text-xs">{l.order || i + 1}</td>
                  <td>
                    <div className="flex items-center gap-3">
                      {l.photo ? (
                        <img src={l.photo.startsWith('http') ? l.photo : `${UPLOADS}/uploads/${l.photo}`} alt={l.name}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-navy-50 flex items-center justify-center text-navy font-bold text-sm flex-shrink-0">
                          {l.name?.charAt(0)}
                        </div>
                      )}
                      <span className="font-medium text-navy text-sm">{l.name}</span>
                    </div>
                  </td>
                  <td className="hidden md:table-cell text-sm text-gray-500">{l.position}</td>
                  <td className="hidden lg:table-cell text-xs text-gray-400">{l.university || '—'}</td>
                  <td>
                    <span className={l.isActive ? 'badge-published' : 'badge-archived'}>
                      {l.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => openEdit(l)} className="btn-ghost btn-icon"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => remove(l.id, l.name)}
                        className="btn-ghost btn-icon text-red-400 hover:bg-red-50 hover:text-red-saus"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
