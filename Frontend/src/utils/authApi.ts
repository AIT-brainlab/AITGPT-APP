/**
 * Authentication API functions
 */
import { post, get, postWithoutAuth, setAuthToken, removeAuthToken, ApiResponse } from './api';
import { User } from '../types/auth';

export interface LoginData {
  username: string;
  password: string;
  user_type: string;
}

export interface BackendUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
  is_active: boolean;
}

export interface AuthResponse {
  token: string;
  user: BackendUser;
}

/**
 * Map backend user to frontend User interface
 * Note: Backend doesn't have role, so we'll default to 'guest' or allow it to be set
 */
export const mapBackendUserToFrontend = (
  backendUser: BackendUser,
  role: User['role'] = 'guest'
): User => {
  const fullName = [backendUser.first_name, backendUser.last_name]
    .filter(Boolean)
    .join(' ') || backendUser.username;

  return {
    id: backendUser.id.toString(),
    name: fullName,
    email: backendUser.email,
    role,
  };
};

/**
 * Log in a user
 * Note: This endpoint should not send Authorization header
 */
export const login = async (
  data: LoginData
): Promise<ApiResponse<AuthResponse>> => {
  // Use postWithoutAuth to ensure no Authorization header is sent
  const response = await postWithoutAuth<AuthResponse>('/api/auth/login/', data);
  
  if (response.success && response.data?.token) {
    setAuthToken(response.data.token);
  }
  
  return response;
};

/**
 * Log out the current user
 */
export const logout = async (): Promise<ApiResponse> => {
  const response = await post('/api/auth/logout/', {});
  removeAuthToken();
  return response;
};

/**
 * Get current user profile
 */
export const getProfile = async (): Promise<ApiResponse<BackendUser>> => {
  return get<BackendUser>('/api/auth/profile/');
};
