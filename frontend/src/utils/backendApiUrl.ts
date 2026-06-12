/**
 * Shared base URL for the Django backend service (port 8000).
 */
export const getBackendApiUrl = (): string => {
  if (typeof window !== 'undefined' && window.__BACKEND_API_BASE_URL__) {
    return window.__BACKEND_API_BASE_URL__;
  }
  if (import.meta.env.VITE_BACKEND_API_URL) {
    return import.meta.env.VITE_BACKEND_API_URL;
  }
  return 'http://localhost:8000';
};
