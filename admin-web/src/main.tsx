import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Overview from './pages/Overview';
import Companies from './pages/Companies';
import RoutesPage from './pages/Routes';
import Buses from './pages/Buses';
import Approvals from './pages/Approvals';
import Parcels from './pages/Parcels';
import Admins from './pages/Admins';
import Schedules from './pages/Schedules';
import Bookings from './pages/Bookings';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Overview />} />
            <Route path="companies" element={<Companies />} />
            <Route path="routes" element={<RoutesPage />} />
            <Route path="buses" element={<Buses />} />
            <Route path="schedules" element={<Schedules />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="approvals" element={<Approvals />} />
            <Route path="parcels" element={<Parcels />} />
            <Route path="admins" element={<Admins />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);