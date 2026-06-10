/**
 * Policy API — Compliance Checker endpoints.
 * Uses VITE_POLICY_API_URL for real compliance service 
 * or falls back to mock mode via policyService.ts
 */
import { apiRequestFormData, del, get, patch } from './api';
import { getPolicyServiceBaseUrl } from './policyServiceUrl';
import type {
  PolicyEvaluationResult,
  PolicyListParams,
  PolicyListResponse,
  PolicyRecord,
  PolicyUpdatePayload,
} from '../types/policy';

const POLICY_API_BASE_URL = getPolicyServiceBaseUrl();

const buildQuery = (params: PolicyListParams): string => {
  const q = new URLSearchParams();
  if (params.search) q.set('search', params.search);
  if (params.type) q.set('type', params.type);
  if (params.page != null) q.set('page', String(params.page));
  if (params.page_size != null) q.set('page_size', String(params.page_size));
  if (params.sort) q.set('sort', params.sort);
  const s = q.toString();
  return s ? `?${s}` : '';
};

export const fetchPoliciesApi = (params: PolicyListParams = {}) =>
  get<PolicyListResponse>(`/api/policies/${buildQuery(params)}`);

export const fetchPolicyByIdApi = (id: string) =>
  get<PolicyRecord>(`/api/policies/${id}/`);

export const fetchCurrentPolicyApi = () => 
  get<PolicyRecord>(`${POLICY_API_BASE_URL}/api/policy`);

export const deleteCurrentPolicyApi = () => 
  del<void>(`${POLICY_API_BASE_URL}/api/policy`);

export const deletePolicyByIdApi = (id: string) => del<void>(`/api/policies/${id}/`);

export const updatePolicyApi = (id: string, body: PolicyUpdatePayload) =>
  patch<PolicyRecord>(`/api/policies/${id}/`, body as Record<string, unknown>);

export const uploadPolicyApi = (formData: FormData) =>
  apiRequestFormData<PolicyRecord>(`${POLICY_API_BASE_URL}/api/policy`, formData, 'POST');

export const uploadCurrentPolicyApi = (formData: FormData) =>
  apiRequestFormData<PolicyRecord>(`${POLICY_API_BASE_URL}/api/policy`, formData, 'POST');

export const fetchPolicyEvaluationApi = () =>
  get<PolicyEvaluationResult>('/api/policy/evaluation/');
