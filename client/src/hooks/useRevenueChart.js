import { useApiData } from "./useApiData";
import { getRevenue } from "../api/analyticsApi";

export function useRevenueChart(filters) {
  return useApiData(
    () => getRevenue(filters),
    [filters.startDate, filters.endDate, filters.category]
  );
}
