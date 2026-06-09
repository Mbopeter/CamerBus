import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, MapPin, ArrowRight } from 'lucide-react';
import { companyService } from '../api/endpoints';
import { getCompanyLogo } from '../utils/companyLogos';
import './CompanyDetail.css';

export default function CompanyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: company, isLoading: loadingCo } = useQuery({
    queryKey: ['company', id],
    queryFn: () => companyService.getById(Number(id)).then(r => r.data.data),
    enabled: !!id,
  });

  const { data: branches = [] } = useQuery({
    queryKey: ['company-branches', id],
    queryFn: () => companyService.getBranches(Number(id)).then(r => r.data.data ?? []),
    enabled: !!id,
  });

  const { data: routes = [], isLoading: loadingRoutes } = useQuery({
    queryKey: ['company-routes', id],
    queryFn: () => companyService.getRoutes(Number(id)).then(r => r.data.data ?? []),
    enabled: !!id,
  });

  if (loadingCo) return (
    <div className="cd-page">
      <div className="cd-hero-skeleton" />
    </div>
  );

  return (
    <div className="cd-page">
      {/* Hero */}
      <div className="cd-hero glass-panel">
        <button className="back-btn" onClick={() => navigate(-1)}><ArrowLeft size={20} /></button>
        <img src={getCompanyLogo(company?.name)} alt={company?.name} className="cd-hero-logo" />
        <div className="cd-hero-info">
          <h1 className="cd-name">{company?.name}</h1>
          <p className="cd-meta">
            {company?.route_count ?? 0} routes · {company?.branch_count ?? 0} branches
          </p>
        </div>
      </div>

      {/* Branches */}
      {branches.length > 0 && (
        <section className="cd-section">
          <h2 className="cd-section-title">📍 Branch Offices</h2>
          <div className="cd-branches">
            {branches.map((b: any) => (
              <div key={b.id} className="cd-branch glass-card">
                <MapPin size={16} className="branch-pin" />
                <div>
                  <div className="branch-name">{b.name}</div>
                  {b.address && <div className="branch-addr">{b.address}</div>}
                  {b.city_name && <div className="branch-city">{b.city_name}</div>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Routes */}
      <section className="cd-section">
        <h2 className="cd-section-title">🛣️ Available Routes</h2>
        {loadingRoutes ? (
          <div className="cd-routes-list">
            {[1,2,3].map(i => <div key={i} className="skeleton-card" style={{ height: 80 }} />)}
          </div>
        ) : routes.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🛣️</span>
            <p>No routes available for this company yet.</p>
          </div>
        ) : (
          <div className="cd-routes-list">
            {routes.map((route: any) => (
              <div key={route.id} className="cd-route glass-card">
                <div className="cd-route-main">
                  <div className="cd-route-cities">
                    <span className="rc-city">{route.from_city}</span>
                    <ArrowRight size={14} className="rc-arrow" />
                    <span className="rc-city">{route.to_city}</span>
                  </div>
                  <div className="cd-route-info">
                    <span>💰 {route.price_standard ? `${Number(route.price_standard).toLocaleString()} XAF` : '—'}</span>
                    {route.distance_km && <span>📏 {route.distance_km} km</span>}
                  </div>
                </div>
                <button
                  id={`view-schedules-${route.id}`}
                  className="btn-primary schedule-btn"
                  onClick={() => navigate('/', { state: { from: route.from_city, to: route.to_city } })}
                >
                  View Schedules
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
