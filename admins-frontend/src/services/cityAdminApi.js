import axios from 'axios';
import { apiPath } from './config';

const API_URL = apiPath('/city-admin');

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

// 1. Dashboard
export const getDashboardData = async (city) => {
  const response = await api.get('/dashboard', { params: { city } });
  return response.data;
};

// 2. Users
export const getAllUsers = async (params) => {
  const response = await api.get('/users', { params });
  return response.data;
};

// 3. Gyms
export const getAllGyms = async (params) => {
  const response = await api.get('/gyms', { params });
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

// 3.5. Gym Owners
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

// 4. Trainers
export const getAllTrainers = async (params) => {
  const response = await api.get('/trainers', { params });
  return response.data;
};

export const getTrainerDetails = async (trainerId) => {
  const response = await api.get(`/trainers/${trainerId}`);
  return response.data;
};

export const approveTrainer = async (trainerId) => {
  const response = await api.patch(`/trainers/${trainerId}/approve`);
  return response.data;
};

export const rejectTrainer = async (trainerId, reason) => {
  const response = await api.patch(`/trainers/${trainerId}/reject`, { reason });
  return response.data;
};

export const blockTrainer = async (trainerId) => {
  const response = await api.patch(`/trainers/${trainerId}/block`);
  return response.data;
};

// 5. Dietitians
export const getAllDietitians = async (params) => {
  const response = await api.get('/dietitians', { params });
  return response.data;
};

export const approveDietitian = async (dietitianId) => {
  const response = await api.patch(`/dietitians/${dietitianId}/approve`);
  return response.data;
};

// 6. Analytics
export const getAnalytics = async (params) => {
  const response = await api.get('/analytics', { params });
  return response.data;
};

// 7. Activity Logs
export const getActivityLogs = async (params) => {
  const response = await api.get('/activity-logs', { params });
  return response.data;
};

// 8. Profile & settings
export const updateProfile = async (data) => {
  const response = await api.patch('/profile', data);
  return response.data;
};

export const changePassword = async (oldPassword, newPassword) => {
  const response = await api.patch('/change-password', { oldPassword, newPassword });
  return response.data;
};

export default {
  getDashboardData,
  getAllUsers,
  getAllGyms,
  approveGym,
  rejectGym,
  suspendGym,
  getAllGymOwners,
  approveGymOwner,
  rejectGymOwner,
  getAllTrainers,
  getTrainerDetails,
  approveTrainer,
  rejectTrainer,
  blockTrainer,
  getAllDietitians,
  approveDietitian,
  getAnalytics,
  getActivityLogs,
  updateProfile,
  changePassword
};
