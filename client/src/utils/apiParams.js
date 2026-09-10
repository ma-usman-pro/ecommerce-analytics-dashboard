/**
 * Builds a clean query-params object from a filters shape, dropping
 * empty/"All" values so the backend's own defaulting rules apply
 * (e.g. omitted category = all categories).
 */
export function buildParams(filters = {}) {
  const { startDate, endDate, category, status, limit, page, search } = filters;
  const params = {};

  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  if (category && category !== "All") params.category = category;
  if (status && status !== "All") params.status = status;
  if (limit) params.limit = limit;
  if (page) params.page = page;
  if (search) params.search = search;

  return params;
}
