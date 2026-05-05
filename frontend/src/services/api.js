import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Request interceptor: add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('il_dule_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('il_dule_token');
      localStorage.removeItem('il_dule_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// ─── Events ───────────────────────────────────────────────────────────
export const eventosService = {
  getAll: (params) => api.get('/events', { params }),
  getById: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
  toggleComplete: (id) => api.patch(`/events/${id}/complete`),
};

// ─── AI ───────────────────────────────────────────────────────────────
export const aiService = {
  chat: (mensaje, historial) => api.post('/ai/chat', { mensaje, historial }),
  sugerencias: () => api.get('/ai/sugerencias'),
};

// ─── Perfil ───────────────────────────────────────────────────────────
export const perfilService = {
  get: () => api.get('/perfil'),
  create: (data) => api.post('/perfil', data),
};

export default api;
