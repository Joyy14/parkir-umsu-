import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('parkir_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('parkir_token');
      localStorage.removeItem('parkir_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  changePassword: (data) => api.post('/auth/change-password', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  getMyHistory: (params) => api.get('/auth/history', { params }),
  getUsers: () => api.get('/auth/users'),
};

export const kendaraanAPI = {
  getAll: (params) => api.get('/kendaraan', { params }),
  getById: (id) => api.get(`/kendaraan/${id}`),
  getByPlat: (plat) => api.get(`/kendaraan/plat/${plat}`),
  create: (data) => api.post('/kendaraan', data),
  update: (id, data) => api.put(`/kendaraan/${id}`, data),
  delete: (id) => api.delete(`/kendaraan/${id}`),
};

export const parkirAPI = {
  getAll: (params) => api.get('/parkir', { params }),
  getAktif: () => api.get('/parkir/aktif'),
  getById: (id) => api.get(`/parkir/${id}`),
  create: (data) => api.post('/parkir', data),
  checkout: (id, data) => api.put(`/parkir/${id}/checkout`, data),
  getLaporanHarian: (params) => api.get('/parkir/laporan/harian', { params }),
};

export const slotAPI = {
  getAll: (params) => api.get('/slot', { params }),
  getById: (id) => api.get(`/slot/${id}`),
  getByLokasi: (lokasi) => api.get(`/slot/lokasi/${lokasi}`),
  create: (data) => api.post('/slot', data),
  update: (id, data) => api.put(`/slot/${id}`, data),
  delete: (id) => api.delete(`/slot/${id}`),
};

export const bookingAPI = {
  getAll: (params) => api.get('/booking', { params }),
  getMy: (params) => api.get('/booking/saya', { params }),
  getById: (id) => api.get(`/booking/${id}`),
  create: (data) => api.post('/booking', data),
  cancel: (id) => api.put(`/booking/${id}/cancel`),
  use: (id) => api.put(`/booking/${id}/use`),
};

export const laporanAPI = {
  getDashboard: () => api.get('/laporan/dashboard'),
  getBulanan: (params) => api.get('/laporan/bulanan', { params }),
  getRekapKendaraan: () => api.get('/laporan/rekap-kendaraan'),
};

export default api;
