import { Search, RotateCcw } from 'lucide-react';
import type { PolicyType } from '../../types/policy';
import { POLICY_TYPE_LABELS } from '../../types/policy';

interface PolicyListHeaderProps {
  search: string;
  onSearchChange: (term: string) => void;
  typeFilter: PolicyType | '';
  onTypeFilterChange: (type: PolicyType | '') => void;
  onRefresh: () => void;
}

export function PolicyListHeader({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  onRefresh,
}: PolicyListHeaderProps) {
  const policyTypes = Object.keys(POLICY_TYPE_LABELS) as PolicyType[];

  return (
    <div className="mb-6 space-y-4">
      {/* Search Box */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9ca3af' }} />
        <input
          type="text"
          placeholder="Search policies by name, type, or ID..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border transition-colors"
          style={{
            borderColor: '#e0e0e0',
            backgroundColor: '#fff',
            color: '#2f2f2f',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#2e7d32';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(46, 125, 50, 0.1)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#e0e0e0';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Type Filter */}
        <div className="flex items-center gap-2">
          <label style={{ color: '#717182', fontSize: '0.875rem', fontWeight: 500 }}>Type:</label>
          <select
            value={typeFilter}
            onChange={(e) => onTypeFilterChange((e.target.value as PolicyType) || '')}
            className="px-3 py-2 rounded-lg border transition-colors"
            style={{
              borderColor: '#e0e0e0',
              backgroundColor: '#fff',
              color: '#2f2f2f',
            }}
          >
            <option value="">All Types</option>
            {policyTypes.map((type) => (
              <option key={type} value={type}>
                {POLICY_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </div>

        {/* Refresh Button */}
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-all hover:bg-gray-50"
          style={{
            borderColor: '#e0e0e0',
            color: '#4a5568',
          }}
          title="Refresh policy list"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="text-sm font-medium">Refresh</span>
        </button>

        {/* Active Filters Indicator */}
        {(search || typeFilter) && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs" style={{ color: '#717182' }}>
              Filters active:{' '}
              <span className="font-semibold" style={{ color: '#2e7d32' }}>
                {[search && 'Search', typeFilter && `Type: ${POLICY_TYPE_LABELS[typeFilter]}`]
                  .filter(Boolean)
                  .join(', ')}
              </span>
            </span>
            <button
              type="button"
              onClick={() => {
                onSearchChange('');
                onTypeFilterChange('');
              }}
              className="text-xs font-medium px-2 py-1 rounded hover:bg-gray-100"
              style={{ color: '#2e7d32' }}
            >
              Clear
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
