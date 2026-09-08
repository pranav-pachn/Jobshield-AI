"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: "default" | "error" | "info";
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  variant = "default",
}: EmptyStateProps) {
  const variantStyles = {
    default: {
      bg: "bg-black/20",
      border: "border-slate-800/50 border-dashed",
      textColor: "text-slate-400",
      iconColor: "text-slate-600",
    },
    error: {
      bg: "bg-red-500/5",
      border: "border-red-500/20",
      textColor: "text-red-400/80",
      iconColor: "text-red-500/50",
    },
    info: {
      bg: "bg-blue-500/5",
      border: "border-blue-500/20",
      textColor: "text-blue-400/80",
      iconColor: "text-blue-500/50",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className={cn("w-full flex flex-col items-center justify-center p-12 text-center rounded-lg border", styles.bg, styles.border)}>
      {icon && (
        <div className={cn("mb-4 flex items-center justify-center", styles.iconColor)}>
          {icon}
        </div>
      )}
      {!icon && (
        <div className={cn("mb-4 flex items-center justify-center", styles.iconColor)}>
          <AlertCircle className="h-8 w-8 opacity-50" />
        </div>
      )}
      <h3 className="mb-2 text-sm font-bold tracking-widest text-slate-300 font-mono uppercase">{title}</h3>
      {description && <p className={cn("mb-6 text-xs max-w-sm font-mono leading-relaxed", styles.textColor)}>{description}</p>}
      {action && (
        <Button onClick={action.onClick} variant="outline" size="sm" className="bg-[#0b1220] border-slate-700 hover:bg-slate-800 font-mono text-xs uppercase tracking-wider">
          <RefreshCw className="h-3 w-3 mr-2" />
          {action.label}
        </Button>
      )}
    </div>
  );
}
