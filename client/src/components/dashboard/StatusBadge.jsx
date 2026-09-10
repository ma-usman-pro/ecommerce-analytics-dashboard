const STATUS_STYLES = {
  Completed: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
  Processing: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
  Pending: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
  Cancelled: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  Refunded: "bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400",
};

export function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.Cancelled;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${style}`}>
      {status}
    </span>
  );
}
