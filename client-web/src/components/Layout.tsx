import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  Home, BusFront, Ticket, Package, Bell, User, LogOut
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useQuery } from '@tanstack/react-query';
import { notificationService } from '../api/endpoints';
import './Layout.css';

export default function Layout() {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();

  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getAll().then(r => r.data.data),
    refetchInterval: 30000,
  });

  const unreadCount = (notifData ?? []).filter((n: any) => !n.is_read).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', icon: <Home size={20} />, label: 'Home' },
    { to: '/companies', icon: <BusFront size={20} />, label: 'Book' },
    { to: '/tickets', icon: <Ticket size={20} />, label: 'Tickets' },
    { to: '/parcels', icon: <Package size={20} />, label: 'Parcels' },
    { to: '/notifications', icon: <Bell size={20} />, label: 'Alerts', badge: unreadCount },
    { to: '/profile', icon: <User size={20} />, label: 'Profile' },
  ];

  return (
    <div className="app-layout">
      {/* Background mesh */}
      <div className="bg-mesh" />

      {/* Top Navbar */}
      <header className="navbar">
        <div className="navbar-inner container">
          <NavLink to="/" className="navbar-brand">
            <img src="/assets/lightlogo.png" alt="CamerBus Logo" className="nav-logo-img" />
          </NavLink>

          <nav className="navbar-links">
            {navItems.map(({ to, icon, label, badge }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                {icon}
                <span>{label}</span>
                {badge ? <span className="nav-badge">{badge}</span> : null}
              </NavLink>
            ))}
          </nav>

          <div className="navbar-right">
            <span className="navbar-user">
              {user?.full_name?.split(' ')[0] ?? 'User'}
            </span>
            <button className="btn-icon" onClick={handleLogout} title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="main-content">
        <div className="container animate-fade-in">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom navigation */}
      <nav className="bottom-nav">
        {navItems.map(({ to, icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            <div className="bottom-nav-icon">
              {icon}
              {badge ? <span className="nav-badge-mobile">{badge}</span> : null}
            </div>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
