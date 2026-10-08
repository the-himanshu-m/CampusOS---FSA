"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";
import { GraduationCap, Lock, Mail, AlertCircle, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      // Retrieve stored user to determine redirect
      const stored = localStorage.getItem("campusos_user");
      const user = stored ? JSON.parse(stored) : null;
      if (user?.role === "ADMIN") {
        router.push("/admin");
      } else if (user?.role === "FACULTY") {
        router.push("/faculty");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Failed to log in. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-gray-900">CampusOS</span>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Sign in to your account</h2>
        <p className="mt-2 text-xs text-gray-500">
          Enter your institutional credentials or use quick demo accounts below
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-2xl border border-gray-100 sm:px-10">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Institutional Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@campus.edu"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors shadow-md shadow-indigo-600/20"
            >
              {isLoading ? "Signing in..." : "Sign In to CampusOS"}
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Demo Login Quick-Fill */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2.5 text-center">
              Quick Fill Demo Credentials
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoFill("admin@campus.edu", "Admin@1234")}
                className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg text-center transition-colors"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill("faculty@campus.edu", "Faculty@1234")}
                className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg text-center transition-colors"
              >
                Faculty
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill("student@campus.edu", "Student@1234")}
                className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg text-center transition-colors"
              >
                Student
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-gray-500">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
