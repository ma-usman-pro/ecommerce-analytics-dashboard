import { useApiData } from "./useApiData";
import { getRecentOrders } from "../api/ordersApi";

export function useRecentOrders(limit = 8) {
  return useApiData(() => getRecentOrders({ limit }), [limit]);
}
