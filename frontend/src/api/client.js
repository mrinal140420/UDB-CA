import axios from "axios";
import { useAuthStore } from "../context/useAuthStore";

const apiBaseURL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? "https://udb-ca.onrender.com/api" : "http://localhost:5000/api");

const api = axios.create({
  baseURL: apiBaseURL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || "";

    if (status === 401 && !url.includes("/auth/login")) {
      const { token, logout } = useAuthStore.getState();
      if (token) {
        logout();
        if (window.location.pathname !== "/login") {
          window.location.replace("/login");
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
