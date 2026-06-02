import React, { useCallback, useState } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';
import { PersonList } from './PersonList';
import { validatePersons } from '../../utils/complianceApi';
import type { ValidateResponse } from '../../types/policy';

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
  const [persons, setPersons] = useState<
    Array<{ id: string; name: string }>
  >([]);

  const handleSelectionChange = useCallback((newSelection: Set<string>) => {
    setSelectedPersonIds(newSelection);
    setSubmitError(null);
  }, []);

  const handleSelectAll = useCallback(() => {
    // This will be set after persons load
    // For now, we'll trigger it from PersonList
  }, []);

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
      onValidationComplete?.(results);
      // Keep modal open for now to show results
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Validation failed'
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
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
            <PersonList
              selectedPersonIds={selectedPersonIds}
              onSelectionChange={handleSelectionChange}
            />

            {/* Error Message */}
            {submitError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-red-800">{submitError}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedPersonIds.size > 0 && (
                <span>
                  {selectedPersonIds.size}{' '}
                  {selectedPersonIds.size === 1 ? 'person' : 'persons'} selected
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleClearAll}
                disabled={selectedPersonIds.size === 0 || isSubmitting}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Clear
              </button>

              <button
                onClick={() => {
                  // Select all will be handled by PersonList
                  // For now, provide visual feedback
                }}
                disabled={isSubmitting}
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
                    <Check className="w-4 h-4" />
                    Check
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
