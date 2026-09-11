import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    allowedHosts: [
      "ecommerce-analytics-dashboard-production-a7a5.up.railway.app"
    ],
  },
});