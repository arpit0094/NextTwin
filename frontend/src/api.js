import axios from 'axios';

const API_BASE = 'https://nexttwin.onrender.com';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nt_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-redirect on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('nt_token');
      localStorage.removeItem('nt_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  me:       ()     => api.get('/auth/me'),
};

// ── Profile ───────────────────────────────────────────────────────────────────
export const profileAPI = {
  get:       ()     => api.get('/profile/'),
  update:    (data) => api.put('/profile/', data),
  evolution: ()     => api.get('/profile/evolution'),
};

// ── Predictions ───────────────────────────────────────────────────────────────
export const predictAPI = {
  placement: () => api.get('/predict/placement'),
  academic:  () => api.get('/predict/academic'),
  skills:    () => api.get('/predict/skills'),
  history:   () => api.get('/predict/history'),
};

// ── What-If ───────────────────────────────────────────────────────────────────
export const whatifAPI = {
  simulate: (data) => api.post('/whatif/simulate', data),
  history:  ()     => api.get('/whatif/history'),
};

// ── Career ────────────────────────────────────────────────────────────────────
export const careerAPI = {
  compatibility: ()     => api.get('/career/compatibility'),
  gap:           (role) => api.get('/career/gap', { params: { role } }),
};

// ── Recommendations ───────────────────────────────────────────────────────────
export const recsAPI = {
  get:     () => api.get('/recommendations/'),
  top3:    () => api.get('/recommendations/top3'),
  roadmap: () => api.get('/recommendations/roadmap'),
};


export default api;
