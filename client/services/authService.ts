import { api, setAuthToken, removeAuthToken } from "../lib/api";
import { User } from "../types";

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user: User;
}

export const authService = {
  login: async (credentials: { email: string; password: string }): Promise<LoginResponse> => {
    const res = await api.post<LoginResponse>("/auth/login", credentials);
    if (res.token) {
      setAuthToken(res.token);
      if (typeof window !== "undefined") {
        localStorage.setItem("campusos_user", JSON.stringify(res.user));
      }
    }
    return res;
  },

  register: async (userData: {
    name: string;
    email: string;
    password: string;
    role?: string;
    department?: string;
    identifier?: string;
  }): Promise<RegisterResponse> => {
    return await api.post<RegisterResponse>("/auth/register", userData);
  },

  getMe: async (): Promise<{ success: boolean; user: User }> => {
    const res = await api.get<{ success: boolean; user: User }>("/auth/me");
    if (res.user && typeof window !== "undefined") {
      localStorage.setItem("campusos_user", JSON.stringify(res.user));
    }
    return res;
  },

  logout: (): void => {
    removeAuthToken();
  },

  getStoredUser: (): User | null => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem("campusos_user");
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
};
