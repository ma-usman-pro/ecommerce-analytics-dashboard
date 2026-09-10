export const DATE_PRESETS = [
  "Today",
  "Last 7 Days",
  "Last 30 Days",
  "Last 90 Days",
  "This Year",
  "Custom",
];

function toISODate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(d, days) {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
}

/**
 * Returns { startDate, endDate } ISO strings for a named preset, or null
 * for "Custom" (the caller keeps whatever dates the user already picked).
 */
export function getPresetRange(preset) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  switch (preset) {
    case "Today":
      return { startDate: toISODate(today), endDate: toISODate(today) };
    case "Last 7 Days":
      return { startDate: toISODate(addDays(today, -6)), endDate: toISODate(today) };
    case "Last 30 Days":
      return { startDate: toISODate(addDays(today, -29)), endDate: toISODate(today) };
    case "Last 90 Days":
      return { startDate: toISODate(addDays(today, -89)), endDate: toISODate(today) };
    case "This Year": {
      const jan1 = new Date(today.getFullYear(), 0, 1);
      return { startDate: toISODate(jan1), endDate: toISODate(today) };
    }
    default:
      return null; // Custom
  }
}

export const PRESET_URL_CODES = {
  "Today": "today",
  "Last 7 Days": "7d",
  "Last 30 Days": "30d",
  "Last 90 Days": "90d",
  "This Year": "ytd",
  "Custom": "custom",
};

const URL_CODE_TO_PRESET = Object.fromEntries(
  Object.entries(PRESET_URL_CODES).map(([label, code]) => [code, label])
);

export function presetFromUrlCode(code) {
  return URL_CODE_TO_PRESET[code] || null;
}

export function formatRangeLabel(startDate, endDate) {
  if (!startDate || !endDate) return "";
  const fmt = (s) => {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };
  return `${fmt(startDate)} \u2192 ${fmt(endDate)}`;
}

/**
 * Given the active range, returns the immediately-preceding range of the
 * same length — used to calculate stat card trend percentages against a
 * real, equivalent prior period (never a made-up comparison value).
 */
export function getPreviousRange(startDate, endDate) {
  if (!startDate || !endDate) return null;

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const lengthDays = Math.round((end - start) / 86400000) + 1;

  const prevEnd = addDays(start, -1);
  const prevStart = addDays(prevEnd, -(lengthDays - 1));

  return { startDate: toISODate(prevStart), endDate: toISODate(prevEnd) };
}
