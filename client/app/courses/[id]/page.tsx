"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "../../../components/DashboardLayout";
import { useAuth } from "../../../hooks/useAuth";
import { courseService } from "../../../services/courseService";
import { assignmentService } from "../../../services/assignmentService";
import { Course, Assignment } from "../../../types";
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import { StatusBadge } from "../../../components/StatusBadge";
import {
  BookOpen,
  User,
  Mail,
  Calendar,
  FileCheck2,
  Users,
  ArrowLeft,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (courseId) {
      loadData();
    }
  }, [courseId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [cRes, aRes] = await Promise.all([
        courseService.getById(courseId),
        assignmentService.getAll({ course: courseId })
      ]);
      setCourse(cRes.course);
      setAssignments(aRes.assignments || []);
    } catch (err: any) {
      setError(err.message || "Failed to load course details");
    } finally {
      setIsLoading(false);
    }
  };

  const isEnrolled = () => {
    if (!user || !course?.students) return false;
    return course.students.some((s: any) => (s._id || s) === user._id);
  };

  const handleEnrollToggle = async () => {
    if (!course) return;
    try {
      setActionLoading(true);
      if (isEnrolled()) {
        if (!confirm("Are you sure you want to drop this course?")) return;
        await courseService.unenroll(course._id);
      } else {
        await courseService.enroll(course._id);
      }
      await loadData();
    } catch (err: any) {
      alert(err.message || "Enrollment action failed");
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <LoadingSpinner size="lg" text="Loading course syllabus & details..." />
      </DashboardLayout>
    );
  }

  if (error || !course) {
    return (
      <DashboardLayout>
        <div className="p-6 bg-red-50 text-red-700 rounded-2xl border border-red-200">
          <p className="font-semibold">{error || "Course not found"}</p>
          <Link href="/courses" className="mt-3 inline-block text-xs font-bold text-red-800 underline">
            Back to Courses
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const faculty = typeof course.faculty === "object" ? (course.faculty as any) : null;
  const enrolledCount = (course.students || []).length;
  const enrolled = isEnrolled();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Courses
        </Link>

        {/* Hero Banner */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="px-3 py-1 rounded-md bg-indigo-50 text-indigo-700 font-bold text-xs">
                  {course.code}
                </span>
                <span className="text-xs text-gray-500 font-medium">
                  Department of {course.department}
                </span>
                <StatusBadge status={course.status} size="sm" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                {course.name}
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-gray-600 max-w-2xl leading-relaxed">
                {course.description || "Course modules, lab exercises, assignments, and curriculum guidelines."}
              </p>
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0">
              {enrolled ? (
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Enrolled
                  </span>
                  <button
                    onClick={handleEnrollToggle}
                    disabled={actionLoading}
                    className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-red-50 hover:text-red-600 text-xs font-semibold text-gray-600 transition-colors"
                  >
                    Drop
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleEnrollToggle}
                  disabled={actionLoading}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                >
                  {actionLoading ? "Processing..." : "Enroll in this Course"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main: Assignments list */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs">
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-indigo-600" /> Course Assignments & Assessments
              </h3>

              {assignments.length === 0 ? (
                <p className="text-xs text-gray-400 py-8 text-center">
                  No assignments have been published for this course yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {assignments.map((assignment) => (
                    <div
                      key={assignment._id}
                      className="p-4 rounded-xl border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/20 transition-all flex items-center justify-between"
                    >
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">{assignment.title}</h4>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            Due: {new Date(assignment.deadline).toLocaleDateString()}
                          </span>
                          <span>Max Points: {assignment.maxPoints}</span>
                        </div>
                      </div>

                      <Link
                        href={`/assignments/${assignment._id}`}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
                      >
                        View Task
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar: Faculty card & Roster stats */}
          <div className="space-y-6">
            {/* Faculty card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                Assigned Instructor
              </h4>
              {faculty ? (
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">
                    {faculty.name.charAt(0)}
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-gray-900">{faculty.name}</h5>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <Mail className="w-3.5 h-3.5" /> {faculty.email}
                    </p>
                    {faculty.officeLocation && (
                      <p className="text-xs text-gray-500 mt-1">Office: {faculty.officeLocation}</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-400">Instructor not yet assigned.</p>
              )}
            </div>

            {/* Class metadata */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Enrollment Roster
              </h4>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Enrolled Students</span>
                <span className="font-bold text-gray-900">{enrolledCount}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Total Assignments</span>
                <span className="font-bold text-gray-900">{assignments.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
