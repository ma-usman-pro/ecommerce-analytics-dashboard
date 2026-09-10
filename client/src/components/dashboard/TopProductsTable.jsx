import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useDashboardFilters } from "../../context/DashboardFilterContext";
import { useTopProducts } from "../../hooks/useTopProducts";
import { formatCurrency, formatNumber } from "../../utils/formatters";
import { Card } from "../ui/Card";
import { TableSkeleton } from "../ui/TableSkeleton";
import { ErrorState } from "../common/ErrorState";
import { EmptyState } from "../common/EmptyState";

const LIMIT_OPTIONS = [5, 10, 20];
// Order here drives both the header row AND the body cells below —
// keep them in sync (matches the spec's Rank/Product/Category/Units
// Sold/Orders/Revenue column order).
const SORT_COLUMNS = [
  { key: "unitsSold", label: "Units Sold" },
  { key: "orders", label: "Orders" },
  { key: "revenue", label: "Revenue" },
];

export function TopProductsTable() {
  const { startDate, endDate, category } = useDashboardFilters();
  const [limit, setLimit] = useState(5);
  const [sortKey, setSortKey] = useState("revenue");
  const [sortDir, setSortDir] = useState("desc");

  // Limit changes need a fresh backend request (the API only returns the
  // top N by revenue). Sorting the already-fetched page, however, is a
  // small enough dataset (max 20 rows) that it's done client-side —
  // clicking a column header never triggers another API call.
  const { data, loading, error, refetch } = useTopProducts({ startDate, endDate, category }, limit);

  const sorted = useMemo(() => {
    if (!data) return [];
    const copy = [...data];
    copy.sort((a, b) => (sortDir === "desc" ? b[sortKey] - a[sortKey] : a[sortKey] - b[sortKey]));
    return copy;
  }, [data, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  return (
    <Card>
      <div className="flex flex-col gap-3 border-b border-slate-100 p-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Top Products</h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Best performers for the selected filters
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 p-0.5 dark:border-slate-800">
          {LIMIT_OPTIONS.map((n) => (
            <button
              key={n}
              onClick={() => setLimit(n)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                limit === n
                  ? "bg-brand-600 text-white"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              Top {n}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={limit} columns={6} />
      ) : error ? (
        <ErrorState title="Unable to load top products" message={error} onRetry={refetch} />
      ) : !data || data.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800 dark:text-slate-500">
                <th className="px-5 py-3 font-medium">Rank</th>
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">Category</th>
                {SORT_COLUMNS.map((col) => (
                  <th key={col.key} className="px-5 py-3 font-medium text-right">
                    <button
                      onClick={() => toggleSort(col.key)}
                      className="inline-flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-200"
                      aria-label={`Sort by ${col.label}`}
                    >
                      {col.label}
                      {sortKey === col.key &&
                        (sortDir === "desc" ? <ArrowDown size={12} /> : <ArrowUp size={12} />)}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((p, i) => (
                <tr
                  key={`${p.product}-${i}`}
                  className="border-b border-slate-50 last:border-0 dark:border-slate-800/60"
                >
                  <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{i + 1}</td>
                  <td className="px-5 py-3 font-medium text-slate-900 dark:text-slate-100">
                    {p.product}
                  </td>
                  <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{p.category}</td>
                  {SORT_COLUMNS.map((col) => (
                    <td
                      key={col.key}
                      className={`px-5 py-3 text-right ${
                        col.key === "revenue"
                          ? "font-medium text-slate-900 dark:text-slate-100"
                          : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {col.key === "revenue" ? formatCurrency(p.revenue) : formatNumber(p[col.key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
