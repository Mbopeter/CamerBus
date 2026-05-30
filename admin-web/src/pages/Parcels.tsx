import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Package, Search, Truck, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export default function Parcels() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-parcels', page, statusFilter],
    queryFn: () => api.get(`/admin/parcels?page=${page}${statusFilter ? `&status=${statusFilter}` : ''}`).then(res => res.data),
  });

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.put(`/parcels/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-parcels'] }),
  });

  const parcels = data?.data || [];
  const pagination = data?.pagination || { total: 0, last_page: 1 };

  const filtered = parcels.filter((p: any) =>
    p.tracking_code?.toLowerCase().includes(search.toLowerCase()) ||
    p.sender_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.receiver_name?.toLowerCase().includes(search.toLowerCase())
  );

  const statusOptions = ['pending', 'in_transit', 'delivered', 'returned'];

  const statusConfig: Record<string, { badge: string; icon: any; label: string }> = {
    pending: { badge: 'badge-warning', icon: Clock, label: 'Pending' },
    in_transit: { badge: 'badge-neutral', icon: Truck, label: 'In Transit' },
    delivered: { badge: 'badge-success', icon: CheckCircle, label: 'Delivered' },
    returned: { badge: 'badge-danger', icon: AlertTriangle, label: 'Returned' },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Parcel Shipments</h2>
          <p style={{ color: 'var(--text-muted)' }}>Track and manage all parcels shipped via CamerBus.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select
            className="input-field"
            style={{ marginBottom: 0, width: '160px' }}
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Statuses</option>
            {statusOptions.map(s => <option key={s} value={s}>{statusConfig[s]?.label || s}</option>)}
          </select>
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="input-field"
              style={{ paddingLeft: '2.5rem', marginBottom: 0 }}
              placeholder="Search by tracking code or name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
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
                  <th>Tracking Code</th>
                  <th>Sender → Receiver</th>
                  <th>Route</th>
                  <th>Weight</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Update Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((parcel: any) => {
                  const cfg = statusConfig[parcel.status] || { badge: 'badge-neutral', icon: Package, label: parcel.status };
                  const Icon = cfg.icon;
                  return (
                    <tr key={parcel.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Package size={16} color="var(--brand-primary)" />
                          </div>
                          <span style={{ fontWeight: 600, fontFamily: 'monospace', letterSpacing: '0.05em', fontSize: '0.85rem' }}>
                            {parcel.tracking_code}
                          </span>
                        </div>
                      </td>
                      <td>
                        <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>{parcel.sender_name}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>→ {parcel.receiver_name}</p>
                        {parcel.receiver_phone && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{parcel.receiver_phone}</p>}
                      </td>
                      <td>
                        <p style={{ fontSize: '0.875rem' }}>{parcel.origin_city} → {parcel.dest_city}</p>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.875rem' }}>{parcel.weight_kg ? `${parcel.weight_kg} kg` : '—'}</span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--status-success)' }}>
                          {parcel.price ? `${Number(parcel.price).toLocaleString()} XAF` : '—'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${cfg.badge}`} style={{ display: 'inline-flex', gap: '0.25rem' }}>
                          <Icon size={11} /> {cfg.label}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <select
                          className="input-field"
                          style={{ marginBottom: 0, width: '140px', padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                          value={parcel.status}
                          onChange={e => {
                            if (window.confirm(`Change status to "${e.target.value}"?`)) {
                              updateStatus({ id: parcel.id, status: e.target.value });
                            }
                          }}
                        >
                          {statusOptions.map(s => <option key={s} value={s}>{statusConfig[s]?.label || s}</option>)}
                        </select>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      <Package size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.2 }} />
                      <p>No parcels found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pagination.last_page > 1 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <button className="btn btn-secondary" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</button>
          <span style={{ display: 'flex', alignItems: 'center', padding: '0 1rem', fontSize: '0.875rem' }}>
            Page {page} of {pagination.last_page}
          </span>
          <button className="btn btn-secondary" disabled={page === pagination.last_page} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}