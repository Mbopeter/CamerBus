import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Bus, Plus, AlertTriangle, CheckCircle, Loader2, Search } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function Buses() {
  const { admin } = useAuthStore();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [newBus, setNewBus] = useState({ 
    company_id: admin?.company_id || '', 
    plate_number: '', 
    name: '', 
    bus_type: '', 
    total_seats: 70 
  });

  const { data: buses = [], isLoading } = useQuery({
    queryKey: ['buses'],
    queryFn: () => api.get('/admin/buses').then(res => res.data.data),
  });

  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: () => api.get('/companies').then(res => res.data.data),
    enabled: admin?.role === 'super_admin'
  });

  const { mutate: createBus, isPending: isCreating } = useMutation({
    mutationFn: (data: any) => api.post('/admin/buses', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buses'] });
      setIsModalOpen(false);
      setNewBus({ company_id: admin?.company_id || '', plate_number: '', name: '', bus_type: '', total_seats: 70 });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to create bus');
    }
  });

  const { mutate: toggleFaulty, isPending: isToggling } = useMutation({
    mutationFn: ({ id, isFaulty }: { id: number, isFaulty: boolean }) => 
      api.put(`/admin/buses/${id}/${isFaulty ? 'operational' : 'faulty'}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buses'] });
    }
  });

  const filtered = buses.filter((b: any) => 
    b.plate_number.toLowerCase().includes(search.toLowerCase()) || 
    b.bus_signature?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Fleet Management</h2>
          <p style={{ color: 'var(--text-muted)' }}>Manage buses, add new vehicles, and report breakdowns.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '250px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="input-field" 
              style={{ paddingLeft: '2.5rem', marginBottom: 0 }} 
              placeholder="Search plate or ID..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            <Plus size={18} /> Add Bus
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Bus ID & Plate</th>
                  {admin?.role === 'super_admin' && <th>Company</th>}
                  <th>Type & Capacity</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((bus: any) => (
                  <tr key={bus.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Bus size={16} color={bus.is_faulty ? 'var(--status-danger)' : 'var(--brand-primary)'} />
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, fontFamily: 'monospace', letterSpacing: '0.05em' }}>{bus.bus_signature || bus.plate_number}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{bus.name || bus.plate_number}</p>
                        </div>
                      </div>
                    </td>
                    {admin?.role === 'super_admin' && <td>{bus.company_name}</td>}
                    <td>
                      <span className="badge badge-neutral" style={{ marginRight: '0.5rem' }}>{bus.bus_type}</span>
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{bus.total_seats} seats</span>
                    </td>
                    <td>
                      {bus.is_faulty ? (
                        <span className="badge badge-danger" style={{ display: 'inline-flex', gap: '0.25rem' }}>
                          <AlertTriangle size={12} /> Under Maintenance
                        </span>
                      ) : (
                        <span className="badge badge-success" style={{ display: 'inline-flex', gap: '0.25rem' }}>
                          <CheckCircle size={12} /> Operational
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        onClick={() => {
                          if (window.confirm(bus.is_faulty ? 'Mark this bus as operational?' : 'Report breakdown? This will cancel all upcoming UNBOOKED schedules for this bus.')) {
                            toggleFaulty({ id: bus.id, isFaulty: bus.is_faulty });
                          }
                        }}
                        className={`btn ${bus.is_faulty ? 'btn-secondary' : 'btn-danger'}`}
                        style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem' }}
                        disabled={isToggling}
                      >
                        {bus.is_faulty ? 'Set Operational' : 'Report Faulty'}
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No buses found.
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
              <h3 style={{ fontSize: '1.25rem' }}>Add New Bus</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>✕</button>
            </div>
            <div className="modal-body">
              <form id="add-bus-form" onSubmit={(e) => {
                e.preventDefault();
                createBus(newBus);
              }}>
                {admin?.role === 'super_admin' && (
                  <div className="input-group">
                    <label className="input-label">Company *</label>
                    <select 
                      className="input-field" 
                      required 
                      value={newBus.company_id} 
                      onChange={e => setNewBus({...newBus, company_id: e.target.value})}
                    >
                      <option value="">Select a company</option>
                      {companies.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="input-group">
                    <label className="input-label">Plate Number *</label>
                    <input type="text" className="input-field" required placeholder="e.g. NW-0123-A" value={newBus.plate_number} onChange={e => setNewBus({...newBus, plate_number: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Bus Name</label>
                    <input type="text" className="input-field" placeholder="Optional" value={newBus.name} onChange={e => setNewBus({...newBus, name: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="input-group">
                    <label className="input-label">Bus Type *</label>
                    <select 
                      className="input-field" 
                      required 
                      value={newBus.bus_type} 
                      onChange={e => {
                        const type = e.target.value;
                        let defaultSeats = 70;
                        if (['VIP', 'Luxury'].includes(type)) defaultSeats = 30;
                        else if (type === 'Coaster') defaultSeats = 30;
                        else if (type === 'Minibus') defaultSeats = 15;
                        setNewBus({...newBus, bus_type: type, total_seats: defaultSeats});
                      }}
                    >
                      <option value="" disabled>Select Bus Type</option>
                      <option value="Standard">Standard</option>
                      <option value="VIP">VIP</option>
                      <option value="Luxury">Luxury</option>
                      <option value="Coaster">Coaster</option>
                      <option value="Minibus">Minibus</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Total Seats *</label>
                    <input type="number" className="input-field" required min="10" max="100" value={newBus.total_seats} onChange={e => setNewBus({...newBus, total_seats: Number(e.target.value)})} />
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
              <button form="add-bus-form" type="submit" className="btn btn-primary" disabled={isCreating}>
                {isCreating ? <Loader2 size={18} className="animate-spin" /> : 'Register Bus'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
