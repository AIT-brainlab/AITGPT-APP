/**
 * Session storage utilities for persisting user sessions
 */
import { User } from '../types/auth';

const SESSION_STORAGE_KEY = 'chat_user_session';

/**
 * Save user session to localStorage
 */
export const saveUserSession = (user: User): void => {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Failed to save user session:', error);
  }
};

/**
 * Load user session from localStorage
 */
export const loadUserSession = (): User | null => {
  try {
    const sessionData = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!sessionData) {
      return null;
    }
    return JSON.parse(sessionData) as User;
  } catch (error) {
    console.error('Failed to load user session:', error);
    return null;
  }
};

/**
 * Clear user session from localStorage
 */
export const clearUserSession = (): void => {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear user session:', error);
  }
};

/**
 * Check if a valid session exists
 */
export const hasValidSession = (): boolean => {
  const session = loadUserSession();
  return session !== null;
};
