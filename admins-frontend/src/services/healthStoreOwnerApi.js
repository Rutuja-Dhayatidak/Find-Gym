import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/health-store-owner';
const AUTH_URL = 'http://localhost:5000/api/health-store';

const getToken = () => localStorage.getItem('hsOwnerToken');

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use(config => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── AUTH & ONBOARDING (PUBLIC) ──────────────────────────────────────────────
export const validateInviteToken = (token) => axios.get(`${AUTH_URL}/invite/${token}`);
export const registerHealthStore = (token, data) => axios.post(`${AUTH_URL}/register/${token}`, data, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const validateSetPasswordToken = (token) => axios.get(`${AUTH_URL}/set-password/${token}`);
export const setPassword = (token, data) => axios.post(`${AUTH_URL}/set-password/${token}`, data);
export const login = (data) => axios.post(`${AUTH_URL}/login`, data);
export const getProfile = () => axios.get(`${AUTH_URL}/profile`, {
  headers: { Authorization: `Bearer ${getToken()}` }
});

// ─── PROTECTED OWNER PANEL ───────────────────────────────────────────────────
export const getDashboard = () => api.get('/dashboard');
export const getStoreProfile = () => api.get('/profile');
export const updateStoreProfile = (data) => api.put('/profile', data, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

// Products CRUD
export const addProduct = (data) => api.post('/products', data, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const getProducts = (params) => api.get('/products', { params });
export const getProductById = (id) => api.get(`/products/${id}`);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const toggleActiveProduct = (id) => api.patch(`/products/${id}/toggle-active`);
export const submitForApproval = (id) => api.put(`/products/${id}/submit`);

// Orders management
export const getOrders = (params) => api.get('/orders', { params });
export const updateOrderStatus = (id, status) => api.put(`/orders/${id}/status`, { status });

export default api;
