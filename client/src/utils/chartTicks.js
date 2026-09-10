/** Recharts `interval` = number of ticks to skip between visible labels. */
export function tickInterval(pointCount) {
  if (pointCount <= 10) return 0;
  if (pointCount <= 20) return 1;
  return Math.ceil(pointCount / 10) - 1;
}
