import { User } from '../types/auth';

const MANAGE_ROLES = new Set(['staff', 'management']);

export const isPolicyDevAdmin = (): boolean =>
  import.meta.env.VITE_POLICY_DEV_ADMIN === 'true';

export const canManagePolicies = (user: User | null): boolean => {
  if (!user || user.role === 'guest') return false;
  if (isPolicyDevAdmin()) return true;
  return MANAGE_ROLES.has(user.role);
};

export const canViewPolicies = (user: User | null): boolean => {
  return !!user && user.role !== 'guest';
};

export const clearPolicyEvalSession = (): void => {
  sessionStorage.removeItem('policy_eval_shown');
};
