import { useApiData } from "./useApiData";
import { getProducts } from "../api/productsApi";

export function useProductsList({ category, search, page, limit }) {
  const { data, loading, error, refetch } = useApiData(
    () => getProducts({ category, search, page, limit }),
    [category, search, page, limit]
  );

  return {
    products: data?.data || [],
    pagination: data?.pagination || { page, limit, total: 0, totalPages: 0 },
    loading,
    error,
    refetch,
  };
}
