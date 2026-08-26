"use client";

import { ReactNode } from "react";
import { getStoredUser } from "@/lib/auth";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: Array<"USER" | "ANALYST" | "ADMIN">;
  fallback?: ReactNode;
}

export function RoleGuard({ children, allowedRoles, fallback = null }: RoleGuardProps) {
  const user = getStoredUser();

  // If no user is logged in, treat them as having no role. 
  // AuthGuard handles the actual authentication check.
  const userRole = user?.role || "USER";

  if (!allowedRoles.includes(userRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
