import { ReactNode } from "react";
import { SignalIndicator, type SignalStatus } from "./SignalIndicator";

interface PageHeaderProps {
  title: string;
  description: string;
  icon: React.ElementType;
  status?: SignalStatus;
  statusLabel?: string;
  action?: ReactNode;
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  status,
  statusLabel,
  action,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
            <Icon className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
              {title}
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">{description}</p>
          </div>
        </div>
        
        {status && (
          <div className="pl-13 ml-1">
            <SignalIndicator status={status} label={statusLabel} />
          </div>
        )}
      </div>

      {action && <div>{action}</div>}
    </div>
  );
}
