import { DollarSign, Receipt, ShoppingBag, Users } from "lucide-react";
import { useDashboardFilters } from "../../context/DashboardFilterContext";
import { useSummary } from "../../hooks/useSummary";
import { getPreviousRange } from "../../utils/dateRanges";
import { formatCurrency, formatNumber } from "../../utils/formatters";
import { computeTrend } from "../../utils/trend";
import { StatCard } from "./StatCard";
import { StatCardSkeleton } from "../ui/StatCardSkeleton";
import { ErrorState } from "../common/ErrorState";

export function StatCardsGrid() {
  const { startDate, endDate, category } = useDashboardFilters();
  const current = useSummary({ startDate, endDate, category });

  const previousRange = getPreviousRange(startDate, endDate) || {};
  const previous = useSummary({
    startDate: previousRange.startDate,
    endDate: previousRange.endDate,
    category,
  });

  if (current.loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (current.error) {
    return <ErrorState title="Unable to load summary" message={current.error} onRetry={current.refetch} />;
  }

  const s = current.data || {};
  const p = previous.data || {};

  // Trends only render once the comparison request has resolved; while
  // it's still loading we simply omit the trend line rather than
  // flashing a wrong or fake number.
  const trendsReady = !previous.loading && !previous.error;

  const cards = [
    {
      title: "Total Revenue",
      value: formatCurrency(s.totalRevenue),
      trend: trendsReady ? computeTrend(s.totalRevenue, p.totalRevenue) : null,
      icon: DollarSign,
    },
    {
      title: "Total Orders",
      value: formatNumber(s.totalOrders),
      trend: trendsReady ? computeTrend(s.totalOrders, p.totalOrders) : null,
      icon: ShoppingBag,
    },
    {
      title: "Customers",
      value: formatNumber(s.totalCustomers),
      trend: trendsReady ? computeTrend(s.totalCustomers, p.totalCustomers) : null,
      icon: Users,
    },
    {
      title: "Average Order Value",
      value: formatCurrency(s.averageOrderValue),
      trend: trendsReady ? computeTrend(s.averageOrderValue, p.averageOrderValue) : null,
      icon: Receipt,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <StatCard key={c.title} {...c} />
      ))}
    </div>
  );
}
