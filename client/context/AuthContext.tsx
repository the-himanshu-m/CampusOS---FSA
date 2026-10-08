"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Role } from "../types";
import { authService } from "../services/authService";
import { setAuthToken, removeAuthToken } from "../lib/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isStudent: boolean;
  isFaculty: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const initAuth = async () => {
    if (typeof window === "undefined") return;

    const savedToken = localStorage.getItem("campusos_token");
    const savedUser = authService.getStoredUser();

    if (savedToken) {
      setToken(savedToken);
      if (savedUser) setUser(savedUser);

      try {
        const res = await authService.getMe();
        if (res.user) {
          setUser(res.user);
        }
      } catch (err) {
        console.error("Token verification failed:", err);
        removeAuthToken();
        setUser(null);
        setToken(null);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authService.login({ email, password });
    setToken(res.token);
    setUser(res.user);
  };

  const register = async (data: any) => {
    await authService.register(data);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  const refreshUser = async () => {
    try {
      const res = await authService.getMe();
      if (res.user) {
        setUser(res.user);
      }
    } catch (err) {
      console.error("Failed to refresh user:", err);
    }
  };

  const role = (user?.role || "").toUpperCase();
  const isStudent = role === "STUDENT";
  const isFaculty = role === "FACULTY";
  const isAdmin = role === "ADMIN";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        isStudent,
        isFaculty,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
