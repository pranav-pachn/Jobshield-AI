/**
 * Utility functions for dashboard data validation and formatting
 */

/**
 * Safely format a scam score to a percentage string
 * Returns "—" if the score is null, undefined, or NaN
 */
export function formatScamScore(score: number | null | undefined): string {
  if (score === null || score === undefined || !Number.isFinite(score)) {
    return "—";
  }
  return `${(score * 100).toFixed(0)}%`;
}

/**
 * Generate a confidence context string based on analysis count
 * Shows how many jobs were analyzed to establish the average
 */
export function getConfidenceContext(count: number): string {
  if (!count || count === 0) {
    return "no analyses yet";
  }
  return `based on ${count} ${count === 1 ? "analysis" : "analyses"}`;
}

/**
 * Format a number with thousand separators
 * Used for large metric values
 */
export function formatMetricNumber(value: number | null | undefined): string | number {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "—";
  }
  return value.toLocaleString();
}

/**
 * Determine risk level class for styling
 * Used to apply consistent risk-level colors
 */
export function getRiskLevelClass(level: string): string {
  const levelMap: Record<string, string> = {
    high: "text-red-500 bg-red-500/10",
    medium: "text-yellow-500 bg-yellow-500/10",
    low: "text-green-500 bg-green-500/10",
  };
  return levelMap[level.toLowerCase()] || "text-gray-500 bg-gray-500/10";
}

/**
 * Validate stats response has required fields
 * Returns true if stats object is safe to use
 */
export function isValidStatsResponse(stats: any): boolean {
  return (
    stats &&
    typeof stats === "object" &&
    typeof stats.total_analyses === "number" &&
    typeof stats.high_risk === "number" &&
    typeof stats.medium_risk === "number" &&
    Number.isFinite(stats.average_scam_score) || stats.average_scam_score === null
  );
}
