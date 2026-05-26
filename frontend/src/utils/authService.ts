import { User, UserRole } from '../types/auth';
import { login as apiLogin, getProfile, mapBackendUserToFrontend, LoginData } from './authApi';
import { getAuthToken } from './api';

/**
 * Authenticate user with backend API
 * For guest users, we still use mock data
 */
export const authenticateUser = async (role: UserRole): Promise<User> => {
  // Guest users don't need backend authentication
  if (role === 'guest') {
    return {
      id: 'guest-001',
      name: 'Guest User',
      email: 'guest@university.edu',
      role: 'guest',
    };
  }

  // For other roles, check if user is already logged in
  const token = getAuthToken();
  if (token) {
    try {
      const profileResponse = await getProfile();
      if (profileResponse.success && profileResponse.data) {
        return mapBackendUserToFrontend(profileResponse.data, role);
      }
    } catch (error) {
      console.error('Failed to get user profile:', error);
    }
  }

  // If not logged in, return a placeholder user
  // In a real app, you might want to redirect to login
  throw new Error('User not authenticated. Please log in.');
};

/**
 * Login user with credentials
 */
export const loginUser = async (credentials: LoginData): Promise<User> => {
  const response = await apiLogin(credentials);
  
  if (!response.success) {
    const errorMessage = response.errors 
      ? (typeof response.errors === 'string' 
          ? response.errors 
          : Object.values(response.errors).flat().join(', '))
      : 'Login failed';
    throw new Error(errorMessage);
  }

  if (!response.data) {
    throw new Error('Invalid response from server');
  }

  // Map backend user to frontend user using the provided user_type
  return mapBackendUserToFrontend(response.data.user, credentials.user_type as UserRole);
};

export const getRoleDisplayName = (role: UserRole): string => {
  const roleNames: Record<UserRole, string> = {
    guest: 'Guest',
    candidate: 'Prospective Student',
    student: 'Current Student',
    faculty: 'Faculty Member',
    staff: 'Staff Member',
    alumni: 'Alumni',
    management: 'Management',
  };
  return roleNames[role];
};

export const getRoleColor = (role: UserRole): string => {
  const roleColors: Record<UserRole, string> = {
    guest: 'bg-gray-100 text-gray-700',
    candidate: 'bg-blue-100 text-blue-700',
    student: 'bg-green-100 text-green-700',
    faculty: 'bg-purple-100 text-purple-700',
    staff: 'bg-orange-100 text-orange-700',
    alumni: 'bg-indigo-100 text-indigo-700',
    management: 'bg-red-100 text-red-700',
  };
  return roleColors[role];
};
