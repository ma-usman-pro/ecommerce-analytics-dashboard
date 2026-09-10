import api from "./axios";
import { buildParams } from "../utils/apiParams";

export async function getProducts(filters) {
  const { data } = await api.get("/products", { params: buildParams(filters) });
  return data; // { success, data, pagination }
}
