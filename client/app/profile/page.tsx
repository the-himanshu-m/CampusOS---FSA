"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { useAuth } from "../../hooks/useAuth";
import { userService } from "../../services/userService";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { User, Mail, Phone, Building, IdCard, Lock, CheckCircle2, AlertCircle, Save } from "lucide-react";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    bio: "",
    batch: "",
    officeLocation: "",
    password: ""
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        bio: user.bio || "",
        batch: user.batch || "",
        officeLocation: user.officeLocation || "",
        password: ""
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsSaving(true);
      setMessage(null);

      const payload: any = {
        name: formData.name,
        phone: formData.phone,
        bio: formData.bio,
      };

      if (user.role === "STUDENT") {
        payload.batch = formData.batch;
      } else if (user.role === "FACULTY") {
        payload.officeLocation = formData.officeLocation;
      }

      if (formData.password) {
        if (formData.password.length < 6) {
          throw new Error("Password must be at least 6 characters");
        }
        payload.password = formData.password;
      }

      await userService.update(user._id, payload);
      await refreshUser();
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setFormData((prev) => ({ ...prev, password: "" }));
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to save profile changes" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Account & Profile Settings</h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage your personal profile, institutional details, and security credentials
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: Summary Card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-indigo-50 border-2 border-indigo-200 text-indigo-700 font-extrabold text-2xl flex items-center justify-center mb-4">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <h3 className="text-lg font-bold text-gray-900">{user?.name}</h3>
            <p className="text-xs text-gray-500">{user?.email}</p>

            <span className="mt-3 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {user?.role}
            </span>

            <div className="mt-6 pt-6 border-t border-gray-100 w-full text-left space-y-3 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Department:</span>
                <span className="font-semibold text-gray-900">{user?.department || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span>Institutional ID:</span>
                <span className="font-semibold text-gray-900">{user?.identifier || "Not assigned"}</span>
              </div>
            </div>
          </div>

          {/* Right 2 cols: Profile Form */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-xs">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {user?.role === "STUDENT" && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Academic Cohort / Batch (e.g. 2024-2028)
                  </label>
                  <input
                    type="text"
                    name="batch"
                    value={formData.batch}
                    onChange={handleChange}
                    placeholder="2024-2028"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}

              {user?.role === "FACULTY" && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Faculty Office Location
                  </label>
                  <input
                    type="text"
                    name="officeLocation"
                    value={formData.officeLocation}
                    onChange={handleChange}
                    placeholder="Engineering Hall, Room 302"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Bio / Research Interests
                </label>
                <textarea
                  name="bio"
                  rows={3}
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Share a brief academic biography..."
                  className="w-full p-3 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-4 border-t border-gray-100">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Change Password (Leave blank to keep current)
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="New password (min 6 characters)"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSaving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
