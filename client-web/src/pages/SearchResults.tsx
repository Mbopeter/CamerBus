import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Clock, BusFront, ArrowRight, Star, MapPin } from 'lucide-react';
import { routeService } from '../api/endpoints';
import { useBookingStore } from '../store/useBookingStore';
import { getCompanyLogo } from '../utils/companyLogos';
import './SearchResults.css';

export default function SearchResults() {
  const navigate = useNavigate();
  const { fromCity, toCity, searchDate, travelTime, fromBranch, toBranch, setSchedule } = useBookingStore();

  const shiftLabel = travelTime === 'morning' ? 'Day (10:00 AM)' : 'Night (8:00 PM)';
  const dateOnly = searchDate?.split('T')[0] ?? searchDate;

  const { data: rawResults, isLoading, isError } = useQuery({
    queryKey: ['search', fromCity?.name, toCity?.name, dateOnly, fromBranch?.id, toBranch?.id],
    queryFn: () => routeService.search({
      from: fromCity?.name,
      to: toCity?.name,
      date: dateOnly,
      ...(fromBranch?.id ? { origin_branch: fromBranch.id } : {}),
      ...(toBranch?.id   ? { dest_branch: toBranch.id }   : {}),
    }).then(r => r.data.data),
    enabled: !!(fromCity && toCity && dateOnly),
  });
  const results: any[] = Array.isArray(rawResults) ? rawResults : [];

  const handleSelect = (schedule: any) => {
    setSchedule(schedule);
    navigate('/booking/seats');
  };

  return (
    <div className="results-page">
      {/* Header */}
      <div className="results-header">
        <button className="btn-icon" onClick={() => navigate(-1)}><ArrowLeft size={20} /></button>
        <div className="results-route">
          <span className="results-city">{fromCity?.name ?? '?'}</span>
          <ArrowRight size={16} className="route-arrow" />
          <span className="results-city">{toCity?.name ?? '?'}</span>
        </div>
        <div className="results-meta">{dateOnly} · {shiftLabel}</div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="results-list">
          {[1,2,3].map(i => <div key={i} className="skeleton-card tall" />)}
        </div>
      ) : isError ? (
        <div className="empty-state">
          <span className="empty-icon">⚠️</span>
          <p>Failed to load results. Please try again.</p>
          <button className="btn-primary" onClick={() => navigate(-1)}>Go Back</button>
        </div>
      ) : results.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🚌</span>
          <h3>No trips found</h3>
          <p>No schedules available for this route and date.</p>
          <button className="btn-primary" onClick={() => navigate(-1)}>Change Search</button>
        </div>
      ) : (
        <div className="results-list">
          <p className="results-count">{results.length} trip{results.length !== 1 ? 's' : ''} found</p>
          {results.map((schedule: any) => {
            const isVip = schedule.company_class === 'vip' || ['VIP','Luxury'].includes(schedule.bus_type ?? '');
            const price = isVip ? schedule.price_vip : schedule.price_standard;
            return (
              <div key={schedule.id} className="result-card glass-card">
                <div className="result-card-top">
                  <div className="result-company">
                    <img src={getCompanyLogo(schedule.company_name)} alt={schedule.company_name} className="result-company-logo" />
                    <div>
                      <div className="result-company-name">{schedule.company_name}</div>
                      <div className="result-bus-type">
                        {isVip
                          ? <span className="badge badge-warning">⭐ VIP</span>
                          : <span className="badge badge-default">🚌 Standard</span>
                        }
                      </div>
                    </div>
                  </div>
                  <div className="result-price">{Number(price).toLocaleString()} <span>XAF</span></div>
                </div>

                <div className="result-route">
                  <div className="result-point">
                    <MapPin size={14} className="point-icon from" />
                    <div>
                      <div className="point-city">{schedule.from_city ?? fromCity?.name}</div>
                      <div className="point-branch">{schedule.origin_branch_name ?? fromBranch?.name ?? '—'}</div>
                    </div>
                  </div>
                  <div className="result-line">
                    <div className="line-dot" /><div className="line" /><div className="line-dot" />
                  </div>
                  <div className="result-point">
                    <MapPin size={14} className="point-icon to" />
                    <div>
                      <div className="point-city">{schedule.to_city ?? toCity?.name}</div>
                      <div className="point-branch">{schedule.dest_branch_name ?? toBranch?.name ?? '—'}</div>
                    </div>
                  </div>
                </div>

                <div className="result-footer">
                  <div className="result-info">
                    <span><Clock size={13} /> {schedule.departure_time}</span>
                    <span><BusFront size={13} /> {schedule.available_seats ?? '?'} seats left</span>
                    {schedule.rating && <span><Star size={13} fill="#E5BC00" color="#E5BC00" /> {schedule.rating}</span>}
                  </div>
                  <button id={`book-${schedule.id}`} className="btn-primary book-btn" onClick={() => handleSelect(schedule)}>
                    Book Now
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
