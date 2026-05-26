import { create } from 'zustand';

interface Seat { id: number; seat_number: string; seat_type: string; is_booked: boolean; is_held: boolean; }
interface BookingState {
  // Step 1: Search
  fromCity:   { id: number; name: string } | null;
  toCity:     { id: number; name: string } | null;
  travelDate: string;
  company:    any | null; // For branch-specific search
  // Step 2: Company / Schedule
  selectedSchedule: any | null;
  // Step 3: Branch
  fromBranch: any | null;
  toBranch:   any | null;
  // Step 4: Seats
  selectedSeats: Seat[];
  // Step 5: Payment
  paymentMethod: 'mtn_momo' | 'orange_money' | 'bank_transfer' | null;
  // Completed booking
  bookingRef:   string | null;
  paymentId:    number | null;

  setSearch:    (from: any, to: any, date: string, company?: any) => void;
  setSchedule:  (s: any) => void;
  setBranches:  (from: any, to: any) => void;
  toggleSeat:   (seat: Seat) => void;
  setPayMethod: (m: BookingState['paymentMethod']) => void;
  setBookingRef:(ref: string, payId: number) => void;
  reset:        () => void;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  fromCity: null, toCity: null, travelDate: new Date().toISOString().split('T')[0], company: null,
  selectedSchedule: null,
  fromBranch: null, toBranch: null,
  selectedSeats: [],
  paymentMethod: null,
  bookingRef: null, paymentId: null,

  setSearch:    (from, to, date, company) => set({ fromCity: from, toCity: to, travelDate: date, company, selectedSchedule: null, selectedSeats: [] }),
  setSchedule:  (s) => set({ selectedSchedule: s, selectedSeats: [] }),
  setBranches:  (from, to) => set({ fromBranch: from, toBranch: to }),
  toggleSeat:   (seat) => set((s) => {
    const exists = s.selectedSeats.find(x => x.id === seat.id);
    return { selectedSeats: exists ? s.selectedSeats.filter(x => x.id !== seat.id) : [...s.selectedSeats, seat] };
  }),
  setPayMethod: (m) => set({ paymentMethod: m }),
  setBookingRef:(ref, payId) => set({ bookingRef: ref, paymentId: payId }),
  reset:        () => set({
    fromCity: null, toCity: null, travelDate: new Date().toISOString().split('T')[0], company: null,
    selectedSchedule: null, fromBranch: null, toBranch: null,
    selectedSeats: [], paymentMethod: null, bookingRef: null, paymentId: null,
  }),
}));
