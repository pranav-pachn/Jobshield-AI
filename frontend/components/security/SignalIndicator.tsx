import { cn } from "@/lib/utils";

export type SignalStatus = "OPERATIONAL" | "SCANNING" | "ALERT" | "OFFLINE";

interface SignalIndicatorProps {
  status: SignalStatus;
  label?: string;
  className?: string;
}

export function SignalIndicator({ status, label, className }: SignalIndicatorProps) {
  const config = {
    OPERATIONAL: {
      color: "bg-[#00ff88]",
      text: "text-[#00ff88]",
      pulse: "bg-[#00ff88]/40",
      defaultLabel: "SYSTEMS NOMINAL",
    },
    SCANNING: {
      color: "bg-blue-400",
      text: "text-blue-400",
      pulse: "bg-blue-400/40",
      defaultLabel: "ANALYSIS ACTIVE",
    },
    ALERT: {
      color: "bg-red-500",
      text: "text-red-500",
      pulse: "bg-red-500/40",
      defaultLabel: "THREAT DETECTED",
    },
    OFFLINE: {
      color: "bg-slate-500",
      text: "text-slate-500",
      pulse: "hidden",
      defaultLabel: "SYSTEM OFFLINE",
    },
  };

  const current = config[status];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative flex h-2 w-2">
        <span
          className={cn(
            "absolute inline-flex h-full w-full rounded-full opacity-75",
            status !== "OFFLINE" && "animate-ping",
            current.pulse
          )}
        />
        <span
          className={cn(
            "relative inline-flex h-2 w-2 rounded-full",
            current.color
          )}
        />
      </div>
      <span
        className={cn(
          "text-[10px] font-bold tracking-widest uppercase font-mono",
          current.text
        )}
      >
        {label || current.defaultLabel}
      </span>
    </div>
  );
}
