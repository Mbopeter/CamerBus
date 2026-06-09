import { create } from 'zustand';

interface BookingState {
  fromCity: any;
  toCity: any;
  fromBranch: any;
  toBranch: any;
  searchDate: string;
  travelTime: string;
  selectedSchedule: any;
  selectedSeats: any[];
  setSearch: (from: any, to: any, date: string) => void;
  setBranches: (from: any, to: any) => void;
  setTravelTime: (time: string) => void;
  setSchedule: (schedule: any) => void;
  toggleSeat: (seat: any) => void;
  clearSeats: () => void;
  reset: () => void;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  fromCity: null,
  toCity: null,
  fromBranch: null,
  toBranch: null,
  searchDate: new Date().toISOString().split('T')[0],
  travelTime: '',
  selectedSchedule: null,
  selectedSeats: [],

  setSearch: (from, to, date) => set({ fromCity: from, toCity: to, searchDate: date, selectedSeats: [] }),
  setBranches: (from, to) => set({ fromBranch: from, toBranch: to }),
  setTravelTime: (time) => set({ travelTime: time }),
  setSchedule: (schedule) => set({ selectedSchedule: schedule, selectedSeats: [] }),

  toggleSeat: (seat) => {
    const { selectedSeats } = get();
    const exists = selectedSeats.find((s) => s.id === seat.id);
    if (exists) {
      set({ selectedSeats: selectedSeats.filter((s) => s.id !== seat.id) });
    } else {
      set({ selectedSeats: [...selectedSeats, seat] });
    }
  },

  clearSeats: () => set({ selectedSeats: [] }),

  reset: () =>
    set({
      fromCity: null, toCity: null, fromBranch: null, toBranch: null,
      searchDate: new Date().toISOString().split('T')[0],
      travelTime: '', selectedSchedule: null, selectedSeats: [],
    }),
}));
