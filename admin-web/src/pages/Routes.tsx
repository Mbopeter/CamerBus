import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { Map, Plus, Trash2, Loader2, Search } from 'lucide-react';

export default function RoutesPage() {
  const { admin } = useAuthStore();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [newRoute, setNewRoute] = useState({ 
    company_id: admin?.company_id || '', 
    origin_city_id: '', 
    dest_city_id: '', 
    price_standard: '', 
    price_vip: '', 
    estimated_duration_minutes: '' 
  });

  // Since we don't have an endpoint that just returns all routes platform-wide easily (RouteController::search requires cities),
  // we'll fetch companies and their routes if super_admin, or just our routes if company_admin.
  // Actually, wait, AdminController doesn't have an "allRoutes" endpoint. Let's just assume we manage routes per company.
  // For simplicity, we will fetch companies, then for the selected company, fetch their routes.
  const [selectedCompanyId, setSelectedCompanyId] = useState(admin?.company_id || '');

  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: () => api.get('/companies').then(res => res.data.data),
    enabled: admin?.role === 'super_admin'
  });

  const { data: routes = [], isLoading } = useQuery({
    queryKey: ['routes', selectedCompanyId],
    queryFn: () => api.get(`/companies/${selectedCompanyId}/routes`).then(res => res.data.data),
    enabled: !!selectedCompanyId
  });

  const { data: cities = [] } = useQuery({
    queryKey: ['cities'],
    queryFn: () => api.get('/cities').then(res => res.data.data),
  });

  const { mutate: createRoute, isPending: isCreating } = useMutation({
    mutationFn: (data: any) => api.post('/admin/routes', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      setIsModalOpen(false);
      setNewRoute({ ...newRoute, origin_city_id: '', dest_city_id: '', price_standard: '', price_vip: '', estimated_duration_minutes: '' });
    },
    onError: (err: any) => alert(err.response?.data?.message || 'Failed to create route')
  });

  const { mutate: deleteRoute, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/routes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    }
  });

  const filtered = routes.filter((r: any) => 
    r.origin_city.toLowerCase().includes(search.toLowerCase()) || 
    r.dest_city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Route Management</h2>
          <p style={{ color: 'var(--text-muted)' }}>Configure pricing and durations for intercity paths.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {admin?.role === 'super_admin' && (
            <select 
              className="input-field" 
              style={{ marginBottom: 0, width: '200px' }}
              value={selectedCompanyId} 
              onChange={e => setSelectedCompanyId(e.target.value)}
            >
              <option value="">Select Company...</option>
              {companies.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          )}
          <div style={{ position: 'relative', width: '250px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="input-field" 
              style={{ paddingLeft: '2.5rem', marginBottom: 0 }} 
              placeholder="Search cities..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="btn btn-primary"
            disabled={!selectedCompanyId}
          >
            <Plus size={18} /> Add Route
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {!selectedCompanyId ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Map size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.2 }} />
            <p>Please select a company to view their routes.</p>
          </div>
        ) : isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Origin &rarr; Destination</th>
                  <th>Duration</th>
                  <th>Standard Price</th>
                  <th>VIP Price</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((route: any) => (
                  <tr key={route.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Map size={16} color="var(--brand-primary)" />
                        </div>
                        <div>
                          <p style={{ fontWeight: 600 }}>{route.origin_city} &rarr; {route.dest_city}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Route #{route.id}</p>
                        </div>
                      </div>
                    </td>
                    <td>{Math.floor(route.estimated_duration_minutes / 60)}h {route.estimated_duration_minutes % 60}m</td>
                    <td><span style={{ fontWeight: 600 }}>{Number(route.price_standard).toLocaleString()} XAF</span></td>
                    <td><span style={{ fontWeight: 600, color: 'var(--brand-primary)' }}>{Number(route.price_vip).toLocaleString()} XAF</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        onClick={() => {
                          if (window.confirm('Delete this route? This will prevent future bookings on this path.')) {
                            deleteRoute(route.id);
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
                      No routes found.
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
              <h3 style={{ fontSize: '1.25rem' }}>Add New Route</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>✕</button>
            </div>
            <div className="modal-body">
              <form id="add-route-form" onSubmit={(e) => {
                e.preventDefault();
                createRoute({ ...newRoute, company_id: selectedCompanyId });
              }}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="input-group">
                    <label className="input-label">Origin City *</label>
                    <select className="input-field" required value={newRoute.origin_city_id} onChange={e => setNewRoute({...newRoute, origin_city_id: e.target.value})}>
                      <option value="">Select...</option>
                      {cities.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Destination City *</label>
                    <select className="input-field" required value={newRoute.dest_city_id} onChange={e => setNewRoute({...newRoute, dest_city_id: e.target.value})}>
                      <option value="">Select...</option>
                      {cities.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="input-group">
                    <label className="input-label">Standard Price (XAF) *</label>
                    <input type="number" className="input-field" required min="500" value={newRoute.price_standard} onChange={e => setNewRoute({...newRoute, price_standard: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">VIP Price (XAF) *</label>
                    <input type="number" className="input-field" required min="500" value={newRoute.price_vip} onChange={e => setNewRoute({...newRoute, price_vip: e.target.value})} />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Estimated Duration (Minutes) *</label>
                  <input type="number" className="input-field" required min="30" value={newRoute.estimated_duration_minutes} onChange={e => setNewRoute({...newRoute, estimated_duration_minutes: e.target.value})} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>e.g., 300 for 5 hours</span>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
              <button form="add-route-form" type="submit" className="btn btn-primary" disabled={isCreating}>
                {isCreating ? <Loader2 size={18} className="animate-spin" /> : 'Save Route'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
