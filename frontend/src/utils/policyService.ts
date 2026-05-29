import type { User } from '../types/auth';
import type {
  PolicyEvaluationResult,
  PolicyListParams,
  PolicyListResponse,
  PolicyRecord,
  PolicyStatus,
  PolicyType,
  PolicyUploadPayload,
  PolicyUpdatePayload,
  PolicyViolation,
} from '../types/policy';
import {
  deleteCurrentPolicyApi,
  deletePolicyByIdApi,
  fetchCurrentPolicyApi,
  fetchPoliciesApi,
  fetchPolicyByIdApi,
  fetchPolicyEvaluationApi,
  updatePolicyApi,
  uploadCurrentPolicyApi,
  uploadPolicyApi,
} from './policyApi';

const MOCK_ENABLED = import.meta.env.VITE_POLICY_MOCK === 'true';
const MOCK_SCENARIO = (import.meta.env.VITE_POLICY_MOCK_SCENARIO || 'pass') as
  | 'pass'
  | 'fail'
  | 'empty';

let mockPolicies: PolicyRecord[] = [
  {
    id: '1',
    name: 'Student Code of Conduct',
    type: 'conduct',
    dateOfIssue: '2024-09-01',
    status: 'active',
    description: 'Standards of behavior for all enrolled students.',
    pdfUrl: '#',
  },
  {
    id: '2',
    name: 'Academic Integrity Policy',
    type: 'academic',
    dateOfIssue: '2025-01-15',
    status: 'active',
    description: 'Plagiarism, examination rules, and academic honesty.',
    pdfUrl: '#',
  },
  {
    id: '3',
    name: 'Tuition & Fee Regulations',
    type: 'financial',
    dateOfIssue: '2024-06-20',
    status: 'active',
    description: 'Payment schedules, refunds, and financial obligations.',
  },
  {
    id: '4',
    name: 'Campus Safety Guidelines',
    type: 'safety',
    dateOfIssue: '2023-11-10',
    status: 'archived',
    description: 'Emergency procedures and campus access rules.',
  },
  {
    id: '5',
    name: 'HR Workplace Policy',
    type: 'hr',
    dateOfIssue: '2025-03-01',
    status: 'pending',
    description: 'Staff workplace expectations and leave policies.',
  },
];

const MOCK_VIOLATIONS: PolicyViolation[] = [
  {
    id: 'v1',
    policyId: '1',
    policyName: 'Student Code of Conduct',
    summary: 'Late submission of required acknowledgment form.',
  },
  {
    id: 'v2',
    policyId: '2',
    policyName: 'Academic Integrity Policy',
    summary: 'Incomplete citation in submitted coursework.',
  },
  {
    id: 'v3',
    policyId: '3',
    policyName: 'Tuition & Fee Regulations',
    summary: 'Outstanding balance past due date.',
  },
];

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const filterMockPolicies = (params: PolicyListParams): PolicyListResponse => {
  let list = [...mockPolicies];
  const search = params.search?.toLowerCase().trim();
  if (search) {
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        p.description?.toLowerCase().includes(search)
    );
  }
  if (params.type) {
    list = list.filter((p) => p.type === params.type);
  }
  if (params.sort === 'date_asc') {
    list.sort((a, b) => a.dateOfIssue.localeCompare(b.dateOfIssue));
  } else {
    list.sort((a, b) => b.dateOfIssue.localeCompare(a.dateOfIssue));
  }
  const page = params.page ?? 1;
  const pageSize = params.page_size ?? 10;
  const start = (page - 1) * pageSize;
  const results = list.slice(start, start + pageSize);
  return { results, count: list.length };
};

const apiError = (response: { message?: string; errors?: Record<string, string[] | string> }): string => {
  if (response.message) return response.message;
  const err = response.errors;
  if (!err) return 'Request failed';
  const msg = err.message;
  if (typeof msg === 'string') return msg;
  if (Array.isArray(msg)) return msg[0];
  const first = Object.values(err)[0];
  return typeof first === 'string' ? first : Array.isArray(first) ? first[0] : 'Request failed';
};

const normalizePolicyResponse = (
  data: unknown,
  fallback: {
    name: string;
    type: PolicyType;
    dateOfIssue?: string;
    description?: string;
    status?: PolicyStatus;
  }
): PolicyRecord => {
  const fallbackRecord: PolicyRecord = {
    id: String(Date.now()),
    name: fallback.name,
    type: fallback.type,
    dateOfIssue: fallback.dateOfIssue ?? new Date().toISOString().slice(0, 10),
    status: fallback.status ?? 'active',
    description: fallback.description,
  };

  if (!data) {
    return fallbackRecord;
  }

  if (typeof data === 'string') {
    return {
      ...fallbackRecord,
      pdfUrl: data,
    };
  }

  if (typeof data === 'object' && data !== null) {
    const payload = data as Record<string, unknown>;
    const pdfUrl =
      typeof payload.pdfUrl === 'string'
        ? payload.pdfUrl
        : typeof payload.path === 'string'
        ? payload.path
        : undefined;

    if (
      typeof payload.id === 'string' &&
      typeof payload.name === 'string' &&
      typeof payload.type === 'string' &&
      typeof payload.dateOfIssue === 'string' &&
      typeof payload.status === 'string'
    ) {
      return {
        id: payload.id,
        name: payload.name,
        type: payload.type as PolicyType,
        dateOfIssue: payload.dateOfIssue,
        status: payload.status as PolicyStatus,
        description:
          typeof payload.description === 'string'
            ? payload.description
            : fallbackRecord.description,
        pdfUrl,
        updatedAt:
          typeof payload.updatedAt === 'string'
            ? payload.updatedAt
            : undefined,
      };
    }

    return {
      ...fallbackRecord,
      description:
        typeof payload.description === 'string'
          ? payload.description
          : fallbackRecord.description,
      pdfUrl,
      updatedAt:
        typeof payload.updatedAt === 'string'
          ? payload.updatedAt
          : undefined,
    };
  }

  return fallbackRecord;
};

