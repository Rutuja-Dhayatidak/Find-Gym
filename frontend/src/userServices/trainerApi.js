import api from './api';

// --------------- AUTH ---------------
export const registerTrainer = async (formData) => {
  const response = await api.post('/trainer/auth/register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const loginTrainer = async (credentials) => {
  const response = await api.post('/trainer/auth/login', credentials);
  return response.data;
};

// --------------- PROFILE ---------------
export const getTrainerProfile = async () => {
  const response = await api.get('/trainer/profile');
  return response.data;
};

export const updateTrainerProfile = async (formData) => {
  const response = await api.put('/trainer/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getTrainerStatus = async () => {
  const response = await api.get('/trainer/status');
  return response.data;
};

export const updateAvailability = async (availability) => {
  const response = await api.put('/trainer/availability', { availability });
  return response.data;
};

export const reapplyTrainer = async (formData) => {
  const response = await api.post('/trainer/reapply', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// --------------- PUBLIC ---------------
export const getPublicTrainers = async (params) => {
  const response = await api.get('/public/trainers', { params });
  return response.data;
};

export const getPublicTrainerById = async (id) => {
  const response = await api.get(`/public/trainers/${id}`);
  return response.data;
};

export default api;
