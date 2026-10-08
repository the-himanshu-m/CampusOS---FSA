"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import DashboardLayout from "../../components/DashboardLayout";
import { useAuth } from "../../hooks/useAuth";
import { courseService } from "../../services/courseService";
import { Course } from "../../types";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { EmptyState } from "../../components/EmptyState";
import { StatusBadge } from "../../components/StatusBadge";
import { BookOpen, Search, Filter, CheckCircle2, User, GraduationCap } from "lucide-react";

export default function CoursesPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"enrolled" | "catalog">("enrolled");
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchCourses();
  }, [activeTab, department]);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const res = await courseService.getAll({
        department: department || undefined,
        search: search || undefined,
        all: activeTab === "catalog"
      });
      setCourses(res.courses || []);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to load courses" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCourses();
  };

  const isEnrolled = (course: Course) => {
    if (!user || !course.students) return false;
    return course.students.some((s: any) => (s._id || s) === user._id);
  };

  const handleEnroll = async (courseId: string) => {
    try {
      setActionLoading(courseId);
      await courseService.enroll(courseId);
      setMessage({ type: "success", text: "Successfully enrolled in course!" });
      fetchCourses();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Enrollment failed" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnenroll = async (courseId: string) => {
    if (!confirm("Are you sure you want to drop/unenroll from this course?")) return;
    try {
      setActionLoading(courseId);
      await courseService.unenroll(courseId);
      setMessage({ type: "success", text: "Successfully unenrolled from course" });
      fetchCourses();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Unenrollment failed" });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Courses & Academics</h1>
            <p className="text-xs text-gray-500 mt-1">
              Browse available course modules and manage your active enrollments
            </p>
          </div>

          {/* Tabs */}
          <div className="flex rounded-xl bg-gray-200/80 p-1 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab("enrolled")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === "enrolled" ? "bg-white text-gray-900 shadow-xs" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              My Enrolled Courses
            </button>
            <button
              onClick={() => setActiveTab("catalog")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === "catalog" ? "bg-white text-gray-900 shadow-xs" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Course Catalog
            </button>
          </div>
        </div>

        {/* Feedback message */}
        {message && (
          <div
            className={`p-3.5 rounded-xl text-xs font-medium border flex items-center justify-between ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-red-50 text-red-800 border-red-200"
            }`}
          >
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="font-bold ml-2">✕</button>
          </div>
        )}

        {/* Filter / Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by course title or code (e.g. CS101)..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </form>

          <div className="flex items-center gap-2">
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="py-2 px-3 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">All Departments</option>
              <option value="CSE">CSE</option>
              <option value="IT">IT</option>
              <option value="AIML">AIML</option>
              <option value="ENTC">ENTC</option>
            </select>
          </div>
        </div>

        {/* Course Cards Grid */}
        {isLoading ? (
          <LoadingSpinner text="Fetching courses..." />
        ) : courses.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title={activeTab === "enrolled" ? "No enrolled courses found" : "No courses match your query"}
            description={
              activeTab === "enrolled"
                ? "You have not enrolled in any courses yet. Switch to the Course Catalog to register."
                : "No matching courses exist in the catalog."
            }
            actionLabel={activeTab === "enrolled" ? "Explore Catalog" : undefined}
            onAction={activeTab === "enrolled" ? () => setActiveTab("catalog") : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((course) => {
              const enrolled = isEnrolled(course);
              const facultyName =
                typeof course.faculty === "object" && course.faculty
                  ? (course.faculty as any).name
                  : "Faculty not assigned";

              return (
                <div
                  key={course._id}
                  className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs hover:border-indigo-200 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md">
                        {course.code}
                      </span>
                      <StatusBadge status={course.status} size="sm" />
                    </div>

                    <Link href={`/courses/${course._id}`} className="group">
                      <h3 className="text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {course.name}
                      </h3>
                    </Link>

                    <p className="mt-2 text-xs text-gray-500 line-clamp-2">
                      {course.description || "Comprehensive curriculum covering fundamentals and applied labs."}
                    </p>

                    <div className="mt-4 pt-3 border-t border-gray-100 space-y-1.5 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        <span className="truncate">{facultyName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-3.5 h-3.5 text-gray-400" />
                        <span>Department: {course.department}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                    <Link
                      href={`/courses/${course._id}`}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                      View Details →
                    </Link>

                    {enrolled ? (
                      <button
                        onClick={() => handleUnenroll(course._id)}
                        disabled={actionLoading === course._id}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-600 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                      >
                        {actionLoading === course._id ? "Processing..." : "Drop Course"}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEnroll(course._id)}
                        disabled={actionLoading === course._id}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                      >
                        {actionLoading === course._id ? "Enrolling..." : "Enroll"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
