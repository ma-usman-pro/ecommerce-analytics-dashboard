import { useApiData } from "./useApiData";
import { getOrdersAnalytics } from "../api/analyticsApi";

export function useOrdersChart(filters) {
  return useApiData(
    () => getOrdersAnalytics(filters),
    [filters.startDate, filters.endDate, filters.category]
  );
}
