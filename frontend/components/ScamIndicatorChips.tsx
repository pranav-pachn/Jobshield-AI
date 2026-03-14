"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle, DollarSign, Clock, MessageSquare, Mail, TrendingUp } from "lucide-react";

interface ScamIndicator {
  phrase: string;
  count: number;
  category: "fee" | "urgency" | "contact" | "salary";
  trend: "up" | "down" | "stable";
}

const scamIndicators: ScamIndicator[] = [
  { phrase: "registration fee", count: 1247, category: "fee", trend: "up" },
  { phrase: "training fee", count: 892, category: "fee", trend: "up" },
  { phrase: "telegram recruiter", count: 756, category: "contact", trend: "up" },
  { phrase: "earn $3000 weekly", count: 634, category: "salary", trend: "stable" },
  { phrase: "start immediately", count: 589, category: "urgency", trend: "down" },
  { phrase: "no interview required", count: 523, category: "urgency", trend: "up" },
  { phrase: "payment upfront", count: 467, category: "fee", trend: "stable" },
  { phrase: "work from home $5000", count: 412, category: "salary", trend: "up" },
  { phrase: "WhatsApp contact only", count: 389, category: "contact", trend: "up" },
  { phrase: "limited positions", count: 345, category: "urgency", trend: "down" },
  { phrase: "consultant-mail.net", count: 298, category: "contact", trend: "stable" },
  { phrase: "guaranteed income", count: 276, category: "salary", trend: "up" },
];

const categoryConfig = {
  fee: {
    icon: DollarSign,
    className: "chip-fee",
    label: "Fee Related",
  },
  urgency: {
    icon: Clock,
    className: "chip-urgency",
    label: "Urgency Tactics",
  },
  contact: {
    icon: Mail,
    className: "chip-contact",
    label: "Suspicious Contact",
  },
  salary: {
    icon: TrendingUp,
    className: "chip-salary",
    label: "Unrealistic Pay",
  },
};

export function ScamIndicatorChips() {
  return (
    <Card className="border-border bg-card glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <AlertTriangle className="h-5 w-5" />
          Most Common Scam Indicators
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Frequently detected suspicious phrases in analyzed job postings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Category Legend */}
        <div className="flex flex-wrap gap-3 pb-2 border-b border-border">
          {Object.entries(categoryConfig).map(([key, config]) => (
            <div key={key} className="flex items-center gap-1.5">
              <config.icon className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{config.label}</span>
            </div>
          ))}
        </div>

        {/* Indicator Chips */}
        <div className="flex flex-wrap gap-2">
          {scamIndicators.map((indicator, index) => {
            const config = categoryConfig[indicator.category];
            return (
              <div
                key={index}
                className={`
                  inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm
                  transition-all duration-200 hover:scale-105 cursor-default
                  ${config.className}
                `}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <config.icon className="h-3 w-3" />
                <span className="font-medium">{indicator.phrase}</span>
                <span className="text-xs opacity-70">({indicator.count})</span>
                {indicator.trend === "up" && (
                  <span className="text-[10px] text-risk-high">↑</span>
                )}
                {indicator.trend === "down" && (
                  <span className="text-[10px] text-risk-low">↓</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 pt-4 border-t border-border">
          {Object.entries(categoryConfig).map(([key, config]) => {
            const categoryIndicators = scamIndicators.filter(i => i.category === key);
            const totalCount = categoryIndicators.reduce((sum, i) => sum + i.count, 0);
            return (
              <div key={key} className="text-center">
                <div className="text-lg font-bold text-foreground">{totalCount.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">{config.label}</div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
