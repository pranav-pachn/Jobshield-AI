"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";

interface RiskData {
  high: number;
  medium: number;
  low: number;
}

interface RiskPieChartProps {
  data: RiskData;
  totalAnalyses: number;
}

const COLORS = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#22c55e'
};

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: {
      percentage: number;
    };
  }>;
}

interface LegendProps {
  payload?: Array<{
    value: string;
    color: string;
    payload: {
      percentage: number;
    };
  }>;
}

const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
        <p className="text-sm font-medium text-foreground">
          {payload[0].name}
        </p>
        <p className="text-sm text-muted-foreground">
          {payload[0].value} jobs ({payload[0].payload.percentage}%)
        </p>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }: LegendProps) => {
  return (
    <div className="flex flex-wrap gap-4 justify-center mt-4">
      {payload?.map((entry, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-muted-foreground">
            {entry.value} ({entry.payload.percentage}%)
          </span>
        </div>
      ))}
    </div>
  );
};

export function RiskPieChart({ data, totalAnalyses }: RiskPieChartProps) {
  const chartData = [
    { 
      name: 'High Risk', 
      value: data.high, 
      percentage: totalAnalyses > 0 ? Math.round((data.high / totalAnalyses) * 100) : 0 
    },
    { 
      name: 'Medium Risk', 
      value: data.medium, 
      percentage: totalAnalyses > 0 ? Math.round((data.medium / totalAnalyses) * 100) : 0 
    },
    { 
      name: 'Low Risk', 
      value: data.low, 
      percentage: totalAnalyses > 0 ? Math.round((data.low / totalAnalyses) * 100) : 0 
    },
  ].filter(item => item.value > 0);

  if (totalAnalyses === 0) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <PieChartIcon className="h-5 w-5" />
            Risk Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">No data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <PieChartIcon className="h-5 w-5" />
          Risk Distribution
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Breakdown of analyzed jobs by risk level
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 min-h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={4}
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={
                      entry.name === 'High Risk' ? COLORS.high :
                      entry.name === 'Medium Risk' ? COLORS.medium :
                      COLORS.low
                    } 
                    strokeWidth={0}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Summary Stats */}
        <div className="mt-4 grid grid-cols-3 gap-4 border-t border-border pt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-risk-high">{data.high}</div>
            <div className="text-xs text-muted-foreground">High Risk</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-risk-medium">{data.medium}</div>
            <div className="text-xs text-muted-foreground">Medium Risk</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-risk-low">{data.low}</div>
            <div className="text-xs text-muted-foreground">Low Risk</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
