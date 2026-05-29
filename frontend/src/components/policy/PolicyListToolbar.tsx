import { Trash2, Download, CheckCircle, X } from 'lucide-react';
import { useState } from 'react';
import type { User } from '../../types/auth';
import type { PolicyRecord } from '../../types/policy';
import { canManagePolicies } from '../../utils/policyPermissions';
import { deletePolicy, updatePolicy } from '../../utils/policyService';

interface PolicyListToolbarProps {
  selectedCount: number;
  selectedIds: string[];
  policies: PolicyRecord[];
  user: User;
  onSuccess: () => void;
  onError: (msg: string) => void;
  onClearSelection: () => void;
}

export function PolicyListToolbar({
  selectedCount,
  selectedIds,
  policies,
  user,
  onSuccess,
  onError,
  onClearSelection,
}: PolicyListToolbarProps) {
  const isAdmin = canManagePolicies(user);
  const [loading, setLoading] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  if (!isAdmin) {
    return null;
  }

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedCount} policies? This cannot be undone.`)) {
      return;
    }

    setLoading(true);
    let deleted = 0;
    let failed = 0;

    for (const id of selectedIds) {
      try {
        await deletePolicy(id);
        deleted++;
      } catch (e) {
        failed++;
      }
    }

    setLoading(false);
    if (failed === 0) {
      onSuccess();
    } else {
      onError(`Deleted ${deleted}, but ${failed} failed.`);
      setTimeout(onSuccess, 2000);
    }
  };

  const handleBulkStatusChange = async (newStatus: 'active' | 'draft' | 'archived') => {
    setLoading(true);
    let updated = 0;
    let failed = 0;

    for (const id of selectedIds) {
      try {
        await updatePolicy(id, { status: newStatus });
        updated++;
      } catch (e) {
        failed++;
      }
    }

    setLoading(false);
    setStatusDropdownOpen(false);
    if (failed === 0) {
      onSuccess();
    } else {
      onError(`Updated ${updated}, but ${failed} failed.`);
      setTimeout(onSuccess, 2000);
    }
  };

  const handleBulkExport = () => {
    try {
      // Create CSV
      const headers = ['ID', 'Name', 'Type', 'Status', 'Date of Issue'];
      const rows = policies.map((p) => [p.id, p.name, p.type, p.status, p.dateOfIssue]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row) =>
          row
            .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
            .join(',')
        ),
      ].join('\n');

      // Download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `policies-export-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      onSuccess();
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Export failed');
    }
  };

  return (
    <div
      className="mb-4 p-4 rounded-lg border flex items-center justify-between"
      style={{
        borderColor: '#2e7d32',
        backgroundColor: '#f0fdf4',
      }}
    >
      {/* Left: Selection info */}
      <div className="flex items-center gap-4">
        <span style={{ color: '#2f2f2f', fontWeight: 600 }}>
          {selectedCount} {selectedCount === 1 ? 'policy' : 'policies'} selected
        </span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Export Button */}
        <button
          type="button"
          onClick={handleBulkExport}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-all disabled:opacity-50"
          style={{
            borderColor: '#2e7d32',
            color: '#2e7d32',
            backgroundColor: '#fff',
          }}
          title="Export selected policies as CSV"
        >
          <Download className="w-4 h-4" />
          <span className="text-sm font-medium">Export</span>
        </button>

        {/* Status Change Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setStatusDropdownOpen((v) => !v)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-all disabled:opacity-50"
            style={{
              borderColor: '#f59e0b',
              color: '#f59e0b',
              backgroundColor: '#fff',
            }}
            title="Change status for selected policies"
          >
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Status</span>
          </button>

          {/* Dropdown Menu */}
          {statusDropdownOpen && (
            <div
              className="absolute right-0 mt-1 min-w-[140px] py-1 rounded-lg shadow-lg z-50 bg-white"
              style={{ border: '1px solid #e0e0e0' }}
            >
              <button
                type="button"
                onClick={() => handleBulkStatusChange('active')}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                style={{ color: '#065f46' }}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => handleBulkStatusChange('draft')}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                style={{ color: '#92400e' }}
              >
                Draft
              </button>
              <button
                type="button"
                onClick={() => handleBulkStatusChange('archived')}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                style={{ color: '#65a30d' }}
              >
                Archived
              </button>
            </div>
          )}
        </div>

        {/* Delete Button */}
        <button
          type="button"
          onClick={handleBulkDelete}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-all disabled:opacity-50 hover:bg-red-50"
          style={{
            borderColor: '#b91c1c',
            color: '#b91c1c',
            backgroundColor: '#fff',
          }}
          title="Delete selected policies"
        >
          <Trash2 className="w-4 h-4" />
          <span className="text-sm font-medium">Delete</span>
        </button>

        {/* Clear Selection */}
        <button
          type="button"
          onClick={onClearSelection}
          disabled={loading}
          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border transition-all disabled:opacity-50"
          style={{
            borderColor: '#e0e0e0',
            color: '#717182',
            backgroundColor: '#fff',
          }}
          title="Clear selection"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
