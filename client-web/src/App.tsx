import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/useAuthStore';

import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import SelectSeats from './pages/SelectSeats';
import BookingSummary from './pages/BookingSummary';
import MyTickets from './pages/MyTickets';
import TicketDetail from './pages/TicketDetail';
import Companies from './pages/Companies';
import CompanyDetail from './pages/CompanyDetail';
import Parcels from './pages/Parcels';
import SendParcel from './pages/SendParcel';
import TrackParcel from './pages/TrackParcel';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 60000 } },
});

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { accessToken } = useAuthStore();
  return accessToken ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { accessToken } = useAuthStore();
  return !accessToken ? <>{children}</> : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public auth routes */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          {/* Protected routes wrapped in Layout */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/booking/seats" element={<SelectSeats />} />
            <Route path="/booking/summary" element={<BookingSummary />} />
            <Route path="/tickets" element={<MyTickets />} />
            <Route path="/tickets/:code" element={<TicketDetail />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/companies/:id" element={<CompanyDetail />} />
            <Route path="/parcels" element={<Parcels />} />
            <Route path="/parcels/send" element={<SendParcel />} />
            <Route path="/parcels/track" element={<TrackParcel />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
