"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { RegisterInput, LoginInput } from "@/lib/shared";
import { api, setAccessToken, refreshAccessToken, ApiError } from "./api-client";
import type { User } from "./types";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        try {
          const me = await api.get<User>("/auth/me");
          setUser(me);
        } catch {
          setUser(null);
        }
      }
      setIsLoading(false);
    })();
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const data = await api.post<{ accessToken: string; user: User }>("/auth/login", input);
    setAccessToken(data.accessToken);
    setUser(data.user);
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const data = await api.post<{ accessToken: string; user: User }>("/auth/register", input);
    setAccessToken(data.accessToken);
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setAccessToken(null);
      setUser(null);
      router.push("/login");
    }
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { ApiError };
