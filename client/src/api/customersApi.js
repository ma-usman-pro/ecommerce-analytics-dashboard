import api from "./axios";
import { buildParams } from "../utils/apiParams";

export async function getCustomers(filters) {
  const { data } = await api.get("/customers", { params: buildParams(filters) });
  return data; // { success, data, pagination }
}
