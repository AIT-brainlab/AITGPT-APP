import { useCallback, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { loadUserSession } from '../utils/sessionStorage';
import type { User } from '../types/auth';
import type { PolicyRecord, PolicyType } from '../types/policy';
import { canViewPolicies } from '../utils/policyPermissions';
import { listPolicies } from '../utils/policyService';
import { PolicyListHeader } from '../components/policy/PolicyListHeader';
import { PolicyListTable } from '../components/policy/PolicyListTable';
import { PolicyListPagination } from '../components/policy/PolicyListPagination';
import { PolicyListToolbar } from '../components/policy/PolicyListToolbar';
import { PolicyDetailModal } from '../components/policy/PolicyDetailModal';
import { PolicyEditModal } from '../components/policy/PolicyEditModal';
import { PolicyConfirmDialog } from '../components/policy/PolicyConfirmDialog';
import { PolicyToast, ToastMessage } from '../components/policy/PolicyToast';

const PAGE_SIZE = 8;

export default function PolicyListPage() {
  const [user, setUser] = useState<User | null>(null);
  const [policies, setPolicies] = useState<PolicyRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<PolicyType | ''>('');
  const [sortColumn, setSortColumn] = useState<'name' | 'type' | 'dateOfIssue'>('dateOfIssue');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [detailPolicy, setDetailPolicy] = useState<PolicyRecord | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editPolicy, setEditPolicy] = useState<PolicyRecord | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
        sort: sortColumn === 'dateOfIssue' 
          ? (sortDirection === 'desc' ? 'date_desc' : 'date_asc')
          : (sortColumn === 'name' 
              ? (sortDirection === 'desc' ? 'name_desc' : 'name_asc')
              : (sortDirection === 'desc' ? 'type_desc' : 'type_asc')),
      });
      setPolicies(data.results);
      setTotalCount(data.count);
      setSelected(new Set());
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to load policies', 'error');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, typeFilter, page, sortColumn, sortDirection, toast]);

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

  const handleSort = (column: 'name' | 'type' | 'dateOfIssue') => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
    setPage(1);
  };

  const handleSearch = (term: string) => {
    setSearch(term);
    setPage(1);
  };

  const handleTypeFilter = (type: PolicyType | '') => {
    setTypeFilter(type);
    setPage(1);
  };

  const handleRefresh = () => {
    fetchList();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b" style={{ borderColor: '#e0e0e0' }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <a href="/" className="inline-flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100">
            <ChevronLeft className="w-5 h-5" style={{ color: '#4a5568' }} />
          </a>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#2f2f2f' }}>
              Policy Management
            </h1>
            <p className="text-sm" style={{ color: '#717182' }}>
              Browse, search, and manage policies
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Bulk Actions Toolbar */}
        {selected.size > 0 && (
          <PolicyListToolbar
            selectedCount={selected.size}
            selectedIds={Array.from(selected)}
            policies={policies.filter((p) => selected.has(p.id))}
            user={user}
            onSuccess={() => {
              toast('Action completed successfully', 'success');
              setSelected(new Set());
              handleRefresh();
            }}
            onError={(msg) => toast(msg, 'error')}
            onClearSelection={() => setSelected(new Set())}
          />
        )}

        {/* Search & Filters */}
        <PolicyListHeader
          search={search}
          onSearchChange={handleSearch}
          typeFilter={typeFilter}
          onTypeFilterChange={handleTypeFilter}
          onRefresh={handleRefresh}
        />

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{ border: '1px solid #e0e0e0' }}>
          <PolicyListTable
            policies={policies}
            loading={loading}
            selected={selected}
            onToggleSelect={toggleSelect}
            onToggleSelectAll={toggleSelectAll}
            selectAll={selected.size === policies.length && policies.length > 0}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
            onViewDetails={(policy) => {
              setDetailPolicy(policy);
              setDetailOpen(true);
            }}
            onEdit={(policy) => {
              setEditPolicy(policy);
              setEditOpen(true);
            }}
            onDelete={(policy) => {
              setEditPolicy(policy);
              setDeleteOpen(true);
            }}
            user={user}
          />
        </div>

        {/* Pagination */}
        {!loading && policies.length > 0 && (
          <PolicyListPagination
            page={page}
            totalPages={totalPages}
            totalItems={totalCount}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            onPageSizeChange={(newSize) => {
              // Page size change would require backend support
              // For now, keep current implementation
            }}
          />
        )}
      </main>

      {/* Modals */}
      <PolicyDetailModal
        open={detailOpen}
        policy={detailPolicy}
        onClose={() => setDetailOpen(false)}
      />

      <PolicyEditModal
        open={editOpen}
        policy={editPolicy}
        onClose={() => setEditOpen(false)}
        onSuccess={() => {
          toast('Policy updated successfully', 'success');
          setEditOpen(false);
          handleRefresh();
        }}
        onError={(msg) => toast(msg, 'error')}
      />

      <PolicyConfirmDialog
        open={deleteOpen}
        title="Delete Policy"
        message={`Are you sure you want to delete "${editPolicy?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="destructive"
        loading={deleteLoading}
        onConfirm={async () => {
          if (!editPolicy) return;
          setDeleteLoading(true);
          try {
            // Assuming deletePolicy exists in policyService
            const { deletePolicy } = await import('../utils/policyService');
            await deletePolicy(editPolicy.id);
            toast('Policy deleted successfully', 'success');
            setDeleteOpen(false);
            handleRefresh();
          } catch (e) {
            toast(e instanceof Error ? e.message : 'Failed to delete policy', 'error');
          } finally {
            setDeleteLoading(false);
          }
        }}
        onCancel={() => setDeleteOpen(false)}
      />

      {/* Toast Notifications */}
      <PolicyToast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
