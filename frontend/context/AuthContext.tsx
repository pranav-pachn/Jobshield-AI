"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  type AuthUser,
  clearAuthSession,
  getStoredToken,
  getStoredUser,
  loginRequest,
  saveAuthSession,
  handleGoogleCallback,
} from "@/lib/auth";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (token: string, user: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = getStoredToken();
    const storedUser = getStoredUser();

    queueMicrotask(() => {
      if (!storedToken || !storedUser) {
        clearAuthSession();
        setUser(null);
        setToken(null);
        setIsLoading(false);
        return;
      }

      setToken(storedToken);
      setUser(storedUser);
      setIsLoading(false);
    });
  }, []);

  async function login(email: string, password: string) {
    const response = await loginRequest(email, password);
    saveAuthSession(response.token, response.user);
    setToken(response.token);
    setUser(response.user);
  }

  async function loginWithGoogle(token: string, user: string) {
    const response = handleGoogleCallback(token, user);
    saveAuthSession(response.token, response.user);
    setToken(response.token);
    setUser(response.user);
  }

  function logout() {
    clearAuthSession();
    setToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(token && user),
      login,
      loginWithGoogle,
      logout,
    }),
    [isLoading, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
