'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, Pencil, Trash2, Eye, Megaphone, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL;

const STATUS_BADGE: Record<string, string> = {
  PUBLISHED: 'badge-published', DRAFT: 'badge-draft',
  ARCHIVED: 'badge-archived', ACTIVE: 'badge-published',
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('saus_token');
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (status) params.set('status', status);
    if (search) params.set('search', search);
    try {
      const res = await fetch(`${API}/campaigns?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setCampaigns(data.data || []);
      setTotal(data.total || 0);
    } catch { toast.error('Failed to load campaigns'); }
    setLoading(false);
  }, [page, search, status]);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  async function deleteCampaign(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    const token = localStorage.getItem('saus_token');
    try {
      await fetch(`${API}/campaigns/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      toast.success('Campaign deleted');
      fetchCampaigns();
    } catch { toast.error('Failed to delete'); }
    setDeleting(null);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono tracking-[0.15em] uppercase text-navy/40 mb-1">SAUS/CMS/CAMPAIGNS</div>
          <h1 className="text-xl font-bold text-navy">Campaigns</h1>
          <p className="text-sm text-gray-400 mt-0.5">{total} total campaigns</p>
        </div>
        <Link href="/dashboard/campaigns/create" className="btn-primary self-start sm:self-auto">
          <Plus className="w-4 h-4" /> New Campaign
        </Link>
      </div>

      <div className="card p-3 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search campaigns…" className="input pl-8 h-8 text-sm" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
            className="input h-8 text-sm w-36">
            {['', 'ACTIVE', 'DRAFT', 'ARCHIVED'].map(s => (
              <option key={s} value={s}>{s || 'All Status'}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="flex gap-2">
              {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-navy animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
            </div>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-sm text-gray-400">No campaigns found</p>
            <Link href="/dashboard/campaigns/create" className="btn-primary btn-sm">Create first campaign</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-base">
              <thead>
                <tr>
                  <th>#</th><th>Campaign</th>
                  <th className="hidden md:table-cell">Author</th>
                  <th>Status</th>
                  <th className="hidden md:table-cell">Created</th>
                  <th className="w-24 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c, i) => (
                  <tr key={c.id}>
                    <td className="text-gray-400 font-mono text-xs">{(page-1)*20 + i + 1}</td>
                    <td>
                      <div className="font-medium text-navy text-sm line-clamp-1">{c.title}</div>
                      {c.description && <div className="text-xs text-gray-400 line-clamp-1">{c.description}</div>}
                    </td>
                    <td className="hidden md:table-cell text-sm text-gray-600">{c.createdBy?.name}</td>
                    <td><span className={STATUS_BADGE[c.status] || 'badge-draft'}>{c.status}</span></td>
                    <td className="hidden md:table-cell">
                      <div className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center justify-center gap-1">
                        <Link href={`/dashboard/campaigns/${c.id}`} className="btn-ghost btn-icon"><Eye className="w-3.5 h-3.5" /></Link>
                        <Link href={`/dashboard/campaigns/${c.id}/edit`} className="btn-ghost btn-icon"><Pencil className="w-3.5 h-3.5" /></Link>
                        <button onClick={() => deleteCampaign(c.id, c.title)} disabled={deleting === c.id}
                          className="btn-ghost btn-icon text-red-400 hover:bg-red-50 hover:text-red-saus"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {total > 20 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Page {page} of {Math.ceil(total / 20)}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="btn-secondary btn-sm">Previous</button>
            <button onClick={() => setPage(p => p+1)} disabled={page >= Math.ceil(total/20)} className="btn-secondary btn-sm">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
