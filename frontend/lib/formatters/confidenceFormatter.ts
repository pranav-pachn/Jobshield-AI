export function formatConfidence(score: number): string {
  return `${Math.round(score * 100)}%`;
}

export function getConfidenceLevel(score: number): 'Low' | 'Medium' | 'High' {
  if (score < 0.4) return 'Low';
  if (score < 0.75) return 'Medium';
  return 'High';
}

export function getConfidenceColor(level: string): string {
  switch (level.toLowerCase()) {
    case 'high':
      return 'text-emerald-400';
    case 'medium':
      return 'text-amber-400';
    case 'low':
      return 'text-red-400';
    default:
      return 'text-slate-400';
  }
}
