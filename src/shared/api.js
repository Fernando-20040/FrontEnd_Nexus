// src/shared/api.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
});

api.interceptors.request.use((config) => {
  const basic = localStorage.getItem("basic");
  if (basic) config.headers.Authorization = `Basic ${basic}`;
  return config;
});

export default api;
