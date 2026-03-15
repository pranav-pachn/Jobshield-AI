"use client";

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  TooltipProps,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchRiskDistribution } from "@/lib/dashboardApi";
import { RiskDistributionResponse } from "@/lib/dashboardTypes";
import { PieChart as PieChartIcon } from "lucide-react";

const COLORS = {
  Low: "#22c55e", // green-500
  Medium: "#eab308", // yellow-500
  High: "#ef4444", // red-500
};

interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: {
      percentage: number;
    };
  }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="rounded-lg border border-white/20 bg-gradient-to-br from-card to-card/50 p-3 shadow-2xl backdrop-blur-xl">
        <p className="text-sm font-semibold text-foreground">{data.name}</p>
        <p className="text-sm text-muted-foreground">
          Count: {data.value}
        </p>
        <p className="text-xs text-muted-foreground">
          {data.payload.percentage}%
        </p>
      </div>
    );
  }
  return null;
};

interface CustomLegendProps {
  payload?: Array<{
    value: string;
    color: string;
  }>;
}

const CustomLegend = ({ payload }: CustomLegendProps) => (
  <div className="flex justify-center gap-6 mt-4">
    {payload?.map((entry, index) => (
      <div key={`legend-${index}`} className="flex items-center gap-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: entry.color }}
        />
        <span className="text-xs text-muted-foreground">{entry.value}</span>
      </div>
    ))}
  </div>
);

export function RiskDistributionChart() {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const distData = await fetchRiskDistribution();
        
        // Transform data for pie chart
        const total = distData.Low + distData.Medium + distData.High;
        const chartData = [
          {
            name: "Low",
            value: distData.Low,
            percentage: ((distData.Low / total) * 100).toFixed(1),
          },
          {
            name: "Medium",
            value: distData.Medium,
            percentage: ((distData.Medium / total) * 100).toFixed(1),
          },
          {
            name: "High",
            value: distData.High,
            percentage: ((distData.High / total) * 100).toFixed(1),
          },
        ];
        
        setData(chartData);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch risk distribution:", err);
        setError("Failed to load risk distribution data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-blue-400" />
              Risk Distribution
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-80 bg-muted rounded-lg animate-pulse" />
        ) : error ? (
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            {error}
          </div>
        ) : data ? (
          <div className="animate-in fade-in duration-500">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  animationDuration={500}
                >
                  {data.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[entry.name as keyof typeof COLORS]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <CustomLegend
              payload={data.map((d: any) => ({
                value: d.name,
                color: COLORS[d.name as keyof typeof COLORS],
              }))}
            />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
