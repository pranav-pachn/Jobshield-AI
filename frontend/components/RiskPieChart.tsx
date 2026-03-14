import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <div className="rounded-lg border border-gray-600 bg-gray-800 p-3 shadow-lg">
        <p className="text-sm font-medium text-gray-100">
          {payload[0].name}
        </p>
        <p className="text-sm text-gray-300">
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
          <span className="text-sm text-gray-300">
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
      <Card className="border-gray-700 bg-gray-800 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-100">
            <PieChartIcon className="h-5 w-5" />
            Risk Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-400">No data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="min-w-0 border-gray-700 bg-gray-800 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-100">
          <PieChartIcon className="h-5 w-5" />
          Risk Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80 min-h-80 min-w-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={280} minHeight={320}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="45%"
                labelLine={false}
                label={({ percentage }) => `${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
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
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{data.high}</div>
            <div className="text-xs text-gray-400">High Risk</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{data.medium}</div>
            <div className="text-xs text-gray-400">Medium Risk</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{data.low}</div>
            <div className="text-xs text-gray-400">Low Risk</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
