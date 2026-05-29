import { MoreHorizontal, Download, Trash2, Eye, Pencil, ChevronUp, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import type { User } from '../../types/auth';
import type { PolicyRecord } from '../../types/policy';
import { POLICY_TYPE_LABELS, POLICY_STATUS_LABELS } from '../../types/policy';
import { canManagePolicies } from '../../utils/policyPermissions';
import { PolicyTypeBadge } from './PolicyTypeBadge';

interface PolicyListTableProps {
  policies: PolicyRecord[];
  loading: boolean;
  selected: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  selectAll: boolean;
  sortColumn: 'name' | 'type' | 'dateOfIssue';
  sortDirection: 'asc' | 'desc';
  onSort: (column: 'name' | 'type' | 'dateOfIssue') => void;
  onViewDetails: (policy: PolicyRecord) => void;
  onEdit: (policy: PolicyRecord) => void;
  onDelete: (policy: PolicyRecord) => void;
  user: User;
}

function SortHeader({
  label,
  column,
  currentColumn,
  direction,
  onClick,
}: {
  label: string;
  column: 'name' | 'type' | 'dateOfIssue';
  currentColumn: string;
  direction: 'asc' | 'desc';
  onClick: () => void;
}) {
  const isActive = currentColumn === column;
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 font-semibold text-sm hover:opacity-70 transition-opacity"
      style={{ color: '#4a5568' }}
    >
      {label}
      {isActive && (
        <span>{direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</span>
      )}
    </button>
  );
}

export function PolicyListTable({
  policies,
  loading,
  selected,
  onToggleSelect,
  onToggleSelectAll,
  selectAll,
  sortColumn,
  sortDirection,
  onSort,
  onViewDetails,
  onEdit,
  onDelete,
  user,
}: PolicyListTableProps) {
  const isAdmin = canManagePolicies(user);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block">
          <div
            className="w-8 h-8 border-4 rounded-full animate-spin"
            style={{
              borderColor: '#e0e0e0',
              borderTopColor: '#2e7d32',
            }}
          />
        </div>
        <p className="mt-3 text-sm" style={{ color: '#717182' }}>
          Loading policies...
        </p>
      </div>
    );
  }

  if (policies.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="text-4xl mb-3">📋</div>
        <p className="font-medium" style={{ color: '#2f2f2f' }}>
          No policies found
        </p>
        <p className="text-sm" style={{ color: '#717182' }}>
          Try adjusting your search or filters
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
            {/* Checkbox Header */}
            <th className="w-12 px-4 py-3 text-left">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={onToggleSelectAll}
                className="w-4 h-4 rounded cursor-pointer"
                style={{
                  accentColor: '#2e7d32',
                }}
              />
            </th>

            {/* Name */}
            <th className="px-4 py-3 text-left">
              <SortHeader
                label="Policy Name"
                column="name"
                currentColumn={sortColumn}
                direction={sortDirection}
                onClick={() => onSort('name')}
              />
            </th>

            {/* Type */}
            <th className="px-4 py-3 text-left">
              <SortHeader
                label="Type"
                column="type"
                currentColumn={sortColumn}
                direction={sortDirection}
                onClick={() => onSort('type')}
              />
            </th>

            {/* Date */}
            <th className="px-4 py-3 text-left">
              <SortHeader
                label="Date of Issue"
                column="dateOfIssue"
                currentColumn={sortColumn}
                direction={sortDirection}
                onClick={() => onSort('dateOfIssue')}
              />
            </th>

            {/* Status */}
            <th className="px-4 py-3 text-left" style={{ color: '#4a5568' }}>
              <span className="font-semibold text-sm">Status</span>
            </th>

            {/* Actions */}
            <th className="px-4 py-3 text-right" style={{ color: '#4a5568' }}>
              <span className="font-semibold text-sm">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {policies.map((policy, idx) => (
            <tr
              key={policy.id}
              style={{
                borderBottom: '1px solid #e0e0e0',
                backgroundColor: idx % 2 === 0 ? '#fff' : '#f9f9f9',
              }}
              className="hover:bg-gray-50 transition-colors"
            >
              {/* Checkbox */}
              <td className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  checked={selected.has(policy.id)}
                  onChange={() => onToggleSelect(policy.id)}
                  className="w-4 h-4 rounded cursor-pointer"
                  style={{
                    accentColor: '#2e7d32',
                  }}
                />
              </td>

              {/* Name */}
              <td className="px-4 py-3">
                <span style={{ color: '#2f2f2f', fontWeight: 500 }}>{policy.name}</span>
              </td>

              {/* Type */}
              <td className="px-4 py-3">
                <PolicyTypeBadge type={policy.type} />
              </td>

              {/* Date */}
              <td className="px-4 py-3">
                <span style={{ color: '#717182', fontSize: '0.875rem' }}>{policy.dateOfIssue}</span>
              </td>

              {/* Status */}
              <td className="px-4 py-3">
                <span
                  className="inline-block px-2 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: policy.status === 'active' ? '#d1fae5' : '#fef3c7',
                    color: policy.status === 'active' ? '#065f46' : '#92400e',
                  }}
                >
                  {POLICY_STATUS_LABELS[policy.status]}
                </span>
              </td>

              {/* Actions */}
              <td className="px-4 py-3 text-right">
                <div className="relative inline-block">
                  <button
                    type="button"
                    onClick={() => setOpenMenuId(openMenuId === policy.id ? null : policy.id)}
                    className="p-1 rounded-lg hover:bg-gray-200 transition-colors"
                    title="More actions"
                  >
                    <MoreHorizontal className="w-4 h-4" style={{ color: '#4a5568' }} />
                  </button>

                  {/* Dropdown Menu */}
                  {openMenuId === policy.id && (
                    <div
                      className="absolute right-0 mt-1 min-w-[160px] py-1 rounded-lg shadow-lg z-50 bg-white"
                      style={{ border: '1px solid #e0e0e0' }}
                    >
                      {/* View Details */}
                      <button
                        type="button"
                        onClick={() => {
                          onViewDetails(policy);
                          setOpenMenuId(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-50"
                        style={{ color: '#4a5568' }}
                      >
                        <Eye className="w-4 h-4" style={{ color: '#2e7d32' }} />
                        View Details
                      </button>

                      {/* Download PDF */}
                      {policy.pdfUrl && policy.pdfUrl !== '#' && (
                        <a
                          href={policy.pdfUrl}
                          download
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-50"
                          style={{ color: '#4a5568', textDecoration: 'none' }}
                        >
                          <Download className="w-4 h-4" style={{ color: '#2e7d32' }} />
                          Download PDF
                        </a>
                      )}

                      {/* Edit (Admin Only) */}
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            onEdit(policy);
                            setOpenMenuId(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-50"
                          style={{ color: '#4a5568' }}
                        >
                          <Pencil className="w-4 h-4" style={{ color: '#f59e0b' }} />
                          Edit
                        </button>
                      )}

                      {/* Delete (Admin Only) */}
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            onDelete(policy);
                            setOpenMenuId(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-50"
                          style={{ color: '#b91c1c' }}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
