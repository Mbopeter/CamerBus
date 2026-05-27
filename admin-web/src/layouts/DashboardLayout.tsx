import { Outlet, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { 
  LayoutDashboard, Building2, Map, Users, Bus, CheckSquare, Package, LogOut, Settings
} from 'lucide-react';
import '../index.css';

export default function DashboardLayout() {
  const { admin, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!admin) {
    return <Navigate to="/login" replace />;
  }

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['super_admin', 'company_admin', 'branch_admin'] },
    { name: 'Companies', path: '/companies', icon: Building2, roles: ['super_admin'] },
    { name: 'Routes', path: '/routes', icon: Map, roles: ['super_admin', 'company_admin'] },
    { name: 'Buses', path: '/buses', icon: Bus, roles: ['super_admin', 'company_admin'] },
    { name: 'Approvals', path: '/approvals', icon: CheckSquare, roles: ['super_admin', 'company_admin', 'branch_admin'] },
    { name: 'Parcels', path: '/parcels', icon: Package, roles: ['super_admin', 'company_admin', 'branch_admin'] },
    { name: 'Admins', path: '/admins', icon: Users, roles: ['super_admin', 'company_admin'] },
  ];

  const filteredLinks = navLinks.filter(link => link.roles.includes(admin.role));

  return (
    <div className="layout-root">
      {/* Sidebar */}
      <aside className="sidebar glass">
        <div className="sidebar-header">
          <div className="logo-box">C</div>
          <span className="logo-text">CamerBus</span>
        </div>
        
        <div className="sidebar-nav">
          <p className="nav-label">Menu</p>
          <div className="nav-links">
            {filteredLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path || (location.pathname.startsWith(link.path) && link.path !== '/');
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                >
                  <Icon size={18} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar">{admin.full_name.charAt(0)}</div>
            <div className="user-info">
              <p className="user-name">{admin.full_name}</p>
              <p className="user-role">{admin.role.replace('_', ' ')}</p>
            </div>
          </div>
          
          <button onClick={handleLogout} className="btn-logout">
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar glass">
          <h2>{filteredLinks.find(l => l.path === location.pathname)?.name || 'Dashboard'}</h2>
          <button className="icon-btn"><Settings size={20} /></button>
        </header>

        <div className="page-wrapper animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
