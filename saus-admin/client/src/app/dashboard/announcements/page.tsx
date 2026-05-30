'use client';
import { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL;

const TYPE_ICON: Record<string, React.ReactNode> = {
  INFO:    <Info className="w-4 h-4 text-blue-500" />,
  WARNING: <AlertCircle className="w-4 h-4 text-yellow-500" />,
  SUCCESS: <CheckCircle2 className="w-4 h-4 text-green" />,
  ERROR:   <AlertCircle className="w-4 h-4 text-red-saus" />,
};

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', type: 'INFO', isActive: true });
  const [saving, setSaving] = useState(false);

  async function fetchAnnouncements() {
    setLoading(true);
    const token = localStorage.getItem('saus_token');
    try {
      const res = await fetch(`${API}/settings`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      const banner = data?.advanced?.announcementBanner || '';
      setAnnouncements(banner ? [{ id: 'banner', title: 'Site Banner', message: banner, type: 'INFO', isActive: true }] : []);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { fetchAnnouncements(); }, []);

  async function save() {
    setSaving(true);
    const token = localStorage.getItem('saus_token');
    try {
      await fetch(`${API}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ settings: [{ key: 'announcementBanner', value: form.message, group: 'advanced' }] }),
      });
      toast.success('Announcement saved');
      setShowForm(false);
      fetchAnnouncements();
    } catch { toast.error('Failed to save'); }
    setSaving(false);
  }

  async function clearBanner() {
    if (!confirm('Clear the site announcement banner?')) return;
    const token = localStorage.getItem('saus_token');
    try {
      await fetch(`${API}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ settings: [{ key: 'announcementBanner', value: '', group: 'advanced' }] }),
      });
      toast.success('Banner cleared');
      fetchAnnouncements();
    } catch { toast.error('Failed to clear'); }
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-navy">Announcements</h1>
          <p className="text-sm text-gray-400 mt-0.5">Site-wide notification banner</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary"><Plus className="w-4 h-4" /> New Announcement</button>
      </div>

      {showForm && (
        <div className="card p-6 space-y-4 border-l-4 border-gold">
          <h3 className="font-semibold text-navy">Set Announcement Banner</h3>
          <div><label className="label">Title</label>
            <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} className="input" /></div>
          <div><label className="label">Message</label>
            <textarea value={form.message} onChange={e => setForm(f => ({...f, message: e.target.value}))}
              rows={3} className="input resize-none"
              placeholder="e.g. Applications for NSFAS 2026/2027 are now open!" /></div>
          <div><label className="label">Type</label>
            <select value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))} className="input">
              {['INFO', 'WARNING', 'SUCCESS'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={save} disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Publish'}</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="flex gap-2">
              {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-navy animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
            </div>
          </div>
        ) : announcements.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-3">
            <Bell className="w-8 h-8 text-gray-300" />
            <p className="text-sm text-gray-400">No active announcements</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {announcements.map(a => (
              <div key={a.id} className="p-4 flex items-start gap-3">
                {TYPE_ICON[a.type] || <Bell className="w-4 h-4 text-gray-400" />}
                <div className="flex-1">
                  <div className="font-semibold text-navy text-sm">{a.title}</div>
                  <div className="text-sm text-gray-500 mt-0.5">{a.message}</div>
                </div>
                {a.isActive && <span className="badge-published">Active</span>}
                <button onClick={clearBanner}
                  className="btn-ghost btn-icon text-red-400 hover:bg-red-50 hover:text-red-saus">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card p-4 bg-gold-50 border border-gold/20">
        <p className="text-xs text-yellow-700">
          <strong>Note:</strong> The announcement banner appears at the top of the public SAUS website.
          Use Settings → General to edit it directly as well.
        </p>
      </div>
    </div>
  );
}
