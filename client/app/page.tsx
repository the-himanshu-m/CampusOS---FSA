"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import { GraduationCap, BookOpen, Users, FileCheck2, Megaphone, ArrowRight, ShieldCheck } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === "ADMIN") router.push("/admin");
      else if (user.role === "FACULTY") router.push("/faculty");
      else router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">CampusOS</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-300 hover:text-white px-3 py-1.5 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors shadow-md shadow-indigo-600/30"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center items-center px-6 py-20 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-6">
          <ShieldCheck className="w-4 h-4 text-indigo-400" /> Full-Stack Campus Management Operating System
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-3xl leading-[1.15]">
          A Unified Workspace for Students, Faculty & Admins
        </h1>
        <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
          CampusOS centralizes enrollment, assignment submissions, real-time grading, and institutional announcements with high security and role-based permissions.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/login"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/30 hover:scale-105"
          >
            Enter CampusOS <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/register"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-sm transition-all hover:scale-105"
          >
            Create Student Account
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full">
          <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">Course Management</h3>
            <p className="mt-2 text-sm text-slate-400">
              Department-scoped course codes, syllabus distribution, student enrollment management, and assigned faculty tracking.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">Assignments & Grading</h3>
            <p className="mt-2 text-sm text-slate-400">
              Deadline enforcement, student work submissions, instructor grading workflows, and real-time status feedback.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-xs">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
              <Megaphone className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">Targeted Bulletins</h3>
            <p className="mt-2 text-sm text-slate-400">
              Audience-targeted announcements for student bodies or faculty groups with priority badges (Urgent, Important, Normal).
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        CampusOS — Enterprise Full-Stack Campus Management System
      </footer>
    </div>
  );
}
