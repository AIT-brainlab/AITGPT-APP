/**
 * Compliance API integration for policy checking
 * Handles communication with the compliance service (running on port 8005)
 */

import type {
  Person,
  PersonListResponse,
  ValidateRequest,
  ValidateResponse,
} from '../types/policy';
import type { ApiResponse } from './api';

// Get compliance API URL from runtime config or environment variable
const getComplianceApiBaseUrl = (): string => {
  // Priority 1: Runtime config (injected in index.html by startup script)
  if (typeof window !== 'undefined' && window.__COMPLIANCE_API_BASE_URL__) {
    return window.__COMPLIANCE_API_BASE_URL__;
  }

  // Priority 2: Vite environment variable
  if (import.meta.env.VITE_COMPLIANCE_API_URL) {
    return import.meta.env.VITE_COMPLIANCE_API_URL;
  }

  // Priority 3: Default fallback (compliance service port)
  return 'http://localhost:8005';
};

const COMPLIANCE_API_BASE_URL = getComplianceApiBaseUrl();

/**
 * Fetch list of persons from compliance API
 * GET /api/persons
 */
export const fetchPersonsApi = async (): Promise<ApiResponse<Person[]>> => {
  try {
    const url = `${COMPLIANCE_API_BASE_URL}/api/persons`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return {
        success: false,
        errors: {
          message: `Failed to fetch persons: ${response.statusText}`,
        },
      };
    }

    const responseData: PersonListResponse = await response.json();

    return {
      success: true,
      data: responseData.persons,
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
 * Submit person IDs for validation
 * POST /api/validate
 */
export const validatePersonsApi = async (
  personIds: string[],
  policyIds?: string[]
): Promise<ApiResponse<ValidateResponse>> => {
  try {
    const url = `${COMPLIANCE_API_BASE_URL}/api/validate`;

    const payload: ValidateRequest = {
      personIds,
      ...(policyIds && policyIds.length > 0 && { policyIds }),
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return {
        success: false,
        errors: {
          message: `Validation failed: ${response.statusText}`,
        },
      };
    }

    const responseData: ValidateResponse = await response.json();

    return {
      success: true,
      data: responseData,
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
 * Service wrapper functions with error handling
 */
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
