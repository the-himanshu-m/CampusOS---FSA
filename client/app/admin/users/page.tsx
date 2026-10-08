"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { useAuth } from "../../../hooks/useAuth";
import { userService } from "../../../services/userService";
import { User, Role } from "../../../types";
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import { EmptyState } from "../../../components/EmptyState";
import { Modal } from "../../../components/Modal";
import { Users, UserPlus, Search, Trash2, Edit, Mail, Shield, Building } from "lucide-react";

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [roleFilter, setRoleFilter] = useState("");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Create User State
  const [createOpen, setCreateOpen] = useState(false);
  const [createData, setCreateData] = useState({
    name: "",
    email: "",
    password: "",
    role: "STUDENT" as Role,
    department: "CSE",
    identifier: ""
  });

  // Edit User State
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editData, setEditData] = useState<{ role: Role; department: string; identifier: string }>({
    role: "STUDENT",
    department: "CSE",
    identifier: ""
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await userService.getAll({
        role: roleFilter || undefined,
        search: search || undefined
      });
      setUsers(res.users || []);
    } catch (err: any) {
      console.error("Failed to load users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await userService.create(createData);
      setMessage({ type: "success", text: "User account created successfully!" });
      setCreateOpen(false);
      setCreateData({
        name: "",
        email: "",
        password: "",
        role: "STUDENT",
        department: "CSE",
        identifier: ""
      });
      await fetchUsers();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to create user" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenEdit = (user: User) => {
    setEditUser(user);
    setEditData({
      role: user.role,
      department: user.department || "CSE",
      identifier: user.identifier || ""
    });
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;

    try {
      setActionLoading(true);
      await userService.update(editUser._id, editData);
      setMessage({ type: "success", text: "User privileges and profile updated!" });
      setEditUser(null);
      await fetchUsers();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Update failed" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (String(userId) === String(currentUser?._id)) {
      alert("You cannot delete your own administrative account.");
      return;
    }

    if (!confirm(`Are you sure you want to delete user account "${userName}"?`)) return;

    try {
      setActionLoading(true);
      await userService.delete(userId);
      setMessage({ type: "success", text: `User ${userName} deleted successfully` });
      await fetchUsers();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Deletion failed" });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <DashboardLayout allowedRoles={["ADMIN"]}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">User Management</h1>
            <p className="text-xs text-gray-500 mt-1">
              Provision accounts, adjust roles, and audit access credentials
            </p>
          </div>

          <button
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            Provision New User
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

        {/* Filter / Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or institutional identifier..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </form>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="py-2 px-3 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">All Roles</option>
            <option value="STUDENT">Student</option>
            <option value="FACULTY">Faculty</option>
            <option value="ADMIN">Administrator</option>
          </select>
        </div>

        {/* User Table */}
        {isLoading ? (
          <LoadingSpinner text="Fetching directory users..." />
        ) : users.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No users found"
            description="No user accounts match your query or role filter."
          />
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-6 py-3.5">User</th>
                    <th className="px-6 py-3.5">Role</th>
                    <th className="px-6 py-3.5">Department</th>
                    <th className="px-6 py-3.5">Identifier</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => {
                    const isSelf = String(u._id) === String(currentUser?._id);

                    return (
                      <tr key={u._id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center shrink-0">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 flex items-center gap-1.5">
                                {u.name}
                                {isSelf && (
                                  <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded font-medium">
                                    You
                                  </span>
                                )}
                              </p>
                              <p className="text-gray-500 text-[11px]">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              u.role === "ADMIN"
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : u.role === "FACULTY"
                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 font-medium">
                          {u.department || "General"}
                        </td>
                        <td className="px-6 py-4 font-mono text-[11px] text-gray-500">
                          {u.identifier || "—"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEdit(u)}
                              className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Edit user privileges"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {!isSelf && (
                              <button
                                onClick={() => handleDeleteUser(u._id, u.name)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete user"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
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

        {/* Provision User Modal */}
        <Modal
          isOpen={createOpen}
          onClose={() => setCreateOpen(false)}
          title="Provision New Campus User"
          maxWidth="lg"
        >
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={createData.name}
                onChange={(e) => setCreateData({ ...createData, name: e.target.value })}
                placeholder="e.g. Dr. Jane Smith"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Institutional Email
              </label>
              <input
                type="email"
                required
                value={createData.email}
                onChange={(e) => setCreateData({ ...createData, email: e.target.value })}
                placeholder="name@campus.edu"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={createData.password}
                onChange={(e) => setCreateData({ ...createData, password: e.target.value })}
                placeholder="Minimum 6 characters"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Access Role
                </label>
                <select
                  value={createData.role}
                  onChange={(e) => setCreateData({ ...createData, role: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="STUDENT">Student</option>
                  <option value="FACULTY">Faculty</option>
                  <option value="ADMIN">Administrator</option>
                </select>
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
                Institutional ID (Roll # or Faculty ID)
              </label>
              <input
                type="text"
                value={createData.identifier}
                onChange={(e) => setCreateData({ ...createData, identifier: e.target.value })}
                placeholder="e.g. FAC-2026-08"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
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
                {actionLoading ? "Creating..." : "Create Account"}
              </button>
            </div>
          </form>
        </Modal>

        {/* Edit User Modal */}
        <Modal
          isOpen={!!editUser}
          onClose={() => setEditUser(null)}
          title={`Edit User Privileges — ${editUser?.name}`}
        >
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Role Privilege
              </label>
              <select
                value={editData.role}
                onChange={(e) => setEditData({ ...editData, role: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="STUDENT">Student</option>
                <option value="FACULTY">Faculty</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Department
              </label>
              <select
                value={editData.department}
                onChange={(e) => setEditData({ ...editData, department: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="CSE">CSE</option>
                <option value="IT">IT</option>
                <option value="AIML">AIML</option>
                <option value="ENTC">ENTC</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Identifier (Roll # / Faculty ID)
              </label>
              <input
                type="text"
                value={editData.identifier}
                onChange={(e) => setEditData({ ...editData, identifier: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setEditUser(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold disabled:opacity-50"
              >
                {actionLoading ? "Saving..." : "Save Privileges"}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
