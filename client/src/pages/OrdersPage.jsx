import { useState } from "react";
import { useDashboardFilters } from "../context/DashboardFilterContext";
import { useOrdersList } from "../hooks/useOrdersList";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { SearchInput } from "../components/common/SearchInput";
import { Pagination } from "../components/common/Pagination";
import { StatusBadge } from "../components/dashboard/StatusBadge";
import { ErrorState } from "../components/common/ErrorState";
import { EmptyState } from "../components/common/EmptyState";
import { TableSkeleton } from "../components/ui/TableSkeleton";
import { Card } from "../components/ui/Card";
import { formatCurrency, formatDateDisplay } from "../utils/formatters";

const ORDER_STATUSES = ["Completed", "Processing", "Pending", "Cancelled", "Refunded"];

export default function OrdersPage() {
  const { startDate, endDate, category } = useDashboardFilters();
  const [status, setStatus] = useState("All");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const search = useDebouncedValue(searchInput, 400);

  // Any filter change (including a fresh search term) should return to
  // page 1 — but derive it during render rather than in an effect, so we
  // don't fire the paginated request once for the stale page and again
  // for the reset page.
  const [lastKey, setLastKey] = useState("");
  const key = `${startDate}|${endDate}|${category}|${status}|${search}`;
  if (key !== lastKey) {
    setLastKey(key);
    if (page !== 1) setPage(1);
  }

  const { orders, pagination, loading, error, refetch } = useOrdersList({
    startDate,
    endDate,
    category,
    status: status === "All" ? undefined : status,
    search,
    page,
    limit,
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          Orders
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Browse and search orders. Uses the same date range and category filters as the dashboard.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={searchInput}
          onChange={setSearchInput}
          placeholder="Search by order # or customer…"
          ariaLabel="Search orders"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filter by status"
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          <option value="All">All Statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <Card>
        {loading ? (
          <TableSkeleton rows={10} columns={6} />
        ) : error ? (
          <ErrorState title="Unable to load orders" message={error} onRetry={refetch} />
        ) : orders.length === 0 ? (
          <EmptyState message="Try a different search term, status, or date range." />
        ) : (
          <>
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800 dark:text-slate-500">
                    <th className="px-5 py-3 font-medium">Order ID</th>
                    <th className="px-5 py-3 font-medium">Customer</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium text-right">Items</th>
                    <th className="px-5 py-3 font-medium text-right">Amount</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr
                      key={o.orderNumber}
                      className="border-b border-slate-50 last:border-0 dark:border-slate-800/60"
                    >
                      <td className="px-5 py-3 font-medium text-slate-900 dark:text-slate-100">
                        {o.orderNumber}
                      </td>
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-300">
                        {o.customer ? o.customer.name : "—"}
                      </td>
                      <td className="px-5 py-3 text-slate-500 dark:text-slate-400">
                        {formatDateDisplay(o.createdAt)}
                      </td>
                      <td className="px-5 py-3 text-right text-slate-700 dark:text-slate-300">
                        {o.items?.length || 0}
                      </td>
                      <td className="px-5 py-3 text-right font-medium text-slate-900 dark:text-slate-100">
                        {formatCurrency(o.totalAmount)}
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={o.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={pagination.page}
              limit={pagination.limit}
              total={pagination.total}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </Card>
    </div>
  );
}
