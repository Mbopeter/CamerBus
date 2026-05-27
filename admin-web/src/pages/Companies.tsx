import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { Building2, Plus, Trash2, Loader2, Search } from 'lucide-react';

export default function Companies() {
  const { admin } = useAuthStore();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCompany, setNewCompany] = useState({ name: '', slug: '', hq_city: '', phone: '', email: '' });

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: () => api.get('/companies').then(res => res.data.data),
  });

  const { mutate: createCompany, isPending: isCreating } = useMutation({
    mutationFn: (data: any) => api.post('/admin/companies', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      setIsModalOpen(false);
      setNewCompany({ name: '', slug: '', hq_city: '', phone: '', email: '' });
    }
  });

  const { mutate: deleteCompany, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/companies/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    }
  });

  if (admin?.role !== 'super_admin') {
    return <div style={{ color: 'var(--status-danger)' }}>Access Denied. Super Admin only.</div>;
  }

  const filtered = companies.filter((c: any) => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="input-field" 
            style={{ paddingLeft: '2.5rem', marginBottom: 0 }} 
            placeholder="Search companies..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <Plus size={18} /> Add Company
        </button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Company Name</th>
                  <th>HQ City</th>
                  <th>Contact</th>
                  <th>Stats</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((co: any) => (
                  <tr key={co.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Building2 size={16} color="var(--brand-primary)" />
                        </div>
                        <div>
                          <p style={{ fontWeight: 600 }}>{co.name}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{co.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td>{co.hq_city || '--'}</td>
                    <td>
                      <p style={{ fontSize: '0.875rem' }}>{co.phone || '--'}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{co.email}</p>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <span className="badge badge-neutral">{co.branch_count} branches</span>
                        <span className="badge badge-neutral">{co.bus_count} buses</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete ${co.name}? This will also delete all associated branches, routes, and buses.`)) {
                            deleteCompany(co.id);
                          }
                        }}
                        className="btn btn-danger" 
                        style={{ padding: '0.5rem', borderRadius: '8px' }}
                        disabled={isDeleting}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No companies found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem' }}>Add New Company</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>✕</button>
            </div>
            <div className="modal-body">
              <form id="add-company-form" onSubmit={(e) => {
                e.preventDefault();
                createCompany(newCompany);
              }}>
                <div className="input-group">
                  <label className="input-label">Company Name *</label>
                  <input type="text" className="input-field" required value={newCompany.name} onChange={e => setNewCompany({...newCompany, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')})} />
                </div>
                <div className="input-group">
                  <label className="input-label">Slug *</label>
                  <input type="text" className="input-field" required value={newCompany.slug} onChange={e => setNewCompany({...newCompany, slug: e.target.value})} />
                </div>
                <div className="input-group">
                  <label className="input-label">HQ City</label>
                  <input type="text" className="input-field" value={newCompany.hq_city} onChange={e => setNewCompany({...newCompany, hq_city: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="input-group">
                    <label className="input-label">Phone</label>
                    <input type="text" className="input-field" value={newCompany.phone} onChange={e => setNewCompany({...newCompany, phone: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Email</label>
                    <input type="email" className="input-field" value={newCompany.email} onChange={e => setNewCompany({...newCompany, email: e.target.value})} />
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
              <button form="add-company-form" type="submit" className="btn btn-primary" disabled={isCreating}>
                {isCreating ? <Loader2 size={18} className="animate-spin" /> : 'Save Company'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
