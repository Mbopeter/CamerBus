import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { CalendarDays, Plus, Loader2, Search, Clock, BusFront, CheckCircle } from 'lucide-react';

export default function Schedules() {
  const { admin } = useAuthStore();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState(String(admin?.company_id || ''));

  const [newSchedule, setNewSchedule] = useState({
    route_id: '',
    bus_id: '',
    travel_date: '',
    departure_time: '',
    shift: 'morning',
    origin_branch_id: '',
    destination_branch_id: '',
  });

  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: () => api.get('/companies').then(res => res.data.data),
    enabled: admin?.role === 'super_admin',
  });

  const { data: routes = [] } = useQuery({
    queryKey: ['routes', selectedCompanyId],
    queryFn: () => api.get(`/companies/${selectedCompanyId}/routes`).then(res => res.data.data),
    enabled: !!selectedCompanyId,
  });

  const { data: buses = [] } = useQuery({
    queryKey: ['buses'],
    queryFn: () => api.get('/admin/buses').then(res => res.data.data),
  });

  // Fetch today's & upcoming schedules via dashboard endpoint (reuse)
  const { data: dashData, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/admin/dashboard').then(res => res.data.data),
  });

  const { mutate: createSchedule, isPending: isCreating } = useMutation({
    mutationFn: (data: any) => api.post('/schedules', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setIsModalOpen(false);
      setNewSchedule({ route_id: '', bus_id: '', travel_date: '', departure_time: '', shift: 'morning', origin_branch_id: '', destination_branch_id: '' });
    },
    onError: (err: any) => alert(err.response?.data?.message || 'Failed to create schedule'),
  });

  const { mutate: markDeparted } = useMutation({
    mutationFn: (id: number) => api.put(`/schedules/${id}/depart`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] }),
  });

  const departures = dashData?.todays_departures || [];
  const filtered = departures.filter((d: any) =>
    d.origin_city?.toLowerCase().includes(search.toLowerCase()) ||
    d.dest_city?.toLowerCase().includes(search.toLowerCase()) ||
    d.plate_number?.toLowerCase().includes(search.toLowerCase())
  );

  const availableBuses = buses.filter((b: any) => !b.is_faulty);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Schedule Management</h2>
          <p style={{ color: 'var(--text-muted)' }}>Create trips and manage today's departures.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '250px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="input-field"
              style={{ paddingLeft: '2.5rem', marginBottom: 0 }}
              placeholder="Search departures..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            <Plus size={18} /> New Schedule
          </button>
        </div>
      </div>

      {/* Today's Departures */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CalendarDays size={18} color="var(--brand-primary)" />
          <h3 style={{ fontSize: '1rem' }}>Today's Departures</h3>
        </div>
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
        ) : (
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Route</th>
                  <th>Company</th>
                  <th>Bus</th>
                  <th>Seats</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((dep: any) => (
                  <tr key={dep.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={14} color="var(--text-muted)" />
                        <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{dep.departure_time?.slice(0, 5)}</span>
                      </div>
                    </td>
                    <td>
                      <p style={{ fontWeight: 500 }}>{dep.origin_city} → {dep.dest_city}</p>
                    </td>
                    <td>{dep.company_name}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <BusFront size={14} color="var(--brand-primary)" />
                        <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{dep.plate_number}</span>
                        <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>{dep.bus_type}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: dep.available_seats < 5 ? 'var(--status-danger)' : 'var(--status-success)' }}>
                        {dep.available_seats}
                      </span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}> avail</span>
                    </td>
                    <td>
                      <span className={`badge ${
                        dep.status === 'scheduled' ? 'badge-warning' :
                        dep.status === 'boarding' ? 'badge-success' :
                        dep.status === 'departed' ? 'badge-neutral' : 'badge-danger'
                      }`}>{dep.status}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {dep.status === 'boarding' && (
                        <button
                          onClick={() => { if (window.confirm('Mark this bus as departed?')) markDeparted(dep.id); }}
                          className="btn btn-secondary"
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', display: 'inline-flex', gap: '0.25rem' }}
                        >
                          <CheckCircle size={14} /> Mark Departed
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      <BusFront size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.2 }} />
                      <p>No departures found for today.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Schedule Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem' }}>Create New Schedule</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>✕</button>
            </div>
            <div className="modal-body">
              <form id="schedule-form" onSubmit={(e) => {
                e.preventDefault();
                createSchedule(newSchedule);
              }}>
                {admin?.role === 'super_admin' && (
                  <div className="input-group">
                    <label className="input-label">Company *</label>
                    <select className="input-field" required value={selectedCompanyId} onChange={e => { setSelectedCompanyId(e.target.value); setNewSchedule(s => ({ ...s, route_id: '', bus_id: '' })); }}>
                      <option value="">Select a company</option>
                      {companies.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                )}

                <div className="input-group">
                  <label className="input-label">Route *</label>
                  <select className="input-field" required value={newSchedule.route_id} onChange={e => setNewSchedule(s => ({ ...s, route_id: e.target.value }))}>
                    <option value="">Select a route</option>
                    {routes.map((r: any) => <option key={r.id} value={r.id}>{r.origin_city} → {r.dest_city}</option>)}
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">Bus *</label>
                  <select className="input-field" required value={newSchedule.bus_id} onChange={e => setNewSchedule(s => ({ ...s, bus_id: e.target.value }))}>
                    <option value="">Select a bus</option>
                    {availableBuses.map((b: any) => <option key={b.id} value={b.id}>{b.bus_signature || b.plate_number} — {b.bus_type} ({b.total_seats} seats)</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="input-group">
                    <label className="input-label">Travel Date *</label>
                    <input type="date" className="input-field" required value={newSchedule.travel_date} min={new Date().toISOString().split('T')[0]} onChange={e => setNewSchedule(s => ({ ...s, travel_date: e.target.value }))} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Departure Time *</label>
                    <input type="time" className="input-field" required value={newSchedule.departure_time} onChange={e => setNewSchedule(s => ({ ...s, departure_time: e.target.value }))} />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Shift</label>
                  <select className="input-field" value={newSchedule.shift} onChange={e => setNewSchedule(s => ({ ...s, shift: e.target.value }))}>
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="night">Night</option>
                  </select>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
              <button form="schedule-form" type="submit" className="btn btn-primary" disabled={isCreating}>
                {isCreating ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : 'Create Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}