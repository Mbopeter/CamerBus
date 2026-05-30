import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { Users, Plus, Loader2, Search, ShieldCheck, ShieldAlert, Clock } from 'lucide-react';

const ROLE_CONFIG: Record<string, { label: string; badge: string; icon: any }> = {
  super_admin:   { label: 'Super Admin',   badge: 'badge-danger',  icon: ShieldAlert },
  company_admin: { label: 'Company Admin', badge: 'badge-warning', icon: ShieldCheck },
  branch_admin:  { label: 'Branch Admin',  badge: 'badge-neutral', icon: Users },
};

export default function Admins() {
  const { admin } = useAuthStore();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    full_name: '',
    email: '',
    password: '',
    role: admin?.role === 'company_admin' ? 'branch_admin' : 'company_admin',
    company_id: admin?.company_id || '',
    branch_id: '',
  });

  const { data: admins = [], isLoading } = useQuery({
    queryKey: ['admins'],
    queryFn: () => api.get('/admin/admins').then(res => res.data.data),
  });

  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: () => api.get('/companies').then(res => res.data.data),
    enabled: admin?.role === 'super_admin',
  });

  const { data: branches = [] } = useQuery({
    queryKey: ['branches'],
    queryFn: () => api.get('/branches').then(res => res.data.data),
  });

  const { mutate: createAdmin, isPending: isCreating, error: createError } = useMutation({
    mutationFn: (data: any) => api.post('/admin/admins', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      setIsModalOpen(false);
      setNewAdmin({ full_name: '', email: '', password: '', role: admin?.role === 'company_admin' ? 'branch_admin' : 'company_admin', company_id: admin?.company_id || '', branch_id: '' });
    },
  });

  const filtered = admins.filter((a: any) =>
    a.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    a.email?.toLowerCase().includes(search.toLowerCase()) ||
    a.company_name?.toLowerCase().includes(search.toLowerCase())
  );

  const availableRoles = admin?.role === 'super_admin'
    ? ['company_admin', 'branch_admin']
    : ['branch_admin'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Admin Users</h2>
          <p style={{ color: 'var(--text-muted)' }}>Manage admins and their roles across companies and branches.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="input-field"
              style={{ paddingLeft: '2.5rem', marginBottom: 0 }}
              placeholder="Search admins..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            <Plus size={18} /> Add Admin
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
        ) : (
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Admin</th>
                  <th>Role</th>
                  <th>Company / Branch</th>
                  <th>Last Login</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a: any) => {
                  const cfg = ROLE_CONFIG[a.role] || ROLE_CONFIG.branch_admin;
                  const Icon = cfg.icon;
                  return (
                    <tr key={a.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div className="avatar" style={{ width: '38px', height: '38px', fontSize: '1rem', background: 'var(--brand-gradient)', color: 'white', border: 'none' }}>
                            {a.full_name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{a.full_name}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{a.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${cfg.badge}`} style={{ display: 'inline-flex', gap: '0.25rem' }}>
                          <Icon size={11} /> {cfg.label}
                        </span>
                      </td>
                      <td>
                        <p style={{ fontSize: '0.875rem' }}>{a.company_name || '—'}</p>
                        {a.branch_name && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{a.branch_name}</p>}
                      </td>
                      <td>
                        {a.last_login ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                            <Clock size={13} />
                            {new Date(a.last_login).toLocaleDateString('fr-CM', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Never</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${a.is_active ? 'badge-success' : 'badge-danger'}`}>
                          {a.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      <Users size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.2 }} />
                      <p>No admins found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem' }}>Add New Admin</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>✕</button>
            </div>
            <div className="modal-body">
              {createError && (
                <div style={{ backgroundColor: 'var(--status-danger-bg)', color: 'var(--status-danger)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
                  {(createError as any)?.response?.data?.message || 'Failed to create admin'}
                </div>
              )}
              <form id="admin-form" onSubmit={(e) => { e.preventDefault(); createAdmin(newAdmin); }}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="input-label">Full Name *</label>
                    <input type="text" className="input-field" required value={newAdmin.full_name} onChange={e => setNewAdmin(a => ({ ...a, full_name: e.target.value }))} />
                  </div>
                  <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="input-label">Email Address *</label>
                    <input type="email" className="input-field" required value={newAdmin.email} onChange={e => setNewAdmin(a => ({ ...a, email: e.target.value }))} />
                  </div>
                  <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="input-label">Password *</label>
                    <input type="password" className="input-field" required minLength={8} value={newAdmin.password} onChange={e => setNewAdmin(a => ({ ...a, password: e.target.value }))} placeholder="Min. 8 characters" />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Role *</label>
                  <select className="input-field" required value={newAdmin.role} onChange={e => setNewAdmin(a => ({ ...a, role: e.target.value }))}>
                    {availableRoles.map(r => <option key={r} value={r}>{ROLE_CONFIG[r]?.label || r}</option>)}
                  </select>
                </div>

                {admin?.role === 'super_admin' && (
                  <div className="input-group">
                    <label className="input-label">Company {newAdmin.role !== 'branch_admin' ? '*' : ''}</label>
                    <select className="input-field" value={String(newAdmin.company_id)} onChange={e => setNewAdmin(a => ({ ...a, company_id: e.target.value }))}>
                      <option value="">Select company</option>
                      {companies.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                )}

                {newAdmin.role === 'branch_admin' && (
                  <div className="input-group">
                    <label className="input-label">Branch *</label>
                    <select className="input-field" required value={String(newAdmin.branch_id)} onChange={e => setNewAdmin(a => ({ ...a, branch_id: e.target.value }))}>
                      <option value="">Select branch</option>
                      {branches.map((b: any) => <option key={b.id} value={b.id}>{b.name} — {b.city}</option>)}
                    </select>
                  </div>
                )}
              </form>
            </div>
            <div className="modal-footer">
              <button onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
              <button form="admin-form" type="submit" className="btn btn-primary" disabled={isCreating}>
                {isCreating ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : 'Create Admin'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}