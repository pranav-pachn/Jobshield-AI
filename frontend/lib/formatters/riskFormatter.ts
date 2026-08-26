export function formatRiskScore(score: number): string {
  return `${Math.round(score)} / 100`;
}

export function getRiskLevel(score: number): 'Low' | 'Medium' | 'High' | 'Critical' {
  if (score < 30) return 'Low';
  if (score < 70) return 'Medium';
  if (score < 90) return 'High';
  return 'Critical';
}

export function getRiskColor(level: string): { bg: string; text: string; border: string } {
  switch (level.toLowerCase()) {
    case 'critical':
    case 'high':
      return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' };
    case 'medium':
      return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' };
    case 'low':
      return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' };
    default:
      return { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' };
  }
}
