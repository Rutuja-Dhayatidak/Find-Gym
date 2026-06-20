const trimTrailingSlash = (url) => (url || '').replace(/\/+$/, '');

export const API_BASE_URL = trimTrailingSlash(
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api'
);

export const API_ORIGIN = trimTrailingSlash(
  import.meta.env.VITE_BASE_URL || API_BASE_URL.replace(/\/api$/, '')
);

export const apiPath = (path = '') => (
  `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
);

export const resolveMediaUrl = (mediaUrl = '') => {
  if (!mediaUrl || /^https?:\/\//i.test(mediaUrl)) return mediaUrl;
  return `${API_ORIGIN}${mediaUrl.startsWith('/') ? mediaUrl : `/${mediaUrl}`}`;
};
