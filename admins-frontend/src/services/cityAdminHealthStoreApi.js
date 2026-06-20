import axios from 'axios';
import { apiPath } from './config';

const BASE_URL = apiPath('/city-admin/health-stores');

const getToken = () => localStorage.getItem('adminToken') || localStorage.getItem('cityAdminToken');

const api = axios.create({ baseURL: BASE_URL });
api.interceptors.request.use(config => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── INVITE ──────────────────────────────────────────────────────────────────
export const inviteHealthStore = (data) => api.post('/invite', data);

// ─── HEALTH STORES ───────────────────────────────────────────────────────────
export const getHealthStores = (params) => api.get('/', { params });
export const getHealthStoreById = (id) => api.get(`/${id}`);
export const approveHealthStore = (id) => api.put(`/${id}/approve`);
export const rejectHealthStore = (id, reason) => api.put(`/${id}/reject`, { reason });
export const requestChanges = (id, reason) => api.put(`/${id}/request-changes`, { reason });
export const blockHealthStore = (id) => api.put(`/${id}/block`);

// ─── PRODUCTS ────────────────────────────────────────────────────────────────
export const getProductsForApproval = (params) => api.get('/products/pending', { params });
export const approveProduct = (productId) => api.put(`/products/${productId}/approve`);
export const rejectProduct = (productId, reason) => api.put(`/products/${productId}/reject`, { reason });

export default api;
