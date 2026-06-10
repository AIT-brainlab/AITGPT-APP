/**
 * Compliance API integration for policy checking.
 * Person list and violation details come from compliance GET /api/person (real SHACL data).
 * Validate pass/fail uses POST /api/person/validate-by-id.
 */

import type {
  Person,
  ValidateResponse,
  ValidationViolation,
} from '../types/policy';
import type { ApiResponse } from './api';
import { getPolicyServiceBaseUrl } from './policyServiceUrl';
import { getBackendApiUrl } from './backendApiUrl';

const COMPLIANCE_API_BASE_URL = getPolicyServiceBaseUrl();

interface ApiConform {
  rule_id: string;
  rule_text: string;
  severity: string;
  message: string;
}

interface ApiPerson {
  id: string;
  name: string;
  type: string;
  not_conforms: ApiConform[];
}

const RULE_SEVERITY_MAP: Record<string, ValidationViolation['severity']> = {
  AIT_0086Shape: 'high',
  AIT_0089Shape: 'high',
  AIT_0079Shape: 'high',
  AIT_0090Shape: 'medium',
  AIT_0219Shape: 'high',
  AIT_0007Shape: 'high',
  AIT_0070Shape: 'medium',
  AIT_0072Shape: 'low',
  AIT_0056Shape: 'high',
  AIT_0100Shape: 'high',
  AIT_0101Shape: 'high',
  AIT_0029Shape: 'high',
};

/** Map compliance not_conforms to frontend ValidationViolation shape. */
export function mapNotConformsToViolations(
  personId: string,
  notConforms: ApiConform[]
): ValidationViolation[] {
  return (notConforms || []).map((conform) => ({
    id: `${personId}_${conform.rule_id}`,
    policyId: conform.rule_id,
    policyName: conform.rule_text,
    description: conform.message,
    severity: RULE_SEVERITY_MAP[conform.rule_id] ?? 'high',
  }));
}

/** Map not_conforms to short issue strings for PersonCard bullet list. */
export function mapNotConformsToIssueStrings(notConforms: ApiConform[]): string[] {
  return (notConforms || []).map(
    (conform) => conform.message || conform.rule_text
  );
}

function mapTypeToRole(type: string): Person['role'] {
  switch (type.toLowerCase()) {
    case 'faculty':
      return 'FACULTY';
    case 'staff':
    case 'employee':
      return 'STAFF';
    case 'student':
    default:
      return 'STUDENT';
  }
}

async function fetchCompliancePersonsRaw(): Promise<ApiPerson[]> {
  const url = `${COMPLIANCE_API_BASE_URL}/api/person`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch persons from compliance: ${response.statusText}`);
  }

  return response.json();
}

/** Fetch violations for selected persons directly from compliance (source of truth). */
export async function fetchViolationsFromCompliance(
  personIds: string[]
): Promise<Array<{ personId: string; personName: string; violations: ValidationViolation[] }>> {
  if (personIds.length === 0) {
    return [];
  }

  const raw = await fetchCompliancePersonsRaw();
  const idSet = new Set(personIds);

  return raw
    .filter((p) => idSet.has(p.id))
    .map((p) => ({
      personId: p.id,
      personName: p.name,
      violations: mapNotConformsToViolations(p.id, p.not_conforms ?? []),
    }));
}

export const fetchPersonsApi = async (): Promise<ApiResponse<Person[]>> => {
  try {
    const raw = await fetchCompliancePersonsRaw();

    const persons: Person[] = raw.map((p) => {
      const issues = mapNotConformsToIssueStrings(p.not_conforms ?? []);
      return {
        id: p.id,
        name: p.name,
        role: mapTypeToRole(p.type),
        status: 'ACTIVE',
        issueCount: issues.length,
        issues,
      };
    });

    return { success: true, data: persons };
  } catch (error) {
    return {
      success: false,
      errors: { message: error instanceof Error ? error.message : 'Network error occurred' },
    };
  }
};

/** Django proxy fallback when browser cannot reach compliance directly. */
export const fetchViolationsApi = async (
  personIds: string[]
): Promise<ApiResponse<{ violations: Array<{ personId: string; personName: string; violations: ValidationViolation[] }> }>> => {
  try {
    if (personIds.length === 0) {
      return { success: true, data: { violations: [] } };
    }

    const backendUrl = getBackendApiUrl();
    const queryString = new URLSearchParams({
      personIds: personIds.join(','),
    }).toString();
    const url = `${backendUrl}/api/tasks/violations/?${queryString}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      return {
        success: false,
        errors: { message: `Failed to fetch violations: ${response.statusText}` },
      };
    }

    const data = await response.json();
    return { success: true, data: data.data };
  } catch (error) {
    return {
      success: false,
      errors: { message: error instanceof Error ? error.message : 'Network error occurred' },
    };
  }
};

async function validatePersonById(personId: string): Promise<boolean> {
  const url = `${COMPLIANCE_API_BASE_URL}/api/person/validate-by-id`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: personId }),
  });

  if (!response.ok) {
    throw new Error(`Validation failed for ${personId}: ${response.statusText}`);
  }

  const result = await response.json();
  return result === true;
}

export const validatePersonsApi = async (
  personIds: string[],
  _policyIds?: string[]
): Promise<ApiResponse<ValidateResponse>> => {
  try {
    const validationResults = await Promise.all(
      personIds.map(async (personId) => {
        const passed = await validatePersonById(personId);
        return {
          personId,
          passed,
          violations: [] as ValidationViolation[],
        };
      })
    );

    // Primary: compliance API (same data as person list — real SHACL not_conforms)
    let violationsByPersonId = new Map<string, ValidationViolation[]>();
    try {
      const fromCompliance = await fetchViolationsFromCompliance(personIds);
      violationsByPersonId = new Map(
        fromCompliance.map((v) => [v.personId, v.violations])
      );
    } catch {
      // Fallback: Django proxy (devcontainer backend → compliance)
      const violationsResponse = await fetchViolationsApi(personIds);
      if (!violationsResponse.success) {
        return {
          success: false,
          errors: violationsResponse.errors ?? { message: 'Failed to fetch violation details' },
        };
      }
      violationsByPersonId = new Map(
        (violationsResponse.data?.violations ?? []).map((v) => [v.personId, v.violations])
      );
    }

    for (const result of validationResults) {
      const personViolations = violationsByPersonId.get(result.personId);
      if (personViolations && personViolations.length > 0) {
        result.passed = false;
        result.violations = personViolations;
      }
    }

    return {
      success: true,
      data: { validationResults },
    };
  } catch (error) {
    return {
      success: false,
      errors: {
        message: error instanceof Error ? error.message : 'Validation failed',
      },
    };
  }
};

export const fetchPersons = async (): Promise<Person[]> => {
  const response = await fetchPersonsApi();

  if (!response.success) {
    throw new Error(
      typeof response.errors?.message === 'string'
        ? response.errors.message
        : 'Failed to fetch persons'
    );
  }

  return response.data || [];
};

export const validatePersons = async (
  personIds: string[],
  policyIds?: string[]
): Promise<ValidateResponse> => {
  if (personIds.length === 0) {
    throw new Error('At least one person must be selected');
  }

  const response = await validatePersonsApi(personIds, policyIds);

  if (!response.success) {
    throw new Error(
      typeof response.errors?.message === 'string'
        ? response.errors.message
        : 'Validation failed'
    );
  }

  return response.data || { validationResults: [] };
};
