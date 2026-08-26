import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { PieChart as PieChartIcon, TrendingDown } from "lucide-react";

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
  high: '#ef4444',    // red-500
  medium: '#eab308',  // yellow-500
  low: '#22c55e'      // green-500
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
      <div className="rounded-lg border border-white/20 bg-gradient-to-br from-card to-card/50 p-4 shadow-2xl backdrop-blur-xl">
        <p className="text-sm font-semibold text-foreground">
          {payload[0].name}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {payload[0].value} incidents
        </p>
        <p className="text-xs font-bold text-primary mt-2">
          {payload[0].payload.percentage}% of total
        </p>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }: LegendProps) => {
  return (
    <div className="flex flex-col gap-3 mt-6 pt-6 border-t border-white/10">
      {payload?.map((entry, index: number) => (
        <div key={index} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[3%] p-3 hover:border-white/10 transition-all">
          <div className="flex items-center gap-3">
            <div 
              className="w-3 h-3 rounded-full shadow-lg"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm font-medium text-foreground">
              {entry.value}
            </span>
          </div>
          <span className="text-sm font-bold text-primary">
            {entry.payload.percentage}%
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
      <Card className="glass-card border-border shadow-xl overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <PieChartIcon className="h-5 w-5 text-primary" />
            Risk Distribution</CardTitle>
          <CardDescription>Breakdown of analysis results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center rounded-lg border border-white/5 bg-black/20">
            <p className="text-muted-foreground">No data available yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-border shadow-xl overflow-hidden relative">
      {/* Accent gradient bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500/50 via-yellow-500/50 to-red-500/50" />
      
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <PieChartIcon className="h-5 w-5 text-primary flex-shrink-0" />
              Risk Distribution
            </CardTitle>
            <CardDescription>Breakdown of {totalAnalyses} analyzed opportunities</CardDescription>
          </div>
          <div className="rounded-full bg-green-500/10 px-3 py-1 flex items-center gap-1">
            <TrendingDown className="h-4 w-4 text-green-400" />
            <span className="text-xs font-semibold text-green-400">-8% high risk</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                fill="#8884d8"
                paddingAngle={4}
                dataKey="value"
              >
                <Cell fill={COLORS.high} />
                <Cell fill={COLORS.medium} />
                <Cell fill={COLORS.low} />
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <CustomLegend payload={chartData.map((item, idx) => ({
          value: item.name,
          color: item.name === 'High Risk' ? COLORS.high : item.name === 'Medium Risk' ? COLORS.medium : COLORS.low,
          payload: { percentage: item.percentage }
        }))} />

        <div className="pt-4 border-t border-white/5 space-y-2">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Summary Statistics</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-center">
              <div className="text-2xl font-bold text-red-400">{data.high}</div>
              <div className="text-xs text-red-300/70 mt-1">High Risk</div>
            </div>
            <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3 text-center">
              <div className="text-2xl font-bold text-yellow-400">{data.medium}</div>
              <div className="text-xs text-yellow-300/70 mt-1">Medium Risk</div>
            </div>
            <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3 text-center">
              <div className="text-2xl font-bold text-green-400">{data.low}</div>
              <div className="text-xs text-green-300/70 mt-1">Low Risk</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
