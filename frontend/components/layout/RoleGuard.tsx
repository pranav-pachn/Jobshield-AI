"use client";
import { ReactNode } from "react";
import { getStoredUser } from "@/lib/auth";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: Array<"USER" | "ANALYST" | "ADMIN">;
  fallback?: ReactNode;
  restrictedMessage?: string;
}

export function RoleGuard({ 
  children, 
  allowedRoles, 
  fallback,
  restrictedMessage = "Analyst or administrator access is required to view this area."
}: RoleGuardProps) {
  const user = getStoredUser();

  // If no user is logged in, treat them as having no role. 
  // AuthGuard handles the actual authentication check.
  const userRole = user?.role || "USER";

  if (!allowedRoles.includes(userRole)) {
    if (fallback !== undefined) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen bg-[#05080f] flex items-center justify-center p-6 text-slate-200">
        <div className="max-w-md w-full bg-[#090d16] border border-slate-800 rounded-2xl p-8 text-center space-y-5 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center shadow-inner">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white tracking-tight font-display">Access Restricted</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              {restrictedMessage}
            </p>
          </div>
          <div className="pt-2">
            <Link href="/dashboard">
              <Button className="bg-[#00ff88] hover:bg-[#00cc6a] text-black font-semibold font-mono text-xs px-6 py-2.5 rounded-lg shadow-lg hover:shadow-[0_0_15px_rgba(0,255,136,0.25)] transition-all">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

