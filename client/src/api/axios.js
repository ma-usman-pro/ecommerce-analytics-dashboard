import axios from "axios";

// In dev, fall back to the local backend if VITE_API_URL isn't set. In a
// production build, never fall back to localhost — fall back to a
// same-origin relative path instead, so a misconfigured build fails
// loudly (network errors) rather than silently pointing at localhost.
const baseURL =
  import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000/api" : "/api");

const api = axios.create({
  baseURL,
  timeout: 15000,
});

export default api;
