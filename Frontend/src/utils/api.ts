/**
 * API configuration and base functions
 */

// Get API URL from runtime config (injected by startup script) or environment variable
const getApiBaseUrl = (): string => {
  // Priority 1: Check for runtime config (injected in index.html by startup script)
  // This allows changing the API URL via environment variables without rebuilding
  if (typeof window !== 'undefined' && window.__API_BASE_URL__) {
    return window.__API_BASE_URL__;
  }
  
  // Priority 2: Fallback to Vite environment variable (build-time)
  // This is used during development or if runtime injection fails
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Priority 3: Default fallback
  return 'http://localhost:8000';
};

const API_BASE_URL = getApiBaseUrl();

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[] | string>;
}

/**
 * Get authentication token from localStorage
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

/**
 * Set authentication token in localStorage
 */
export const setAuthToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

/**
 * Remove authentication token from localStorage
 */
export const removeAuthToken = (): void => {
  localStorage.removeItem('auth_token');
};

/**
 * Make an API request with authentication
 */
export const apiRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        errors: data.errors || { message: data.message || 'An error occurred' },
      };
    }

    return {
      success: true,
      ...data,
    };
  } catch (error) {
    return {
      success: false,
      errors: {
        message: error instanceof Error ? error.message : 'Network error occurred',
      },
    };
  }
};

/**
 * Make an API request without authentication
 */
export const apiRequestWithoutAuth = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        errors: data.errors || { message: data.message || 'An error occurred' },
      };
    }

    return {
      success: true,
      ...data,
    };
  } catch (error) {
    return {
      success: false,
      errors: {
        message: error instanceof Error ? error.message : 'Network error occurred',
      },
    };
  }
};

/**
 * POST request helper
 */
export const post = <T = any>(
  endpoint: string,
  body: any
): Promise<ApiResponse<T>> => {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });
};

/**
 * POST request helper without authentication (for login/signup)
 */
export const postWithoutAuth = <T = any>(
  endpoint: string,
  body: any
): Promise<ApiResponse<T>> => {
  return apiRequestWithoutAuth<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });
};

/**
 * GET request helper
 */
export const get = <T = any>(endpoint: string): Promise<ApiResponse<T>> => {
  return apiRequest<T>(endpoint, {
    method: 'GET',
  });
};
