import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PolicyListPaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export function PolicyListPagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: PolicyListPaginationProps) {
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems);

  const getPageRange = (current: number, total: number): (number | string)[] => {
    const delta = 2;
    const range: (number | string)[] = [];

    // Always include first page
    range.push(1);

    // Add ellipsis and left range
    if (current - delta > 2) {
      range.push('...');
    }

    for (let i = Math.max(2, current - delta); i < current; i++) {
      range.push(i);
    }

    // Add current page
    if (current > 1 && current < total) {
      range.push(current);
    }

    // Add right range and ellipsis
    for (let i = current + 1; i <= Math.min(total - 1, current + delta); i++) {
      range.push(i);
    }

    if (current + delta < total - 1) {
      range.push('...');
    }

    // Always include last page
    if (total > 1) {
      range.push(total);
    }

    return range;
  };

  const pageRange = getPageRange(page, totalPages);

  return (
    <div className="mt-6 flex items-center justify-between" style={{ color: '#717182' }}>
      {/* Left: Items info */}
      <div className="text-sm">
        Showing <span style={{ color: '#2f2f2f', fontWeight: 600 }}>{startItem}</span> to{' '}
        <span style={{ color: '#2f2f2f', fontWeight: 600 }}>{endItem}</span> of{' '}
        <span style={{ color: '#2f2f2f', fontWeight: 600 }}>{totalItems}</span> policies
      </div>

      {/* Right: Pagination controls */}
      <div className="flex items-center gap-2">
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-gray-50"
          style={{ borderColor: '#e0e0e0', color: '#4a5568' }}
          title="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Prev</span>
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {pageRange.map((p, idx) => (
            <div key={idx}>
              {p === '...' ? (
                <span className="px-2 py-1" style={{ color: '#9ca3af' }}>
                  {p}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onPageChange(p as number)}
                  className="min-w-[36px] h-[36px] rounded-lg border transition-all font-medium text-sm"
                  style={
                    p === page
                      ? {
                          backgroundColor: '#2e7d32',
                          color: '#fff',
                          borderColor: '#2e7d32',
                        }
                      : {
                          borderColor: '#e0e0e0',
                          color: '#4a5568',
                          backgroundColor: '#fff',
                        }
                  }
                >
                  {p}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-gray-50"
          style={{ borderColor: '#e0e0e0', color: '#4a5568' }}
          title="Next page"
        >
          <span className="text-sm font-medium">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
