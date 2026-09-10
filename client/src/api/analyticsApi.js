import api from "./axios";
import { buildParams } from "../utils/apiParams";

export async function getSummary(filters) {
  const { data } = await api.get("/analytics/summary", { params: buildParams(filters) });
  return data.data;
}

export async function getRevenue(filters) {
  const { data } = await api.get("/analytics/revenue", { params: buildParams(filters) });
  return data.data;
}

export async function getOrdersAnalytics(filters) {
  const { data } = await api.get("/analytics/orders", { params: buildParams(filters) });
  return data.data;
}

export async function getCategoryAnalytics(filters) {
  const { data } = await api.get("/analytics/categories", { params: buildParams(filters) });
  return data.data;
}

export async function getOrderStatus(filters) {
  const { data } = await api.get("/analytics/order-status", { params: buildParams(filters) });
  return data.data;
}

export async function getTopProducts(filters) {
  const { data } = await api.get("/analytics/top-products", { params: buildParams(filters) });
  return data.data;
}

// Category names for the filter dropdown — served by /api/categories,
// not an /analytics route, but grouped here since it only exists to
// feed the analytics filter bar.
export async function getCategories() {
  const { data } = await api.get("/categories");
  return data.data;
}
