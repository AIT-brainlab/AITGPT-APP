import React, { useCallback, useState } from 'react';
import { X, Shield, AlertCircle } from 'lucide-react';
import { PersonList } from './PersonList';
import { validatePersons } from '../../utils/complianceApi';
import type { ValidateResponse, Person } from '../../types/policy';

interface CheckPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onValidationComplete?: (results: ValidateResponse) => void;
}

export const CheckPolicyModal: React.FC<CheckPolicyModalProps> = ({
  isOpen,
  onClose,
  onValidationComplete,
}) => {
  const [selectedPersonIds, setSelectedPersonIds] = useState<Set<string>>(
    new Set()
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [validationResults, setValidationResults] = useState<ValidateResponse | null>(null);
  const [allPersons, setAllPersons] = useState<Person[]>([]);

  // Quick ID → name lookup so results show names, not raw IDs
  const personNameMap = React.useMemo(
    () => new Map(allPersons.map((p) => [p.id, p.name])),
    [allPersons]
  );

  const handleSelectionChange = useCallback((newSelection: Set<string>) => {
    setSelectedPersonIds(newSelection);
    setSubmitError(null);
  }, []);

  const handleSelectAll = useCallback(() => {
    const allIds = new Set(allPersons.map(p => p.id));
    setSelectedPersonIds(allIds);
    setSubmitError(null);
  }, [allPersons]);

  const handleClearAll = useCallback(() => {
    setSelectedPersonIds(new Set());
    setSubmitError(null);
  }, []);

  const handleCheck = useCallback(async () => {
    if (selectedPersonIds.size === 0) {
      setSubmitError('Please select at least one person');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      const personIds = Array.from(selectedPersonIds);
      const results = await validatePersons(personIds);
      setValidationResults(results);
      onValidationComplete?.(results);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Compliance check failed'
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedPersonIds, onValidationComplete]);

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop with blur effect */}
      <div
        className="fixed inset-0 z-40 backdrop-blur-sm animate-fadeIn"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={onClose}
      />

      {/* Modal with fade-in animation */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Check Policy - Select Persons
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {!validationResults ? (
              <>
                <PersonList
                  selectedPersonIds={selectedPersonIds}
                  onSelectionChange={handleSelectionChange}
                  onPersonsLoaded={setAllPersons}
                />

                {/* Error Message */}
                {submitError && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-red-800">{submitError}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-3">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-900">
                        Check Complete
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        {validationResults.validationResults.length} {validationResults.validationResults.length === 1 ? 'person' : 'persons'} checked:{' '}
                        {validationResults.validationResults.filter(r => r.passed).length} compliant,{' '}
                        {validationResults.validationResults.filter(r => !r.passed).length} with violations
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900">Compliance Results</h3>
                  {validationResults.validationResults.map((result) => (
                    <div key={result.personId} className="p-3 border rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-gray-900">
                            {personNameMap.get(result.personId) ?? result.personId}
                          </span>
                          <span className="ml-2 text-xs text-gray-400">{result.personId}</span>
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            result.passed
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {result.passed 
                            ? '✓ 0 Violations' 
                            : `✗ ${(result.violations ?? []).length} Violation${(result.violations ?? []).length !== 1 ? 's' : ''}`}
                        </span>
                      </div>
                      {result.violations && result.violations.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {result.violations.map((v, idx) => (
                            <div key={v.id ?? idx} className="p-2 bg-white rounded border border-red-100">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">{v.policyName}</p>
                                  {v.description && (
                                    <p className="text-xs text-gray-600 mt-1">{v.description}</p>
                                  )}
                                </div>
                                {v.severity && (
                                  <span
                                    className={`flex-shrink-0 inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                      v.severity === 'high'
                                        ? 'bg-red-100 text-red-800'
                                        : v.severity === 'medium'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-green-100 text-green-800'
                                    }`}
                                  >
                                    {v.severity}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {!validationResults && selectedPersonIds.size > 0 && (
                <span>
                  {selectedPersonIds.size}{' '}
                  {selectedPersonIds.size === 1 ? 'person' : 'persons'} selected
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {!validationResults ? (
                <>
                  <button
                    onClick={handleClearAll}
                    disabled={selectedPersonIds.size === 0 || isSubmitting}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Clear
                  </button>

                  <button
                    onClick={handleSelectAll}
                    disabled={isSubmitting || allPersons.length === 0}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Select All
                  </button>

                  <button
                    onClick={handleCheck}
                    disabled={selectedPersonIds.size === 0 || isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Checking...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4" />
                        Check Policy
                      </>
                    )}
                  </button>

                  <button
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setValidationResults(null)}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>

                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Close
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
