import { api } from "../lib/api";
import { StudentDashboardData, FacultyDashboardData, AdminDashboardData } from "../types";

export const dashboardService = {
  getStudent: async () => {
    return await api.get<{ success: boolean; dashboard: StudentDashboardData }>("/dashboard/student");
  },

  getFaculty: async () => {
    return await api.get<{ success: boolean; dashboard: FacultyDashboardData }>("/dashboard/faculty");
  },

  getAdmin: async () => {
    return await api.get<{ success: boolean; dashboard: AdminDashboardData }>("/dashboard/admin");
  }
};
