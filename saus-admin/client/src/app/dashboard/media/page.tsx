'use client';
import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Search, Grid3X3, List, Trash2, Copy, ImageIcon, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const API = process.env.NEXT_PUBLIC_API_URL;
const UPLOADS = (API || 'http://localhost:4000/api').replace(/\/api\/?$/, '');

interface MediaItem {
  id: string; url: string; filename: string; originalName: string;
  size: number; mimeType: string; createdAt: string;
  width?: number; height?: number; alt?: string;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function MediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('saus_token');
    try {
      const res = await fetch(`${API}/media?search=${search}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setItems(data.data || []);
    } catch { toast.error('Failed to load media'); }
    setLoading(false);
  }, [search]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const onDrop = useCallback(async (files: File[]) => {
    setUploading(true);
    const token = localStorage.getItem('saus_token');
    for (const file of files) {
      const fd = new FormData();
      fd.append('file', file);
      try {
        const res = await fetch(`${API}/media/upload`, {
          method: 'POST', body: fd,
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Upload failed');
        toast.success(`${file.name} uploaded`);
      } catch { toast.error(`Failed to upload ${file.name}`); }
    }
    setUploading(false);
    fetchItems();
  }, [fetchItems]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [], 'video/*': [] }, maxSize: 50 * 1024 * 1024,
  });

  async function deleteItem(id: string) {
    if (!confirm('Delete this media item?')) return;
    const token = localStorage.getItem('saus_token');
    await fetch(`${API}/media/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    toast.success('Deleted');
    setSelected(null);
    fetchItems();
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard');
  }

  return (
    <div className="flex gap-4 h-[calc(100vh-9rem)]">
      {/* ── Main panel ── */}
      <div className="flex-1 flex flex-col min-w-0 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-navy">Media Library</h1>
            <p className="text-sm text-gray-400 mt-0.5">{items.length} items</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setView(v => v === 'grid' ? 'list' : 'grid')}
              className="btn-secondary btn-icon">
              {view === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Upload zone */}
        <div {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
            ${isDragActive ? 'border-navy bg-navy-50' : 'border-gray-200 hover:border-navy/40 hover:bg-gray-50'}`}>
          <input {...getInputProps()} />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-navy border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-navy font-medium">Uploading…</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className={`w-8 h-8 ${isDragActive ? 'text-navy' : 'text-gray-300'}`} />
              <p className="text-sm font-medium text-navy">
                {isDragActive ? 'Drop files here' : 'Drag & drop files, or click to browse'}
              </p>
              <p className="text-xs text-gray-400">Images and videos · Max 50 MB each</p>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search media…" className="input pl-8" />
        </div>

        {/* Grid / List */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-6 h-6 border-2 border-navy border-t-transparent rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <ImageIcon className="w-12 h-12 text-gray-200" />
            <p className="text-sm text-gray-400">No media uploaded yet</p>
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 gap-2 overflow-y-auto">
            {items.map(item => (
              <div key={item.id} onClick={() => setSelected(item)}
                className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer group border-2 transition-all
                  ${selected?.id === item.id ? 'border-navy' : 'border-transparent hover:border-navy/30'}`}>
                <img src={item.url && item.url.startsWith('http') ? item.url : `${UPLOADS}/uploads/${item.filename}`} alt={item.alt || item.originalName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-navy/0 group-hover:bg-navy/20 transition-colors" />
              </div>
            ))}
          </div>
        ) : (
          <div className="card overflow-hidden overflow-y-auto">
            <table className="w-full table-base">
              <thead><tr><th>File</th><th>Type</th><th>Size</th><th>Uploaded</th><th>Actions</th></tr></thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} onClick={() => setSelected(item)} className="cursor-pointer">
                    <td>
                      <div className="flex items-center gap-2">
                        <img src={item.url && item.url.startsWith('http') ? item.url : `${UPLOADS}/uploads/${item.filename}`} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" />
                        <span className="text-sm font-medium text-navy truncate max-w-[200px]">{item.originalName}</span>
                      </div>
                    </td>
                    <td><span className="badge bg-gray-100 text-gray-500">{item.mimeType.split('/')[1]}</span></td>
                    <td><span className="text-xs text-gray-400">{formatBytes(item.size)}</span></td>
                    <td><span className="text-xs text-gray-400">{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</span></td>
                    <td>
                      <div className="flex gap-1">
                        <button onClick={e => { e.stopPropagation(); copyUrl(item.url); }} className="btn-ghost btn-icon"><Copy className="w-3.5 h-3.5" /></button>
                        <button onClick={e => { e.stopPropagation(); deleteItem(item.id); }} className="btn-ghost btn-icon text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Detail panel ── */}
      {selected && (
        <div className="w-72 flex-shrink-0 card p-4 flex flex-col gap-4 overflow-y-auto animate-slide-in">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-navy text-sm">File Details</h3>
            <button onClick={() => setSelected(null)} className="btn-ghost btn-icon">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="rounded-lg overflow-hidden bg-gray-100">
            <img src={selected.url && selected.url.startsWith('http') ? selected.url : `${UPLOADS}/uploads/${selected.filename}`} alt={selected.alt || ''} className="w-full object-contain max-h-48" />
          </div>
          <div className="space-y-2 text-sm">
            <div>
              <span className="label">Filename</span>
              <p className="text-navy break-all">{selected.originalName}</p>
            </div>
            {selected.width && (
              <div>
                <span className="label">Dimensions</span>
                <p className="text-navy">{selected.width} × {selected.height}px</p>
              </div>
            )}
            <div>
              <span className="label">Size</span>
              <p className="text-navy">{formatBytes(selected.size)}</p>
            </div>
            <div>
              <span className="label">Type</span>
              <p className="text-navy">{selected.mimeType}</p>
            </div>
            <div>
              <span className="label">Uploaded</span>
              <p className="text-navy">{formatDistanceToNow(new Date(selected.createdAt), { addSuffix: true })}</p>
            </div>
          </div>
          <div>
            <label className="label">Alt Text</label>
            <input placeholder="Describe this image…" className="input text-sm"
              defaultValue={selected.alt || ''} />
          </div>
          <div>
            <label className="label">File URL</label>
            <div className="flex gap-1">
              <input readOnly value={selected.url} className="input text-xs flex-1 truncate bg-gray-50" />
              <button onClick={() => copyUrl(selected.url)} className="btn-secondary btn-icon flex-shrink-0">
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <button onClick={() => deleteItem(selected.id)}
            className="btn-danger w-full justify-center mt-auto">
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      )}
    </div>
  );
}
