'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, Pencil, Trash2, Eye, Star, MoreHorizontal, Clock } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import toast from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL;

const STATUS_OPTS = ['', 'PUBLISHED', 'DRAFT', 'SCHEDULED', 'ARCHIVED'];
const STATUS_BADGE: Record<string, string> = {
  PUBLISHED: 'badge-published',
  DRAFT:     'badge-draft',
  SCHEDULED: 'badge-scheduled',
  ARCHIVED:  'badge-archived',
  PENDING_REVIEW: 'badge-pending',
};

export default function NewsPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('saus_token');
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (status) params.set('status', status);
    if (search) params.set('search', search);
    try {
      const res = await fetch(`${API}/news?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setArticles(data.data || []);
      setTotal(data.total || 0);
    } catch { toast.error('Failed to load articles'); }
    setLoading(false);
  }, [page, search, status]);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);

  async function deleteArticle(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    const token = localStorage.getItem('saus_token');
    try {
      await fetch(`${API}/news/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      toast.success('Article deleted');
      fetchArticles();
    } catch { toast.error('Failed to delete'); }
    setDeleting(null);
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono tracking-[0.15em] uppercase text-navy/40 mb-1">SAUS/CMS/NEWS</div>
          <h1 className="text-xl font-bold text-navy">News & Statements</h1>
          <p className="text-sm text-gray-400 mt-0.5">{total} total articles</p>
        </div>
        <Link href="/dashboard/news/create" className="btn-primary self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Write Article
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-3 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search articles…" className="input pl-8 h-8 text-sm" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
            className="input h-8 text-sm w-36">
            {STATUS_OPTS.map(s => <option key={s} value={s}>{s || 'All Status'}</option>)}
          </select>
        </div>
        <span className="text-xs text-gray-400 font-mono ml-auto hidden sm:block">
          Showing {articles.length} of {total}
        </span>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="flex gap-2">
              {[0,1,2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full bg-navy animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />
              ))}
            </div>
          </div>
        ) : articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <Plus className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-sm text-gray-400">No articles found</p>
            <Link href="/dashboard/news/create" className="btn-primary btn-sm">Write your first article</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-base">
              <thead>
                <tr>
                  <th className="w-8">#</th>
                  <th>Title</th>
                  <th className="hidden md:table-cell">Author</th>
                  <th className="hidden lg:table-cell">Category</th>
                  <th>Status</th>
                  <th className="hidden md:table-cell">Date</th>
                  <th className="w-24 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((a, i) => (
                  <tr key={a.id}>
                    <td className="text-gray-400 font-mono text-xs">{(page-1)*20 + i + 1}</td>
                    <td>
                      <div className="flex items-start gap-2">
                        {a.isFeatured && <Star className="w-3 h-3 text-gold flex-shrink-0 mt-0.5" fill="currentColor" />}
                        <div>
                          <div className="font-medium text-navy text-sm line-clamp-1">{a.title}</div>
                          {a.excerpt && <div className="text-xs text-gray-400 line-clamp-1">{a.excerpt}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="hidden md:table-cell">
                      <div className="text-sm text-gray-600">{a.author?.name}</div>
                    </td>
                    <td className="hidden lg:table-cell">
                      {a.category ? (
                        <span className="badge bg-navy-50 text-navy text-[10px]">{a.category.name}</span>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td>
                      <span className={STATUS_BADGE[a.status] || 'badge-draft'}>{a.status}</span>
                    </td>
                    <td className="hidden md:table-cell">
                      <div className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center justify-center gap-1">
                        <Link href={`/dashboard/news/${a.id}`} className="btn-ghost btn-icon" title="View">
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <Link href={`/dashboard/news/${a.id}/edit`} className="btn-ghost btn-icon" title="Edit">
                          <Pencil className="w-3.5 h-3.5" />
                        </Link>
                        <button onClick={() => deleteArticle(a.id, a.title)}
                          disabled={deleting === a.id}
                          className="btn-ghost btn-icon text-red-400 hover:bg-red-50 hover:text-red-saus" title="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {total > 20 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Page {page} of {Math.ceil(total / 20)}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="btn-secondary btn-sm">
              Previous
            </button>
            <button onClick={() => setPage(p => p+1)} disabled={page >= Math.ceil(total/20)} className="btn-secondary btn-sm">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
