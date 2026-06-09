import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Package, MapPin, ArrowRight } from 'lucide-react';
import { parcelService } from '../api/endpoints';
import './FormPage.css';
import './TrackParcel.css';

export default function TrackParcel() {
  const navigate = useNavigate();
  const [trackingNo, setTrackingNo] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNo.trim()) { setError('Enter a tracking number.'); return; }
    setError(''); setResult(null); setLoading(true); setSearched(false);
    try {
      const res = await parcelService.track(trackingNo.trim());
      setResult(res.data.data);
      setSearched(true);
    } catch (err: any) {
      const msg = err?.response?.status === 404
        ? 'No parcel found with this tracking number.'
        : err?.response?.data?.message ?? 'Failed to track parcel.';
      setError(msg); setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const statusSteps = ['pending', 'in_transit', 'delivered'];
  const currentStep = result ? statusSteps.indexOf(result.status) : -1;

  return (
    <div className="form-page">
      <div className="form-header">
        <button className="btn-icon" onClick={() => navigate(-1)}><ArrowLeft size={20} /></button>
        <div>
          <h2>Track Parcel</h2>
          <p>Enter your tracking number to see status</p>
        </div>
      </div>

      <form className="form-card glass-panel" onSubmit={handleTrack} style={{ gap: '1rem' }}>
        <div className="form-group">
          <label className="form-label">Tracking Number</label>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <input
              id="tracking-input"
              className="form-input"
              placeholder="e.g. TRK-20241234"
              value={trackingNo}
              onChange={e => setTrackingNo(e.target.value)}
              style={{ flex: 1 }}
            />
            <button id="track-btn" type="submit" className="btn-primary" style={{ padding: '0 1.25rem', borderRadius: 10 }} disabled={loading}>
              {loading ? '...' : <Search size={18} />}
            </button>
          </div>
        </div>
        {error && <div className="form-error">⚠️ {error}</div>}
      </form>

      {result && (
        <div className="track-result glass-panel">
          {/* Header */}
          <div className="track-header">
            <Package size={20} className="track-pkg-icon" />
            <div>
              <div className="track-number">{result.tracking_number}</div>
              <div className={`track-status-badge status-${result.status === 'delivered' ? 'success' : result.status === 'in_transit' ? 'primary' : 'warning'}`}>
                {result.status?.replace('_', ' ')}
              </div>
            </div>
          </div>

          {/* Route */}
          <div className="track-route">
            <div className="track-city"><MapPin size={14} color="#4f46e5" /> {result.from_city}</div>
            <ArrowRight size={14} className="track-arrow" />
            <div className="track-city"><MapPin size={14} color="#10b981" /> {result.to_city}</div>
          </div>

          {/* Progress bar */}
          <div className="track-progress">
            {statusSteps.map((step, i) => (
              <div key={step} className="track-step">
                <div className={`step-dot ${i <= currentStep ? 'done' : ''}`}>
                  {i <= currentStep ? '✓' : i + 1}
                </div>
                <span className={`step-label ${i <= currentStep ? 'done' : ''}`}>
                  {step.replace('_', ' ')}
                </span>
                {i < statusSteps.length - 1 && (
                  <div className={`step-line ${i < currentStep ? 'done' : ''}`} />
                )}
              </div>
            ))}
          </div>

          {/* Details */}
          <div className="track-details">
            <div className="track-detail-row"><span>Recipient</span><strong>{result.recipient_name}</strong></div>
            <div className="track-detail-row"><span>Phone</span><strong>{result.recipient_phone}</strong></div>
            <div className="track-detail-row"><span>Description</span><strong>{result.description}</strong></div>
            {result.weight && <div className="track-detail-row"><span>Weight</span><strong>{result.weight} kg</strong></div>}
            <div className="track-detail-row"><span>Sent</span><strong>{result.created_at?.split('T')[0]}</strong></div>
          </div>
        </div>
      )}

      {searched && !result && !error && (
        <div className="empty-state">
          <span className="empty-icon">📦</span>
          <h3>No parcel found</h3>
        </div>
      )}
    </div>
  );
}
