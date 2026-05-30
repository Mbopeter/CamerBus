import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import {
  DollarSign, Ticket, Clock, Building2, BusFront, Package, TrendingUp, CalendarDays
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Overview() {
  const { admin } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/admin/dashboard').then(res => res.data.data),
    refetchInterval: 60_000, // refresh every minute
  });

  const stats = data?.stats || {};

  const statCards = [
    { title: 'Total Revenue',      value: `${(stats.total_revenue || 0).toLocaleString()} XAF`,   icon: DollarSign,    color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)',  show: true },
    { title: "Today's Revenue",    value: `${(stats.today_revenue || 0).toLocaleString()} XAF`,   icon: TrendingUp,    color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)',  show: true },
    { title: 'Total Bookings',     value: stats.total_bookings || 0,                               icon: Ticket,        color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.1)',  show: true },
    { title: 'Pending Approvals',  value: stats.pending_payments || 0,                             icon: Clock,         color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)',  show: true, alert: (stats.pending_payments || 0) > 0, link: '/approvals' },
    { title: 'Active Schedules',   value: stats.active_schedules || 0,                             icon: CalendarDays,  color: '#EC4899', bg: 'rgba(236, 72, 153, 0.1)',  show: true },
    { title: 'Total Parcels',      value: stats.total_parcels || 0,                                icon: Package,       color: '#06B6D4', bg: 'rgba(6, 182, 212, 0.1)',   show: true },
    { title: 'Active Companies',   value: stats.total_companies || 0,                              icon: Building2,     color: '#A78BFA', bg: 'rgba(167, 139, 250, 0.1)', show: admin?.role === 'super_admin' },
    { title: "Today's Confirmed",  value: stats.confirmed_today || 0,                              icon: BusFront,      color: '#34D399', bg: 'rgba(52, 211, 153, 0.1)',  show: true },
  ];

  const visibleCards = statCards.filter(c => c.show);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* Pending approval alert banner */}
      {(stats.pending_payments || 0) > 0 && (
        <Link to="/approvals" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: 'var(--border-radius-md)',
            padding: '0.875rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            cursor: 'pointer',
            transition: 'background 0.15s ease',
          }}>
            <Clock size={18} color="#F59E0B" />
            <span style={{ color: '#F59E0B', fontWeight: 600, fontSize: '0.875rem' }}>
              {stats.pending_payments} payment{stats.pending_payments > 1 ? 's' : ''} awaiting your approval — click to review
            </span>
          </div>
        </Link>
      )}

      {/* Stats Grid */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card" style={{ height: '90px', opacity: 0.4, animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      ) : (
        <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
          {visibleCards.map((stat, idx) => {
            const Icon = stat.icon;
            const card = (
              <div
                key={idx}
                className="card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.25rem',
                  cursor: stat.link ? 'pointer' : 'default',
                  borderColor: stat.alert ? 'rgba(245,158,11,0.3)' : undefined,
                  transition: 'transform 0.15s ease, border-color 0.15s ease',
                }}
                onMouseEnter={e => { if (stat.link) (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; }}
              >
                <div style={{
                  width: '52px', height: '52px',
                  borderRadius: '14px',
                  backgroundColor: stat.bg,
                  color: stat.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={24} />
                </div>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {stat.title}
                  </p>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: stat.alert ? stat.color : 'var(--text-primary)', lineHeight: 1 }}>
                    {stat.value}
                  </h3>
                </div>
              </div>
            );
            return stat.link ? <Link key={idx} to={stat.link} style={{ textDecoration: 'none' }}>{card}</Link> : card;
          })}
        </div>
      )}

      {/* Today's Departures */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CalendarDays size={18} color="var(--brand-primary)" />
            <h3 style={{ fontSize: '1.125rem' }}>Today's Departures</h3>
          </div>
          <Link to="/schedules" style={{ fontSize: '0.8rem', color: 'var(--brand-primary)', fontWeight: 500 }}>
            View all →
          </Link>
        </div>

        {isLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
        ) : data?.todays_departures?.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Route</th>
                  <th>Company</th>
                  <th>Bus / Type</th>
                  <th>Available</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.todays_departures.map((dep: any) => (
                  <tr key={dep.id}>
                    <td style={{ fontWeight: 700, fontFamily: 'monospace' }}>{dep.departure_time?.slice(0, 5)}</td>
                    <td style={{ fontWeight: 500 }}>{dep.origin_city} → {dep.dest_city}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{dep.company_name}</td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{dep.plate_number}</span>
                      <span className="badge badge-neutral" style={{ marginLeft: '0.5rem', fontSize: '0.65rem' }}>{dep.bus_type}</span>
                    </td>
                    <td>
                      <span style={{
                        fontWeight: 600,
                        color: dep.available_seats < 5 ? 'var(--status-danger)' : dep.available_seats < 15 ? 'var(--status-warning)' : 'var(--status-success)'
                      }}>
                        {dep.available_seats}
                      </span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}> seats</span>
                    </td>
                    <td>
                      <span className={`badge ${
                        dep.status === 'scheduled' ? 'badge-warning' :
                        dep.status === 'boarding' ? 'badge-success' :
                        dep.status === 'departed' ? 'badge-neutral' : 'badge-danger'
                      }`}>
                        {dep.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <BusFront size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.2, display: 'block' }} />
            <p>No departures scheduled for today.</p>
            <Link to="/schedules" className="btn btn-secondary" style={{ marginTop: '1rem', display: 'inline-flex' }}>
              Create a schedule
            </Link>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}