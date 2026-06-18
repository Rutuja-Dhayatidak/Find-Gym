import api from './api';

// Register a new gym
export const registerGym = async (formData) => {
  const response = await api.post('/gyms', formData);
  return response.data;
};

// Get nearby gyms within a specified radius
export const getNearbyGyms = async ({ lat, lng, radius = 15, page = 1, limit = 10 }) => {
  const response = await api.get('/gyms/nearby', {
    params: { lat, lng, radius, page, limit },
  });
  return response.data;
};

// Get all active gyms (paginated)
export const getAllGyms = async ({ page = 1, limit = 10 } = {}) => {
  const response = await api.get('/gyms', {
    params: { page, limit },
  });
  return response.data;
};

// Get details of a single gym by ID
export const getGymById = async (id) => {
  const response = await api.get(`/gyms/${id}`);
  return response.data;
};

// Setup gym details
export const setupGym = async (id, data) => {
  const response = await api.patch(`/gyms/${id}/setup`, data);
  return response.data;
};

// Upload gym image
export const uploadGymImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  const response = await api.post('/gyms/upload-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};
