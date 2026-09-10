import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { DateRangeSelect } from "./DateRangeSelect";
import { CategorySelect } from "./CategorySelect";
import { ExportButton } from "./ExportButton";
import { useDashboardFilters } from "../../context/DashboardFilterContext";
import { formatRangeLabel } from "../../utils/dateRanges";

export function FilterBar() {
  const { startDate, endDate, category, resetFilters, isDefault } = useDashboardFilters();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <SlidersHorizontal size={15} />
          <span className="text-xs font-medium uppercase tracking-wide">Filters</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <DateRangeSelect />
          <CategorySelect />
          {!isDefault && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <RotateCcw size={13} />
              Reset Filters
            </button>
          )}
          <ExportButton />
        </div>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        Analyzing{" "}
        <span className="font-medium text-slate-700 dark:text-slate-300">
          {formatRangeLabel(startDate, endDate)}
        </span>
        {category && category !== "All" && (
          <>
            {" "}
            in{" "}
            <span className="font-medium text-slate-700 dark:text-slate-300">{category}</span>
          </>
        )}
      </p>
    </div>
  );
}
