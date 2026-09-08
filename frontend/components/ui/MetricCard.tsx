import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
}

export function MetricCard({ label, value, icon: Icon, trend }: MetricCardProps) {
  return (
    <Card className="card-primary">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 tracking-widest uppercase mb-1">
              {label}
            </p>
            <p className="text-3xl font-light text-white font-mono">
              {value}
            </p>
            {trend && (
              <p className={`text-xs mt-2 font-medium ${trend.positive ? 'text-[#00ff88]' : 'text-red-400'}`}>
                {trend.positive ? '↑' : '↓'} {trend.value}
              </p>
            )}
          </div>
          {Icon && (
            <div className="p-3 rounded-lg bg-primary/10 text-primary border border-primary/20">
              <Icon className="h-6 w-6" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
