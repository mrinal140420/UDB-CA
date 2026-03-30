import { create } from "zustand";
import axios from "axios";

const authApi = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 15000,
});

const stored = JSON.parse(localStorage.getItem("inventory_auth") || "null");

export const useAuthStore = create((set) => ({
  token: stored?.token || "",
  user: stored?.user || null,
  isLoading: false,
  login: async (payload) => {
    set({ isLoading: true });
    try {
      const { data } = await authApi.post("/auth/login", payload);
      const auth = { token: data.data.token, user: data.data.user };
      localStorage.setItem("inventory_auth", JSON.stringify(auth));
      set({ ...auth, isLoading: false });
      return { ok: true };
    } catch (error) {
      set({ isLoading: false });
      return { ok: false, message: error.response?.data?.message || "Login failed" };
    }
  },
  logout: () => {
    localStorage.removeItem("inventory_auth");
    set({ token: "", user: null });
  },
  updateUser: (user) => {
    const current = useAuthStore.getState();
    const auth = { token: current.token, user };
    localStorage.setItem("inventory_auth", JSON.stringify(auth));
    set({ user });
  },
}));
