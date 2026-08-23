import { ReactNode } from "react";
import { Breadcrumbs } from "./Breadcrumbs";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  showBreadcrumbs?: boolean;
}

export function PageHeader({ 
  title, 
  description, 
  icon, 
  action, 
  showBreadcrumbs = true 
}: PageHeaderProps) {
  return (
    <div className="mb-8 space-y-4">
      {showBreadcrumbs && <Breadcrumbs />}
      
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          {icon && (
            <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-emerald-400">
              {icon}
            </div>
          )}
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-100">
            {title}
          </h1>
          {description && (
            <p className="max-w-3xl text-base leading-relaxed text-slate-400">
              {description}
            </p>
          )}
        </div>
        
        {action && (
          <div className="flex items-center mt-4 sm:mt-0">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}
