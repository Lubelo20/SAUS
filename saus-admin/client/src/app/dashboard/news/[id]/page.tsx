'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Pencil, Trash2, Star, Clock } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL;

const STATUS_BADGE: Record<string, string> = {
  PUBLISHED: 'badge-published', DRAFT: 'badge-draft',
  SCHEDULED: 'badge-scheduled', ARCHIVED: 'badge-archived',
  PENDING_REVIEW: 'badge-pending',
};

export default function ViewArticlePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('saus_token');
    fetch(`${API}/news/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setArticle(d); setLoading(false); })
      .catch(() => { toast.error('Failed to load article'); setLoading(false); });
  }, [id]);

  async function handleDelete() {
    if (!confirm(`Delete "${article?.title}"? This cannot be undone.`)) return;
    const token = localStorage.getItem('saus_token');
    try {
      await fetch(`${API}/news/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      toast.success('Article deleted');
      router.push('/dashboard/news');
    } catch { toast.error('Failed to delete article'); }
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Loading…</div>;
  if (!article || article.error) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <p className="text-gray-400 text-sm">Article not found.</p>
      <Link href="/dashboard/news" className="btn-secondary btn-sm">← Back to News</Link>
    </div>
  );

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/news" className="btn-ghost btn-icon"><ArrowLeft className="w-4 h-4" /></Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-navy truncate">{article.title}</h1>
          <p className="text-xs text-gray-400 mt-0.5 font-mono truncate">{article.slug}</p>
        </div>
        <Link href={`/dashboard/news/${id}/edit`} className="btn-secondary btn-sm">
          <Pencil className="w-3.5 h-3.5" /> Edit
        </Link>
        <button onClick={handleDelete} className="btn-danger btn-sm">
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-5 items-start">
        <div className="lg:col-span-2 space-y-4">
          {article.coverImage && (
            <div className="card overflow-hidden">
              <img src={article.coverImage} alt={article.title} className="w-full h-52 object-cover" />
            </div>
          )}
          <div className="card p-6">
            {article.excerpt && (
              <p className="text-gray-500 text-sm italic mb-4 pb-4 border-b border-gray-100">{article.excerpt}</p>
            )}
            <div
              className="prose prose-sm max-w-none text-navy leading-relaxed"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-4 space-y-3">
            <h3 className="font-semibold text-navy text-sm">Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">Status</span>
                <span className={STATUS_BADGE[article.status] || 'badge-draft'}>{article.status}</span>
              </div>
              {article.isFeatured && (
                <div className="flex items-center gap-1.5 text-gold text-xs font-semibold">
                  <Star className="w-3.5 h-3.5" /> Featured
                </div>
              )}
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Author</span>
                <span className="font-medium text-navy">{article.author?.name || '—'}</span>
              </div>
              {article.category && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Category</span>
                  <span className="font-medium text-navy">{article.category.name}</span>
                </div>
              )}
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Created</span>
                <span className="text-navy">{format(new Date(article.createdAt), 'dd MMM yyyy')}</span>
              </div>
              {article.publishedAt && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Published</span>
                  <span className="text-navy">{format(new Date(article.publishedAt), 'dd MMM yyyy')}</span>
                </div>
              )}
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Read time</span>
                <span className="text-navy">{article.readTimeMinutes || 1} min</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Views</span>
                <span className="text-navy">{article.viewCount ?? 0}</span>
              </div>
            </div>
          </div>

          {(article.seoTitle || article.seoDescription) && (
            <div className="card p-4 space-y-2">
              <h3 className="font-semibold text-navy text-sm">SEO</h3>
              {article.seoTitle && <p className="text-xs text-navy font-medium">{article.seoTitle}</p>}
              {article.seoDescription && <p className="text-xs text-gray-500">{article.seoDescription}</p>}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Link href={`/dashboard/news/${id}/edit`} className="btn-primary w-full justify-center">
              <Pencil className="w-3.5 h-3.5" /> Edit Article
            </Link>
            <button onClick={handleDelete}
              className="btn-ghost w-full justify-center text-red-saus hover:bg-red-50 text-sm">
              <Trash2 className="w-3.5 h-3.5" /> Delete Article
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
