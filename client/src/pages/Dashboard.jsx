import { FilterBar } from "../components/dashboard/FilterBar";
import { StatCardsGrid } from "../components/dashboard/StatCardsGrid";
import { RevenueChart } from "../components/dashboard/RevenueChart";
import { OrdersChart } from "../components/dashboard/OrdersChart";
import { CategoryChart } from "../components/dashboard/CategoryChart";
import { OrderStatusChart } from "../components/dashboard/OrderStatusChart";
import { TopProductsTable } from "../components/dashboard/TopProductsTable";
import { RecentOrdersTable } from "../components/dashboard/RecentOrdersTable";
import { SectionErrorBoundary } from "../components/common/SectionErrorBoundary";

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          E Commerce Analytics
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Track your store performance and understand your sales.
        </p>
      </div>

      <FilterBar />

      <SectionErrorBoundary label="stat cards">
        <StatCardsGrid />
      </SectionErrorBoundary>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <SectionErrorBoundary label="revenue chart">
          <RevenueChart />
        </SectionErrorBoundary>
        <SectionErrorBoundary label="orders chart">
          <OrdersChart />
        </SectionErrorBoundary>
        <SectionErrorBoundary label="category chart">
          <CategoryChart />
        </SectionErrorBoundary>
        <SectionErrorBoundary label="order status chart">
          <OrderStatusChart />
        </SectionErrorBoundary>
      </div>

      <SectionErrorBoundary label="top products">
        <TopProductsTable />
      </SectionErrorBoundary>

      <SectionErrorBoundary label="recent orders">
        <RecentOrdersTable />
      </SectionErrorBoundary>
    </div>
  );
}
