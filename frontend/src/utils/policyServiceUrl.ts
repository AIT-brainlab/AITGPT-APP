/**
 * Shared base URL for the compliance / policy-checker service (port 8005).
 */
export const getPolicyServiceBaseUrl = (): string => {
  if (typeof window !== 'undefined' && window.__POLICY_API_BASE_URL__) {
    return window.__POLICY_API_BASE_URL__;
  }
  if (import.meta.env.VITE_POLICY_API_URL) {
    return import.meta.env.VITE_POLICY_API_URL;
  }
  return 'http://localhost:8005';
};
