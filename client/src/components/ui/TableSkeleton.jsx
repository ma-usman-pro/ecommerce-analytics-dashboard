export function TableSkeleton({ rows = 5, columns = 5 }) {
  return (
    <div className="w-full">
      <div className="flex gap-4 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        {Array.from({ length: columns }).map((_, i) => (
          <div
            key={i}
            className="h-3 flex-1 animate-pulse rounded bg-slate-200 dark:bg-slate-800"
          />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className="flex gap-4 border-b border-slate-100 px-4 py-4 last:border-0 dark:border-slate-800/60"
        >
          {Array.from({ length: columns }).map((_, c) => (
            <div
              key={c}
              className="h-3 flex-1 animate-pulse rounded bg-slate-100 dark:bg-slate-800/60"
            />
          ))}
        </div>
      ))}
    </div>
  );
}
