"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { TrendingUp } from "lucide-react";

interface ThreatData {
  timestamp: string;
  threats: number;
  high_risk: number;
  medium_risk: number;
  low_risk: number;
}

interface ThreatTrendsProps {
  data?: ThreatData[];
  title?: string;
  description?: string;
}

const DEFAULT_DATA: ThreatData[] = [
  { timestamp: "Mon", threats: 45, high_risk: 8, medium_risk: 24, low_risk: 13 },
  { timestamp: "Tue", threats: 38, high_risk: 6, medium_risk: 19, low_risk: 13 },
  { timestamp: "Wed", threats: 62, high_risk: 12, medium_risk: 34, low_risk: 16 },
  { timestamp: "Thu", threats: 55, high_risk: 10, medium_risk: 28, low_risk: 17 },
  { timestamp: "Fri", threats: 78, high_risk: 15, medium_risk: 41, low_risk: 22 },
  { timestamp: "Sat", threats: 52, high_risk: 9, medium_risk: 26, low_risk: 17 },
  { timestamp: "Sun", threats: 48, high_risk: 7, medium_risk: 25, low_risk: 16 },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-white/20 bg-gradient-to-br from-card to-card/50 p-4 shadow-2xl backdrop-blur-xl">
        <p className="text-sm font-semibold text-foreground mb-2">
          {payload[0]?.payload?.timestamp}
        </p>
        {payload.map((entry: any, idx: number) => (
          <div key={idx} className="flex items-center gap-2 text-xs">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-semibold" style={{ color: entry.color }}>
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function ThreatTrends({
  data = DEFAULT_DATA,
  title = "Threat Detection Trends",
  description = "Recent scam detection activity over the last 7 days",
}: ThreatTrendsProps) {
  const totalThreats = data.reduce((sum, item) => sum + item.threats, 0);
  const avgThreatsPerDay = Math.round(totalThreats / data.length);
  const peakDay = data.reduce((prev, current) =>
    prev.threats > current.threats ? prev : current
  );

  return (
    <Card className="glass-card-accent border-border overflow-hidden">
      <CardHeader className="pb-0">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <span className="flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <TrendingUp className="h-5 w-5 text-primary" />
              {title}
            </CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
          <div className="live-data-card-glow flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-3 py-1.5">
            <span className="text-xs font-medium text-muted-foreground">Avg/Day</span>
            <span className="text-sm font-bold text-primary">{avgThreatsPerDay}</span>
          </div>
        </div>

        {/* Quick stats */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="live-data-card-glow rounded-lg border border-white/5 bg-white/[3%] p-3">
            <p className="text-xs font-medium uppercase text-muted-foreground">Total Threats</p>
            <p className="mt-1 text-lg font-bold text-foreground">{totalThreats}</p>
          </div>
          <div className="live-data-card-glow rounded-lg border border-white/5 bg-white/[3%] p-3">
            <p className="text-xs font-medium uppercase text-muted-foreground">Avg per Day</p>
            <p className="mt-1 text-lg font-bold text-primary">{avgThreatsPerDay}</p>
          </div>
          <div className="live-data-card-glow rounded-lg border border-white/5 bg-white/[3%] p-3">
            <p className="text-xs font-medium uppercase text-muted-foreground">Peak Day</p>
            <p className="mt-1 text-lg font-bold text-red-400">{peakDay.threats}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-8">
        {/* Chart */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.08)"
                vertical={false}
              />
              <XAxis
                dataKey="timestamp"
                stroke="rgba(255,255,255,0.5)"
                style={{ fontSize: "12px" }}
              />
              <YAxis
                stroke="rgba(255,255,255,0.5)"
                style={{ fontSize: "12px" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="threats"
                stroke="#ef4444"
                fillOpacity={1}
                fill="url(#colorThreats)"
                strokeWidth={2}
                isAnimationActive={true}
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Legend detail */}
        <div className="mt-6 grid grid-cols-3 gap-3 border-t border-white/5 pt-6">
          <div className="flex items-center gap-2">
            <div className="live-data-breathe w-3 h-3 rounded-full bg-red-500" style={{ color: 'rgb(239, 68, 68)' }} />
            <div>
              <p className="text-xs font-medium text-muted-foreground">High Risk</p>
              <p className="text-sm font-semibold text-foreground">
                {data.reduce((sum, item) => sum + item.high_risk, 0)} avg
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="live-data-breathe w-3 h-3 rounded-full bg-yellow-500" style={{ color: 'rgb(245, 158, 11)' }} />
            <div>
              <p className="text-xs font-medium text-muted-foreground">Medium Risk</p>
              <p className="text-sm font-semibold text-foreground">
                {data.reduce((sum, item) => sum + item.medium_risk, 0)} avg
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="live-data-breathe w-3 h-3 rounded-full bg-green-500" style={{ color: 'rgb(34, 197, 94)' }} />
            <div>
              <p className="text-xs font-medium text-muted-foreground">Low Risk</p>
              <p className="text-sm font-semibold text-foreground">
                {data.reduce((sum, item) => sum + item.low_risk, 0)} avg
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
