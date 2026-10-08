export type Role = "STUDENT" | "FACULTY" | "ADMIN" | "PLACEMENT_OFFICER";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  identifier?: string;
  department?: string;
  phone?: string;
  bio?: string;
  officeLocation?: string;
  batch?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Course {
  _id: string;
  name: string;
  code: string;
  description?: string;
  department: string;
  semester?: string;
  faculty?: User | string | null;
  students?: (User | string)[];
  status: "ACTIVE" | "ARCHIVED";
  createdAt?: string;
  updatedAt?: string;
}

export interface Submission {
  _id: string;
  student: User | string;
  content?: string;
  fileUrl?: string;
  submittedAt: string;
  status: "SUBMITTED" | "GRADED" | "LATE";
  grade?: number | null;
  feedback?: string;
}

export interface Assignment {
  _id: string;
  title: string;
  description?: string;
  course: Course | string;
  createdBy: User | string;
  deadline: string;
  maxPoints: number;
  status: "PUBLISHED" | "DRAFT" | "CLOSED";
  submissions: Submission[];
  mySubmission?: Submission | null;
  isSubmitted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Announcement {
  _id: string;
  title: string;
  content: string;
  author: User;
  audience: "ALL" | "STUDENT" | "FACULTY";
  course?: Course | string | null;
  priority: "NORMAL" | "IMPORTANT" | "URGENT";
  createdAt: string;
  updatedAt?: string;
}

export interface StudentDashboardData {
  profile: User;
  courses: Course[];
  stats: {
    totalEnrolledCourses: number;
    upcomingCount: number;
    overdueCount: number;
    completedCount: number;
  };
  upcomingAssignments: Array<{
    _id: string;
    title: string;
    course: Course;
    deadline: string;
    maxPoints: number;
    submission: Submission | null;
    isSubmitted: boolean;
  }>;
  overdueAssignments: Array<{
    _id: string;
    title: string;
    course: Course;
    deadline: string;
    maxPoints: number;
    submission: Submission | null;
    isSubmitted: boolean;
  }>;
  completedAssignments: Array<{
    _id: string;
    title: string;
    course: Course;
    deadline: string;
    maxPoints: number;
    submission: Submission | null;
    isSubmitted: boolean;
  }>;
  recentAnnouncements: Announcement[];
}

export interface FacultyDashboardData {
  profile: User;
  courses: Course[];
  assignments: Assignment[];
  stats: {
    totalCourses: number;
    totalStudents: number;
    totalAssignments: number;
    totalSubmissions: number;
    pendingGrading: number;
  };
  recentAnnouncements: Announcement[];
}

export interface AdminDashboardData {
  stats: {
    totalUsers: number;
    totalStudents: number;
    totalFaculty: number;
    totalAdmins: number;
    totalCourses: number;
    totalAssignments: number;
    totalAnnouncements: number;
  };
  recentUsers: User[];
  recentCourses: Course[];
  recentAnnouncements: Announcement[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  user?: User;
  token?: string;
  count?: number;
  [key: string]: any;
}
