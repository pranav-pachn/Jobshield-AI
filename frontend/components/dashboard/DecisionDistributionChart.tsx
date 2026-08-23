"use client";

import { AnalyticsOverview } from "@/lib/intelligenceTypes";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface Props {
  overview: AnalyticsOverview | null;
}

export function DecisionDistributionChart({ overview }: Props) {
  if (!overview) return null;

  const data = [
    { name: "Scam", value: overview.scamCount, color: "#f43f5e" },
    { name: "Legitimate", value: overview.legitimateCount, color: "#10b981" },
    { name: "Human Review", value: overview.humanReviewCount, color: "#f59e0b" }
  ].filter(item => item.value > 0);

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
        No decision data available yet
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.5rem' }}
            itemStyle={{ color: '#e2e8f0' }}
          />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
