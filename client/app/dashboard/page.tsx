"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import DashboardLayout from "../../components/DashboardLayout";
import { useAuth } from "../../hooks/useAuth";
import { dashboardService } from "../../services/dashboardService";
import { StudentDashboardData } from "../../types";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { StatusBadge } from "../../components/StatusBadge";
import {
  BookOpen,
  FileCheck2,
  Clock,
  AlertTriangle,
  Megaphone,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ExternalLink
} from "lucide-react";

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      const res = await dashboardService.getStudent();
      setData(res.dashboard);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout allowedRoles={["STUDENT"]}>
      {isLoading ? (
        <LoadingSpinner size="lg" text="Loading student dashboard..." />
      ) : error ? (
        <div className="p-6 bg-red-50 text-red-700 rounded-xl border border-red-200">
          <p className="font-semibold">{error}</p>
          <button
            onClick={fetchDashboard}
            className="mt-3 px-4 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Welcome Card */}
          <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 rounded-2xl p-6 sm:p-8 text-white shadow-lg shadow-indigo-600/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-xs mb-2">
                  Academic Portal
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Welcome back, {user?.name || "Student"}!
                </h1>
                <p className="mt-1 text-sm text-indigo-100 max-w-xl">
                  Department: <span className="font-semibold">{user?.department || "General"}</span>
                  {user?.identifier && ` • Student ID: ${user.identifier}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/courses"
                  className="px-4 py-2.5 bg-white text-indigo-700 rounded-xl text-xs font-bold hover:bg-indigo-50 transition-colors shadow-xs"
                >
                  Browse Catalog
                </Link>
                <Link
                  href="/assignments"
                  className="px-4 py-2.5 bg-indigo-500/40 text-white border border-white/20 rounded-xl text-xs font-bold hover:bg-indigo-500/60 transition-colors"
                >
                  View Tasks
                </Link>
              </div>
            </div>
          </div>

          {/* Metric Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Enrolled Courses</p>
                <p className="text-2xl font-bold text-gray-900">{data?.stats.totalEnrolledCourses || 0}</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Upcoming Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{data?.stats.upcomingCount || 0}</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Overdue Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{data?.stats.overdueCount || 0}</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Completed Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{data?.stats.completedCount || 0}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 cols: Enrolled Courses & Upcoming Assignments */}
            <div className="lg:col-span-2 space-y-6">
              {/* Upcoming Assignments Section */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Upcoming Assignments</h3>
                    <p className="text-xs text-gray-500">Deadlines requiring submission</p>
                  </div>
                  <Link href="/assignments" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                    All tasks <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {!data?.upcomingAssignments || data.upcomingAssignments.length === 0 ? (
                  <p className="text-xs text-gray-400 py-6 text-center">No pending assignments. You are all caught up!</p>
                ) : (
                  <div className="space-y-3">
                    {data.upcomingAssignments.slice(0, 4).map((item) => (
                      <div
                        key={item._id}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/20 transition-colors"
                      >
                        <div className="min-w-0 flex-1 mr-4">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                            {item.course?.code || "Course"}
                          </span>
                          <h4 className="text-sm font-semibold text-gray-900 truncate mt-1">
                            {item.title}
                          </h4>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            Due: {new Date(item.deadline).toLocaleDateString()} {new Date(item.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <Link
                          href={`/assignments/${item._id}`}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shrink-0 transition-colors"
                        >
                          Submit
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Enrolled Courses Section */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Enrolled Courses</h3>
                    <p className="text-xs text-gray-500">Active subjects for this semester</p>
                  </div>
                  <Link href="/courses" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                    Manage <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {!data?.courses || data.courses.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-xs text-gray-400 mb-3">You are not enrolled in any courses yet.</p>
                    <Link
                      href="/courses"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
                    >
                      Browse Course Catalog
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {data.courses.map((course) => (
                      <Link
                        key={course._id}
                        href={`/courses/${course._id}`}
                        className="p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-xs transition-all group block"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                            {course.code}
                          </span>
                          <StatusBadge status={course.status} size="sm" />
                        </div>
                        <h4 className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                          {course.name}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                          Instructor: {typeof course.faculty === "object" && course.faculty ? (course.faculty as any).name : "TBA"}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right col: Bulletins & Announcements */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-base font-bold text-gray-900">Campus Bulletins</h3>
                  </div>
                  <Link href="/announcements" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                    All
                  </Link>
                </div>

                {!data?.recentAnnouncements || data.recentAnnouncements.length === 0 ? (
                  <p className="text-xs text-gray-400 py-6 text-center">No announcements at this time.</p>
                ) : (
                  <div className="space-y-3.5">
                    {data.recentAnnouncements.map((ann) => (
                      <div key={ann._id} className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] text-gray-400 font-medium">
                            {new Date(ann.createdAt).toLocaleDateString()}
                          </span>
                          <StatusBadge status={ann.priority} size="sm" />
                        </div>
                        <h4 className="text-xs font-bold text-gray-900">{ann.title}</h4>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{ann.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
