import { api } from "../lib/api";
import { Course } from "../types";

export const courseService = {
  getAll: async (params?: { department?: string; search?: string; all?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.department) query.append("department", params.department);
    if (params?.search) query.append("search", params.search);
    if (params?.all) query.append("all", "true");

    const endpoint = `/courses${query.toString() ? `?${query.toString()}` : ""}`;
    return await api.get<{ success: boolean; count: number; courses: Course[] }>(endpoint);
  },

  getById: async (id: string) => {
    return await api.get<{ success: boolean; course: Course }>(`/courses/${id}`);
  },

  create: async (data: {
    name: string;
    code: string;
    description?: string;
    department?: string;
    semester?: string;
    faculty?: string | null;
  }) => {
    return await api.post<{ success: boolean; message: string; course: Course }>("/courses", data);
  },

  update: async (
    id: string,
    data: Partial<{
      name: string;
      code: string;
      description: string;
      department: string;
      semester: string;
      faculty: string | null;
      status: "ACTIVE" | "ARCHIVED";
    }>
  ) => {
    return await api.patch<{ success: boolean; message: string; course: Course }>(`/courses/${id}`, data);
  },

  delete: async (id: string) => {
    return await api.delete<{ success: boolean; message: string }>(`/courses/${id}`);
  },

  enroll: async (courseId: string, studentId?: string) => {
    return await api.post<{ success: boolean; message: string; course: Course }>(
      `/courses/${courseId}/enroll`,
      studentId ? { studentId } : {}
    );
  },

  unenroll: async (courseId: string, studentId?: string) => {
    return await api.post<{ success: boolean; message: string; course: Course }>(
      `/courses/${courseId}/unenroll`,
      studentId ? { studentId } : {}
    );
  }
};
