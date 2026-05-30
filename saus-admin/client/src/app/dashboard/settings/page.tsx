'use client';
import { useState, useEffect } from 'react';
import { Save, Globe, Mail, Phone, Share2, Search, Bell, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL;

interface Settings {
  siteName: string; tagline: string; email: string; phone: string;
  address: string; facebook: string; instagram: string; linkedin: string; tiktok: string;
  seoTitle: string; seoDescription: string; googleAnalyticsId: string;
  maintenanceMode: string; announcementBanner: string;
}

const DEFAULT: Settings = {
  siteName: 'South African Union of Students', tagline: 'Uniting Student Voices Across South Africa',
  email: 'Secretariat@saus.org.za', phone: '+27 79 129 5948',
  address: 'National Office, Republic of South Africa',
  facebook: 'https://www.facebook.com/SAUStudents/',
  instagram: 'https://www.instagram.com/sa.union.of.students/',
  linkedin: 'https://za.linkedin.com/company/south-african-union-of-students',
  tiktok: 'https://www.tiktok.com/@southafricanunionofstud8',
  seoTitle: 'SAUS — South African Union of Students',
  seoDescription: 'Official national student representative body for all 26 public universities in South Africa.',
  googleAnalyticsId: '', maintenanceMode: 'false', announcementBanner: '',
};

const TABS = ['General', 'Contact', 'Social Media', 'SEO', 'Advanced'] as const;

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT);
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('General');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('saus_token');
    fetch(`${API}/settings`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        const flat: any = {};
        Object.values(data).forEach((group: any) => Object.assign(flat, group));
        setSettings(prev => ({ ...prev, ...flat }));
      }).catch(() => {});
  }, []);

  function update(k: keyof Settings, v: string) {
    setSettings(prev => ({ ...prev, [k]: v }));
  }

  async function save() {
    setSaving(true);
    const token = localStorage.getItem('saus_token');
    const settingsArr = Object.entries(settings).map(([key, value]) => ({
      key, value, group: ['siteName','tagline'].includes(key) ? 'general' :
        ['email','phone','address'].includes(key) ? 'contact' :
        ['facebook','instagram','linkedin','tiktok'].includes(key) ? 'social' :
        ['seoTitle','seoDescription','googleAnalyticsId'].includes(key) ? 'seo' : 'advanced',
    }));
    try {
      await fetch(`${API}/settings`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ settings: settingsArr }),
      });
      toast.success('Settings saved successfully');
    } catch { toast.error('Failed to save settings'); }
    setSaving(false);
  }

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-navy">Site Settings</h1>
          <p className="text-sm text-gray-400">Configure the SAUS website content and metadata</p>
        </div>
        <button onClick={save} disabled={saving} className="btn-primary">
          <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-1">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px
              ${activeTab === tab ? 'border-navy text-navy' : 'border-transparent text-gray-400 hover:text-navy'}`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="card p-6 space-y-5">
        {activeTab === 'General' && (
          <>
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-navy/50" />
              <h3 className="font-semibold text-navy">General Information</h3>
            </div>
            <div><label className="label">Site Name</label>
              <input value={settings.siteName} onChange={e => update('siteName', e.target.value)} className="input" /></div>
            <div><label className="label">Tagline</label>
              <input value={settings.tagline} onChange={e => update('tagline', e.target.value)} className="input" /></div>
            <div>
              <label className="label">Announcement Banner</label>
              <textarea value={settings.announcementBanner} onChange={e => update('announcementBanner', e.target.value)}
                placeholder="Leave empty to hide banner. e.g. 'Applications for NSFAS 2026/2027 are now open!'"
                rows={2} className="input resize-none" />
              <p className="text-xs text-gray-400 mt-1">Displays a site-wide notification bar on the public website.</p>
            </div>
          </>
        )}

        {activeTab === 'Contact' && (
          <>
            <div className="flex items-center gap-2 mb-2">
              <Phone className="w-4 h-4 text-navy/50" />
              <h3 className="font-semibold text-navy">Contact Details</h3>
            </div>
            <div><label className="label">Secretariat Email</label>
              <input type="email" value={settings.email} onChange={e => update('email', e.target.value)} className="input" /></div>
            <div><label className="label">Phone Number</label>
              <input value={settings.phone} onChange={e => update('phone', e.target.value)} className="input" /></div>
            <div><label className="label">Physical Address</label>
              <textarea value={settings.address} onChange={e => update('address', e.target.value)} rows={2} className="input resize-none" /></div>
          </>
        )}

        {activeTab === 'Social Media' && (
          <>
            <div className="flex items-center gap-2 mb-2">
              <Share2 className="w-4 h-4 text-navy/50" />
              <h3 className="font-semibold text-navy">Social Media Profiles</h3>
            </div>
            {([
              ['facebook',  'Facebook URL'],
              ['instagram', 'Instagram URL'],
              ['linkedin',  'LinkedIn URL'],
              ['tiktok',    'TikTok URL'],
            ] as [keyof Settings, string][]).map(([key, label]) => (
              <div key={key}><label className="label">{label}</label>
                <input value={settings[key]} onChange={e => update(key, e.target.value)} className="input" placeholder="https://…" /></div>
            ))}
          </>
        )}

        {activeTab === 'SEO' && (
          <>
            <div className="flex items-center gap-2 mb-2">
              <Search className="w-4 h-4 text-navy/50" />
              <h3 className="font-semibold text-navy">Search Engine Optimisation</h3>
            </div>
            <div><label className="label">Default SEO Title</label>
              <input value={settings.seoTitle} onChange={e => update('seoTitle', e.target.value)} className="input" maxLength={60} /></div>
            <div><label className="label">Default Meta Description</label>
              <textarea value={settings.seoDescription} onChange={e => update('seoDescription', e.target.value)}
                rows={3} className="input resize-none" maxLength={160} /></div>
            <div><label className="label">Google Analytics ID</label>
              <input value={settings.googleAnalyticsId} onChange={e => update('googleAnalyticsId', e.target.value)}
                placeholder="G-XXXXXXXXXX" className="input" /></div>
          </>
        )}

        {activeTab === 'Advanced' && (
          <>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-red-saus" />
              <h3 className="font-semibold text-navy">Advanced Settings</h3>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border border-red-100 mb-4">
              <p className="text-sm text-red-saus font-medium">⚠ These settings affect the live website. Change with caution.</p>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <div className={`relative w-10 h-5 rounded-full transition-colors ${settings.maintenanceMode === 'true' ? 'bg-red-saus' : 'bg-gray-200'}`}
                onClick={() => update('maintenanceMode', settings.maintenanceMode === 'true' ? 'false' : 'true')}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${settings.maintenanceMode === 'true' ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
              <div>
                <div className="text-sm font-semibold text-navy">Maintenance Mode</div>
                <div className="text-xs text-gray-400">Shows a maintenance page to public visitors</div>
              </div>
            </label>
          </>
        )}
      </div>
    </div>
  );
}
