export const DECISION_COLORS = {
  SCAM: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
  HUMAN_REVIEW: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  SAFE: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
};

export function getDecisionColor(decision: string) {
  return DECISION_COLORS[decision as keyof typeof DECISION_COLORS] || { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' };
}

export function getDecisionLabel(decision: string) {
  switch (decision) {
    case 'SCAM': return 'High Risk / Scam';
    case 'HUMAN_REVIEW': return 'Needs Review';
    case 'SAFE': return 'Safe';
    default: return decision;
  }
}
