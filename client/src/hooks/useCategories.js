import { useApiData } from "./useApiData";
import { getCategories } from "../api/analyticsApi";

export function useCategories() {
  return useApiData(() => getCategories(), []);
}
