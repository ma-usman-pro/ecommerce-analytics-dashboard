import { useApiData } from "./useApiData";
import { getSummary } from "../api/analyticsApi";

export function useSummary(filters) {
  return useApiData(
    () => getSummary(filters),
    [filters.startDate, filters.endDate, filters.category]
  );
}
