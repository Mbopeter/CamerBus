import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, CheckCircle } from 'lucide-react';
import { parcelService } from '../api/endpoints';
import { useAuthStore } from '../store/useAuthStore';
import './FormPage.css';

const CITIES = ['Yaoundé','Douala','Bamenda','Bafoussam','Buea','Limbe','Ngaoundéré','Garoua','Maroua','Bertoua'];

export default function SendParcel() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [form, setForm] = useState({
    from_city: '', to_city: '',
    recipient_name: '', recipient_phone: '',
    description: '', weight: '', amount: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<any>(null);

  const set = (f: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const { from_city, to_city, recipient_name, recipient_phone, description } = form;
    if (!from_city || !to_city || !recipient_name || !recipient_phone || !description) {
      setError('Please fill in all required fields.'); return;
    }
    setLoading(true);
    try {
      const res = await parcelService.create({ ...form, sender_id: user?.id });
      setSuccess(res.data.data);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to send parcel. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="form-page">
      <div className="success-card glass-panel">
        <CheckCircle size={64} color="#10b981" />
        <h2>Parcel Sent!</h2>
        <p>Your parcel has been registered.</p>
        <div className="tracking-pill">
          📦 Tracking #: <strong>{success.tracking_number}</strong>
        </div>
        <button className="btn-primary" onClick={() => navigate('/parcels')}>View My Parcels</button>
      </div>
    </div>
  );

  return (
    <div className="form-page">
      <div className="form-header">
        <button className="btn-icon" onClick={() => navigate(-1)}><ArrowLeft size={20} /></button>
        <div>
          <h2>Send a Parcel</h2>
          <p>Fill in the details below</p>
        </div>
      </div>

      <form className="form-card glass-panel" onSubmit={handleSubmit}>
        <div className="form-section-title"><Package size={16} /> Route</div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">From City <span className="req">*</span></label>
            <select id="from-city" className="form-input" value={form.from_city} onChange={set('from_city')}>
              <option value="">Select city</option>
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">To City <span className="req">*</span></label>
            <select id="to-city" className="form-input" value={form.to_city} onChange={set('to_city')}>
              <option value="">Select city</option>
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="form-section-title">👤 Recipient</div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Full Name <span className="req">*</span></label>
            <input id="recipient-name" className="form-input" placeholder="John Doe" value={form.recipient_name} onChange={set('recipient_name')} />
          </div>
          <div className="form-group">
            <label className="form-label">Phone <span className="req">*</span></label>
            <input id="recipient-phone" className="form-input" placeholder="6XX XXX XXX" value={form.recipient_phone} onChange={set('recipient_phone')} />
          </div>
        </div>

        <div className="form-section-title">📦 Parcel Details</div>
        <div className="form-group">
          <label className="form-label">Description <span className="req">*</span></label>
          <textarea id="description" className="form-input form-textarea" placeholder="What are you sending?" value={form.description} onChange={set('description')} rows={3} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Weight (kg)</label>
            <input id="weight" className="form-input" type="number" placeholder="e.g. 2.5" value={form.weight} onChange={set('weight')} />
          </div>
          <div className="form-group">
            <label className="form-label">Declared Value (XAF)</label>
            <input id="amount" className="form-input" type="number" placeholder="e.g. 5000" value={form.amount} onChange={set('amount')} />
          </div>
        </div>

        {error && <div className="form-error">⚠️ {error}</div>}
        <button id="send-parcel-submit" type="submit" className="btn-primary form-submit" disabled={loading}>
          {loading ? <span className="loading-dots"><span /><span /><span /></span> : <><Package size={16} /> Send Parcel</>}
        </button>
      </form>
    </div>
  );
}
