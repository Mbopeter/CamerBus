import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { scheduleService } from '../api/endpoints';
import { useBookingStore } from '../store/useBookingStore';
import './SelectSeats.css';

const SEAT_SIZE = 44;
const SEAT_GAP  = 8;
const AISLE_W   = 32;
const H_PAD     = 20;
const RIGHT_W   = SEAT_SIZE * 2 + SEAT_GAP;

export default function SelectSeats() {
  const navigate = useNavigate();
  const { selectedSchedule, selectedSeats, toggleSeat } = useBookingStore();

  const { data, isLoading } = useQuery({
    queryKey: ['seats', selectedSchedule?.id],
    queryFn: () => scheduleService.getSeats(selectedSchedule.id).then(r => r.data?.data ?? null),
    enabled: !!selectedSchedule?.id,
    refetchInterval: 15000,
  });

  const seats: any[] = data?.seats ?? [];
  const busType = data?.bus_type ?? selectedSchedule?.bus_type ?? '';
  const isVip = data?.company_class === 'vip' || ['VIP', 'Luxury'].includes(busType);
  const flatPrice: number = data?.flat_price
    ? Number(data.flat_price)
    : isVip ? Number(selectedSchedule?.price_vip ?? 0) : Number(selectedSchedule?.price_standard ?? 0);
  const totalPrice = selectedSeats.length * flatPrice;

  const isDoorRow = (r: number) => r === 4 || r === 12;
  const getLeftCount = (rowSeats: any[], isDoor: boolean) =>
    isDoor ? rowSeats.length : Math.max(0, rowSeats.length - 2);

  const rowMap = seats.reduce((acc: Record<number, any[]>, s) => {
    if (!acc[s.row_number]) acc[s.row_number] = [];
    acc[s.row_number].push(s);
    return acc;
  }, {});
  const allRowNums = Object.keys(rowMap).map(Number).sort((a, b) => a - b);
  const maxRow = allRowNums.length ? Math.max(...allRowNums) : 0;
  const maxLeftCount = allRowNums
    .filter(r => r !== 0 && r !== maxRow)
    .reduce((mx, r) => Math.max(mx, getLeftCount(rowMap[r] ?? [], isDoorRow(r))), 1);
  const LEFT_W = SEAT_SIZE * maxLeftCount + SEAT_GAP * Math.max(0, maxLeftCount - 1);

  const getSeatColor = (seat: any) => {
    if (seat.is_booked || seat.is_held) return '#e74c3c';
    if (selectedSeats.find(s => s.id === seat.id)) return '#f1c40f';
    return isVip ? '#6d28d9' : '#4f46e5';
  };

  const renderSeat = (seat: any) => (
    <button
      key={seat.id}
      id={`seat-${seat.id}`}
      className={`seat ${seat.is_booked || seat.is_held ? 'booked' : ''} ${selectedSeats.find(s => s.id === seat.id) ? 'selected' : ''}`}
      style={{ background: getSeatColor(seat), width: SEAT_SIZE, height: SEAT_SIZE }}
      onClick={() => !seat.is_booked && !seat.is_held && toggleSeat(seat)}
      disabled={Boolean(seat.is_booked || seat.is_held)}
      title={`Seat ${seat.seat_number}`}
    >
      <span className="seat-num">{seat.seat_number}</span>
      {isVip && !seat.is_booked && !seat.is_held && <span className="vip-star">★</span>}
    </button>
  );

  const renderDoor = () => (
    <div className="door-box" style={{ width: RIGHT_W, height: SEAT_SIZE }}>
      <span>Door</span>
    </div>
  );

  return (
    <div className="seats-page">
      {/* Header */}
      <div className="seats-header glass-panel">
        <div className="seats-header-top">
          <button className="btn-icon" onClick={() => navigate(-1)}><ArrowLeft size={20} /></button>
          <div>
            <h2 className="seats-title">
              Select Your Seat{' '}
              <span className={`class-badge ${isVip ? 'vip' : 'std'}`}>
                {isVip ? '⭐ VIP' : '🚌 Standard'}
              </span>
            </h2>
            <p className="seats-sub">
              {selectedSchedule?.company_name} · {Number(flatPrice).toLocaleString()} XAF / seat
            </p>
          </div>
        </div>
        <div className="legend">
          <div className="legend-item"><div className="legend-dot" style={{ background: isVip ? '#6d28d9' : '#4f46e5' }} /><span>Available</span></div>
          <div className="legend-item"><div className="legend-dot" style={{ background: '#e74c3c' }} /><span>Occupied</span></div>
          <div className="legend-item"><div className="legend-dot" style={{ background: '#f1c40f' }} /><span>Selected</span></div>
        </div>
      </div>

      {/* Seat Map */}
      <div className="seat-map-wrapper">
        {isLoading ? (
          <div className="seats-loading">
            <div className="spinner" />
            <p>Loading seat map…</p>
          </div>
        ) : (
          <div className="bus-body" style={{ width: LEFT_W + AISLE_W + RIGHT_W + H_PAD * 2 }}>
            {/* Driver Row */}
            <div className="driver-row" style={{ width: LEFT_W + AISLE_W + RIGHT_W }}>
              <div className="driver-seat" style={{ width: SEAT_SIZE + 16, height: SEAT_SIZE }}>
                <span>Driver</span>
              </div>
              <div style={{ flex: 1 }} />
              <div className="row-group" style={{ gap: SEAT_GAP }}>
                {(rowMap[0] ?? [])
                  .sort((a: any, b: any) => Number(a.seat_number) - Number(b.seat_number))
                  .map(renderSeat)}
              </div>
            </div>
            <div className="bus-divider" />

            {/* Main Rows */}
            {allRowNums.filter(r => r !== 0).map(rn => {
              const sorted = [...(rowMap[rn] ?? [])].sort((a, b) => Number(a.seat_number) - Number(b.seat_number));
              if (rn === maxRow) return (
                <div key={rn} className="rear-row-wrapper">
                  <span className="rear-label">rear row</span>
                  <div className="rear-row" style={{ gap: SEAT_GAP }}>{sorted.map(renderSeat)}</div>
                </div>
              );
              if (isDoorRow(rn)) return (
                <div key={rn} className="seat-row" style={{ width: LEFT_W + AISLE_W + RIGHT_W, gap: 0 }}>
                  <div style={{ width: LEFT_W }}>
                    <div className="row-group" style={{ gap: SEAT_GAP }}>{sorted.map(renderSeat)}</div>
                  </div>
                  <div style={{ width: AISLE_W }} />
                  <div style={{ width: RIGHT_W }}>{renderDoor()}</div>
                </div>
              );
              const lc = getLeftCount(sorted, false);
              const leftSeats = sorted.slice(0, lc);
              const rightSeats = sorted.slice(lc);
              return (
                <div key={rn} className="seat-row" style={{ width: LEFT_W + AISLE_W + RIGHT_W, gap: 0 }}>
                  <div style={{ width: LEFT_W }}>
                    <div className="row-group" style={{ gap: SEAT_GAP }}>{leftSeats.map(renderSeat)}</div>
                  </div>
                  <div style={{ width: AISLE_W }} />
                  <div style={{ width: RIGHT_W }}>
                    <div className="row-group" style={{ gap: SEAT_GAP }}>{rightSeats.map(renderSeat)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      {selectedSeats.length > 0 && (
        <div className="seats-bottom-bar">
          <div>
            <div className="selected-info">
              🪑 Seats: {selectedSeats.map(s => s.seat_number).join(', ')}
            </div>
            <div className="total-price">
              {totalPrice.toLocaleString()} XAF
              {isVip && <span className="vip-label">VIP</span>}
            </div>
          </div>
          <button id="continue-btn" className="btn-primary continue-btn" onClick={() => navigate('/booking/summary')}>
            Continue <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
