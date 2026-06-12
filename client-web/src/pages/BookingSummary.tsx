import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, CheckCircle } from 'lucide-react';
import { bookingService, paymentService } from '../api/endpoints';
import { useAuthStore } from '../store/useAuthStore';
import { useBookingStore } from '../store/useBookingStore';
import './BookingSummary.css';

export default function BookingSummary() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { selectedSchedule, selectedSeats, fromCity, toCity, fromBranch, toBranch, reset } = useBookingStore();

  const isVip = selectedSchedule?.company_class === 'vip' || ['VIP','Luxury'].includes(selectedSchedule?.bus_type ?? '');
  const pricePerSeat = isVip ? Number(selectedSchedule?.price_vip ?? 0) : Number(selectedSchedule?.price_standard ?? 0);
  const total = selectedSeats.length * pricePerSeat;

  const [step, setStep] = useState<'summary' | 'payment' | 'success'>('summary');
  const [method, setMethod] = useState<'momo' | 'orange' | 'bank'>('momo');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [bookingRef, setBookingRef] = useState('');
  const [_paymentId, setPaymentId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBooking = async () => {
    setLoading(true); setError('');
    try {
      const payload = {
        schedule_id: selectedSchedule.id,
        seat_ids: selectedSeats.map(s => s.id),
        user_id: user?.id,
      };
      const res = await bookingService.create(payload);
      const ref = res.data.data?.booking_reference;
      setBookingRef(ref);
      setStep('payment');
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!proofFile) { setError('Please upload payment proof.'); return; }
    setLoading(true); setError('');
    try {
      const payRes = await paymentService.create({
        booking_reference: bookingRef,
        amount: total,
        payment_method: method,
      });
      const pid = payRes.data.data?.id;
      setPaymentId(pid);
      const fd = new FormData();
      fd.append('proof', proofFile);
      await paymentService.uploadProof(pid, fd);
      setStep('success');
      reset();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Payment submission failed.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') return (
    <div className="summary-page">
      <div className="success-card glass-panel">
        <CheckCircle size={64} color="#10b981" />
        <h2>Booking Submitted!</h2>
        <p>Your booking <strong>{bookingRef}</strong> has been submitted.<br />
          You'll be notified once your payment is approved.</p>
        <button className="btn-primary" onClick={() => navigate('/tickets')}>View My Tickets</button>
        <button className="btn-secondary mt-4" onClick={() => navigate('/')}>Back to Home</button>
      </div>
    </div>
  );

  if (step === 'payment') return (
    <div className="summary-page">
      <div className="summary-header">
        <button className="btn-icon" onClick={() => setStep('summary')}><ArrowLeft size={20} /></button>
        <h2>Upload Payment Proof</h2>
      </div>

      <div className="summary-card glass-panel">
        <div className="payment-ref">
          Booking Reference: <strong>{bookingRef}</strong>
        </div>
        <div className="payment-amount">Total: <strong>{total.toLocaleString()} XAF</strong></div>

        <div className="payment-methods">
          {(['momo', 'orange', 'bank'] as const).map(m => (
            <button key={m} id={`method-${m}`} className={`method-btn ${method === m ? 'active' : ''}`} onClick={() => setMethod(m)}>
              <span className="method-icon">{m === 'momo' ? '📱' : m === 'orange' ? '🍊' : '🏦'}</span>
              <span>{m === 'momo' ? 'MTN Mobile Money' : m === 'orange' ? 'Orange Money' : 'Bank Payment'}</span>
            </button>
          ))}
        </div>

        <div className="payment-instructions glass-card">
          <p>📋 <strong>Instructions:</strong></p>
          {method === 'momo' ? (
            <ol>
              <li>Dial <strong>*126#</strong> on your MTN line</li>
              <li>Send <strong>{total.toLocaleString()} XAF</strong></li>
              <li>Take a screenshot and upload below</li>
            </ol>
          ) : method === 'orange' ? (
            <ol>
              <li>Dial <strong>#150*60#</strong> on your Orange line</li>
              <li>Send <strong>{total.toLocaleString()} XAF</strong></li>
              <li>Take a screenshot and upload below</li>
            </ol>
          ) : (
            <ol>
              <li>Transfer <strong>{total.toLocaleString()} XAF</strong> to the designated bank account</li>
              <li>Account Name: <strong>CamerBus</strong></li>
              <li>Take a screenshot of the receipt and upload below</li>
            </ol>
          )}
        </div>

        <label id="upload-label" className={`upload-area ${proofFile ? 'has-file' : ''}`}>
          <input type="file" accept="image/*" hidden onChange={e => setProofFile(e.target.files?.[0] ?? null)} />
          {proofFile ? (
            <><CheckCircle size={24} color="#10b981" /><span>{proofFile.name}</span></>
          ) : (
            <><Upload size={24} /><span>Tap to upload payment screenshot</span></>
          )}
        </label>

        {error && <div className="auth-error">⚠️ {error}</div>}

        <button id="submit-payment-btn" className="btn-primary auth-submit" onClick={handlePayment} disabled={loading}>
          {loading ? <span className="loading-dots"><span /><span /><span /></span> : 'Submit Payment'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="summary-page">
      <div className="summary-header">
        <button className="btn-icon" onClick={() => navigate(-1)}><ArrowLeft size={20} /></button>
        <h2>Booking Summary</h2>
      </div>

      <div className="summary-card glass-panel">
        <div className="summary-section">
          <h4 className="summary-section-title">Trip Details</h4>
          <div className="summary-row"><span>From</span><strong>{fromBranch ? `${fromBranch.name} (${fromCity?.name})` : fromCity?.name}</strong></div>
          <div className="summary-row"><span>To</span><strong>{toBranch ? `${toBranch.name} (${toCity?.name})` : toCity?.name}</strong></div>
          <div className="summary-row"><span>Date</span><strong>{selectedSchedule?.departure_date}</strong></div>
          <div className="summary-row"><span>Departure</span><strong>{selectedSchedule?.departure_time}</strong></div>
          <div className="summary-row"><span>Company</span><strong>{selectedSchedule?.company_name}</strong></div>
          <div className="summary-row"><span>Class</span><strong>{isVip ? '⭐ VIP' : '🚌 Standard'}</strong></div>
        </div>

        <div className="summary-divider" />

        <div className="summary-section">
          <h4 className="summary-section-title">Seats & Pricing</h4>
          <div className="summary-row"><span>Seats</span><strong>{selectedSeats.map(s => s.seat_number).join(', ')}</strong></div>
          <div className="summary-row"><span>Price / seat</span><strong>{pricePerSeat.toLocaleString()} XAF</strong></div>
          <div className="summary-row total-row"><span>Total</span><strong className="total-amount">{total.toLocaleString()} XAF</strong></div>
        </div>

        <div className="summary-divider" />

        <div className="summary-section">
          <h4 className="summary-section-title">Passenger</h4>
          <div className="summary-row"><span>Name</span><strong>{user?.full_name}</strong></div>
          <div className="summary-row"><span>Phone</span><strong>{user?.phone}</strong></div>
        </div>

        {error && <div className="auth-error">⚠️ {error}</div>}

        <button id="confirm-booking-btn" className="btn-primary auth-submit" onClick={handleBooking} disabled={loading}>
          {loading ? <span className="loading-dots"><span /><span /><span /></span> : 'Confirm & Proceed to Payment'}
        </button>
      </div>
    </div>
  );
}
