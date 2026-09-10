import { useApiData } from "./useApiData";
import { getOrders } from "../api/ordersApi";

export function useOrdersList({ startDate, endDate, category, status, search, page, limit }) {
  const { data, loading, error, refetch } = useApiData(
    () => getOrders({ startDate, endDate, category, status, search, page, limit }),
    [startDate, endDate, category, status, search, page, limit]
  );

  return {
    orders: data?.data || [],
    pagination: data?.pagination || { page, limit, total: 0, totalPages: 0 },
    loading,
    error,
    refetch,
  };
}
