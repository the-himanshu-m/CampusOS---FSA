"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import {
  LayoutDashboard,
  BookOpen,
  FileCheck2,
  Megaphone,
  User as UserIcon,
  Users,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  GraduationCap
} from "lucide-react";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, isStudent, isFaculty, isAdmin } = useAuth();

  const studentLinks = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "My Courses", href: "/courses", icon: BookOpen },
    { label: "Assignments", href: "/assignments", icon: FileCheck2 },
    { label: "Announcements", href: "/announcements", icon: Megaphone },
    { label: "Profile", href: "/profile", icon: UserIcon },
  ];

  const facultyLinks = [
    { label: "Overview", href: "/faculty", icon: LayoutDashboard },
    { label: "My Courses", href: "/faculty/courses", icon: BookOpen },
    { label: "Assignments & Grading", href: "/faculty/assignments", icon: FileCheck2 },
    { label: "Announcements", href: "/faculty/announcements", icon: Megaphone },
    { label: "Profile", href: "/profile", icon: UserIcon },
  ];

  const adminLinks = [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "User Management", href: "/admin/users", icon: Users },
    { label: "Course Management", href: "/admin/courses", icon: BookOpen },
    { label: "Assignments", href: "/admin/assignments", icon: FileCheck2 },
    { label: "Announcements", href: "/admin/announcements", icon: Megaphone },
    { label: "Profile", href: "/profile", icon: UserIcon },
  ];

  let links = studentLinks;
  if (isAdmin) {
    links = adminLinks;
  } else if (isFaculty) {
    links = facultyLinks;
  }

  const roleLabel = isAdmin ? "Administrator" : isFaculty ? "Faculty" : "Student Portal";

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-0 -translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2.5 px-6 py-5 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-white shadow">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight">CampusOS</h1>
            <p className="text-xs text-slate-400 font-medium">{roleLabel}</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{link.label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-indigo-200" />}
              </Link>
            );
          })}
        </nav>

        {user && (
          <div className="p-4 border-t border-slate-800 bg-slate-950/40">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-indigo-400 text-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user.department || user.role}</p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
