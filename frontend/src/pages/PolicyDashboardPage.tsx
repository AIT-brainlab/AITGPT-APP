import { useCallback, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Search, Upload, Trash2, Pencil, Mail, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { loadUserSession } from '../utils/sessionStorage';
import type { User } from '../types/auth';
import type { PolicyRecord, PolicyType, PolicyViolation } from '../types/policy';
import { POLICY_TYPE_LABELS, POLICY_STATUS_LABELS } from '../types/policy';
import { canManagePolicies, canViewPolicies } from '../utils/policyPermissions';
import { listPolicies, deletePolicy } from '../utils/policyService';
import { PolicyDashboardHeader } from '../components/policy/PolicyDashboardHeader';
import { PolicyTableSkeleton } from '../components/policy/PolicyTableSkeleton';
import { PolicyTypeBadge } from '../components/policy/PolicyTypeBadge';
import { PolicyDetailModal } from '../components/policy/PolicyDetailModal';
import { PolicyUploadModal } from '../components/policy/PolicyUploadModal';
import { PolicyEditModal } from '../components/policy/PolicyEditModal';
import { PolicyContactAdminModal } from '../components/policy/PolicyContactAdminModal';
import { PolicyConfirmDialog } from '../components/policy/PolicyConfirmDialog';
import { PolicyToast, ToastMessage } from '../components/policy/PolicyToast';

const PAGE_SIZE = 8;
const POLICY_TYPES = Object.keys(POLICY_TYPE_LABELS) as PolicyType[];

export default function PolicyDashboardPage() {
  const location = useLocation();
  const state = location.state as {
    highlightViolations?: boolean;
    violations?: PolicyViolation[];
  } | null;

  const [user, setUser] = useState<User | null>(null);
  const [policies, setPolicies] = useState<PolicyRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<PolicyType | ''>('');
  const [dateSort, setDateSort] = useState<'date_desc' | 'date_asc'>('date_desc');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [detailPolicy, setDetailPolicy] = useState<PolicyRecord | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editPolicy, setEditPolicy] = useState<PolicyRecord | null>(null);
  const [contactOpen, setContactOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const isAdmin = canManagePolicies(user);
  const violations = state?.violations ?? [];

  const toast = useCallback((text: string, variant: 'success' | 'error' = 'success') => {
    setToasts((prev) => [...prev, { id: `t-${Date.now()}`, text, variant }]);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    setUser(loadUserSession());
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listPolicies({
        search: debouncedSearch || undefined,
        type: typeFilter || undefined,
        page,
        page_size: PAGE_SIZE,
        sort: dateSort,
      });
      setPolicies(data.results);
      setTotalCount(data.count);
      setSelected(new Set());
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to load policies', 'error');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, typeFilter, page, dateSort, toast]);

  useEffect(() => {
    if (user && canViewPolicies(user)) {
      fetchList();
    }
  }, [user, fetchList]);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!canViewPolicies(user)) {
    return <Navigate to="/" replace />;
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === policies.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(policies.map((p) => p.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    setDeleteLoading(true);
    try {
      for (const id of selected) {
        await deletePolicy(id);
      }
      toast(`${selected.size} polic${selected.size === 1 ? 'y' : 'ies'} deleted.`);
      setDeleteOpen(false);
      fetchList();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Delete failed', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const openRow = (policy: PolicyRecord) => {
    setDetailPolicy(policy);
    setDetailOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>
      <PolicyDashboardHeader user={user} />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-6" style={{ color: '#2f2f2f' }}>
          List of Policy
        </h1>

        {state?.highlightViolations && violations.length > 0 && (
          <div
            className="mb-6 rounded-xl px-4 py-3 text-sm"
            style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b' }}
          >
            <p className="font-semibold mb-2">Your reported violations:</p>
            <ul className="list-disc list-inside space-y-1">
              {violations.map((v) => (
                <li key={v.id}>{v.policyName}{v.summary ? ` — ${v.summary}` : ''}</li>
              ))}
            </ul>
          </div>
        )}

        <div
          className="bg-white rounded-xl shadow-sm border p-4 md:p-6"
          style={{ borderColor: '#e0e0e0' }}
        >
          <div className="flex flex-col lg:flex-row gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#90a1b9' }} />
              <input
                type="search"
                placeholder="Search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 rounded-lg text-sm border outline-none focus:ring-1 focus:ring-green-600"
                style={{ borderColor: '#c8d2e0', color: '#2f2f2f' }}
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value as PolicyType | '');
                setPage(1);
              }}
              className="px-3 py-2 rounded-lg text-sm border min-w-[120px]"
              style={{ borderColor: '#c8d2e0', color: '#4a5568' }}
              aria-label="Filter by type"
            >
              <option value="">Type</option>
              {POLICY_TYPES.map((t) => (
                <option key={t} value={t}>{POLICY_TYPE_LABELS[t]}</option>
              ))}
            </select>
            <select
              value={dateSort}
              onChange={(e) => {
                setDateSort(e.target.value as 'date_desc' | 'date_asc');
                setPage(1);
              }}
              className="px-3 py-2 rounded-lg text-sm border min-w-[120px]"
              style={{ borderColor: '#c8d2e0', color: '#4a5568' }}
              aria-label="Sort by date"
            >
              <option value="date_desc">Date (newest)</option>
              <option value="date_asc">Date (oldest)</option>
            </select>
            <button
              type="button"
              className="p-2 rounded-lg border hidden sm:flex items-center justify-center"
              style={{ borderColor: '#c8d2e0', color: '#717182' }}
              aria-label="More options"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {!isAdmin && (
              <button
                type="button"
                onClick={() => setContactOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border"
                style={{ borderColor: '#2e7d32', color: '#2e7d32' }}
              >
                <Mail className="w-4 h-4" />
                Contact admin
              </button>
            )}
            {isAdmin && (
              <>
                <button
                  type="button"
                  onClick={() => setUploadOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
                  style={{ backgroundColor: '#2e7d32' }}
                >
                  <Upload className="w-4 h-4" />
                  Upload
                </button>
                <button
                  type="button"
                  onClick={() => selected.size > 0 && setDeleteOpen(true)}
                  disabled={selected.size === 0}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-opacity"
                  style={{
                    borderColor: '#d4183d',
                    color: '#d4183d',
                    opacity: selected.size === 0 ? 0.45 : 1,
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left" style={{ borderColor: '#e0e0e0', color: '#717182' }}>
                  {isAdmin && (
                    <th className="py-3 pr-2 w-10">
                      <input
                        type="checkbox"
                        checked={policies.length > 0 && selected.size === policies.length}
                        onChange={toggleSelectAll}
                        aria-label="Select all"
                      />
                    </th>
                  )}
                  <th className="py-3 pr-4 font-medium">Name</th>
                  <th className="py-3 pr-4 font-medium">Type</th>
                  <th className="py-3 pr-4 font-medium hidden sm:table-cell">Date of Issue</th>
                  <th className="py-3 pr-4 font-medium hidden md:table-cell">Status</th>
                  {isAdmin && <th className="py-3 w-20 font-medium">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={isAdmin ? 6 : 4}>
                      <PolicyTableSkeleton />
                    </td>
                  </tr>
                )}
                {!loading && policies.length === 0 && (
                  <tr>
                    <td colSpan={isAdmin ? 6 : 4} className="py-12 text-center" style={{ color: '#717182' }}>
                      No policies found.
                    </td>
                  </tr>
                )}
                {!loading &&
                  policies.map((policy) => (
                    <tr
                      key={policy.id}
                      className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                      style={{ borderColor: '#f0f0f0' }}
                      onClick={() => openRow(policy)}
                    >
                      {isAdmin && (
                        <td className="py-3 pr-2" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selected.has(policy.id)}
                            onChange={() => toggleSelect(policy.id)}
                            aria-label={`Select ${policy.name}`}
                          />
                        </td>
                      )}
                      <td className="py-3 pr-4 font-medium" style={{ color: '#2f2f2f' }}>
                        {policy.name}
                      </td>
                      <td className="py-3 pr-4">
                        <PolicyTypeBadge type={policy.type} />
                      </td>
                      <td className="py-3 pr-4 hidden sm:table-cell" style={{ color: '#4a5568' }}>
                        {policy.dateOfIssue}
                      </td>
                      <td className="py-3 pr-4 hidden md:table-cell" style={{ color: '#4a5568' }}>
                        {POLICY_STATUS_LABELS[policy.status]}
                      </td>
                      {isAdmin && (
                        <td className="py-3" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setEditPolicy(policy)}
                            className="p-1.5 rounded-lg hover:bg-gray-100"
                            aria-label={`Edit ${policy.name}`}
                          >
                            <Pencil className="w-4 h-4" style={{ color: '#2e7d32' }} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {!loading && totalCount > PAGE_SIZE && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t" style={{ borderColor: '#e0e0e0' }}>
              <p className="text-xs" style={{ color: '#717182' }}>
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalCount)} of {totalCount}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="p-2 rounded-lg border disabled:opacity-40"
                  style={{ borderColor: '#c8d2e0' }}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="flex items-center px-2 text-sm" style={{ color: '#4a5568' }}>
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-2 rounded-lg border disabled:opacity-40"
                  style={{ borderColor: '#c8d2e0' }}
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <PolicyDetailModal
        open={detailOpen}
        policy={detailPolicy}
        onClose={() => setDetailOpen(false)}
      />

      <PolicyUploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSuccess={() => {
          toast('Policy uploaded successfully.');
          fetchList();
        }}
        onError={(msg) => toast(msg, 'error')}
      />

      <PolicyEditModal
        open={!!editPolicy}
        policy={editPolicy}
        onClose={() => setEditPolicy(null)}
        onSuccess={() => {
          toast('Policy updated successfully.');
          setEditPolicy(null);
          fetchList();
        }}
        onError={(msg) => toast(msg, 'error')}
      />

      <PolicyContactAdminModal
        open={contactOpen}
        user={user}
        violations={violations}
        onClose={() => setContactOpen(false)}
        onSent={() => toast('Message sent to admin.')}
      />

      <PolicyConfirmDialog
        open={deleteOpen}
        title="Delete policies"
        message={`Delete ${selected.size} selected polic${selected.size === 1 ? 'y' : 'ies'}? This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        loading={deleteLoading}
        onConfirm={handleBulkDelete}
        onCancel={() => setDeleteOpen(false)}
      />

      <PolicyToast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
