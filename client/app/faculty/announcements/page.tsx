"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { useAuth } from "../../../hooks/useAuth";
import { announcementService } from "../../../services/announcementService";
import { Announcement } from "../../../types";
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import { EmptyState } from "../../../components/EmptyState";
import { Modal } from "../../../components/Modal";
import { StatusBadge } from "../../../components/StatusBadge";
import { Megaphone, PlusCircle, Trash2, Calendar, User, Edit3 } from "lucide-react";

export default function FacultyAnnouncementsPage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [createData, setCreateData] = useState({
    title: "",
    content: "",
    audience: "STUDENT" as "ALL" | "STUDENT" | "FACULTY",
    priority: "NORMAL" as "NORMAL" | "IMPORTANT" | "URGENT"
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setIsLoading(true);
      const res = await announcementService.getAll();
      setAnnouncements(res.announcements || []);
    } catch (err: any) {
      console.error("Failed to load announcements:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await announcementService.create(createData);
      setMessage({ type: "success", text: "Notice posted successfully!" });
      setCreateOpen(false);
      setCreateData({
        title: "",
        content: "",
        audience: "STUDENT",
        priority: "NORMAL"
      });
      await fetchAnnouncements();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to post notice" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this bulletin?")) return;
    try {
      setActionLoading(true);
      await announcementService.delete(id);
      setMessage({ type: "success", text: "Notice deleted" });
      await fetchAnnouncements();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to delete" });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <DashboardLayout allowedRoles={["FACULTY", "ADMIN"]}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Faculty Notices & Bulletins</h1>
            <p className="text-xs text-gray-500 mt-1">
              Broadcast announcements to student cohorts or department peers
            </p>
          </div>

          <button
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            Post New Bulletin
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
          <LoadingSpinner text="Fetching notices..." />
        ) : announcements.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title="No bulletins posted yet"
            description="Share academic schedules, exam dates, or project guidelines with students."
            actionLabel="Post New Bulletin"
            onAction={() => setCreateOpen(true)}
          />
        ) : (
          <div className="space-y-4">
            {announcements.map((ann) => {
              const isAuthor =
                String(typeof ann.author === "object" ? ann.author._id : ann.author) ===
                String(user?._id);

              return (
                <div
                  key={ann._id}
                  className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs hover:border-purple-200 transition-all space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold">
                        Audience: {ann.audience}
                      </span>
                      <StatusBadge status={ann.priority} size="sm" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        {new Date(ann.createdAt).toLocaleDateString()}
                      </span>
                      {isAuthor && (
                        <button
                          onClick={() => handleDelete(ann._id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete notice"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900">{ann.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                    {ann.content}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Post Modal */}
        <Modal
          isOpen={createOpen}
          onClose={() => setCreateOpen(false)}
          title="Post Faculty Bulletin"
          maxWidth="lg"
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Notice Title
              </label>
              <input
                type="text"
                required
                value={createData.title}
                onChange={(e) => setCreateData({ ...createData, title: e.target.value })}
                placeholder="e.g. Schedule for Mid-Semester Lab Presentations"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Notice Content
              </label>
              <textarea
                rows={5}
                required
                value={createData.content}
                onChange={(e) => setCreateData({ ...createData, content: e.target.value })}
                placeholder="Include all pertinent instructions, dates, and requirements..."
                className="w-full p-3 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Target Audience
                </label>
                <select
                  value={createData.audience}
                  onChange={(e) => setCreateData({ ...createData, audience: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                >
                  <option value="STUDENT">Students Only</option>
                  <option value="FACULTY">Faculty Only</option>
                  <option value="ALL">Entire Campus (All)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Priority
                </label>
                <select
                  value={createData.priority}
                  onChange={(e) => setCreateData({ ...createData, priority: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                >
                  <option value="NORMAL">Normal</option>
                  <option value="IMPORTANT">Important</option>
                  <option value="URGENT">Urgent</option>
                </select>
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
                {actionLoading ? "Publishing..." : "Post Notice"}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
