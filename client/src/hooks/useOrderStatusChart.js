import { useApiData } from "./useApiData";
import { getOrderStatus } from "../api/analyticsApi";

export function useOrderStatusChart(filters) {
  return useApiData(
    () => getOrderStatus(filters),
    [filters.startDate, filters.endDate, filters.category]
  );
}
