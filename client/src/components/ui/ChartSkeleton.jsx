import { Card } from "./Card";

export function ChartSkeleton({ heightClass = "h-64" }) {
  return (
    <Card className="p-5">
      <div className="h-4 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      <div className={`mt-4 ${heightClass} w-full animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800/60`} />
    </Card>
  );
}
