import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Package, Search, Send, ArrowRight, Clock } from 'lucide-react';
import { parcelService } from '../api/endpoints';
import { useAuthStore } from '../store/useAuthStore';
import './Parcels.css';

const statusColors: Record<string, string> = {
  pending:    'warning',
  in_transit: 'primary',
  delivered:  'success',
  cancelled:  'danger',
};

export default function Parcels() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: parcels = [], isLoading } = useQuery({
    queryKey: ['parcels', user?.id],
    queryFn: () => parcelService.getByUser(user!.id).then(r => r.data.data ?? []),
    enabled: !!user?.id,
  });

  return (
    <div className="parcels-page">
      <div className="parcels-hero glass-panel">
        <Package size={32} className="parcels-hero-icon" />
        <div>
          <h1>Parcels & Cargo</h1>
          <p>Send and track your parcels across Cameroon</p>
        </div>
      </div>

      <div className="parcels-actions">
        <button id="send-parcel-btn" className="action-card glass-card" onClick={() => navigate('/parcels/send')}>
          <Send size={28} className="action-icon" />
          <div>
            <div className="action-title">Send Parcel</div>
            <div className="action-sub">Ship items to any city</div>
          </div>
          <ArrowRight size={16} className="action-arrow" />
        </button>
        <button id="track-parcel-btn" className="action-card glass-card" onClick={() => navigate('/parcels/track')}>
          <Search size={28} className="action-icon" />
          <div>
            <div className="action-title">Track Parcel</div>
            <div className="action-sub">Check delivery status</div>
          </div>
          <ArrowRight size={16} className="action-arrow" />
        </button>
      </div>

      <section>
        <h2 className="parcels-section-title">My Parcels</h2>
        {isLoading ? (
          <div className="parcels-list">{[1,2,3].map(i => <div key={i} className="skeleton-card parcel-skel" />)}</div>
        ) : parcels.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📦</span>
            <h3>No parcels yet</h3>
            <p>Send your first parcel to get started!</p>
            <button className="btn-primary" onClick={() => navigate('/parcels/send')}>Send Parcel</button>
          </div>
        ) : (
          <div className="parcels-list">
            {parcels.map((p: any) => {
              const cls = statusColors[p.status] ?? 'warning';
              return (
                <div key={p.id} className="parcel-card glass-card">
                  <div className="parcel-top">
                    <div className="parcel-tracking">
                      <span className="tracking-label">Tracking #</span>
                      <span className="tracking-code">{p.tracking_number}</span>
                    </div>
                    <span className={`parcel-status status-${cls}`}>{p.status?.replace('_', ' ')}</span>
                  </div>
                  <div className="parcel-route">
                    <span>{p.from_city}</span>
                    <ArrowRight size={14} />
                    <span>{p.to_city}</span>
                  </div>
                  <div className="parcel-footer">
                    <span><Clock size={13} /> {p.created_at?.split('T')[0]}</span>
                    <span>💰 {Number(p.amount ?? 0).toLocaleString()} XAF</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
