import { DATE_PRESETS } from "../../utils/dateRanges";
import { useDashboardFilters } from "../../context/DashboardFilterContext";

export function DateRangeSelect() {
  const { preset, startDate, endDate, selectPreset, setCustomRange } = useDashboardFilters();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div
        role="group"
        aria-label="Date range presets"
        className="flex flex-wrap rounded-lg border border-slate-200 p-0.5 dark:border-slate-800"
      >
        {DATE_PRESETS.map((option) => (
          <button
            key={option}
            onClick={() => selectPreset(option)}
            aria-pressed={preset === option}
            className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
              preset === option
                ? "bg-brand-600 text-white"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {preset === "Custom" && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            aria-label="Custom range start date"
            value={startDate || ""}
            max={endDate || undefined}
            onChange={(e) => setCustomRange(e.target.value, endDate)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          />
          <span className="text-xs text-slate-400">to</span>
          <input
            type="date"
            aria-label="Custom range end date"
            value={endDate || ""}
            min={startDate || undefined}
            onChange={(e) => setCustomRange(startDate, e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          />
        </div>
      )}
    </div>
  );
}
