"use client";

import { Loader2, Zap, Shield, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
  variant?: "default" | "threat" | "scan";
}

export function LoadingSpinner({ 
  message = "Analyzing with AI...", 
  size = "md",
  fullScreen = false,
  variant = "default"
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const messageSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Threat Variant - Scanning AI */}
      {variant === "threat" && (
        <div className="relative">
          {/* Concentric circles */}
          <div className="absolute inset-0 rounded-full border border-primary/30 animate-pulse" />
          <div className="absolute inset-1.5 rounded-full border border-primary/20" />
          <div className="absolute inset-3 rounded-full border border-primary/10 animate-spin" style={{animationDirection: 'reverse'}} />
          
          {/* Center icon */}
          <Shield className={cn("text-primary animate-pulse", sizeClasses[size])} />
          
          {/* Scan line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-primary to-transparent animate-pulse opacity-60" />
        </div>
      )}

      {/* Scan Variant - Network Activity */}
      {variant === "scan" && (
        <div className="relative">
          <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
          <div className="absolute inset-0 flex items-center justify-center">
            <Activity className={cn("text-cyan-400 opacity-60 animate-pulse", 
              size === "sm" ? "h-3 w-3" : size === "md" ? "h-4 w-4" : "h-6 w-6"
            )} />
          </div>
          
          {/* Orbiting dots */}
          <div className="absolute inset-0">
            {[0, 120, 240].map((deg) => (
              <div
                key={deg}
                className="absolute w-1.5 h-1.5 bg-cyan-400 rounded-full"
                style={{
                  top: "50%",
                  left: "50%",
                  animation: `orbit ${2}s linear infinite`,
                  transformOrigin: `${size === "lg" ? "24px" : size === "md" ? "16px" : "12px"} 0`,
                  transform: `rotate(${deg}deg)`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Default Variant */}
      {variant === "default" && (
        <div className="relative">
          <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
          <Zap className={cn("absolute inset-0 m-auto text-yellow-400 opacity-50 animate-pulse", 
            size === "sm" ? "h-3 w-3" : size === "md" ? "h-4 w-4" : "h-6 w-6"
          )} />
        </div>
      )}

      {/* Message */}
      {message && (
        <div className="text-center">
          <p className={cn("text-muted-foreground font-medium tracking-wide", messageSizeClasses[size])}>
            {message}
          </p>
          <div className="mt-2 flex justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-1 rounded-full bg-primary/60"
                style={{
                  width: "4px",
                  animation: `pulse ${0.8}s infinite`,
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes orbit {
          from { transform: rotate(0deg) translateY(-12px) rotate(0deg); }
          to { transform: rotate(360deg) translateY(-12px) rotate(-360deg); }
        }
      `}</style>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 backdrop-blur-md z-50">
        <div className="relative">
          {/* Background glow */}
          <div className="absolute -inset-20 rounded-full bg-primary/10 blur-3xl opacity-50 animate-pulse" />
          <div className="relative">
            {content}
          </div>
        </div>
      </div>
    );
  }

  return content;
}
