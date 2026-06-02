import React from 'react';
import type { Person } from '../../types/policy';
import { AlertCircle } from 'lucide-react';

interface PersonCardProps {
  person: Person;
  isSelected: boolean;
  onToggle: (personId: string) => void;
}

export const PersonCard: React.FC<PersonCardProps> = ({
  person,
  isSelected,
  onToggle,
}) => {
  const handleCheckboxChange = () => {
    onToggle(person.id);
  };

  const getRoleColor = (role: string): string => {
    switch (role) {
      case 'STUDENT':
        return 'bg-blue-100 text-blue-800';
      case 'FACULTY':
        return 'bg-purple-100 text-purple-800';
      case 'STAFF':
        return 'bg-green-100 text-green-800';
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'ACTIVE':
        return 'text-gray-500';
      case 'INACTIVE':
        return 'text-gray-400';
      case 'SUSPENDED':
        return 'text-red-500';
      case 'GRADUATED':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  const issueCount = person.issues?.length || person.issueCount || 0;

  return (
    <div
      className={`flex items-start gap-3 p-4 border rounded-lg transition-all ${
        isSelected
          ? 'border-blue-400 bg-blue-50'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={isSelected}
        onChange={handleCheckboxChange}
        className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
        aria-label={`Select ${person.name}`}
      />

      {/* Person Content */}
      <div className="flex-1 min-w-0">
        {/* Name and Role Row */}
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-gray-900">{person.name}</span>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(
              person.role
            )}`}
          >
            {person.role}
          </span>
        </div>

        {/* Status and Issue Count Row */}
        <div className="flex items-center gap-3 mb-2">
          <span className={`text-sm ${getStatusColor(person.status)}`}>
            {person.status}
          </span>

          {issueCount > 0 && (
            <div className="flex items-center gap-1">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-red-600">
                {issueCount} {issueCount === 1 ? 'issue' : 'issues'}
              </span>
            </div>
          )}
        </div>

        {/* Issues List */}
        {person.issues && person.issues.length > 0 && (
          <div className="text-sm text-gray-500">
            {person.issues.map((issue, idx) => (
              <div key={idx} className="truncate">
                • {issue}
              </div>
            ))}
          </div>
        )}

        {/* No issues indicator */}
        {issueCount === 0 && (
          <span className="text-sm text-gray-400">NO KNOWN ISSUES</span>
        )}
      </div>
    </div>
  );
};
