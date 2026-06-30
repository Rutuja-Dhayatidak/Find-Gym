import api from './api';

export const getActiveBanners = async () => {
  return api.get('/superadmin/cms/banners');
};

export const getPublicStats = async () => {
  const response = await api.get('/public/stats');
  return response.data;
};
