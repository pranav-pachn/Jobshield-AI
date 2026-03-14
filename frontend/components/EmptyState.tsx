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
      bg: "bg-card/40",
      border: "border-border/30",
      textColor: "text-muted-foreground",
    },
    error: {
      bg: "bg-destructive/10",
      border: "border-destructive/30",
      textColor: "text-destructive/70",
    },
    info: {
      bg: "bg-primary/10",
      border: "border-primary/30",
      textColor: "text-primary/70",
    },
  };

  const styles = variantStyles[variant];

  return (
    <Card className={cn("border", styles.border, styles.bg)}>
      <CardContent className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
          {icon || <AlertCircle className="h-8 w-8 text-muted-foreground" />}
        </div>
        <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
        {description && <p className={cn("mb-6 text-sm max-w-sm", styles.textColor)}>{description}</p>}
        {action && (
          <Button onClick={action.onClick} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
