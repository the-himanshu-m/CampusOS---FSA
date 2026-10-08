import { api } from "../lib/api";
import { Assignment } from "../types";

export const assignmentService = {
  getAll: async (params?: { course?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.course) query.append("course", params.course);
    if (params?.status) query.append("status", params.status);

    const endpoint = `/assignments${query.toString() ? `?${query.toString()}` : ""}`;
    return await api.get<{ success: boolean; count: number; assignments: Assignment[] }>(endpoint);
  },

  getById: async (id: string) => {
    return await api.get<{ success: boolean; assignment: Assignment }>(`/assignments/${id}`);
  },

  create: async (data: {
    title: string;
    description?: string;
    course: string;
    deadline: string;
    maxPoints?: number;
    status?: "PUBLISHED" | "DRAFT" | "CLOSED";
  }) => {
    return await api.post<{ success: boolean; message: string; assignment: Assignment }>("/assignments", data);
  },

  update: async (
    id: string,
    data: Partial<{
      title: string;
      description: string;
      deadline: string;
      maxPoints: number;
      status: "PUBLISHED" | "DRAFT" | "CLOSED";
    }>
  ) => {
    return await api.patch<{ success: boolean; message: string; assignment: Assignment }>(
      `/assignments/${id}`,
      data
    );
  },

  delete: async (id: string) => {
    return await api.delete<{ success: boolean; message: string }>(`/assignments/${id}`);
  },

  submit: async (id: string, data: { content?: string; fileUrl?: string }) => {
    return await api.post<{ success: boolean; message: string; assignment: Assignment }>(
      `/assignments/${id}/submit`,
      data
    );
  },

  grade: async (
    id: string,
    submissionId: string,
    data: { grade: number; feedback?: string }
  ) => {
    return await api.patch<{ success: boolean; message: string; assignment: Assignment }>(
      `/assignments/${id}/submissions/${submissionId}/grade`,
      data
    );
  }
};
