"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { useAuth } from "../../hooks/useAuth";
import { announcementService } from "../../services/announcementService";
import { Announcement } from "../../types";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { EmptyState } from "../../components/EmptyState";
import { StatusBadge } from "../../components/StatusBadge";
import { Megaphone, Search, User, Calendar, AlertCircle } from "lucide-react";

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, [priority]);

  const fetchAnnouncements = async () => {
    try {
      setIsLoading(true);
      const res = await announcementService.getAll({
        priority: priority || undefined,
        search: search || undefined
      });
      setAnnouncements(res.announcements || []);
    } catch (err: any) {
      console.error("Failed to load announcements:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAnnouncements();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Campus Bulletins & Notices</h1>
          <p className="text-xs text-gray-500 mt-1">
            Official institutional updates, departmental notices, and academic schedules
          </p>
        </div>

        {/* Filter bar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search announcements by keywords..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </form>

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="py-2 px-3 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">All Priorities</option>
            <option value="URGENT">Urgent Only</option>
            <option value="IMPORTANT">Important</option>
            <option value="NORMAL">Normal</option>
          </select>
        </div>

        {/* Announcements List */}
        {isLoading ? (
          <LoadingSpinner text="Fetching notices..." />
        ) : announcements.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title="No bulletins found"
            description="There are currently no announcements matching your filters."
          />
        ) : (
          <div className="space-y-4">
            {announcements.map((ann) => {
              const authorName =
                typeof ann.author === "object" && ann.author ? ann.author.name : "Administration";
              const authorRole =
                typeof ann.author === "object" && ann.author ? ann.author.role : "Staff";

              return (
                <div
                  key={ann._id}
                  className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs hover:border-indigo-100 transition-all space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold">
                        Audience: {ann.audience}
                      </span>
                      <StatusBadge status={ann.priority} size="sm" />
                    </div>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(ann.createdAt).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900">{ann.title}</h3>

                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                    {ann.content}
                  </p>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      Posted by <strong className="text-gray-700">{authorName}</strong> ({authorRole})
                    </span>
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
