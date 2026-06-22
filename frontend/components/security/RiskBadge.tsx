import { cn } from "@/lib/utils";

export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

interface RiskBadgeProps {
  level: RiskLevel;
  className?: string;
  glow?: boolean;
}

export function RiskBadge({ level, className, glow = true }: RiskBadgeProps) {
  const colors = {
    Low: "bg-[#00ff88]/10 text-[#00ff88] border-[#00ff88]/30",
    Medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
    High: "bg-orange-500/10 text-orange-500 border-orange-500/30",
    Critical: "bg-red-500/10 text-red-500 border-red-500/30",
  };

  const glowColors = {
    Low: "shadow-[0_0_10px_rgba(0,255,136,0.2)]",
    Medium: "shadow-[0_0_10px_rgba(234,179,8,0.2)]",
    High: "shadow-[0_0_10px_rgba(249,115,22,0.2)]",
    Critical: "shadow-[0_0_10px_rgba(239,68,68,0.2)]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-2.5 py-0.5 text-xs font-semibold font-mono tracking-widest uppercase transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        colors[level],
        glow && glowColors[level],
        className
      )}
    >
      {level} RISK
    </span>
  );
}
