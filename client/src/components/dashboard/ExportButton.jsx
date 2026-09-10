import { useState } from "react";
import { Check, Download, Loader2 } from "lucide-react";
import { useDashboardFilters } from "../../context/DashboardFilterContext";
import { getRevenue, getOrdersAnalytics } from "../../api/analyticsApi";
import { buildCsv, downloadCsv } from "../../utils/csv";

export function ExportButton() {
  const { startDate, endDate, category } = useDashboardFilters();
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [message, setMessage] = useState("");

  const handleExport = async () => {
    setStatus("loading");
    setMessage("");
    try {
      // Fresh request at export time — respects whatever filters are
      // active right now rather than reusing stale chart state.
      const [revenueRows, orderRows] = await Promise.all([
        getRevenue({ startDate, endDate, category }),
        getOrdersAnalytics({ startDate, endDate, category }),
      ]);

      const ordersByDate = Object.fromEntries(orderRows.map((r) => [r.date, r.orders]));
      const dates = Array.from(
        new Set([...revenueRows.map((r) => r.date), ...orderRows.map((r) => r.date)])
      ).sort();

      const categoryLabel = category && category !== "All" ? category : "All Categories";
      const revenueByDate = Object.fromEntries(revenueRows.map((r) => [r.date, r.revenue]));

      const rows = dates.map((date) => [
        date,
        categoryLabel,
        revenueByDate[date] ?? 0,
        ordersByDate[date] ?? 0,
      ]);

      if (rows.length === 0) {
        setStatus("error");
        setMessage("No data to export for the selected filters.");
        return;
      }

      const csv = buildCsv(["Date", "Category", "Revenue", "Orders"], rows);
      const filename = `analytics_${startDate}_to_${endDate}_${categoryLabel.replace(/\s+/g, "-")}.csv`;
      downloadCsv(filename, csv);

      setStatus("done");
      setMessage("CSV exported successfully.");
    } catch (err) {
      setStatus("error");
      setMessage(err?.response?.data?.message || err?.message || "Export failed. Please try again.");
    } finally {
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleExport}
        disabled={status === "loading"}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-60 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        {status === "loading" ? (
          <Loader2 size={13} className="animate-spin" />
        ) : status === "done" ? (
          <Check size={13} className="text-emerald-600 dark:text-emerald-400" />
        ) : (
          <Download size={13} />
        )}
        {status === "loading" ? "Exporting…" : "Export CSV"}
      </button>
      {message && (
        <span
          className={`text-xs ${
            status === "error" ? "text-rose-600 dark:text-rose-400" : "text-slate-500 dark:text-slate-400"
          }`}
          role="status"
        >
          {message}
        </span>
      )}
    </div>
  );
}
