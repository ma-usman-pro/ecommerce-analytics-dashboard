import { useApiData } from "./useApiData";
import { getCategoryAnalytics } from "../api/analyticsApi";

export function useCategoryChart(filters) {
  return useApiData(
    () => getCategoryAnalytics(filters),
    [filters.startDate, filters.endDate, filters.category]
  );
}
