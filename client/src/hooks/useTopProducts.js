import { useApiData } from "./useApiData";
import { getTopProducts } from "../api/analyticsApi";

export function useTopProducts(filters, limit = 5) {
  return useApiData(
    () => getTopProducts({ ...filters, limit }),
    [filters.startDate, filters.endDate, filters.category, limit]
  );
}
