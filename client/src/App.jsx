import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout";
import { DashboardFilterProvider } from "./context/DashboardFilterContext";

// Route-level code splitting: Dashboard pulls in Recharts (the largest
// dependency in this app), so keeping it in its own chunk means visiting
// /orders or /products never downloads charting code they don't need.
const Dashboard = lazy(() => import("./pages/Dashboard"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const ProductsPage = lazy(() => import("./pages/ProductsPage"));
const Placeholder = lazy(() => import("./pages/Placeholder"));

function RouteFallback() {
  return (
    <div className="flex h-64 items-center justify-center text-sm text-slate-500 dark:text-slate-400">
      Loading…
    </div>
  );
}

export default function App() {
  return (
    // Lifted above the routes (not just the Dashboard page) so the Orders
    // and Products pages share the exact same date-range/category filter
    // state as the dashboard, per Part 6's filter-consistency requirement.
    <DashboardFilterProvider>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/customers" element={<Placeholder title="Customers" />} />
            <Route path="/analytics" element={<Placeholder title="Analytics" />} />
            <Route path="/settings" element={<Placeholder title="Settings" />} />
          </Route>
        </Routes>
      </Suspense>
    </DashboardFilterProvider>
  );
}
