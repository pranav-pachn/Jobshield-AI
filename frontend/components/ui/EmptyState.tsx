import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="py-16 flex flex-col items-center justify-center text-center opacity-80 animate-in fade-in zoom-in-95 duration-500">
      <div className="h-20 w-20 rounded-full border border-dashed border-white/20 bg-white/[2%] flex items-center justify-center mb-6 shadow-inner">
        <Icon className="h-8 w-8 text-muted-foreground/70" />
      </div>
      <h3 className="text-xl font-medium text-foreground tracking-widest uppercase mb-3">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground max-w-md leading-relaxed mb-6">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
