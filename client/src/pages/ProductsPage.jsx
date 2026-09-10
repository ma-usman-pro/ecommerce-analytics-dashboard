import { useState } from "react";
import { useDashboardFilters } from "../context/DashboardFilterContext";
import { useProductsList } from "../hooks/useProductsList";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { SearchInput } from "../components/common/SearchInput";
import { Pagination } from "../components/common/Pagination";
import { CategorySelect } from "../components/dashboard/CategorySelect";
import { ErrorState } from "../components/common/ErrorState";
import { EmptyState } from "../components/common/EmptyState";
import { TableSkeleton } from "../components/ui/TableSkeleton";
import { Card } from "../components/ui/Card";
import { formatCurrency, formatNumber } from "../utils/formatters";

export default function ProductsPage() {
  const { category } = useDashboardFilters();
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const search = useDebouncedValue(searchInput, 400);

  const [lastKey, setLastKey] = useState("");
  const key = `${category}|${search}`;
  if (key !== lastKey) {
    setLastKey(key);
    if (page !== 1) setPage(1);
  }

  const { products, pagination, loading, error, refetch } = useProductsList({
    category,
    search,
    page,
    limit,
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          Products
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Browse the product catalog. Category filter is shared with the dashboard.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={searchInput}
          onChange={setSearchInput}
          placeholder="Search products…"
          ariaLabel="Search products"
        />
        <CategorySelect />
      </div>

      <Card>
        {loading ? (
          <TableSkeleton rows={10} columns={4} />
        ) : error ? (
          <ErrorState title="Unable to load products" message={error} onRetry={refetch} />
        ) : products.length === 0 ? (
          <EmptyState message="Try a different search term or category." />
        ) : (
          <>
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800 dark:text-slate-500">
                    <th className="px-5 py-3 font-medium">Product</th>
                    <th className="px-5 py-3 font-medium">Category</th>
                    <th className="px-5 py-3 font-medium text-right">Price</th>
                    <th className="px-5 py-3 font-medium text-right">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr
                      key={p._id}
                      className="border-b border-slate-50 last:border-0 dark:border-slate-800/60"
                    >
                      <td className="px-5 py-3 font-medium text-slate-900 dark:text-slate-100">
                        {p.name}
                      </td>
                      <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{p.category}</td>
                      <td className="px-5 py-3 text-right text-slate-700 dark:text-slate-300">
                        {formatCurrency(p.price)}
                      </td>
                      <td className="px-5 py-3 text-right text-slate-700 dark:text-slate-300">
                        {formatNumber(p.stock)}
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
