"use client";

import { AlertCircle, X, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ErrorAlertProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  variant?: "destructive" | "warning";
  icon?: React.ReactNode;
}

export function ErrorAlert({
  title = "Analysis Failed",
  message,
  onRetry,
  onDismiss,
  variant = "destructive",
  icon,
}: ErrorAlertProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  const variantStyles = {
    destructive: {
      container: "border-red-500/40 bg-gradient-to-r from-red-500/15 to-red-500/5 shadow-[0_0_20px_rgba(239,68,68,0.1)]",
      title: "text-red-300",
      message: "text-red-200/70",
      icon: "text-red-400",
    },
    warning: {
      container: "border-yellow-500/40 bg-gradient-to-r from-yellow-500/15 to-yellow-500/5 shadow-[0_0_20px_rgba(234,179,8,0.1)]",
      title: "text-yellow-300",
      message: "text-yellow-200/70",
      icon: "text-yellow-400",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className={`rounded-xl border ${styles.container} p-4 mt-4 animate-in fade-in slide-in-from-top-4 duration-300`}>
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 mt-0.5 ${styles.icon}`}>
          {icon || <AlertCircle className="h-5 w-5" />}
        </div>

        {/* Content */}
        <div className="flex-1">
          <p className={`text-sm font-bold uppercase tracking-wide ${styles.title}`}>{title}</p>
          <p className={`mt-1 text-sm ${styles.message} font-mono`}>{message}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {onRetry && (
            <Button
              onClick={onRetry}
              size="sm"
              variant="outline"
              className="h-8 px-3 border-white/10 hover:border-primary/50 hover:bg-primary/10 text-xs"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Retry
            </Button>
          )}
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
