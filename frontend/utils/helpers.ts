export function formatRiskLabel(score: number): string {
  if (score >= 80) {
    return "High Risk";
  }

  if (score >= 50) {
    return "Medium Risk";
  }

  return "Low Risk";
}
