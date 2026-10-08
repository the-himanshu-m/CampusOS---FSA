"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { assignmentService } from "../../../services/assignmentService";
import { courseService } from "../../../services/courseService";
import { Assignment, Course, Submission } from "../../../types";
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import { EmptyState } from "../../../components/EmptyState";
import { Modal } from "../../../components/Modal";
import { StatusBadge } from "../../../components/StatusBadge";
import {
  FileCheck2,
  PlusCircle,
  Calendar,
  Users,
  Award,
  Trash2,
  Edit,
  ExternalLink,
  CheckCircle2,
  Clock
} from "lucide-react";

export default function FacultyAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create Assignment Modal State
  const [createOpen, setCreateOpen] = useState(false);
  const [createData, setCreateData] = useState({
    title: "",
    description: "",
    course: "",
    deadline: "",
    maxPoints: 100
  });

  // Grading Modal State
  const [gradingAssignment, setGradingAssignment] = useState<Assignment | null>(null);
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [gradeScore, setGradeScore] = useState<number | string>("");
  const [gradeFeedback, setGradeFeedback] = useState("");

  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [aRes, cRes] = await Promise.all([
        assignmentService.getAll(),
        courseService.getAll()
      ]);
      setAssignments(aRes.assignments || []);
      setCourses(cRes.courses || []);
      if (cRes.courses?.length && !createData.course) {
        setCreateData((prev) => ({ ...prev, course: cRes.courses[0]._id }));
      }
    } catch (err: any) {
      console.error("Failed to load assignments data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createData.course) {
      setMessage({ type: "error", text: "Please select a course" });
      return;
    }

    try {
      setActionLoading(true);
      await assignmentService.create({
        ...createData,
        maxPoints: Number(createData.maxPoints)
      });
      setMessage({ type: "success", text: "Assignment created successfully!" });
      setCreateOpen(false);
      setCreateData({
        title: "",
        description: "",
        course: courses[0]?._id || "",
        deadline: "",
        maxPoints: 100
      });
      await loadData();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to create assignment" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this assignment?")) return;
    try {
      setActionLoading(true);
      await assignmentService.delete(id);
      setMessage({ type: "success", text: "Assignment deleted" });
      await loadData();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to delete" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSelectSubmissionForGrading = (sub: Submission) => {
    setSelectedSub(sub);
    setGradeScore(sub.grade !== null && sub.grade !== undefined ? sub.grade : "");
    setGradeFeedback(sub.feedback || "");
  };

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingAssignment || !selectedSub) return;

    try {
      setActionLoading(true);
      await assignmentService.grade(gradingAssignment._id, selectedSub._id, {
        grade: Number(gradeScore),
        feedback: gradeFeedback
      });
      setMessage({ type: "success", text: "Grade saved successfully!" });
      // Refresh current assignment details
      const updated = await assignmentService.getById(gradingAssignment._id);
      setGradingAssignment(updated.assignment);
      setSelectedSub(null);
      await loadData();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to submit grade" });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <DashboardLayout allowedRoles={["FACULTY", "ADMIN"]}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Assignments & Evaluation</h1>
            <p className="text-xs text-gray-500 mt-1">
              Create curriculum assessments and evaluate student submissions
            </p>
          </div>

          <button
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            Create Assignment
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

        {isLoading ? (
          <LoadingSpinner text="Fetching assignments..." />
        ) : assignments.length === 0 ? (
          <EmptyState
            icon={FileCheck2}
            title="No assignments created yet"
            description="Create your first assignment for your assigned courses to start receiving student submissions."
            actionLabel="Create Assignment"
            onAction={() => setCreateOpen(true)}
          />
        ) : (
          <div className="space-y-3.5">
            {assignments.map((assignment) => {
              const courseCode =
                typeof assignment.course === "object" ? assignment.course.code : "";
              const courseName =
                typeof assignment.course === "object" ? assignment.course.name : "";
              const subCount = assignment.submissions?.length || 0;
              const gradedCount =
                assignment.submissions?.filter((s) => s.status === "GRADED").length || 0;

              return (
                <div
                  key={assignment._id}
                  className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs hover:border-purple-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                        {courseCode}
                      </span>
                      <span className="text-xs text-gray-500 font-medium truncate">{courseName}</span>
                      <StatusBadge status={assignment.status} size="sm" />
                    </div>

                    <h3 className="text-base font-bold text-gray-900 line-clamp-1">
                      {assignment.title}
                    </h3>

                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        Due: {new Date(assignment.deadline).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-gray-400" />
                        Max Points: {assignment.maxPoints}
                      </span>
                      <span className="flex items-center gap-1.5 font-semibold text-purple-700">
                        <Users className="w-3.5 h-3.5" />
                        {subCount} Submissions ({gradedCount} Graded)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setGradingAssignment(assignment)}
                      className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold transition-colors"
                    >
                      Review & Grade ({subCount})
                    </button>
                    <button
                      onClick={() => handleDeleteAssignment(assignment._id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      title="Delete assignment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create Assignment Modal */}
        <Modal
          isOpen={createOpen}
          onClose={() => setCreateOpen(false)}
          title="Create New Assignment"
          maxWidth="lg"
        >
          <form onSubmit={handleCreateAssignment} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Select Course
              </label>
              <select
                required
                value={createData.course}
                onChange={(e) => setCreateData({ ...createData, course: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              >
                <option value="">-- Choose Course --</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Assignment Title
              </label>
              <input
                type="text"
                required
                value={createData.title}
                onChange={(e) => setCreateData({ ...createData, title: e.target.value })}
                placeholder="e.g. Lab 4: Relational Database Modeling"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Instructions & Rubric
              </label>
              <textarea
                rows={4}
                value={createData.description}
                onChange={(e) => setCreateData({ ...createData, description: e.target.value })}
                placeholder="Detailed submission guidelines, objectives, and parameters..."
                className="w-full p-3 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Submission Deadline
                </label>
                <input
                  type="datetime-local"
                  required
                  value={createData.deadline}
                  onChange={(e) => setCreateData({ ...createData, deadline: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Maximum Points
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={createData.maxPoints}
                  onChange={(e) => setCreateData({ ...createData, maxPoints: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>
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
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold disabled:opacity-50"
              >
                {actionLoading ? "Creating..." : "Publish Assignment"}
              </button>
            </div>
          </form>
        </Modal>

        {/* Submissions & Grading Modal */}
        <Modal
          isOpen={!!gradingAssignment}
          onClose={() => {
            setGradingAssignment(null);
            setSelectedSub(null);
          }}
          title={`Submissions — ${gradingAssignment?.title}`}
          maxWidth="xl"
        >
          <div className="space-y-4">
            {!gradingAssignment?.submissions || gradingAssignment.submissions.length === 0 ? (
              <p className="text-xs text-gray-400 py-8 text-center">
                No students have turned in submissions for this task yet.
              </p>
            ) : (
              <div className="space-y-3">
                {gradingAssignment.submissions.map((sub: any) => (
                  <div
                    key={sub._id}
                    className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-gray-900">
                          {sub.student?.name || "Student"}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          {sub.student?.email} • Turned in: {new Date(sub.submittedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={sub.status} size="sm" />
                        <button
                          onClick={() => handleSelectSubmissionForGrading(sub)}
                          className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold"
                        >
                          {sub.status === "GRADED" ? "Edit Grade" : "Grade Work"}
                        </button>
                      </div>
                    </div>

                    {sub.content && (
                      <div className="p-2.5 rounded-lg bg-white border border-gray-200 text-xs text-gray-700 whitespace-pre-line">
                        {sub.content}
                      </div>
                    )}

                    {sub.fileUrl && (
                      <a
                        href={sub.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> View Artifact / Repo: {sub.fileUrl}
                      </a>
                    )}

                    {sub.status === "GRADED" && (
                      <div className="text-xs font-semibold text-emerald-700 pt-1">
                        Score Awarded: {sub.grade} / {gradingAssignment.maxPoints} pts
                        {sub.feedback && <span className="font-normal text-gray-600 ml-2">({sub.feedback})</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* In-place Grading Sub-Form */}
            {selectedSub && (
              <div className="mt-4 p-4 rounded-xl border border-purple-200 bg-purple-50/40 space-y-3 animate-in fade-in">
                <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                  Grading: {(selectedSub as any).student?.name || "Student"}
                </h4>
                <form onSubmit={handleSaveGrade} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Awarded Points (out of {gradingAssignment?.maxPoints})
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      max={gradingAssignment?.maxPoints}
                      value={gradeScore}
                      onChange={(e) => setGradeScore(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Feedback / Notes
                    </label>
                    <textarea
                      rows={2}
                      value={gradeFeedback}
                      onChange={(e) => setGradeFeedback(e.target.value)}
                      placeholder="Constructive feedback or rubric marks..."
                      className="w-full p-2 border border-gray-300 rounded-lg text-xs bg-white"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedSub(null)}
                      className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                    >
                      {actionLoading ? "Saving..." : "Save Grade & Notify Student"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
