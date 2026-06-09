import api from './client';

// ─── Auth ───────────────────────────────────────────────────────────────────
export const authService = {
  register:   (data: any)     => api.post('/auth/register', data),
  login:      (data: any)     => api.post('/auth/login', data),
  logout:     (token: string) => api.post('/auth/logout', { refresh_token: token }),
};

// ─── Cities ─────────────────────────────────────────────────────────────────
export const cityService = {
  getAll: () => api.get('/cities'),
};

// ─── Companies ──────────────────────────────────────────────────────────────
export const companyService = {
  getAll:      ()             => api.get('/companies'),
  getById:     (id: number)   => api.get(`/companies/${id}`),
  getRoutes:   (id: number)   => api.get(`/companies/${id}/routes`),
  getBranches: (id: number)   => api.get(`/companies/${id}/branches`),
};

// ─── Branches ───────────────────────────────────────────────────────────────
export const branchService = {
  getAll:  (params?: { city?: number; company?: number }) =>
    api.get('/branches', { params }),
  getById: (id: number) => api.get(`/branches/${id}`),
};

// ─── Routes / Schedules ─────────────────────────────────────────────────────
export const routeService = {
  search: (params: { from?: string; to?: string; date: string; company?: number }) =>
    api.get('/routes/search', { params }),
};

export const scheduleService = {
  getById:  (id: number) => api.get(`/schedules/${id}`),
  getSeats: (id: number) => api.get(`/schedules/${id}/seats`),
};

// ─── Bookings ────────────────────────────────────────────────────────────────
export const bookingService = {
  create:             (data: any)       => api.post('/bookings', data),
  getByRef:           (ref: string)     => api.get(`/bookings/${ref}`),
  getByUser:          (userId: number)  => api.get(`/bookings/user/${userId}`),
  cancel:             (ref: string)     => api.delete(`/bookings/${ref}`),
  updatePassengerInfo:(ref: string, data: any) => api.put(`/bookings/${ref}/passenger-info`, data),
};

// ─── Payments ────────────────────────────────────────────────────────────────
export const paymentService = {
  create:      (data: any)                    => api.post('/payments', data),
  getById:     (id: number)                   => api.get(`/payments/${id}`),
  uploadProof: (id: number, formData: FormData) =>
    api.post(`/payments/${id}/upload-proof`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// ─── Tickets ─────────────────────────────────────────────────────────────────
export const ticketService = {
  getByCode: (code: string) => api.get(`/tickets/${code}`),
};

// ─── Parcels ─────────────────────────────────────────────────────────────────
export const parcelService = {
  create:    (data: any)          => api.post('/parcels', data),
  track:     (trackingNo: string) => api.get(`/parcels/${trackingNo}`),
  getByUser: (userId: number)     => api.get(`/parcels/user/${userId}`),
};

// ─── Notifications ───────────────────────────────────────────────────────────
export const notificationService = {
  getAll:      ()           => api.get('/notifications'),
  markRead:    (id: number) => api.put(`/notifications/${id}/read`),
  markAllRead: ()           => api.put('/notifications/read-all'),
};
