import { Card } from "../ui/Card";
import { ChartSkeleton } from "../ui/ChartSkeleton";
import { ErrorState } from "../common/ErrorState";
import { EmptyState } from "../common/EmptyState";

export function ChartCard({
  title,
  description,
  loading,
  error,
  onRetry,
  isEmpty,
  emptyMessage = "Try selecting a different date range or category.",
  heightClass = "h-64",
  children,
}) {
  if (loading) return <ChartSkeleton heightClass={heightClass} />;

  return (
    <Card className="p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
        {description && (
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{description}</p>
        )}
      </div>

      {error ? (
        <div className={heightClass}>
          <ErrorState title={`Unable to load ${title.toLowerCase()}`} message={error} onRetry={onRetry} />
        </div>
      ) : isEmpty ? (
        <div className={`flex ${heightClass} items-center`}>
          <EmptyState title="No data available" message={emptyMessage} />
        </div>
      ) : (
        children
      )}
    </Card>
  );
}
