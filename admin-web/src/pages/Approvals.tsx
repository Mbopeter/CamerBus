import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, BASE_URL } from '../services/api';
import { CheckSquare, XSquare, Search, ExternalLink } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function Approvals() {
  const { admin } = useAuthStore();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['pending-payments', page],
    queryFn: () => api.get(`/admin/payments?page=${page}`).then(res => res.data),
  });

  const { mutate: approvePayment, isPending: isApproving } = useMutation({
    mutationFn: (id: number) => api.put(`/admin/payments/${id}/approve`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-payments'] });
    }
  });

  const { mutate: rejectPayment, isPending: isRejecting } = useMutation({
    mutationFn: (id: number) => api.put(`/admin/payments/${id}/reject`, { reason: 'Invalid receipt' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-payments'] });
    }
  });

  const payments = data?.data || [];
  const pagination = data?.pagination || { total: 0, last_page: 1 };

  const filtered = payments.filter((p: any) => 
    p.booking_ref.toLowerCase().includes(search.toLowerCase()) || 
    p.passenger_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Pending Approvals</h2>
          <p style={{ color: 'var(--text-muted)' }}>Review and approve mobile money or bank transfer payments to issue tickets.</p>
        </div>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="input-field" 
            style={{ paddingLeft: '2.5rem', marginBottom: 0 }} 
            placeholder="Search bookings..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
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
                  <th>Booking Ref</th>
                  <th>Passenger</th>
                  <th>Trip Details</th>
                  <th>Payment Info</th>
                  <th>Receipt</th>
                  {admin?.role !== 'super_admin' && <th style={{ textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((pay: any) => (
                  <tr key={pay.id}>
                    <td>
                      <p style={{ fontWeight: 600, fontFamily: 'monospace', letterSpacing: '0.05em' }}>{pay.booking_ref}</p>
                      <span className="badge badge-warning" style={{ marginTop: '0.25rem' }}>{pay.status}</span>
                    </td>
                    <td>
                      <p style={{ fontWeight: 500 }}>{pay.passenger_name}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{pay.phone}</p>
                      <span className="badge badge-neutral" style={{ marginTop: '0.25rem' }}>{pay.passenger_count} Seat(s)</span>
                    </td>
                    <td>
                      <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>{pay.origin_city} &rarr; {pay.dest_city}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {pay.company_name} • {pay.travel_date} {pay.departure_time?.slice(0,5) ?? ''}
                      </p>
                    </td>
                    <td>
                      {admin?.role !== 'super_admin' ? (
                        <>
                          <p style={{ fontWeight: 600, color: 'var(--status-success)' }}>{Number(pay.amount).toLocaleString()} XAF</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{pay.method.replace('_', ' ')}</p>
                        </>
                      ) : (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Amount hidden</p>
                      )}
                    </td>
                    <td>
                      {pay.receipts && pay.receipts.length > 0 ? (
                        <a 
                          href={`${BASE_URL}/${pay.receipts[0].file_path}`} 
                          target="_blank" 
                          rel="noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', backgroundColor: 'var(--bg-tertiary)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}
                        >
                          <ExternalLink size={12} /> View Receipt
                        </a>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--status-warning)' }}>No receipt uploaded</span>
                      )}
                    </td>
                    {admin?.role !== 'super_admin' && (
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button 
                            onClick={() => {
                              if (window.confirm('Reject this payment? This will cancel the booking.')) {
                                rejectPayment(pay.id);
                              }
                            }}
                            className="btn btn-secondary" 
                            style={{ padding: '0.5rem', borderRadius: '8px', color: 'var(--status-danger)' }}
                            disabled={isApproving || isRejecting}
                            title="Reject Payment"
                          >
                            <XSquare size={18} />
                          </button>
                          <button 
                            onClick={() => {
                              if (window.confirm('Approve this payment and issue tickets?')) {
                                approvePayment(pay.id);
                              }
                            }}
                            className="btn btn-primary" 
                            style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: 'var(--status-success)' }}
                            disabled={isApproving || isRejecting}
                            title="Approve & Issue Tickets"
                          >
                            <CheckSquare size={18} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No pending approvals found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.last_page > 1 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <button 
            className="btn btn-secondary" 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </button>
          <span style={{ display: 'flex', alignItems: 'center', padding: '0 1rem', fontSize: '0.875rem' }}>
            Page {page} of {pagination.last_page}
          </span>
          <button 
            className="btn btn-secondary" 
            disabled={page === pagination.last_page}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </button>
        </div>
      )}

    </div>
  );
}
