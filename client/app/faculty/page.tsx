"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import DashboardLayout from "../../components/DashboardLayout";
import { useAuth } from "../../hooks/useAuth";
import { dashboardService } from "../../services/dashboardService";
import { FacultyDashboardData } from "../../types";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { StatusBadge } from "../../components/StatusBadge";
import {
  BookOpen,
  FileCheck2,
  Users,
  Clock,
  PlusCircle,
  Megaphone,
  ArrowRight,
  GraduationCap
} from "lucide-react";

export default function FacultyDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<FacultyDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      const res = await dashboardService.getFaculty();
      setData(res.dashboard);
    } catch (err: any) {
      setError(err.message || "Failed to load faculty dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout allowedRoles={["FACULTY", "ADMIN"]}>
      {isLoading ? (
        <LoadingSpinner size="lg" text="Loading faculty workspace..." />
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
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-purple-800 via-indigo-700 to-indigo-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg shadow-purple-900/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-xs mb-2">
                  Faculty Faculty Portal
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Welcome, Prof. {user?.name}
                </h1>
                <p className="mt-1 text-sm text-purple-100">
                  Department: <span className="font-semibold">{user?.department}</span>
                  {user?.officeLocation && ` • Office: ${user.officeLocation}`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/faculty/assignments"
                  className="px-4 py-2.5 bg-white text-purple-800 rounded-xl text-xs font-bold hover:bg-purple-50 transition-colors shadow-xs"
                >
                  Create Assignment
                </Link>
                <Link
                  href="/faculty/announcements"
                  className="px-4 py-2.5 bg-purple-600/40 text-white border border-white/20 rounded-xl text-xs font-bold hover:bg-purple-600/60 transition-colors"
                >
                  Post Notice
                </Link>
              </div>
            </div>
          </div>

          {/* Metric Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Taught Courses</p>
                <p className="text-2xl font-bold text-gray-900">{data?.stats.totalCourses || 0}</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Enrolled Students</p>
                <p className="text-2xl font-bold text-gray-900">{data?.stats.totalStudents || 0}</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Active Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{data?.stats.totalAssignments || 0}</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Pending Grading</p>
                <p className="text-2xl font-bold text-gray-900">{data?.stats.pendingGrading || 0}</p>
              </div>
            </div>
          </div>

          {/* Courses & Assignments Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Assigned Courses */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Your Assigned Courses</h3>
                    <p className="text-xs text-gray-500">Courses where you are listed as instructor</p>
                  </div>
                  <Link href="/faculty/courses" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                    Manage Roster <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {!data?.courses || data.courses.length === 0 ? (
                  <p className="text-xs text-gray-400 py-6 text-center">No assigned courses currently.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {data.courses.map((course) => (
                      <div
                        key={course._id}
                        className="p-4 rounded-xl border border-gray-100 hover:border-indigo-100 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                            {course.code}
                          </span>
                          <span className="text-xs text-gray-500 font-medium">
                            {(course.students || []).length} students
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-gray-900 truncate">{course.name}</h4>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                          Department of {course.department}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Assignments Section */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Recent Assignments</h3>
                    <p className="text-xs text-gray-500">Track deadlines and submission progress</p>
                  </div>
                  <Link href="/faculty/assignments" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                    All tasks & grading <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {!data?.assignments || data.assignments.length === 0 ? (
                  <p className="text-xs text-gray-400 py-6 text-center">No assignments created yet.</p>
                ) : (
                  <div className="space-y-3">
                    {data.assignments.slice(0, 5).map((a) => (
                      <div
                        key={a._id}
                        className="p-3.5 rounded-xl border border-gray-100 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                              {typeof a.course === "object" ? a.course.code : "Course"}
                            </span>
                            <h4 className="text-sm font-semibold text-gray-900">{a.title}</h4>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Due: {new Date(a.deadline).toLocaleDateString()} • Submissions: {a.submissions?.length || 0}
                          </p>
                        </div>
                        <Link
                          href="/faculty/assignments"
                          className="px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-xs font-semibold"
                        >
                          Grade Work
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right col: Notices */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-purple-600" />
                    <h3 className="text-base font-bold text-gray-900">Faculty Notices</h3>
                  </div>
                  <Link href="/faculty/announcements" className="text-xs font-semibold text-indigo-600">
                    Post
                  </Link>
                </div>

                {!data?.recentAnnouncements || data.recentAnnouncements.length === 0 ? (
                  <p className="text-xs text-gray-400 py-6 text-center">No bulletins posted.</p>
                ) : (
                  <div className="space-y-3">
                    {data.recentAnnouncements.map((ann) => (
                      <div key={ann._id} className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="flex items-center justify-between mb-1">
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
