"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { assignmentService } from "../../../services/assignmentService";
import { Assignment } from "../../../types";
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import { EmptyState } from "../../../components/EmptyState";
import { StatusBadge } from "../../../components/StatusBadge";
import { FileCheck2, Calendar, Award, Trash2, Users } from "lucide-react";

export default function AdminAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setIsLoading(true);
      const res = await assignmentService.getAll();
      setAssignments(res.assignments || []);
    } catch (err: any) {
      console.error("Failed to load assignments:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete assignment "${title}"?`)) return;

    try {
      setActionLoading(true);
      await assignmentService.delete(id);
      setMessage({ type: "success", text: `Assignment "${title}" removed from catalog` });
      await fetchAssignments();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Deletion failed" });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <DashboardLayout allowedRoles={["ADMIN"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">System Assignments Oversight</h1>
          <p className="text-xs text-gray-500 mt-1">
            Global audit and management of institutional course assignments and student submissions
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
          <LoadingSpinner text="Fetching assignments directory..." />
        ) : assignments.length === 0 ? (
          <EmptyState
            icon={FileCheck2}
            title="No assignments recorded"
            description="Faculty members have not created any course assignments yet."
          />
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-6 py-3.5">Assignment</th>
                    <th className="px-6 py-3.5">Course</th>
                    <th className="px-6 py-3.5">Instructor</th>
                    <th className="px-6 py-3.5">Deadline</th>
                    <th className="px-6 py-3.5">Max Points</th>
                    <th className="px-6 py-3.5">Submissions</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {assignments.map((a) => {
                    const courseCode =
                      typeof a.course === "object" ? a.course.code : "";
                    const courseName =
                      typeof a.course === "object" ? a.course.name : "";
                    const creatorName =
                      typeof a.createdBy === "object" && a.createdBy ? (a.createdBy as any).name : "Faculty";
                    const subCount = a.submissions?.length || 0;

                    return (
                      <tr key={a._id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-6 py-4 font-semibold text-gray-900">
                          {a.title}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[11px]">
                            {courseCode}
                          </span>{" "}
                          <span className="text-gray-600 ml-1">{courseName}</span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {creatorName}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {new Date(a.deadline).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-900">
                          {a.maxPoints} pts
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {subCount} turned in
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDelete(a._id, a.title)}
                            disabled={actionLoading}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete assignment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
