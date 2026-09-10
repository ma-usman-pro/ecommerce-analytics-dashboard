/**
 * Percentage change from `previous` to `current`. Returns null when there
 * is no valid prior value to compare against (e.g. previous period had
 * zero orders) — callers must treat null as "no trend to show", not 0%.
 */
export function computeTrend(current, previous) {
  if (current === null || current === undefined) return null;
  if (previous === null || previous === undefined || previous === 0) return null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}
