"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { courseService } from "../../../services/courseService";
import { userService } from "../../../services/userService";
import { Course, User } from "../../../types";
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import { EmptyState } from "../../../components/EmptyState";
import { Modal } from "../../../components/Modal";
import { StatusBadge } from "../../../components/StatusBadge";
import { BookOpen, PlusCircle, Search, Trash2, Edit, UserCheck, Users } from "lucide-react";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [facultyList, setFacultyList] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Create Modal State
  const [createOpen, setCreateOpen] = useState(false);
  const [createData, setCreateData] = useState({
    code: "",
    name: "",
    description: "",
    department: "CSE",
    faculty: ""
  });

  // Edit Modal State
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [editData, setEditData] = useState({
    name: "",
    description: "",
    faculty: "",
    status: "ACTIVE" as "ACTIVE" | "ARCHIVED"
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, [department]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [cRes, uRes] = await Promise.all([
        courseService.getAll({
          department: department || undefined,
          search: search || undefined
        }),
        userService.getAll({ role: "FACULTY" })
      ]);
      setCourses(cRes.courses || []);
      setFacultyList(uRes.users || []);
    } catch (err: any) {
      console.error("Failed to load admin courses data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await courseService.create({
        ...createData,
        faculty: createData.faculty || null
      });
      setMessage({ type: "success", text: "Course created successfully!" });
      setCreateOpen(false);
      setCreateData({
        code: "",
        name: "",
        description: "",
        department: "CSE",
        faculty: ""
      });
      await loadData();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to create course" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenEdit = (course: Course) => {
    setEditCourse(course);
    setEditData({
      name: course.name,
      description: course.description || "",
      faculty: typeof course.faculty === "object" && course.faculty ? (course.faculty as any)._id : "",
      status: course.status
    });
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCourse) return;

    try {
      setActionLoading(true);
      await courseService.update(editCourse._id, {
        name: editData.name,
        description: editData.description,
        faculty: editData.faculty || null,
        status: editData.status
      });
      setMessage({ type: "success", text: "Course updated successfully!" });
      setEditCourse(null);
      await loadData();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to update course" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCourse = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete course "${name}"?`)) return;

    try {
      setActionLoading(true);
      await courseService.delete(id);
      setMessage({ type: "success", text: `Course "${name}" deleted` });
      await loadData();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to delete" });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <DashboardLayout allowedRoles={["ADMIN"]}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Course Management</h1>
            <p className="text-xs text-gray-500 mt-1">
              Configure curriculum subjects and assign department faculty instructors
            </p>
          </div>

          <button
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            Add New Course
          </button>
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

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by code or course name..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </form>

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

        {/* Courses Table */}
        {isLoading ? (
          <LoadingSpinner text="Fetching course registry..." />
        ) : courses.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No courses found"
            description="No courses match the criteria. Create a course to get started."
            actionLabel="Add Course"
            onAction={() => setCreateOpen(true)}
          />
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-6 py-3.5">Code</th>
                    <th className="px-6 py-3.5">Course Name</th>
                    <th className="px-6 py-3.5">Department</th>
                    <th className="px-6 py-3.5">Assigned Faculty</th>
                    <th className="px-6 py-3.5">Students</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {courses.map((c) => {
                    const facultyName =
                      typeof c.faculty === "object" && c.faculty ? (c.faculty as any).name : "Unassigned";
                    const studentCount = (c.students || []).length;

                    return (
                      <tr key={c._id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-indigo-700">
                          {c.code}
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-900">
                          {c.name}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {c.department}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {facultyName}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {studentCount} enrolled
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={c.status} size="sm" />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEdit(c)}
                              className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Edit course details & faculty"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCourse(c._id, c.name)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete course"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Course Modal */}
        <Modal
          isOpen={createOpen}
          onClose={() => setCreateOpen(false)}
          title="Create New Academic Course"
          maxWidth="lg"
        >
          <form onSubmit={handleCreateCourse} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Course Code
                </label>
                <input
                  type="text"
                  required
                  value={createData.code}
                  onChange={(e) => setCreateData({ ...createData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. CS101"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Department
                </label>
                <select
                  value={createData.department}
                  onChange={(e) => setCreateData({ ...createData, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="CSE">CSE</option>
                  <option value="IT">IT</option>
                  <option value="AIML">AIML</option>
                  <option value="ENTC">ENTC</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Course Title
              </label>
              <input
                type="text"
                required
                value={createData.name}
                onChange={(e) => setCreateData({ ...createData, name: e.target.value })}
                placeholder="e.g. Introduction to Data Structures & Algorithms"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Assign Faculty Instructor
              </label>
              <select
                value={createData.faculty}
                onChange={(e) => setCreateData({ ...createData, faculty: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Unassigned (Assign Later) --</option>
                {facultyList.map((f) => (
                  <option key={f._id} value={f._id}>
                    {f.name} ({f.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Course Description & Objectives
              </label>
              <textarea
                rows={3}
                value={createData.description}
                onChange={(e) => setCreateData({ ...createData, description: e.target.value })}
                placeholder="Overview, syllabus topics, and prerequisites..."
                className="w-full p-3 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold disabled:opacity-50"
              >
                {actionLoading ? "Creating..." : "Create Course"}
              </button>
            </div>
          </form>
        </Modal>

        {/* Edit Course Modal */}
        <Modal
          isOpen={!!editCourse}
          onClose={() => setEditCourse(null)}
          title={`Edit Course — ${editCourse?.code}`}
        >
          <form onSubmit={handleUpdateCourse} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Course Title
              </label>
              <input
                type="text"
                required
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Assigned Faculty
              </label>
              <select
                value={editData.faculty}
                onChange={(e) => setEditData({ ...editData, faculty: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Unassigned --</option>
                {facultyList.map((f) => (
                  <option key={f._id} value={f._id}>
                    {f.name} ({f.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Course Status
              </label>
              <select
                value={editData.status}
                onChange={(e) => setEditData({ ...editData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                className="w-full p-3 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setEditCourse(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold disabled:opacity-50"
              >
                {actionLoading ? "Saving..." : "Save Course"}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
