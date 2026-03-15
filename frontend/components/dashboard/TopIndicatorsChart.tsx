"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchTopIndicators } from "@/lib/dashboardApi";
import { IndicatorChartItem } from "@/lib/dashboardTypes";
import { AlertCircle } from "lucide-react";

interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-white/20 bg-gradient-to-br from-card to-card/50 p-3 shadow-2xl backdrop-blur-xl">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-sm text-red-400">Count: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export function TopIndicatorsChart() {
  const [data, setData] = useState<IndicatorChartItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const indicatorsData = await fetchTopIndicators();
        setData(indicatorsData);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch top indicators:", err);
        setError("Failed to load indicators data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Prepare data with truncated labels for display
  const displayData = data?.map((item) => ({
    ...item,
    displayPhrase: item.phrase.length > 20 
      ? item.phrase.substring(0, 17) + "..."
      : item.phrase,
  }));

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm glow-border glow-border-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-orange-400" />
          Top Scam Indicators
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-80 bg-muted rounded-lg animate-pulse" />
        ) : error ? (
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            {error}
          </div>
        ) : displayData && displayData.length > 0 ? (
          <div className="animate-in fade-in duration-500">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={displayData}
                margin={{ top: 5, right: 30, left: 0, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis
                  dataKey="displayPhrase"
                  stroke="rgba(255,255,255,0.5)"
                  style={{ fontSize: "11px" }}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.5)"
                  style={{ fontSize: "12px" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="count"
                  fill="#ff4d4f"
                  radius={[8, 8, 0, 0]}
                  animationDuration={500}
                />
              </BarChart>
            </ResponsiveContainer>
            
            {/* Full phrase reference below chart */}
            <div className="mt-6 space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                Indicator Phrases
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {data?.map((indicator, index) => (
                  <div
                    key={index}
                    className="text-xs text-muted-foreground flex items-start gap-2 p-2 rounded bg-muted/50"
                  >
                    <span className="font-bold text-primary min-w-6">{index + 1}.</span>
                    <span title={indicator.phrase}>{indicator.phrase}</span>
                    <span className="ml-auto font-semibold text-foreground">
                      {indicator.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
