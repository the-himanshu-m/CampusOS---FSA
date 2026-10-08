"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import DashboardLayout from "../../components/DashboardLayout";
import { useAuth } from "../../hooks/useAuth";
import { dashboardService } from "../../services/dashboardService";
import { AdminDashboardData } from "../../types";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { StatusBadge } from "../../components/StatusBadge";
import {
  Users,
  BookOpen,
  FileCheck2,
  Megaphone,
  UserCheck,
  GraduationCap,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  UserPlus,
  PlusCircle
} from "lucide-react";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      const res = await dashboardService.getAdmin();
      setData(res.dashboard);
    } catch (err: any) {
      setError(err.message || "Failed to load admin telemetry");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout allowedRoles={["ADMIN"]}>
      {isLoading ? (
        <LoadingSpinner size="lg" text="Compiling CampusOS administrative telemetry..." />
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
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30 mb-2">
                  System Administration
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  CampusOS Control Center
                </h1>
                <p className="mt-1 text-sm text-slate-300">
                  Logged in as Administrator: <span className="font-semibold text-white">{user?.name}</span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/admin/users"
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Manage Users
                </Link>
                <Link
                  href="/admin/courses"
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Add Course
                </Link>
              </div>
            </div>
          </div>

          {/* Metric Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{data?.stats.totalUsers || 0}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {data?.stats.totalStudents || 0} Students • {data?.stats.totalFaculty || 0} Faculty
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Active Courses</p>
                <p className="text-2xl font-bold text-gray-900">{data?.stats.totalCourses || 0}</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Assignments</p>
                <p className="text-2xl font-bold text-gray-900">{data?.stats.totalAssignments || 0}</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Megaphone className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Announcements</p>
                <p className="text-2xl font-bold text-gray-900">{data?.stats.totalAnnouncements || 0}</p>
              </div>
            </div>
          </div>

          {/* Tables and Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Users */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-900">Recently Registered Users</h3>
                <Link href="/admin/users" className="text-xs font-semibold text-indigo-600 flex items-center gap-1">
                  View all <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {!data?.recentUsers || data.recentUsers.length === 0 ? (
                <p className="text-xs text-gray-400 py-6 text-center">No users registered.</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {data.recentUsers.map((u) => (
                    <div key={u._id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-gray-900">{u.name}</p>
                        <p className="text-[11px] text-gray-500">{u.email}</p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700">
                        {u.role}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Courses */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-900">Course Registry</h3>
                <Link href="/admin/courses" className="text-xs font-semibold text-indigo-600 flex items-center gap-1">
                  Manage courses <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {!data?.recentCourses || data.recentCourses.length === 0 ? (
                <p className="text-xs text-gray-400 py-6 text-center">No courses configured.</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {data.recentCourses.map((c) => (
                    <div key={c._id} className="py-3 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">
                            {c.code}
                          </span>
                          <p className="text-xs font-bold text-gray-900">{c.name}</p>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          Instructor: {typeof c.faculty === "object" && c.faculty ? (c.faculty as any).name : "Unassigned"}
                        </p>
                      </div>
                      <StatusBadge status={c.status} size="sm" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
