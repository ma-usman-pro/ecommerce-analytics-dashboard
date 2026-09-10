import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card } from "../ui/Card";

export function StatCard({ title, value, trend, icon: Icon }) {
  const hasTrend = trend !== null && trend !== undefined;
  const isUp = hasTrend && trend >= 0;

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
        {Icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-400">
            <Icon size={16} />
          </div>
        )}
      </div>

      <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
        {value}
      </p>

      {hasTrend ? (
        <p
          className={`mt-2 inline-flex items-center gap-1 text-xs font-medium ${
            isUp ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
          }`}
        >
          {isUp ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          {Math.abs(trend)}% vs previous period
        </p>
      ) : (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">vs previous period: n/a</p>
      )}
    </Card>
  );
}
