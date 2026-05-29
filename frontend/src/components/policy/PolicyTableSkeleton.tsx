export function PolicyTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-4 py-3 rounded-lg policy-skeleton-row"
          style={{ backgroundColor: '#f8faf9' }}
        >
          <div className="policy-shimmer w-4 h-4 rounded shrink-0" />
          <div className="policy-shimmer h-4 flex-1 max-w-[180px] rounded" />
          <div className="policy-shimmer h-5 w-20 rounded-full hidden sm:block" />
          <div className="policy-shimmer h-4 w-24 rounded hidden md:block" />
          <div className="policy-shimmer h-4 w-16 rounded hidden lg:block" />
        </div>
      ))}
    </div>
  );
}
