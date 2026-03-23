"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  type AuthUser,
  clearAuthSession,
  getStoredToken,
  getStoredUser,
  loginRequest,
  saveAuthSession,
  getCurrentUser,
} from "@/lib/auth";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (token: string, user: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getStoredToken();
      const storedUser = getStoredUser();

      // Always validate existing session with backend before trusting local storage.
      const currentUser = await getCurrentUser(storedToken);
      if (currentUser) {
        // Store user data in localStorage (cookie-based auth has no local token).
        localStorage.setItem("jobshield_auth_user", JSON.stringify(currentUser));
        setUser(currentUser);
        if (storedToken && storedUser) {
          setToken(storedToken);
        } else {
          setToken("cookie-auth"); // Marker that auth token is in secure cookie
        }
      } else {
        clearAuthSession();
        setUser(null);
        setToken(null);
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await loginRequest(email, password);
    
    // Check if this is a password setup response
    if ('requiresPasswordSetup' in response && response.requiresPasswordSetup) {
      // Throw a structured error that the login page can handle
      const error = new Error(response.message) as Error & { requiresPasswordSetup: boolean; email: string };
      error.requiresPasswordSetup = true;
      error.email = response.email;
      throw error;
    }
    
    // Normal successful login - cast to LoginResponse since we know it's not PasswordSetupResponse
    const loginResponse = response as { token: string; user: AuthUser };
    saveAuthSession(loginResponse.token, loginResponse.user);
    setToken(loginResponse.token);
    setUser(loginResponse.user);
  }, []);

  const loginWithGoogle = useCallback((token: string, user: string) => {
    // For backward compatibility (though should be deprecated with new OAuth flow)
    const parsedUser = JSON.parse(decodeURIComponent(user)) as AuthUser;
    saveAuthSession(token, parsedUser);
    setToken(token);
    setUser(parsedUser);
  }, []);

  const logout = useCallback(() => {
    clearAuthSession();
    setToken(null);
    setUser(null);
  }, []);

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
    [isLoading, token, user, login, loginWithGoogle, logout]
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
