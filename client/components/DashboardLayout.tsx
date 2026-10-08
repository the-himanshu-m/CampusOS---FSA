"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { LoadingSpinner } from "./LoadingSpinner";
import { ShieldAlert } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  allowedRoles?: ("STUDENT" | "FACULTY" | "ADMIN" | "PLACEMENT_OFFICER")[];
}

export default function DashboardLayout({
  children,
  allowedRoles
}: DashboardLayoutProps) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Authenticating CampusOS session..." />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 text-center">
        <div className="w-14 h-14 mb-4 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Access Restricted</h2>
        <p className="mt-2 text-sm text-gray-600 max-w-md">
          Your account role (<span className="font-semibold">{user.role}</span>) is not authorized to access this section of CampusOS.
        </p>
        <button
          onClick={() => {
            const path = user.role === "ADMIN" ? "/admin" : user.role === "FACULTY" ? "/faculty" : "/dashboard";
            router.push(path);
          }}
          className="mt-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-900">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
