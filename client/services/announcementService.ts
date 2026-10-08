import { api } from "../lib/api";
import { Announcement } from "../types";

export const announcementService = {
  getAll: async (params?: { priority?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.priority) query.append("priority", params.priority);
    if (params?.search) query.append("search", params.search);

    const endpoint = `/announcements${query.toString() ? `?${query.toString()}` : ""}`;
    return await api.get<{ success: boolean; count: number; announcements: Announcement[] }>(endpoint);
  },

  getById: async (id: string) => {
    return await api.get<{ success: boolean; announcement: Announcement }>(`/announcements/${id}`);
  },

  create: async (data: {
    title: string;
    content: string;
    audience?: "ALL" | "STUDENT" | "FACULTY";
    priority?: "NORMAL" | "IMPORTANT" | "URGENT";
    course?: string | null;
  }) => {
    return await api.post<{ success: boolean; message: string; announcement: Announcement }>(
      "/announcements",
      data
    );
  },

  update: async (
    id: string,
    data: Partial<{
      title: string;
      content: string;
      audience: "ALL" | "STUDENT" | "FACULTY";
      priority: "NORMAL" | "IMPORTANT" | "URGENT";
      course: string | null;
    }>
  ) => {
    return await api.patch<{ success: boolean; message: string; announcement: Announcement }>(
      `/announcements/${id}`,
      data
    );
  },

  delete: async (id: string) => {
    return await api.delete<{ success: boolean; message: string }>(`/announcements/${id}`);
  }
};
