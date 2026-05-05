import React from "react";

interface AnalysisSectionProps {
  number: number;
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

export function AnalysisSection({
  number,
  icon,
  title,
  children,
}: AnalysisSectionProps) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/15 text-sm font-bold text-primary">
          {number}
        </div>
        <div className="flex items-center gap-2">
          <span className="opacity-60">{icon}</span>
          <h3 className="text-lg font-bold tracking-tight text-foreground">{title}</h3>
        </div>
        <div className="h-px flex-1 bg-border/50" />
      </div>
      {children}
    </section>
  );
}
