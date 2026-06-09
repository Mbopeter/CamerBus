import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, QrCode, MapPin, Clock, BusFront, User, Phone } from 'lucide-react';
import { bookingService } from '../api/endpoints';
import './TicketDetail.css';

export default function TicketDetail() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', code],
    queryFn: () => bookingService.getByRef(code!).then(r => r.data.data),
    enabled: !!code,
  });

  if (isLoading) return (
    <div className="ticket-detail-page">
      <div className="detail-skeleton" />
    </div>
  );

  if (!booking) return (
    <div className="ticket-detail-page">
      <div className="empty-state">
        <span className="empty-icon">❌</span>
        <h3>Ticket not found</h3>
        <button className="btn-primary" onClick={() => navigate('/tickets')}>Back to Tickets</button>
      </div>
    </div>
  );

  const isVip = booking.company_class === 'vip' || ['VIP','Luxury'].includes(booking.bus_type ?? '');
  const statusClsMap: Record<string,string> = { confirmed: 'success', pending: 'warning', cancelled: 'danger', completed: 'success' };
  const statusCls = statusClsMap[booking.status] ?? 'warning';

  return (
    <div className="ticket-detail-page">
      <div className="detail-header">
        <button className="btn-icon" onClick={() => navigate('/tickets')}><ArrowLeft size={20} /></button>
        <h2>Ticket Details</h2>
      </div>

      {/* Main Ticket Card */}
      <div className="detail-ticket glass-panel">
        {/* Top stub */}
        <div className="detail-stub-top">
          <div className="stub-brand">🚌 CamerBus</div>
          <span className={`status-badge status-${statusCls}`}>{booking.status}</span>
        </div>

        {/* Route */}
        <div className="detail-route">
          <div className="detail-city">
            <MapPin size={16} className="city-pin from" />
            <div>
              <div className="city-name">{booking.origin_city}</div>
              <div className="city-branch">{booking.origin_branch ?? '—'}</div>
            </div>
          </div>
          <div className="detail-route-line">
            <div className="rl-dot" /><div className="rl-line" />
            <BusFront size={16} className="rl-bus" />
            <div className="rl-line" /><div className="rl-dot" />
          </div>
          <div className="detail-city right">
            <MapPin size={16} className="city-pin to" />
            <div>
              <div className="city-name">{booking.dest_city}</div>
              <div className="city-branch">{booking.dest_branch ?? '—'}</div>
            </div>
          </div>
        </div>

        {/* Info grid */}
        <div className="detail-grid">
          <div className="detail-cell">
            <span className="cell-label">Date</span>
            <span className="cell-value">📅 {booking.travel_date}</span>
          </div>
          <div className="detail-cell">
            <span className="cell-label">Departure</span>
            <span className="cell-value"><Clock size={13}/> {booking.departure_time}</span>
          </div>
          <div className="detail-cell">
            <span className="cell-label">Company</span>
            <span className="cell-value">{booking.company_name}</span>
          </div>
          <div className="detail-cell">
            <span className="cell-label">Class</span>
            <span className="cell-value">{isVip ? '⭐ VIP' : '🚌 Standard'}</span>
          </div>
          <div className="detail-cell">
            <span className="cell-label">Seats</span>
            <span className="cell-value">{(booking.seats ?? []).map((s: any) => s.seat_number).join(', ') || '—'}</span>
          </div>
          <div className="detail-cell">
            <span className="cell-label">Total Paid</span>
            <span className="cell-value price">{Number(booking.total_amount ?? 0).toLocaleString()} XAF</span>
          </div>
        </div>

        {/* Perforated divider */}
        <div className="perf-divider" />

        {/* Passenger */}
        <div className="detail-passenger">
          <div className="pass-item"><User size={14}/> {booking.passenger_name ?? booking.user_name ?? '—'}</div>
          <div className="pass-item"><Phone size={14}/> {booking.passenger_phone ?? booking.user_phone ?? '—'}</div>
        </div>

        {/* Booking reference */}
        <div className="detail-ref">
          <span className="ref-label">Booking Reference</span>
          <span className="ref-code">{booking.booking_ref}</span>
        </div>

        {/* QR Code placeholder */}
        {booking.ticket_code && (
          <div className="qr-section">
            <QrCode size={20} />
            <span>Ticket Code: <strong>{booking.ticket_code}</strong></span>
            <p className="qr-hint">Show this to the bus conductor</p>
          </div>
        )}
      </div>

      {/* Actions */}
      {booking.status === 'pending' && (
        <div className="detail-actions">
          <p className="pending-msg">⏳ Awaiting payment approval from admin.</p>
        </div>
      )}
      {booking.status === 'confirmed' && (
        <div className="detail-actions">
          <p className="confirmed-msg">✅ Your ticket is confirmed. Have a safe trip!</p>
        </div>
      )}
    </div>
  );
}
