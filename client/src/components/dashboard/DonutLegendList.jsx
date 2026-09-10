export function DonutLegendList({ items }) {
  return (
    <ul className="mt-4 flex flex-col gap-2">
      {items.map((item) => (
        <li key={item.label} className="flex items-center justify-between gap-3 text-xs">
          <span className="flex min-w-0 items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: item.color }}
              aria-hidden="true"
            />
            <span className="truncate font-medium text-slate-700 dark:text-slate-300">
              {item.label}
            </span>
          </span>
          <span className="flex shrink-0 items-center gap-2 text-slate-500 dark:text-slate-400">
            <span>{item.valueLabel}</span>
            <span className="w-12 text-right tabular-nums text-slate-500 dark:text-slate-400">
              {item.percentage.toFixed(1)}%
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}
