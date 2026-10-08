"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "../../../components/DashboardLayout";
import { useAuth } from "../../../hooks/useAuth";
import { assignmentService } from "../../../services/assignmentService";
import { Assignment, Submission } from "../../../types";
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import { StatusBadge } from "../../../components/StatusBadge";
import {
  FileCheck2,
  Calendar,
  Clock,
  ArrowLeft,
  Link as LinkIcon,
  CheckCircle2,
  Send,
  Award,
  MessageSquare,
  AlertCircle
} from "lucide-react";

export default function AssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isStudent } = useAuth();
  const assignmentId = params.id as string;

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [content, setContent] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (assignmentId) {
      loadAssignment();
    }
  }, [assignmentId]);

  const loadAssignment = async () => {
    try {
      setIsLoading(true);
      const res = await assignmentService.getById(assignmentId);
      setAssignment(res.assignment);

      // Pre-fill existing submission if available
      const sub = res.assignment.mySubmission;
      if (sub) {
        setContent(sub.content || "");
        setFileUrl(sub.fileUrl || "");
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to load assignment" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !fileUrl.trim()) {
      setMessage({ type: "error", text: "Please enter submission text or provide a link." });
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage(null);
      await assignmentService.submit(assignmentId, { content, fileUrl });
      setMessage({ type: "success", text: "Assignment work submitted successfully!" });
      await loadAssignment();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Submission failed" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <LoadingSpinner size="lg" text="Loading assignment specifications..." />
      </DashboardLayout>
    );
  }

  if (!assignment) {
    return (
      <DashboardLayout>
        <div className="p-6 bg-red-50 text-red-700 rounded-2xl border border-red-200">
          <p className="font-semibold">Assignment could not be found or access is restricted.</p>
          <Link href="/assignments" className="mt-3 inline-block text-xs font-bold underline">
            Back to Assignments
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const course = typeof assignment.course === "object" ? assignment.course : null;
  const mySubmission = assignment.mySubmission;
  const isPastDue = new Date() > new Date(assignment.deadline);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Link
          href={user?.role === "FACULTY" ? "/faculty/assignments" : "/assignments"}
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Assignments
        </Link>

        {/* Message Banner */}
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

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Details and Student Submission */}
          <div className="lg:col-span-2 space-y-6">
            {/* Assignment Details Card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-xs">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {course && (
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md">
                    {course.code}
                  </span>
                )}
                <span className="text-xs text-gray-500 font-medium">
                  {course?.name || "General Course"}
                </span>
                <StatusBadge status={assignment.status} size="sm" />
              </div>

              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                {assignment.title}
              </h1>

              <div className="mt-4 prose prose-sm text-gray-700 leading-relaxed max-w-none">
                <p className="whitespace-pre-line">{assignment.description || "No specific instructions provided."}</p>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100 flex flex-wrap items-center gap-6 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span>
                    Deadline: <strong className="text-gray-900">{new Date(assignment.deadline).toLocaleString()}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-indigo-600" />
                  <span>
                    Max Points: <strong className="text-gray-900">{assignment.maxPoints} pts</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Student Submission Box */}
            {isStudent && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <FileCheck2 className="w-5 h-5 text-indigo-600" /> Your Submission
                  </h3>
                  {mySubmission && (
                    <StatusBadge status={mySubmission.status} size="sm" />
                  )}
                </div>

                {/* Grade display if graded */}
                {mySubmission && mySubmission.grade !== undefined && mySubmission.grade !== null && (
                  <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                        Evaluated Score
                      </span>
                      <span className="text-lg font-extrabold text-emerald-700">
                        {mySubmission.grade} / {assignment.maxPoints} pts
                      </span>
                    </div>
                    {mySubmission.feedback && (
                      <div className="mt-2 text-xs text-emerald-900">
                        <strong>Instructor Feedback:</strong> {mySubmission.feedback}
                      </div>
                    )}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Submission Notes / Description
                    </label>
                    <textarea
                      rows={4}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Write your explanation, summary, or response here..."
                      className="w-full p-3 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Artifact Link / GitHub URL / Document URL
                    </label>
                    <div className="relative">
                      <LinkIcon className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                      <input
                        type="url"
                        value={fileUrl}
                        onChange={(e) => setFileUrl(e.target.value)}
                        placeholder="https://github.com/your-username/repo-name"
                        className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    {isPastDue && (
                      <p className="text-xs text-rose-600 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Deadline has passed. Work will be marked Late.
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="ml-auto inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {isSubmitting
                        ? "Submitting..."
                        : mySubmission
                        ? "Update Submission"
                        : "Turn In Work"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Right Col: Timeline & Metadata */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Submission Information
              </h4>

              <div className="space-y-3 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-semibold text-gray-900">
                    {mySubmission ? mySubmission.status : isPastDue ? "Overdue" : "Not Submitted"}
                  </span>
                </div>
                {mySubmission?.submittedAt && (
                  <div className="flex justify-between">
                    <span>Submitted on:</span>
                    <span className="font-semibold text-gray-900">
                      {new Date(mySubmission.submittedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Allowed Formats:</span>
                  <span className="font-semibold text-gray-900">Text & Links</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
