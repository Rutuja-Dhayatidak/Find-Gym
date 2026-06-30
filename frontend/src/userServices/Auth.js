import api from './api';

// Register a new user
export const registerUser = async (formData) => {
  const config = formData instanceof FormData 
    ? { headers: { 'Content-Type': 'multipart/form-data' } } 
    : {};
  const response = await api.post('/auth/register', formData, config);
  return response.data;
};

// Login a user
export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

// Send OTP to user's email
export const sendOtp = async (email) => {
  const response = await api.post('/auth/send-otp', { email });
  return response.data;
};

// Verify OTP
export const verifyOtp = async (email, otp) => {
  const response = await api.post('/auth/verify-otp', { email, otp });
  return response.data;
};

// Get authenticated user profile
export const getUserProfile = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// Update authenticated user profile
export const updateUserProfile = async (formData) => {
  const config = formData instanceof FormData 
    ? { headers: { 'Content-Type': 'multipart/form-data' } } 
    : {};
  const response = await api.put('/auth/profile', formData, config);
  return response.data;
};

// Google Login / Sign-up
export const googleLogin = async (token) => {
  const response = await api.post('/auth/google-login', { token });
  return response.data;
};
