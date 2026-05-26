import api from './api';

// ─── Auth ───────────────────────────────────────────────────────────────────
export const authService = {
  register:   (data: any)    => api.post('/auth/register', data),
  login:      (data: any)    => api.post('/auth/login', data),
  adminLogin: (data: any)    => api.post('/auth/admin-login', data),
  refresh:    (token: string)=> api.post('/auth/refresh', { refresh_token: token }),
  logout:     (token: string)=> api.post('/auth/logout', { refresh_token: token }),
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
  getAll:    (params?: { city?: number; company?: number }) =>
    api.get('/branches', { params }),
  getById:   (id: number) => api.get(`/branches/${id}`),
  byCompany: (companyId: number) => api.get(`/companies/${companyId}/branches`),
};

// ─── Routes / Schedules ─────────────────────────────────────────────────────
export const routeService = {
  search: (params: { from?: string; to?: string; date: string; company?: number; origin_branch?: number; dest_branch?: number }) =>
    api.get('/routes/search', { params }),
};

export const scheduleService = {
  getById:      (id: number) => api.get(`/schedules/${id}`),
  getSeats:     (id: number) => api.get(`/schedules/${id}/seats`),
  create:       (data: any)  => api.post('/schedules', data),
  markDeparted: (id: number) => api.put(`/schedules/${id}/depart`),
};

// ─── Bookings ────────────────────────────────────────────────────────────────
export const bookingService = {
  create:   (data: any)       => api.post('/bookings', data),
  getByRef: (ref: string)     => api.get(`/bookings/${ref}`),
  getByUser:(userId: number)  => api.get(`/bookings/user/${userId}`),
  cancel:   (ref: string)     => api.delete(`/bookings/${ref}`),
};

// ─── Payments ────────────────────────────────────────────────────────────────
export const paymentService = {
  create:     (data: any)                    => api.post('/payments', data),
  getById:    (id: number)                   => api.get(`/payments/${id}`),
  uploadProof:(id: number, formData: FormData) =>
    api.post(`/payments/${id}/upload-proof`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  approve: (id: number, data?: any) => api.put(`/payments/${id}/approve`, data ?? {}),
  reject:  (id: number, data: any)  => api.put(`/payments/${id}/reject`, data),
};

// ─── Tickets ─────────────────────────────────────────────────────────────────
export const ticketService = {
  getByCode: (code: string)      => api.get(`/tickets/${code}`),
  validate:  (code: string, data?: any) => api.post(`/tickets/${code}/validate`, data ?? {}),
};

// ─── Parcels ─────────────────────────────────────────────────────────────────
export const parcelService = {
  create:       (data: any)            => api.post('/parcels', data),
  track:        (trackingNo: string)   => api.get(`/parcels/${trackingNo}`),
  getByUser:    (userId: number)       => api.get(`/parcels/user/${userId}`),
  updateStatus: (id: number, data: any)=> api.put(`/parcels/${id}/status`, data),
};

// ─── Notifications ───────────────────────────────────────────────────────────
export const notificationService = {
  getAll:      ()           => api.get('/notifications'),
  markRead:    (id: number) => api.put(`/notifications/${id}/read`),
  markAllRead: ()           => api.put('/notifications/read-all'),
};

// ─── Admin ───────────────────────────────────────────────────────────────────
export const adminService = {
  dashboard:       ()           => api.get('/admin/dashboard'),
  pendingPayments: ()           => api.get('/admin/payments'),
  allBookings:     (params?: any) => api.get('/admin/bookings', { params }),
  allParcels:      (params?: any) => api.get('/admin/parcels',  { params }),
  createCompany:   (data: any)  => api.post('/admin/companies', data),
  createBus:       (data: any)  => api.post('/admin/buses', data),
  createAdmin:     (data: any)  => api.post('/admin/admins', data),
  listAdmins:      ()           => api.get('/admin/admins'),
};
