"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import DashboardLayout from "../../components/DashboardLayout";
import { useAuth } from "../../hooks/useAuth";
import { assignmentService } from "../../services/assignmentService";
import { Assignment } from "../../types";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { EmptyState } from "../../components/EmptyState";
import { StatusBadge } from "../../components/StatusBadge";
import { FileCheck2, Calendar, Clock, AlertTriangle, CheckCircle2, ChevronRight } from "lucide-react";

export default function AssignmentsPage() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [filterTab, setFilterTab] = useState<"all" | "pending" | "overdue" | "completed">("all");
  const [isLoading, setIsLoading] = useState(true);

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

  const now = new Date();

  const filteredAssignments = assignments.filter((a) => {
    const isSubmitted = !!a.mySubmission || a.isSubmitted;
    const isOverdue = !isSubmitted && new Date(a.deadline) < now;
    const isPending = !isSubmitted && new Date(a.deadline) >= now;

    if (filterTab === "pending") return isPending;
    if (filterTab === "overdue") return isOverdue;
    if (filterTab === "completed") return isSubmitted;
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Assignments & Tasks</h1>
            <p className="text-xs text-gray-500 mt-1">
              Track deadlines, turn in coursework, and review faculty evaluations
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex rounded-xl bg-gray-200/80 p-1 overflow-x-auto">
            <button
              onClick={() => setFilterTab("all")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                filterTab === "all" ? "bg-white text-gray-900 shadow-xs" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              All ({assignments.length})
            </button>
            <button
              onClick={() => setFilterTab("pending")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                filterTab === "pending" ? "bg-white text-gray-900 shadow-xs" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilterTab("overdue")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                filterTab === "overdue" ? "bg-white text-gray-900 shadow-xs" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Overdue
            </button>
            <button
              onClick={() => setFilterTab("completed")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                filterTab === "completed" ? "bg-white text-gray-900 shadow-xs" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        {/* Assignments List */}
        {isLoading ? (
          <LoadingSpinner text="Fetching assignments..." />
        ) : filteredAssignments.length === 0 ? (
          <EmptyState
            icon={FileCheck2}
            title="No assignments found"
            description="There are currently no assignments matching your chosen filter criteria."
          />
        ) : (
          <div className="space-y-3.5">
            {filteredAssignments.map((assignment) => {
              const courseName =
                typeof assignment.course === "object" ? assignment.course.name : "Course";
              const courseCode =
                typeof assignment.course === "object" ? assignment.course.code : "";
              const isSubmitted = !!assignment.mySubmission || assignment.isSubmitted;
              const isOverdue = !isSubmitted && new Date(assignment.deadline) < now;

              return (
                <div
                  key={assignment._id}
                  className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs hover:border-indigo-100 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      {courseCode && (
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                          {courseCode}
                        </span>
                      )}
                      <span className="text-xs text-gray-500 font-medium truncate">{courseName}</span>
                      {isSubmitted ? (
                        <StatusBadge
                          status={assignment.mySubmission?.status || "SUBMITTED"}
                          size="sm"
                        />
                      ) : isOverdue ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          Overdue
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          Pending
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-gray-900 line-clamp-1">
                      {assignment.title}
                    </h3>
                    <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                      {assignment.description || "Review problem statement and submission parameters."}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        Due: {new Date(assignment.deadline).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                      <span>Max Points: {assignment.maxPoints}</span>
                      {assignment.mySubmission?.grade !== undefined && assignment.mySubmission?.grade !== null && (
                        <span className="font-semibold text-emerald-600">
                          Score: {assignment.mySubmission.grade} / {assignment.maxPoints}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0">
                    <Link
                      href={`/assignments/${assignment._id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
                    >
                      {isSubmitted ? "View Submission" : "Submit Work"}
                      <ChevronRight className="w-4 h-4" />
                    </Link>
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
