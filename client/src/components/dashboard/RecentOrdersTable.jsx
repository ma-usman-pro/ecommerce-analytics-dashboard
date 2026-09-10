import { useRecentOrders } from "../../hooks/useRecentOrders";
import { formatCurrency, formatDateDisplay } from "../../utils/formatters";
import { Card } from "../ui/Card";
import { TableSkeleton } from "../ui/TableSkeleton";
import { ErrorState } from "../common/ErrorState";
import { EmptyState } from "../common/EmptyState";
import { StatusBadge } from "./StatusBadge";

export function RecentOrdersTable() {
  const { data, loading, error, refetch } = useRecentOrders(8);

  return (
    <Card>
      <div className="border-b border-slate-100 p-5 dark:border-slate-800">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Recent Orders</h3>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          The latest orders placed in your store
        </p>
      </div>

      {loading ? (
        <TableSkeleton rows={6} columns={5} />
      ) : error ? (
        <ErrorState title="Unable to load recent orders" message={error} onRetry={refetch} />
      ) : !data || data.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800 dark:text-slate-500">
                <th className="px-5 py-3 font-medium">Order</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium text-right">Items</th>
                <th className="px-5 py-3 font-medium text-right">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((o) => (
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
                    {formatDateDisplay(o.date)}
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
      )}
    </Card>
  );
}
