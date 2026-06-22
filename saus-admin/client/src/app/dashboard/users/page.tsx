'use client';
import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Shield, ShieldCheck, ShieldAlert, Clock, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const API = process.env.NEXT_PUBLIC_API_URL;

const ROLES = ['SUPER_ADMIN', 'SECRETARIAT', 'MARKETING', 'MEDIA', 'EDITOR', 'CONTRIBUTOR'] as const;

const ROLE_CONFIG: Record<string, { label: string; color: string; icon: typeof Shield }> = {
  SUPER_ADMIN:  { label: 'Super Admin',   color: 'bg-red-50 text-red-saus',   icon: ShieldAlert },
  SECRETARIAT:  { label: 'Secretariat',   color: 'bg-navy-50 text-navy',      icon: ShieldCheck },
  MARKETING:    { label: 'Marketing',     color: 'bg-gold-50 text-yellow-700', icon: Shield },
  MEDIA:        { label: 'Media Team',    color: 'bg-blue-50 text-blue-700',  icon: Shield },
  EDITOR:       { label: 'Editor',        color: 'bg-green-50 text-green',     icon: Shield },
  CONTRIBUTOR:  { label: 'Contributor',   color: 'bg-gray-100 text-gray-500', icon: Shield },
};

interface UserForm { name: string; email: string; password: string; role: string; department: string; }

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<any | null>(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<UserForm>({ name: '', email: '', password: '', role: 'CONTRIBUTOR', department: '' });

  const token = typeof window !== 'undefined' ? localStorage.getItem('saus_token') : '';

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/users?search=${search}`, { headers: { Authorization: `Bearer ${token}` } });
      setUsers((await res.json()).data || []);
    } catch { toast.error('Failed to load users'); }
    setLoading(false);
  }

  useEffect(() => { fetchUsers(); }, [search]);

  function openCreate() {
    setEditUser(null);
    setForm({ name: '', email: '', password: '', role: 'CONTRIBUTOR', department: '' });
    setShowModal(true);
  }

  function openEdit(user: any) {
    setEditUser(user);
    setForm({ name: user.name, email: user.email, password: '', role: user.role, department: user.department || '' });
    setShowModal(true);
  }

  async function saveUser() {
    if (!form.name || !form.email) return toast.error('Name and email are required');
    if (!editUser && !form.password) return toast.error('Password is required for new users');

    const endpoint = editUser ? `${API}/users/${editUser.id}` : `${API}/users`;
    const method = editUser ? 'PUT' : 'POST';
    const body = editUser ? { name: form.name, role: form.role, department: form.department } : form;

    try {
      const res = await fetch(endpoint, {
        method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success(editUser ? 'User updated' : 'User created');
      setShowModal(false);
      fetchUsers();
    } catch (err: any) { toast.error(err.message); }
  }

  async function toggleActive(user: any) {
    await fetch(`${API}/users/${user.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ isActive: !user.isActive }),
    });
    toast.success(user.isActive ? 'User deactivated' : 'User activated');
    fetchUsers();
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-navy">Users & Roles</h1>
          <p className="text-sm text-gray-400 mt-0.5">{users.length} accounts registered</p>
        </div>
        <button onClick={openCreate} className="btn-primary self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      {/* Role legend */}
      <div className="card p-3 flex flex-wrap gap-2">
        {ROLES.map(role => {
          const { label, color, icon: Icon } = ROLE_CONFIG[role];
          return (
            <span key={role} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${color}`}>
              <Icon className="w-3 h-3" /> {label}
            </span>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search users…" className="input pl-8" />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-6 h-6 border-2 border-navy border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-base">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th className="hidden md:table-cell">Department</th>
                  <th>Status</th>
                  <th className="hidden lg:table-cell">Last Login</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => {
                  const { label, color, icon: RoleIcon } = ROLE_CONFIG[user.role] || ROLE_CONFIG.CONTRIBUTOR;
                  return (
                    <tr key={user.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-navy-50 border border-gray-200 flex items-center justify-center text-sm font-bold text-navy flex-shrink-0">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-navy text-sm">{user.name}</div>
                            <div className="text-xs text-gray-400">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`flex items-center gap-1 w-fit px-2 py-0.5 rounded text-xs font-semibold ${color}`}>
                          <RoleIcon className="w-3 h-3" /> {label}
                        </span>
                      </td>
                      <td className="hidden md:table-cell">
                        <span className="text-sm text-gray-500">{user.department || '—'}</span>
                      </td>
                      <td>
                        <span className={`badge ${user.isActive ? 'badge-published' : 'badge-archived'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="hidden lg:table-cell">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {user.lastLoginAt
                            ? formatDistanceToNow(new Date(user.lastLoginAt), { addSuffix: true })
                            : 'Never'}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => openEdit(user)} className="btn-ghost btn-icon" title="Edit">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => toggleActive(user)}
                            className={`btn-ghost btn-icon ${user.isActive ? 'text-red-400 hover:bg-red-50' : 'text-green hover:bg-green-50'}`}
                            title={user.isActive ? 'Deactivate' : 'Activate'}>
                            <Shield className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl animate-slide-in">
            <h3 className="font-bold text-navy text-lg mb-4">
              {editUser ? 'Edit User' : 'Create New User'}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="label">Full Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Full name" className="input" />
              </div>
              <div>
                <label className="label">Email Address</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="user@saus.org.za" className="input" disabled={!!editUser} />
              </div>
              {!editUser && (
                <div>
                  <label className="label">Password</label>
                  <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Minimum 8 characters" className="input" />
                </div>
              )}
              <div>
                <label className="label">Role</label>
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="input">
                  {ROLES.map(r => <option key={r} value={r}>{ROLE_CONFIG[r].label}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Department</label>
                <input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                  placeholder="e.g. Marketing, Secretariat…" className="input" />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={saveUser} className="btn-primary flex-1 justify-center">
                {editUser ? 'Update User' : 'Create User'}
              </button>
              <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
