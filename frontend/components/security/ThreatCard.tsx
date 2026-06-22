import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ThreatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  accentColor?: "primary" | "danger" | "warning" | "success" | "none";
  className?: string;
  glow?: boolean;
}

export function ThreatCard({ 
  children, 
  accentColor = "none", 
  className,
  glow = false,
  ...props 
}: ThreatCardProps) {
  const accentClasses = {
    none: "",
    primary: "before:bg-blue-500",
    danger: "before:bg-red-500",
    warning: "before:bg-yellow-500",
    success: "before:bg-[#00ff88]",
  };

  const glowClasses = {
    none: "",
    primary: "shadow-[0_0_15px_rgba(59,130,246,0.15)]",
    danger: "shadow-[0_0_15px_rgba(239,68,68,0.15)]",
    warning: "shadow-[0_0_15px_rgba(234,179,8,0.15)]",
    success: "shadow-[0_0_15px_rgba(0,255,136,0.15)]",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-[#0b1220] border border-slate-800",
        accentColor !== "none" && "before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px]",
        accentColor !== "none" && accentClasses[accentColor],
        glow && glowClasses[accentColor],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
