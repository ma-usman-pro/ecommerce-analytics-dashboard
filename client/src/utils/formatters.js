const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("en-US");

export function formatCurrency(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return currencyFormatter.format(value);
}

export function formatNumber(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return numberFormatter.format(value);
}

export function formatDateDisplay(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// Compact axis-friendly currency: $0, $1K, $2.5K, $10K — never long decimals,
// and never a trailing ".0" on round numbers.
export function formatCompactCurrency(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "$0";
  const abs = Math.abs(value);
  const trimZero = (s) => s.replace(/\.0$/, "");
  if (abs >= 1_000_000) {
    return `$${trimZero((value / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1))}M`;
  }
  if (abs >= 1_000) {
    return `$${trimZero((value / 1_000).toFixed(abs >= 10_000 ? 0 : 1))}K`;
  }
  return `$${Math.round(value)}`;
}

// Short chart-axis date label, parsed as a plain calendar date (no
// timezone shift) since the backend returns "YYYY-MM-DD" strings.
export function formatShortDate(value) {
  if (!value) return "";
  const [y, m, d] = String(value).split("-").map(Number);
  if (!y || !m || !d) return String(value);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
