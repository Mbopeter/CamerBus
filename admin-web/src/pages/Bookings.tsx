import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Ticket, Search } from 'lucide-react';

const STATUS_CONFIG: Record<string, { badge: string; label: string }> = {
  pending:   { badge: 'badge-warning', label: 'Pending' },
  confirmed: { badge: 'badge-success', label: 'Confirmed' },
  cancelled: { badge: 'badge-danger',  label: 'Cancelled' },
  completed: { badge: 'badge-neutral', label: 'Completed' },
};

export default function Bookings() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-bookings', page, statusFilter],
    queryFn: () => api.get(`/admin/bookings?page=${page}${statusFilter ? `&status=${statusFilter}` : ''}`).then(res => res.data),
  });

  const bookings = data?.data || [];
  const pagination = data?.pagination || { total: 0, last_page: 1 };

  const filtered = bookings.filter((b: any) =>
    b.booking_ref?.toLowerCase().includes(search.toLowerCase()) ||
    b.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    b.phone?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>All Bookings</h2>
          <p style={{ color: 'var(--text-muted)' }}>View and monitor all passenger bookings across the platform.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select
            className="input-field"
            style={{ marginBottom: 0, width: '160px' }}
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Statuses</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="input-field"
              style={{ paddingLeft: '2.5rem', marginBottom: 0 }}
              placeholder="Search ref, name, phone..."
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
                  <th>Booking Ref</th>
                  <th>Passenger</th>
                  <th>Trip</th>
                  <th>Date</th>
                  <th>Seats</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b: any) => {
                  const cfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
                  return (
                    <tr key={b.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Ticket size={16} color="var(--brand-primary)" />
                          </div>
                          <span style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.85rem', letterSpacing: '0.05em' }}>{b.booking_ref}</span>
                        </div>
                      </td>
                      <td>
                        <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>{b.full_name}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.phone}</p>
                      </td>
                      <td>
                        <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>{b.origin_city} → {b.dest_city}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.company_name}</p>
                      </td>
                      <td>
                        <p style={{ fontSize: '0.875rem' }}>{b.travel_date}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{b.departure_time?.slice(0, 5)}</p>
                      </td>
                      <td>
                        <span className="badge badge-neutral">{b.passenger_count} seat(s)</span>
                      </td>
                      <td>
                        <span className={`badge ${cfg.badge}`}>{cfg.label}</span>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      <Ticket size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.2 }} />
                      <p>No bookings found.</p>
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