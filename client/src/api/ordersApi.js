import api from "./axios";
import { buildParams } from "../utils/apiParams";

export async function getOrders(filters) {
  const { data } = await api.get("/orders", { params: buildParams(filters) });
  return data; // { success, data, pagination }
}

export async function getRecentOrders({ limit } = {}) {
  const { data } = await api.get("/orders/recent", { params: buildParams({ limit }) });
  return data.data;
}
