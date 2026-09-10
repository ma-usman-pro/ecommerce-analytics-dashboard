import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDashboardFilters } from "../../context/DashboardFilterContext";
import { useRevenueChart } from "../../hooks/useRevenueChart";
import { formatCompactCurrency, formatCurrency, formatShortDate } from "../../utils/formatters";
import { useChartAxisColors, BRAND_LINE, BRAND_FILL } from "../../utils/chartTheme";
import { tickInterval } from "../../utils/chartTicks";
import { ChartCard } from "./ChartCard";

function RevenueTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-slate-700 dark:bg-slate-800">
      <p className="font-medium text-slate-900 dark:text-slate-100">{formatShortDate(label)}</p>
      <p className="mt-0.5 text-slate-500 dark:text-slate-400">
        Revenue: <span className="font-medium text-slate-900 dark:text-slate-100">{formatCurrency(payload[0].value)}</span>
      </p>
    </div>
  );
}

export function RevenueChart() {
  const { startDate, endDate, category } = useDashboardFilters();
  const { data, loading, error, refetch } = useRevenueChart({ startDate, endDate, category });
  const axis = useChartAxisColors();

  const isEmpty = !loading && !error && (!data || data.length === 0);

  return (
    <ChartCard
      title="Revenue Overview"
      description="Revenue trend for the selected period"
      loading={loading}
      error={error}
      onRetry={refetch}
      isEmpty={isEmpty}
    >
      <div className="h-64 w-full" role="img" aria-label="Revenue over time chart">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={BRAND_FILL} stopOpacity={0.35} />
                <stop offset="100%" stopColor={BRAND_FILL} stopOpacity={0.02} />
              </linearGradient>
            </defs>
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
              tickFormatter={formatCompactCurrency}
              tick={{ fill: axis.axis, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip content={<RevenueTooltip />} cursor={{ stroke: axis.grid, strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke={BRAND_LINE}
              strokeWidth={2}
              fill="url(#revenueFill)"
              name="Revenue"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