export const listPolicies = async (params: PolicyListParams = {}): Promise<PolicyListResponse> => {
  if (MOCK_ENABLED) {
    await delay(400);
    if (MOCK_SCENARIO === 'empty') return { results: [], count: 0 };
    return filterMockPolicies(params);
  }
  const res = await fetchPoliciesApi(params);
  if (!res.success || !res.data) throw new Error(apiError(res));
  return res.data;
};

export const getPolicyById = async (id: string): Promise<PolicyRecord> => {
  if (MOCK_ENABLED) {
    await delay(200);
    const found = mockPolicies.find((p) => p.id === id);
    if (!found) throw new Error('Policy not found');
    return found;
  }
  const res = await fetchPolicyByIdApi(id);
  if (!res.success || !res.data) throw new Error(apiError(res));
  return res.data;
};

export const getCurrentPolicy = async (): Promise<PolicyRecord | null> => {
  if (MOCK_ENABLED) {
    await delay(300);
    const active = mockPolicies.find((p) => p.status === 'active');
    return active ?? mockPolicies[0] ?? null;
  }
  const res = await fetchCurrentPolicyApi();
  if (!res.success) {
    const msg = apiError(res);
    if (msg.toLowerCase().includes('not found') || msg.includes('404')) return null;
    throw new Error(msg);
  }
  return normalizePolicyResponse(res.data, {
    name: 'Current policy',
    type: 'general',
    dateOfIssue: new Date().toISOString().slice(0, 10),
    status: 'active',
  });
};

export const evaluateUserPolicies = async (_user: User): Promise<PolicyEvaluationResult> => {
  if (MOCK_ENABLED) {
    await delay(1200);
    if (MOCK_SCENARIO === 'fail') {
      return { passed: false, violations: MOCK_VIOLATIONS };
    }
    return { passed: true, violations: [] };
  }
  const res = await fetchPolicyEvaluationApi();
  if (!res.success) {
    console.warn('[policy] evaluation endpoint unavailable, treating as pass');
    return { passed: true, violations: [] };
  }
  return res.data ?? { passed: true, violations: [] };
};

export const uploadPolicy = async (payload: PolicyUploadPayload): Promise<PolicyRecord> => {
  const formData = new FormData();
  formData.append('name', payload.name);
  formData.append('type', payload.type);
  if (payload.description) formData.append('description', payload.description);
  if (payload.dateOfIssue) formData.append('date_of_issue', payload.dateOfIssue);
  if (payload.file) formData.append('file', payload.file);

  if (MOCK_ENABLED) {
    await delay(600);
    const record: PolicyRecord = {
      id: String(Date.now()),
      name: payload.name,
      type: payload.type,
      dateOfIssue: payload.dateOfIssue || new Date().toISOString().slice(0, 10),
      status: 'active',
      description: payload.description,
      pdfUrl: payload.file ? URL.createObjectURL(payload.file) : undefined,
    };
    mockPolicies = [record, ...mockPolicies];
    return record;
  }

  const res = await uploadPolicyApi(formData);
  if (!res.success) throw new Error(apiError(res));
  return normalizePolicyResponse(res.data, {
    name: payload.name,
    type: payload.type,
    dateOfIssue: payload.dateOfIssue,
    description: payload.description,
    status: 'active',
  });
};

export const updatePolicy = async (id: string, payload: PolicyUpdatePayload): Promise<PolicyRecord> => {
  if (MOCK_ENABLED) {
    await delay(400);
    const idx = mockPolicies.findIndex((p) => p.id === id);
    if (idx < 0) throw new Error('Policy not found');
    mockPolicies[idx] = {
      ...mockPolicies[idx],
      ...payload,
      dateOfIssue: payload.dateOfIssue ?? mockPolicies[idx].dateOfIssue,
    };
    return mockPolicies[idx];
  }
  const res = await updatePolicyApi(id, payload);
  if (!res.success || !res.data) throw new Error(apiError(res));
  return res.data;
};

export const deletePolicy = async (id: string): Promise<void> => {
  if (MOCK_ENABLED) {
    await delay(350);
    mockPolicies = mockPolicies.filter((p) => p.id !== id);
    return;
  }
  const res = await deletePolicyByIdApi(id);
  if (!res.success) throw new Error(apiError(res));
};

export const deleteCurrentPolicy = async (): Promise<void> => {
  if (MOCK_ENABLED) {
    await delay(350);
    const active = mockPolicies.find((p) => p.status === 'active');
    if (active) mockPolicies = mockPolicies.filter((p) => p.id !== active.id);
    return;
  }
  const res = await deleteCurrentPolicyApi();
  if (!res.success) throw new Error(apiError(res));
};

export const uploadCurrentPolicy = async (payload: PolicyUploadPayload): Promise<PolicyRecord> => {
  const formData = new FormData();
  formData.append('name', payload.name);
  formData.append('type', payload.type);
  if (payload.description) formData.append('description', payload.description);
  if (payload.dateOfIssue) formData.append('date_of_issue', payload.dateOfIssue);
  if (payload.file) formData.append('file', payload.file);

  if (MOCK_ENABLED) {
    return uploadPolicy(payload);
  }

  const res = await uploadCurrentPolicyApi(formData);
  if (!res.success) throw new Error(apiError(res));
  return normalizePolicyResponse(res.data, {
    name: payload.name,
    type: payload.type,
    dateOfIssue: payload.dateOfIssue,
    description: payload.description,
    status: 'active',
  });
};
