import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useDashboardFilters } from "../../context/DashboardFilterContext";
import { useCategoryChart } from "../../hooks/useCategoryChart";
import { formatCurrency } from "../../utils/formatters";
import { CATEGORY_COLORS } from "../../utils/chartTheme";
import { ChartCard } from "./ChartCard";
import { DonutLegendList } from "./DonutLegendList";

function CategoryTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-slate-700 dark:bg-slate-800">
      <p className="font-medium text-slate-900 dark:text-slate-100">{d.category}</p>
      <p className="mt-0.5 text-slate-500 dark:text-slate-400">
        Revenue: <span className="font-medium text-slate-900 dark:text-slate-100">{formatCurrency(d.revenue)}</span>
      </p>
      <p className="text-slate-500 dark:text-slate-400">
        Share: <span className="font-medium text-slate-900 dark:text-slate-100">{d.percentage.toFixed(1)}%</span>
      </p>
    </div>
  );
}

export function CategoryChart() {
  const { startDate, endDate, category } = useDashboardFilters();
  const { data, loading, error, refetch } = useCategoryChart({ startDate, endDate, category });

  const total = (data || []).reduce((sum, d) => sum + d.revenue, 0);
  const withPct = (data || []).map((d, i) => ({
    ...d,
    percentage: total > 0 ? (d.revenue / total) * 100 : 0,
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  }));

  const isEmpty = !loading && !error && (withPct.length === 0 || total === 0);

  return (
    <ChartCard
      title="Sales by Category"
      description="Revenue distribution across product categories"
      loading={loading}
      error={error}
      onRetry={refetch}
      isEmpty={isEmpty}
      heightClass="h-56"
    >
      <div className="flex flex-col items-center">
        <div className="relative h-48 w-full" role="img" aria-label="Sales by category donut chart">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={withPct}
                dataKey="revenue"
                nameKey="category"
                innerRadius="60%"
                outerRadius="90%"
                paddingAngle={2}
                stroke="none"
              >
                {withPct.map((d) => (
                  <Cell key={d.category} fill={d.color} />
                ))}
              </Pie>
              <Tooltip content={<CategoryTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {formatCurrency(total)}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Total revenue</span>
          </div>
        </div>

        <DonutLegendList
          items={withPct.map((d) => ({
            label: d.category,
            valueLabel: formatCurrency(d.revenue),
            percentage: d.percentage,
            color: d.color,
          }))}
        />
      </div>
    </ChartCard>
  );
}
