export type PolicyType = 'academic' | 'conduct' | 'financial' | 'general' | 'hr' | 'safety';

export type PolicyStatus = 'active' | 'draft' | 'archived' | 'pending';

export interface PolicyRecord {
  id: string;
  name: string;
  type: PolicyType;
  dateOfIssue: string;
  status: PolicyStatus;
  description?: string;
  pdfUrl?: string;
  updatedAt?: string;
}

export interface PolicyListResponse {
  results: PolicyRecord[];
  count: number;
}

export interface PolicyListParams {
  search?: string;
  type?: PolicyType | '';
  page?: number;
  page_size?: number;
  sort?: 'date_asc' | 'date_desc';
}

export interface PolicyViolation {
  id: string;
  policyId: string;
  policyName: string;
  summary?: string;
}

export interface PolicyEvaluationResult {
  passed: boolean;
  violations: PolicyViolation[];
}

export interface PolicyUploadPayload {
  name: string;
  type: PolicyType;
  description?: string;
  dateOfIssue?: string;
  file?: File;
}

export interface PolicyUpdatePayload {
  name?: string;
  type?: PolicyType;
  description?: string;
  dateOfIssue?: string;
  status?: PolicyStatus;
}

export const POLICY_TYPE_LABELS: Record<PolicyType, string> = {
  academic: 'Academic',
  conduct: 'Conduct',
  financial: 'Financial',
  general: 'General',
  hr: 'HR',
  safety: 'Safety',
};

export const POLICY_STATUS_LABELS: Record<PolicyStatus, string> = {
  active: 'Active',
  draft: 'Draft',
  archived: 'Archived',
  pending: 'Pending',
};
