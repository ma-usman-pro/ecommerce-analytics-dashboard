import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useDashboardFilters } from "../../context/DashboardFilterContext";
import { useOrdersChart } from "../../hooks/useOrdersChart";
import { formatNumber, formatShortDate } from "../../utils/formatters";
import { useChartAxisColors, BRAND_FILL } from "../../utils/chartTheme";
import { tickInterval } from "../../utils/chartTicks";
import { ChartCard } from "./ChartCard";

function OrdersTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-slate-700 dark:bg-slate-800">
      <p className="font-medium text-slate-900 dark:text-slate-100">{formatShortDate(label)}</p>
      <p className="mt-0.5 text-slate-500 dark:text-slate-400">
        Orders: <span className="font-medium text-slate-900 dark:text-slate-100">{formatNumber(payload[0].value)}</span>
      </p>
    </div>
  );
}

export function OrdersChart() {
  const { startDate, endDate, category } = useDashboardFilters();
  const { data, loading, error, refetch } = useOrdersChart({ startDate, endDate, category });
  const axis = useChartAxisColors();

  const isEmpty = !loading && !error && (!data || data.length === 0);

  return (
    <ChartCard
      title="Orders Overview"
      description="Order volume for the selected period"
      loading={loading}
      error={error}
      onRetry={refetch}
      isEmpty={isEmpty}
    >
      <div className="h-64 w-full" role="img" aria-label="Orders over time chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid stroke={axis.grid} vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatShortDate}
              interval={tickInterval(data?.length || 0)}
              tick={{ fill: axis.axis, fontSize: 11 }}
              axisLine={{ stroke: axis.grid }}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: axis.axis, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={32}
            />
            <Tooltip content={<OrdersTooltip />} cursor={{ fill: axis.grid, opacity: 0.4 }} />
            <Bar dataKey="orders" fill={BRAND_FILL} radius={[4, 4, 0, 0]} name="Orders" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
