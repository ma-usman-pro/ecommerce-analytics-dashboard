import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useDashboardFilters } from "../../context/DashboardFilterContext";
import { useOrderStatusChart } from "../../hooks/useOrderStatusChart";
import { formatNumber } from "../../utils/formatters";
import { STATUS_COLORS } from "../../utils/chartTheme";
import { ChartCard } from "./ChartCard";
import { DonutLegendList } from "./DonutLegendList";

function StatusTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-slate-700 dark:bg-slate-800">
      <p className="font-medium text-slate-900 dark:text-slate-100">{d.status}</p>
      <p className="mt-0.5 text-slate-500 dark:text-slate-400">
        {formatNumber(d.count)} order{d.count === 1 ? "" : "s"}
      </p>
    </div>
  );
}

export function OrderStatusChart() {
  const { startDate, endDate, category } = useDashboardFilters();
  const { data, loading, error, refetch } = useOrderStatusChart({ startDate, endDate, category });

  const total = (data || []).reduce((sum, d) => sum + d.count, 0);
  // The backend always returns all 5 controlled statuses (zero-filled) so
  // the legend is complete; the pie itself only needs the non-zero slices.
  const nonZero = (data || []).filter((d) => d.count > 0);

  const isEmpty = !loading && !error && total === 0;

  return (
    <ChartCard
      title="Order Status"
      description="Distribution of orders by status"
      loading={loading}
      error={error}
      onRetry={refetch}
      isEmpty={isEmpty}
      heightClass="h-56"
    >
      <div className="flex flex-col items-center">
        <div className="relative h-48 w-full" role="img" aria-label="Order status donut chart">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={nonZero}
                dataKey="count"
                nameKey="status"
                innerRadius="60%"
                outerRadius="90%"
                paddingAngle={2}
                stroke="none"
              >
                {nonZero.map((d) => (
                  <Cell key={d.status} fill={STATUS_COLORS[d.status]} />
                ))}
              </Pie>
              <Tooltip content={<StatusTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {formatNumber(total)}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Orders</span>
          </div>
        </div>

        <DonutLegendList
          items={(data || []).map((d) => ({
            label: d.status,
            valueLabel: formatNumber(d.count),
            percentage: total > 0 ? (d.count / total) * 100 : 0,
            color: STATUS_COLORS[d.status],
          }))}
        />
      </div>
    </ChartCard>
  );
}
