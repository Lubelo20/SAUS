'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Pencil, Trash2, Star, Calendar, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL;

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: 'badge-published', DRAFT: 'badge-draft', ARCHIVED: 'badge-archived',
};

export default function ViewCampaignPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('saus_token');
    fetch(`${API}/campaigns/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setCampaign(d); setLoading(false); })
      .catch(() => { toast.error('Failed to load campaign'); setLoading(false); });
  }, [id]);

  async function handleDelete() {
    if (!confirm(`Delete "${campaign?.title}"? This cannot be undone.`)) return;
    const token = localStorage.getItem('saus_token');
    try {
      await fetch(`${API}/campaigns/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      toast.success('Campaign deleted');
      router.push('/dashboard/campaigns');
    } catch { toast.error('Failed to delete campaign'); }
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Loading…</div>;
  if (!campaign || campaign.error) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <p className="text-gray-400 text-sm">Campaign not found.</p>
      <Link href="/dashboard/campaigns" className="btn-secondary btn-sm">← Back to Campaigns</Link>
    </div>
  );

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/campaigns" className="btn-ghost btn-icon"><ArrowLeft className="w-4 h-4" /></Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-navy truncate">{campaign.title}</h1>
          <p className="text-xs text-gray-400 mt-0.5 font-mono truncate">{campaign.slug}</p>
        </div>
        <Link href={`/dashboard/campaigns/${id}/edit`} className="btn-secondary btn-sm">
          <Pencil className="w-3.5 h-3.5" /> Edit
        </Link>
        <button onClick={handleDelete} className="btn-danger btn-sm">
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-5 items-start">
        <div className="lg:col-span-2 space-y-4">
          {campaign.graphic && (
            <div className="card overflow-hidden">
              <img src={campaign.graphic} alt={campaign.title} className="w-full h-52 object-cover" />
            </div>
          )}
          <div className="card p-6">
            {campaign.description ? (
              <div className="prose prose-sm max-w-none text-navy leading-relaxed"
                dangerouslySetInnerHTML={{ __html: campaign.description }} />
            ) : (
              <p className="text-gray-400 text-sm italic">No description provided.</p>
            )}
            {campaign.ctaUrl && (
              <a href={campaign.ctaUrl} target="_blank" rel="noopener noreferrer"
                className="btn-primary btn-sm mt-6 inline-flex">
                {campaign.ctaLabel || 'Learn More'} <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-4 space-y-3">
            <h3 className="font-semibold text-navy text-sm">Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">Status</span>
                <span className={STATUS_BADGE[campaign.status] || 'badge-draft'}>{campaign.status}</span>
              </div>
              {campaign.isFeatured && (
                <div className="flex items-center gap-1.5 text-gold text-xs font-semibold">
                  <Star className="w-3.5 h-3.5" /> Featured
                </div>
              )}
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Author</span>
                <span className="font-medium text-navy">{campaign.createdBy?.name || '—'}</span>
              </div>
              {campaign.category && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Category</span>
                  <span className="font-medium text-navy">{campaign.category.name}</span>
                </div>
              )}
              {campaign.startDate && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Start</span>
                  <span className="text-navy flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(campaign.startDate), 'dd MMM yyyy')}
                  </span>
                </div>
              )}
              {campaign.endDate && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">End</span>
                  <span className="text-navy">{format(new Date(campaign.endDate), 'dd MMM yyyy')}</span>
                </div>
              )}
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Created</span>
                <span className="text-navy">{format(new Date(campaign.createdAt), 'dd MMM yyyy')}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Link href={`/dashboard/campaigns/${id}/edit`} className="btn-primary w-full justify-center">
              <Pencil className="w-3.5 h-3.5" /> Edit Campaign
            </Link>
            <button onClick={handleDelete}
              className="btn-ghost w-full justify-center text-red-saus hover:bg-red-50 text-sm">
              <Trash2 className="w-3.5 h-3.5" /> Delete Campaign
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
