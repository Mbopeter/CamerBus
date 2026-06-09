import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Star, BusFront, MapPin } from 'lucide-react';
import { companyService } from '../api/endpoints';
import { getCompanyLogo } from '../utils/companyLogos';
import './Companies.css';

export default function Companies() {
  const navigate = useNavigate();
  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: () => companyService.getAll().then(r => r.data.data ?? []),
    staleTime: 60000,
  });

  return (
    <div className="companies-page">
      <div className="companies-hero glass-panel">
        <BusFront size={32} className="hero-icon" />
        <div>
          <h1>Bus Companies</h1>
          <p>Choose a company and explore their routes</p>
        </div>
      </div>

      {isLoading ? (
        <div className="co-grid">
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton-card co-skeleton" />)}
        </div>
      ) : (
        <div className="companies-grid">
        {companies.map((co: any) => (
          <button key={co.id} id={`company-${co.id}`} className="co-card glass-card" onClick={() => navigate(`/companies/${co.id}`)}>
            <img src={getCompanyLogo(co.name)} alt={co.name} className="co-logo" />
            <h3 className="co-name">{co.name}</h3>
            <div className="co-stats">
              <span><MapPin size={12} /> {co.route_count ?? 0} routes</span>
              <span><BusFront size={12} /> {co.branch_count ?? 0} branches</span>
            </div>
            {co.rating && (
              <div className="co-rating">
                <Star size={12} fill="#E5BC00" color="#E5BC00" /> {co.rating}
              </div>
            )}
          </button>
        ))}
        </div>
      )}
    </div>
  );
}
