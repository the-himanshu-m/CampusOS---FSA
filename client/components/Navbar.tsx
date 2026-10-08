"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";
import { LogOut, User as UserIcon, Bell, GraduationCap, Menu } from "lucide-react";

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  const { user, logout, isStudent, isFaculty, isAdmin } = useAuth();

  const getRoleBadge = () => {
    if (isAdmin) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 border border-rose-200">
          Administrator
        </span>
      );
    }
    if (isFaculty) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">
          Faculty
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
        Student
      </span>
    );
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3">
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 lg:hidden"
              aria-label="Toggle navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link href={isAdmin ? "/admin" : isFaculty ? "/faculty" : "/dashboard"} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold text-gray-900 tracking-tight">CampusOS</span>
              <span className="hidden sm:inline-block ml-1 text-xs text-gray-500 font-medium">Portal</span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {user && (
            <>
              <div className="hidden sm:flex items-center gap-2">
                {getRoleBadge()}
              </div>

              <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                <Link
                  href="/profile"
                  className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-semibold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden md:block text-left text-xs">
                    <p className="font-semibold text-gray-800 leading-tight">{user.name}</p>
                    <p className="text-gray-500 leading-tight">{user.email}</p>
                  </div>
                </Link>

                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
