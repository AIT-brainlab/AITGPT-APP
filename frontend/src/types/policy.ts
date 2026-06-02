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

export type PersonRole = 'STUDENT' | 'FACULTY' | 'STAFF' | 'ADMIN';

export type PersonStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'GRADUATED';

export interface Person {
  id: string;
  name: string;
  role: PersonRole;
  status: PersonStatus;
  issueCount: number;
  issues?: string[];
}

export interface PersonListResponse {
  persons: Person[];
}

export interface ValidateRequest {
  personIds: string[];
  policyIds?: string[];
}

export interface ValidationViolation {
  id: string;
  policyId: string;
  policyName: string;
  description?: string;
  severity?: 'high' | 'medium' | 'low';
}

export interface PersonValidationResult {
  personId: string;
  passed: boolean;
  violations?: ValidationViolation[];
}

export interface ValidateResponse {
  validationResults: PersonValidationResult[];
  timestamp?: string;
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
