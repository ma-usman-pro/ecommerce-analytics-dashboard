import { useTheme } from "../context/ThemeContext";

const LIGHT = {
  grid: "#e2e8f0", // slate-200
  axis: "#94a3b8", // slate-400
};
const DARK = {
  grid: "#1e293b", // slate-800
  axis: "#64748b", // slate-500
};

/** SVG axis/grid colors can't respond to Tailwind's `dark:` class the way
 * plain HTML can, so charts read the active theme directly. Tooltips and
 * legends are ordinary HTML and use Tailwind dark: classes instead. */
export function useChartAxisColors() {
  const { theme } = useTheme();
  return theme === "dark" ? DARK : LIGHT;
}

// Single-series charts (revenue area, orders bars) — matches the brand
// accent used for active nav state / primary actions elsewhere.
export const BRAND_LINE = "#0f8875"; // brand-600
export const BRAND_FILL = "#16a891"; // brand-500

// Category donut palette — distinct hues, not relied on alone since every
// slice is also labeled by name in the legend list below the chart.
export const CATEGORY_COLORS = [
  "#0f8875", // brand-600 teal
  "#d97706", // amber-600
  "#4f46e5", // indigo-600
  "#db2777", // pink-600
  "#16a34a", // green-600
  "#0284c7", // sky-600
  "#9333ea", // purple-600
];

// Order status colors — same semantics as the StatusBadge pill colors.
export const STATUS_COLORS = {
  Completed: "#059669", // emerald-600
  Processing: "#2563eb", // blue-600
  Pending: "#d97706", // amber-600
  Cancelled: "#64748b", // slate-500
  Refunded: "#7c3aed", // violet-600
};
