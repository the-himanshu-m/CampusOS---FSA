import { api } from "../lib/api";
import { User } from "../types";

export const userService = {
  getAll: async (params?: { role?: string; department?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.role) query.append("role", params.role);
    if (params?.department) query.append("department", params.department);
    if (params?.search) query.append("search", params.search);

    const endpoint = `/users${query.toString() ? `?${query.toString()}` : ""}`;
    return await api.get<{ success: boolean; count: number; users: User[] }>(endpoint);
  },

  getById: async (id: string) => {
    return await api.get<{ success: boolean; user: User }>(`/users/${id}`);
  },

  create: async (data: {
    name: string;
    email: string;
    password: string;
    role: string;
    department?: string;
    identifier?: string;
    phone?: string;
    bio?: string;
    officeLocation?: string;
    batch?: string;
  }) => {
    return await api.post<{ success: boolean; message: string; user: User }>("/users", data);
  },

  update: async (id: string, data: Partial<User & { password?: string }>) => {
    return await api.patch<{ success: boolean; message: string; user: User }>(`/users/${id}`, data);
  },

  delete: async (id: string) => {
    return await api.delete<{ success: boolean; message: string }>(`/users/${id}`);
  }
};
