import axios from 'axios';
import { apiPath } from './config';

const API_URL = apiPath('/admins');

// Setup an axios instance
const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Dashboard
export const getDashboardData = async () => {
  const response = await api.get('/dashboard');
  return response.data;
};

// Users
export const getAllUsers = async (params) => {
  const response = await api.get('/users', { params });
  return response.data;
};

export const getUserDetails = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

export const getUserActivity = async (userId, params) => {
  const response = await api.get(`/users/${userId}/activity`, { params });
  return response.data;
};

export const blockUser = async (userId, reason) => {
  const response = await api.patch(`/users/${userId}/block`, { reason });
  return response.data;
};

export const unblockUser = async (userId) => {
  const response = await api.patch(`/users/${userId}/unblock`);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await api.delete(`/users/${userId}`);
  return response.data;
};

// Gyms
export const getAllGyms = async (params) => {
  const response = await api.get('/gyms', { params });
  return response.data;
};

export const getPendingGyms = async (params) => {
  const response = await api.get('/gyms/pending', { params });
  return response.data;
};

export const getGymDetails = async (gymId) => {
  const response = await api.get(`/gyms/${gymId}`);
  return response.data;
};

export const getGymAnalytics = async (gymId, params) => {
  const response = await api.get(`/gyms/${gymId}/analytics`, { params });
  return response.data;
};

export const approveGym = async (gymId) => {
  const response = await api.patch(`/gyms/${gymId}/approve`);
  return response.data;
};

export const rejectGym = async (gymId, reason) => {
  const response = await api.patch(`/gyms/${gymId}/reject`, { reason });
  return response.data;
};

export const suspendGym = async (gymId) => {
  const response = await api.patch(`/gyms/${gymId}/suspend`);
  return response.data;
};

export const reactivateGym = async (gymId) => {
  const response = await api.patch(`/gyms/${gymId}/reactivate`);
  return response.data;
};

export const deleteGym = async (gymId) => {
  const response = await api.delete(`/gyms/${gymId}`);
  return response.data;
};

// Trainers
export const getAllTrainers = async (params) => {
  const response = await api.get('/trainers', { params });
  return response.data;
};

export const getTrainerStats = async () => {
  const response = await api.get('/trainers/stats');
  return response.data;
};

export const getTrainerDetails = async (trainerId) => {
  const response = await api.get(`/trainers/${trainerId}`);
  return response.data;
};

export const approveTrainer = async (trainerId, notes = '') => {
  const response = await api.patch(`/trainers/${trainerId}/approve`, { notes });
  return response.data;
};

export const rejectTrainer = async (trainerId, rejectionReason) => {
  const response = await api.patch(`/trainers/${trainerId}/reject`, { rejectionReason });
  return response.data;
};

export const blockTrainer = async (trainerId, blockedReason) => {
  const response = await api.patch(`/trainers/${trainerId}/block`, { blockedReason });
  return response.data;
};

export const unblockTrainer = async (trainerId) => {
  const response = await api.patch(`/trainers/${trainerId}/unblock`);
  return response.data;
};

export const deleteTrainer = async (trainerId) => {
  const response = await api.delete(`/trainers/${trainerId}`);
  return response.data;
};

// Payments
export const getAllTransactions = async (params) => {
  const response = await api.get('/transactions', { params });
  return response.data;
};

export const getRevenueReports = async (params) => {
  const response = await api.get('/revenue/reports', { params });
  return response.data;
};

export const getPendingPayouts = async () => {
  const response = await api.get('/payouts/pending');
  return response.data;
};

export const processPayout = async (payoutId, data) => {
  const response = await api.patch(`/payouts/${payoutId}/process`, data);
  return response.data;
};

// CMS
export const getAllBanners = async () => {
  const response = await api.get('/cms/banners');
  return response.data;
};

export const createBanner = async (data) => {
  const response = await api.post('/cms/banners', data);
  return response.data;
};

export const updateBanner = async (bannerId, data) => {
  const response = await api.patch(`/cms/banners/${bannerId}`, data);
  return response.data;
};

export const deleteBanner = async (bannerId) => {
  const response = await api.delete(`/cms/banners/${bannerId}`);
  return response.data;
};

// Gym Categories
export const getAllGymCategories = async () => {
  const response = await api.get('/cms/gym-categories');
  return response.data;
};

export const createGymCategory = async (data) => {
  const response = await api.post('/cms/gym-categories', data);
  return response.data;
};

export const updateGymCategory = async (categoryId, data) => {
  const response = await api.patch(`/cms/gym-categories/${categoryId}`, data);
  return response.data;
};

export const deleteGymCategory = async (categoryId) => {
  const response = await api.delete(`/cms/gym-categories/${categoryId}`);
  return response.data;
};

// Gym Owners
export const getAllGymOwners = async (params) => {
  const response = await api.get('/gym-owners', { params });
  return response.data;
};

export const approveGymOwner = async (ownerId) => {
  const response = await api.patch(`/gym-owners/${ownerId}/approve`);
  return response.data;
};

export const rejectGymOwner = async (ownerId, reason) => {
  const response = await api.patch(`/gym-owners/${ownerId}/reject`, { reason });
  return response.data;
};

// City Admins (Platform Admin view)
export const getCityAdmins = async () => {
  const response = await api.get('/city-admins');
  return response.data;
};

export default api;
