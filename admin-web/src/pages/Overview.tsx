import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { 
  DollarSign, 
  Ticket, 
  Clock, 
  Building2, 
  BusFront, 
  Package
} from 'lucide-react';

export default function Overview() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/admin/dashboard').then(res => res.data.data),
  });

  if (isLoading) {
    return <div className="text-[#A0A0A0]">Loading dashboard data...</div>;
  }

  const stats = data?.stats || {};

  const statCards = [
    { title: 'Total Revenue', value: `${(stats.total_revenue || 0).toLocaleString()} XAF`, icon: DollarSign, color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' },
    { title: "Today's Revenue", value: `${(stats.today_revenue || 0).toLocaleString()} XAF`, icon: DollarSign, color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)' },
    { title: 'Total Bookings', value: stats.total_bookings || 0, icon: Ticket, color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.1)' },
    { title: 'Pending Payments', value: stats.pending_payments || 0, icon: Clock, color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' },
    { title: 'Active Schedules', value: stats.active_schedules || 0, icon: BusFront, color: '#EC4899', bg: 'rgba(236, 72, 153, 0.1)' },
    { title: 'Total Parcels', value: stats.total_parcels || 0, icon: Package, color: '#06B6D4', bg: 'rgba(6, 182, 212, 0.1)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-6">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: stat.bg, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={24} />
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.25rem' }}>{stat.title}</p>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Today's Departures */}
      <div className="card">
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.125rem' }}>Today's Departures</h3>
        {data?.todays_departures?.length > 0 ? (
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
                    <td style={{ fontWeight: 600 }}>{dep.departure_time.slice(0, 5)}</td>
                    <td>{dep.origin_city} &rarr; {dep.dest_city}</td>
                    <td>{dep.company_name}</td>
                    <td>{dep.plate_number} <span className="badge badge-neutral" style={{ marginLeft: '0.5rem', fontSize: '0.65rem' }}>{dep.bus_type}</span></td>
                    <td>{dep.available_seats} seats</td>
                    <td>
                      <span className={`badge ${dep.status === 'scheduled' ? 'badge-warning' : dep.status === 'departed' ? 'badge-neutral' : 'badge-success'}`}>
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
            <BusFront size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.2 }} />
            <p>No departures scheduled for today.</p>
          </div>
        )}
      </div>

    </div>
  );
}
