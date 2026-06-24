'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Lock, Mail, Shield } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      localStorage.setItem('saus_token', data.token);
      localStorage.setItem('saus_user', JSON.stringify(data.user));
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}!`);
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-navy flex">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex w-[520px] flex-shrink-0 flex-col justify-between p-12
                      bg-gradient-to-br from-navy to-navy-light border-r border-white/8 relative overflow-hidden">
        {/* SA flag stripe */}
        <div className="absolute top-0 left-0 right-0 h-1 flex">
          <div className="flex-1 bg-navy" />
          <div className="flex-1 bg-green" />
          <div className="flex-1 bg-gold" />
          <div className="flex-1 bg-red-saus" />
        </div>
        {/* Dot pattern */}
        <div className="absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-full border-2 border-gold overflow-hidden bg-white">
              <img src="/saus-logo.jpeg" alt="SAUS logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="text-white font-bold text-sm tracking-wide">SAUS CMS</div>
              <div className="text-white/40 text-xs font-mono tracking-widest uppercase">Admin Portal</div>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            South African<br />
            <span className="text-gold italic" style={{ fontFamily: 'Georgia, serif' }}>Union of Students</span>
          </h1>
          <p className="text-white/50 text-sm leading-relaxed max-w-xs">
            Centralised content management system for the 9th National Executive Committee and all affiliated departments.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          {[
            { label: 'News & Statements',   desc: 'Publish articles, media advisories, official statements' },
            { label: 'Events Management',   desc: 'Create and manage national events and campus activations' },
            { label: 'Campaigns & Media',   desc: 'Run awareness campaigns, upload documents and gallery' },
          ].map(item => (
            <div key={item.label} className="flex gap-3">
              <div className="mt-0.5 w-5 h-5 rounded-sm bg-gold/20 border border-gold/30 flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 rounded-sm bg-gold" />
              </div>
              <div>
                <div className="text-white text-sm font-semibold">{item.label}</div>
                <div className="text-white/40 text-xs">{item.desc}</div>
              </div>
            </div>
          ))}
          <div className="pt-4 border-t border-white/8">
            <p className="text-white/25 text-xs font-mono">
              SAUS/CMS/SECURE · Est. April 2006 · 26 Public Universities
            </p>
          </div>
        </div>
      </div>

      {/* ── Right panel — login form ── */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-full border-2 border-gold overflow-hidden bg-white">
              <img src="/saus-logo.jpeg" alt="SAUS logo" className="w-full h-full object-cover" />
            </div>
            <div className="text-white font-bold text-lg">SAUS CMS</div>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-2xl">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-navy/40" />
                <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Secure Access</span>
              </div>
              <h2 className="text-2xl font-bold text-navy">Sign in to Dashboard</h2>
              <p className="text-gray-400 text-sm mt-1">Authorised personnel only</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="label">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="admin@saus.org.za"
                    autoComplete="username"
                    className="input pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPwd ? 'text' : 'password'} required value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="input pl-9 pr-10"
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base rounded-lg">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Signing in…
                  </span>
                ) : 'Sign in'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-400">Protected by SAUS Security Policy</p>
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-sm bg-navy" />
                <div className="w-3 h-3 rounded-sm bg-green" />
                <div className="w-3 h-3 rounded-sm bg-gold" />
                <div className="w-3 h-3 rounded-sm bg-red-saus" />
              </div>
            </div>
          </div>

          <p className="text-center text-white/30 text-xs mt-6">
            © {new Date().getFullYear()} South African Union of Students · Developed by Lubelo Tech Solutions
          </p>
        </div>
      </div>
    </div>
  );
}
