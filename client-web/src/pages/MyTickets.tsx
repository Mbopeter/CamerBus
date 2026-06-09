import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Ticket, ArrowRight, Clock, CheckCircle, XCircle } from 'lucide-react';
import { bookingService } from '../api/endpoints';
import { useAuthStore } from '../store/useAuthStore';
import './MyTickets.css';

const statusConfig: Record<string, { label: string; icon: any; cls: string }> = {
  confirmed:  { label: 'Confirmed',  icon: CheckCircle,  cls: 'success' },
  pending:    { label: 'Pending',    icon: Clock,        cls: 'warning' },
  cancelled:  { label: 'Cancelled',  icon: XCircle,      cls: 'danger'  },
  completed:  { label: 'Completed',  icon: CheckCircle,  cls: 'success' },
};

export default function MyTickets() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [tab, setTab] = useState<'active' | 'past'>('active');

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['bookings', user?.id],
    queryFn: () => bookingService.getByUser(user!.id).then(r => r.data.data ?? []),
    enabled: !!user?.id,
  });

  const active = bookings.filter((b: any) => ['confirmed', 'pending'].includes(b.status));
  const past   = bookings.filter((b: any) => ['cancelled', 'completed'].includes(b.status));
  const shown  = tab === 'active' ? active : past;

  return (
    <div className="tickets-page">
      <div className="tickets-header">
        <Ticket size={28} className="tickets-icon" />
        <div>
          <h1 className="tickets-title">My Tickets</h1>
          <p className="tickets-sub">Your bus booking history</p>
        </div>
      </div>

      <div className="tickets-tabs">
        <button id="tab-active" className={`tab-btn ${tab === 'active' ? 'active' : ''}`} onClick={() => setTab('active')}>
          Active <span className="tab-badge">{active.length}</span>
        </button>
        <button id="tab-past" className={`tab-btn ${tab === 'past' ? 'active' : ''}`} onClick={() => setTab('past')}>
          Past <span className="tab-badge">{past.length}</span>
        </button>
      </div>

      {isLoading ? (
        <div className="tickets-list">{[1,2,3].map(i => <div key={i} className="skeleton-card tall" />)}</div>
      ) : shown.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🎫</span>
          <h3>No {tab} tickets</h3>
          <p>{tab === 'active' ? 'Book your first trip to get started!' : 'No completed or cancelled trips yet.'}</p>
          {tab === 'active' && <button className="btn-primary" onClick={() => navigate('/')}>Book a Trip</button>}
        </div>
      ) : (
        <div className="tickets-list">
          {shown.map((booking: any) => {
            const cfg = statusConfig[booking.status] ?? statusConfig.pending;
            const StatusIcon = cfg.icon;
            return (
              <div key={booking.booking_ref} className="ticket-card glass-card"
                onClick={() => navigate(`/tickets/${booking.booking_ref}`)}>
                <div className="ticket-top">
                  <div className="ticket-ref">
                    <span className="ref-label">Booking Ref</span>
                    <span className="ref-value">{booking.booking_ref}</span>
                  </div>
                  <span className={`status-badge status-${cfg.cls}`}>
                    <StatusIcon size={12} /> {cfg.label}
                  </span>
                </div>

                <div className="ticket-route">
                  <div className="ticket-city">{booking.origin_city}</div>
                  <div className="ticket-line">
                    <div className="tl-dot" />
                    <div className="tl-track" />
                    <div className="tl-dot" />
                  </div>
                  <div className="ticket-city">{booking.dest_city}</div>
                </div>

                <div className="ticket-footer">
                  <div className="ticket-info">
                    <span>📅 {booking.travel_date}</span>
                    <span>🕐 {booking.departure_time}</span>
                    <span>🚌 {booking.company_name}</span>
                  </div>
                  <div className="ticket-price">{Number(booking.total_amount ?? 0).toLocaleString()} XAF</div>
                </div>

                <div className="ticket-arrow"><ArrowRight size={16} /></div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
