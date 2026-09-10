import { Card } from "./Card";

export function StatCardSkeleton() {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div className="h-3.5 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-8 w-8 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
      </div>
      <div className="mt-4 h-7 w-28 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      <div className="mt-3 h-3 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
    </Card>
  );
}
