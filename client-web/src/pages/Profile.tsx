import { useNavigate } from 'react-router-dom';
import { User, Phone, Shield, BusFront, Package, LogOut, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useQuery } from '@tanstack/react-query';
import { bookingService, parcelService } from '../api/endpoints';
import './Profile.css';

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const { data: bookings = [] } = useQuery({
    queryKey: ['bookings', user?.id],
    queryFn: () => bookingService.getByUser(user!.id).then(r => r.data.data ?? []),
    enabled: !!user?.id,
  });

  const { data: parcels = [] } = useQuery({
    queryKey: ['parcels', user?.id],
    queryFn: () => parcelService.getByUser(user!.id).then(r => r.data.data ?? []),
    enabled: !!user?.id,
  });

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user?.full_name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) ?? '?';

  const stats = [
    { label: 'Trips', value: bookings.length, icon: '🎫' },
    { label: 'Parcels', value: parcels.length, icon: '📦' },
    { label: 'Completed', value: bookings.filter((b: any) => b.status === 'completed').length, icon: '✅' },
  ];

  const menuItems = [
    { icon: <BusFront size={18} />, label: 'My Tickets', sub: 'View booking history', to: '/tickets' },
    { icon: <Package size={18} />, label: 'My Parcels', sub: 'Track sent parcels', to: '/parcels' },
    { icon: <Shield size={18} />, label: 'Account Security', sub: 'Password & privacy', to: null },
  ];

  return (
    <div className="profile-page">
      {/* Avatar + Info */}
      <div className="profile-hero glass-panel">
        <div className="profile-avatar">{initials}</div>
        <div className="profile-info">
          <h1 className="profile-name">{user?.full_name}</h1>
          <div className="profile-meta"><Phone size={13} /> {user?.phone}</div>
          {user?.email && <div className="profile-meta"><User size={13} /> {user.email}</div>}
          <span className="profile-role">{user?.role === 'admin' ? '🛡️ Admin' : '👤 Passenger'}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="profile-stats">
        {stats.map(s => (
          <div key={s.label} className="stat-card glass-card">
            <span className="stat-icon">{s.icon}</span>
            <span className="stat-value">{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Menu */}
      <div className="profile-menu glass-panel">
        {menuItems.map(({ icon, label, sub, to }) => (
          <button
            key={label}
            id={`menu-${label.toLowerCase().replace(/\s/g,'-')}`}
            className="menu-item"
            onClick={() => to && navigate(to)}
          >
            <div className="menu-icon">{icon}</div>
            <div className="menu-text">
              <div className="menu-label">{label}</div>
              <div className="menu-sub">{sub}</div>
            </div>
            <ChevronRight size={16} className="menu-chevron" />
          </button>
        ))}
      </div>

      {/* Logout */}
      <button id="logout-btn" className="logout-btn" onClick={handleLogout}>
        <LogOut size={18} /> Sign Out
      </button>

      <p className="app-version">CamerBus Web v1.0.0 · Powered by Antigravity AI</p>
    </div>
  );
}
