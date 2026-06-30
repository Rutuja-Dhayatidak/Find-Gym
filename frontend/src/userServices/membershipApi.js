import api from './api';

// Fetch active plans of a gym
export const getActivePlans = async (gymId) => {
  const response = await api.get(`/memberships/plans/${gymId}`);
  return response.data;
};

// Fetch single plan details
export const getPlanDetails = async (planId) => {
  const response = await api.get(`/memberships/plan/${planId}`);
  return response.data;
};

// Calculate pricing breakdown
export const calculateMembership = async (planId, couponCode) => {
  const response = await api.post('/memberships/calculate', { planId, couponCode });
  return response.data;
};

// Create a membership order (online or pay at gym)
export const createMembershipOrder = async (orderData) => {
  const response = await api.post('/memberships/create-order', orderData);
  return response.data;
};

// Verify payment signature
export const verifyMembershipPayment = async (paymentData) => {
  const response = await api.post('/memberships/verify-payment', paymentData);
  return response.data;
};

// Get current user's active membership
export const getMyActiveMembership = async () => {
  const response = await api.get('/memberships/my-active');
  return response.data;
};

// Get all memberships for logged-in user
export const getMyMemberships = async () => {
  const response = await api.get('/memberships/my');
  return response.data;
};

// Get single membership details
export const getMembershipDetails = async (membershipId) => {
  const response = await api.get(`/memberships/${membershipId}`);
  return response.data;
};

// Get invoice details
export const getInvoiceDetails = async (membershipId) => {
  const response = await api.get(`/memberships/${membershipId}/invoice`);
  return response.data;
};

// Get QR Code image URL and payload
export const getQRCode = async (membershipId) => {
  const response = await api.get(`/memberships/${membershipId}/qr`);
  return response.data;
};

// Confirm pay at gym payment (Admin / Owner protected)
export const confirmPayAtGym = async (purchaseId) => {
  const response = await api.post(`/memberships/pay-at-gym/${purchaseId}/confirm`);
  return response.data;
};
