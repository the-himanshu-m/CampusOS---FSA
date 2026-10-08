"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { courseService } from "../../../services/courseService";
import { Course, User } from "../../../types";
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import { EmptyState } from "../../../components/EmptyState";
import { Modal } from "../../../components/Modal";
import { StatusBadge } from "../../../components/StatusBadge";
import { BookOpen, Users, Edit3, Mail, CheckCircle2 } from "lucide-react";

export default function FacultyCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rosterCourse, setRosterCourse] = useState<Course | null>(null);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const res = await courseService.getAll();
      setCourses(res.courses || []);
    } catch (err: any) {
      console.error("Failed to load faculty courses:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenEdit = (course: Course) => {
    setEditCourse(course);
    setEditDescription(course.description || "");
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCourse) return;

    try {
      setIsSaving(true);
      await courseService.update(editCourse._id, { description: editDescription });
      setMessage({ type: "success", text: "Course syllabus updated successfully!" });
      setEditCourse(null);
      await fetchCourses();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to update course" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout allowedRoles={["FACULTY", "ADMIN"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Assigned Courses & Rosters</h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage course curriculum and review enrolled students
          </p>
        </div>

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

        {isLoading ? (
          <LoadingSpinner text="Fetching assigned courses..." />
        ) : courses.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No courses assigned"
            description="You currently have no courses assigned. Contact the administrator for teaching assignments."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((course) => {
              const studentCount = (course.students || []).length;

              return (
                <div
                  key={course._id}
                  className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs hover:border-purple-200 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md">
                        {course.code}
                      </span>
                      <StatusBadge status={course.status} size="sm" />
                    </div>

                    <h3 className="text-base font-bold text-gray-900">{course.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">Department of {course.department}</p>
                    <p className="mt-3 text-xs text-gray-600 line-clamp-3">
                      {course.description || "No description specified for this course."}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setRosterCourse(course)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-purple-50 hover:text-purple-700 text-gray-700 rounded-lg text-xs font-semibold transition-colors"
                    >
                      <Users className="w-3.5 h-3.5" />
                      Roster ({studentCount})
                    </button>

                    <button
                      onClick={() => handleOpenEdit(course)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Student Roster Modal */}
        <Modal
          isOpen={!!rosterCourse}
          onClose={() => setRosterCourse(null)}
          title={`Enrolled Students — ${rosterCourse?.code}: ${rosterCourse?.name}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            {!rosterCourse?.students || rosterCourse.students.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No students enrolled yet.</p>
            ) : (
              <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                {rosterCourse.students.map((student: any) => (
                  <div key={student._id || student} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-gray-900">{student.name || "Student"}</p>
                      <p className="text-[11px] text-gray-500 flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {student.email}
                      </p>
                    </div>
                    {student.identifier && (
                      <span className="text-[11px] font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                        {student.identifier}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>

        {/* Edit Syllabus Modal */}
        <Modal
          isOpen={!!editCourse}
          onClose={() => setEditCourse(null)}
          title={`Update Course Syllabus — ${editCourse?.code}`}
        >
          <form onSubmit={handleSaveCourse} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Course Description & Syllabus
              </label>
              <textarea
                rows={5}
                required
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditCourse(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
