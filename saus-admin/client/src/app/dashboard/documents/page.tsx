'use client';
import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, Trash2, Download, FileText, Upload, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL;
const UPLOADS = (API || 'http://localhost:4000/api').replace(/\/api\/?$/, '');

const CATEGORIES = ['', 'Policy', 'Constitution', 'Report', 'Press Release', 'Circular', 'Other'];

function formatBytes(b: number) {
  if (!b) return '—';
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b/1024).toFixed(1)} KB`;
  return `${(b/1048576).toFixed(1)} MB`;
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('saus_token');
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (category) params.set('category', category);
    if (search) params.set('search', search);
    try {
      const res = await fetch(`${API}/documents?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setDocs(data.data || []);
      setTotal(data.total || 0);
    } catch { toast.error('Failed to load documents'); }
    setLoading(false);
  }, [page, search, category]);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  async function uploadDoc(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const token = localStorage.getItem('saus_token');
    const fd = new FormData();
    fd.append('file', file);
    fd.append('title', file.name.replace(/\.[^.]+$/, ''));
    fd.append('category', 'Other');
    try {
      await fetch(`${API}/documents`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
      toast.success('Document uploaded');
      fetchDocs();
    } catch { toast.error('Upload failed'); }
    setUploading(false);
    e.target.value = '';
  }

  async function deleteDoc(id: string, title: string) {
    if (!confirm(`Delete "${title}"?`)) return;
    const token = localStorage.getItem('saus_token');
    try {
      await fetch(`${API}/documents/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      toast.success('Document deleted');
      fetchDocs();
    } catch { toast.error('Failed to delete'); }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono tracking-[0.15em] uppercase text-navy/40 mb-1">SAUS/CMS/DOCUMENTS</div>
          <h1 className="text-xl font-bold text-navy">Documents & PDFs</h1>
          <p className="text-sm text-gray-400 mt-0.5">{total} documents</p>
        </div>
        <label className={`btn-primary self-start sm:self-auto cursor-pointer ${uploading ? 'opacity-60' : ''}`}>
          <Upload className="w-4 h-4" /> {uploading ? 'Uploading…' : 'Upload Document'}
          <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip" className="hidden" onChange={uploadDoc} disabled={uploading} />
        </label>
      </div>

      <div className="card p-3 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search documents…" className="input pl-8 h-8 text-sm" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}
            className="input h-8 text-sm w-40">
            {CATEGORIES.map(c => <option key={c} value={c}>{c || 'All Categories'}</option>)}
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
        ) : docs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-sm text-gray-400">No documents uploaded yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-base">
              <thead>
                <tr>
                  <th>#</th><th>Document</th>
                  <th className="hidden md:table-cell">Category</th>
                  <th className="hidden lg:table-cell">Size</th>
                  <th className="hidden md:table-cell">Uploaded</th>
                  <th className="w-24 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((d, i) => (
                  <tr key={d.id}>
                    <td className="text-gray-400 font-mono text-xs">{(page-1)*20 + i + 1}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-red-saus flex-shrink-0" />
                        <div>
                          <div className="font-medium text-navy text-sm">{d.title}</div>
                          <div className="text-xs text-gray-400 font-mono">{d.filename}</div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden md:table-cell">
                      {d.category ? <span className="badge bg-navy-50 text-navy text-[10px]">{d.category}</span> : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="hidden lg:table-cell text-xs text-gray-400 font-mono">{formatBytes(d.fileSize)}</td>
                    <td className="hidden md:table-cell">
                      <div className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(d.createdAt), { addSuffix: true })}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center justify-center gap-1">
                        <a href={`${UPLOADS}/uploads/${d.filename}`} target="_blank" rel="noopener noreferrer"
                          className="btn-ghost btn-icon" title="Download"><Download className="w-3.5 h-3.5" /></a>
                        <button onClick={() => deleteDoc(d.id, d.title)}
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
