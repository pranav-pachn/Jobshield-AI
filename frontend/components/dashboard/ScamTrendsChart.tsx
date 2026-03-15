"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchTrends } from "@/lib/dashboardApi";
import { TrendChartItem } from "@/lib/dashboardTypes";
import { TrendingUp } from "lucide-react";

interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-white/20 bg-gradient-to-br from-card to-card/50 p-3 shadow-2xl backdrop-blur-xl">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function ScamTrendsChart() {
  const [data, setData] = useState<TrendChartItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const trendsData = await fetchTrends();
        
        // Transform data for line chart
        const chartData = trendsData.map((item) => ({
          date: new Date(item.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          High: item.high,
          Medium: item.medium,
          Low: item.low,
        }));
        
        setData(chartData);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch trends:", err);
        setError("Failed to load trend data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm glow-border glow-border-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-purple-400" />
          Scam Detection Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-80 bg-muted rounded-lg animate-pulse" />
        ) : error ? (
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            {error}
          </div>
        ) : data && data.length > 0 ? (
          <div className="animate-in fade-in duration-500">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={data}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <defs>
                  <filter id="glowHigh" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter id="glowMedium" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter id="glowLow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(255,255,255,0.5)"
                  style={{ fontSize: "12px" }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.5)"
                  style={{ fontSize: "12px" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="High"
                  stroke="#ff4d4f"
                  strokeWidth={2.5}
                  dot={false}
                  animationDuration={500}
                  filter="url(#glowHigh)"
                />
                <Line
                  type="monotone"
                  dataKey="Medium"
                  stroke="#f7b500"
                  strokeWidth={2.5}
                  dot={false}
                  animationDuration={500}
                  filter="url(#glowMedium)"
                />
                <Line
                  type="monotone"
                  dataKey="Low"
                  stroke="#2ecc71"
                  strokeWidth={2.5}
                  dot={false}
                  animationDuration={500}
                  filter="url(#glowLow)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
