"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { announcementService } from "../../../services/announcementService";
import { Announcement } from "../../../types";
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import { EmptyState } from "../../../components/EmptyState";
import { Modal } from "../../../components/Modal";
import { StatusBadge } from "../../../components/StatusBadge";
import { Megaphone, PlusCircle, Trash2, Calendar, User, Search } from "lucide-react";

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [createData, setCreateData] = useState({
    title: "",
    content: "",
    audience: "ALL" as "ALL" | "STUDENT" | "FACULTY",
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
      setMessage({ type: "success", text: "Institutional announcement published!" });
      setCreateOpen(false);
      setCreateData({
        title: "",
        content: "",
        audience: "ALL",
        priority: "NORMAL"
      });
      await fetchAnnouncements();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to publish" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete announcement "${title}"?`)) return;

    try {
      setActionLoading(true);
      await announcementService.delete(id);
      setMessage({ type: "success", text: `Notice "${title}" deleted` });
      await fetchAnnouncements();
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
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Campus Bulletins Management</h1>
            <p className="text-xs text-gray-500 mt-1">
              Broadcast critical institutional bulletins across student and faculty portals
            </p>
          </div>

          <button
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            Publish Notice
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
          <LoadingSpinner text="Fetching notices catalog..." />
        ) : announcements.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title="No bulletins posted"
            description="Broadcast policy announcements, holiday schedules, and event notices."
            actionLabel="Publish Notice"
            onAction={() => setCreateOpen(true)}
          />
        ) : (
          <div className="space-y-4">
            {announcements.map((ann) => {
              const authorName =
                typeof ann.author === "object" && ann.author ? ann.author.name : "Admin";

              return (
                <div
                  key={ann._id}
                  className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs hover:border-indigo-200 transition-all space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold">
                        Audience: {ann.audience}
                      </span>
                      <StatusBadge status={ann.priority} size="sm" />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        {new Date(ann.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => handleDelete(ann._id, ann.title)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete notice"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900">{ann.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                    {ann.content}
                  </p>

                  <div className="pt-3 border-t border-gray-100 text-xs text-gray-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Published by {authorName}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Publish Notice Modal */}
        <Modal
          isOpen={createOpen}
          onClose={() => setCreateOpen(false)}
          title="Publish Institutional Bulletin"
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
                placeholder="e.g. Campus Holiday Schedule & Semester Break"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Announcement Content
              </label>
              <textarea
                rows={5}
                required
                value={createData.content}
                onChange={(e) => setCreateData({ ...createData, content: e.target.value })}
                placeholder="Provide complete announcements details..."
                className="w-full p-3 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
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
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ALL">Entire Campus (All)</option>
                  <option value="STUDENT">Students Only</option>
                  <option value="FACULTY">Faculty Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Priority
                </label>
                <select
                  value={createData.priority}
                  onChange={(e) => setCreateData({ ...createData, priority: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
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
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold disabled:opacity-50"
              >
                {actionLoading ? "Publishing..." : "Broadcast Notice"}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
