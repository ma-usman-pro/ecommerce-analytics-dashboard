import { useCategories } from "../../hooks/useCategories";
import { useDashboardFilters } from "../../context/DashboardFilterContext";

export function CategorySelect() {
  const { category, setCategory } = useDashboardFilters();
  const { data: categories, loading, error } = useCategories();

  return (
    <select
      value={category}
      onChange={(e) => setCategory(e.target.value)}
      disabled={loading || !!error}
      aria-label="Filter by category"
      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
    >
      <option value="All">All Categories</option>
      {(categories || []).map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
    </select>
  );
}
