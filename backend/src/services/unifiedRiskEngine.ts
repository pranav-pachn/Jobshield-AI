import { PatternMatchResult } from "./threatIntelligenceEngine";

export interface UnifiedRiskScores {
  aiScore: number;
  recruiterScore: number;
  threatScore: number;
}

export interface RiskBreakdown {
  aiScore: number;
  recruiterScore: number;
  threatScore: number;
}

export interface UnifiedRiskResult {
  finalScore: number;
  riskLevel: "High" | "Medium" | "Low";
  confidence: number;
  breakdown: RiskBreakdown;
}

/**
 * Calculate the final unified risk score using weighted formula:
 * Final Score = (AI Score * 0.5) + (Recruiter Score * 0.25) + (Threat Score * 0.25)
 */
export function calculateFinalScore(scores: UnifiedRiskScores): number {
  const finalScore =
    scores.aiScore * 0.5 +
    scores.recruiterScore * 0.25 +
    scores.threatScore * 0.25;

  return Math.round(finalScore);
}

/**
 * Determine risk level based on final score
 * > 75: High
 * > 40: Medium
 * <= 40: Low
 */
export function getRiskLevel(score: number): "High" | "Medium" | "Low" {
  if (score > 75) return "High";
  if (score > 40) return "Medium";
  return "Low";
}

/**
 * Calculate confidence based on signal agreement.
 * Higher confidence when AI, Recruiter, and Threat scores align closely.
 * Uses standard deviation: lower deviation = higher confidence.
 */
export function calculateConfidence(scores: UnifiedRiskScores): number {
  const scoreArray = [scores.aiScore, scores.recruiterScore, scores.threatScore];

  // Calculate mean
  const mean = scoreArray.reduce((a, b) => a + b, 0) / scoreArray.length;

  // Calculate variance
  const variance =
    scoreArray.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) /
    scoreArray.length;

  // Calculate standard deviation
  const stdDev = Math.sqrt(variance);

  // Lower deviation = higher confidence (max 100, min 0)
  const confidence = Math.max(0, 100 - stdDev * 2);

  return Math.round(confidence);
}

/**
 * Calculate hybrid threat intelligence score (0-100) combining:
 * - risk_boost (capped 0-50) → normalized to 0-60 weight
 * - pattern frequency bonus (0-20)
 * - domain/phrase match intensity (0-20)
 */
export function calculateThreatScore(
  patternResult: PatternMatchResult,
  originalRiskScore: number
): number {
  // Normalize risk_boost (0-50) to 0-60 scale
  const riskBoostComponent = Math.min(patternResult.risk_boost, 50) * 1.2;

  // Pattern frequency bonus (0-20)
  // Higher frequency = higher threat score
  let frequencyBonus = 0;
  if (patternResult.frequency > 20) {
    frequencyBonus = 20;
  } else if (patternResult.frequency > 10) {
    frequencyBonus = 15;
  } else if (patternResult.frequency > 5) {
    frequencyBonus = 10;
  } else if (patternResult.frequency > 0) {
    frequencyBonus = 5;
  }

  // Domain/phrase match intensity (0-20)
  let matchIntensity = 0;
  const matchCount =
    (patternResult.similar_domains?.length || 0) +
    (patternResult.similar_phrases?.length || 0);

  if (matchCount > 5) {
    matchIntensity = 20;
  } else if (matchCount > 3) {
    matchIntensity = 15;
  } else if (matchCount > 1) {
    matchIntensity = 10;
  } else if (matchCount > 0) {
    matchIntensity = 5;
  }

  // If patterns were found, ensure minimum threat score
  const baseThreatScore = riskBoostComponent + frequencyBonus + matchIntensity;
  const finalThreatScore = patternResult.found
    ? Math.max(baseThreatScore, 30) // Minimum 30 if patterns found
    : baseThreatScore;

  return Math.round(Math.min(finalThreatScore, 100));
}

/**
 * Main function to compute unified risk assessment
 */
export function computeUnifiedRisk(
  aiProbability: number, // 0-1 from AI analysis
  recruiterEmailScore: number | null, // 0-100 from threat intelligence service, null if no email
  patternResult: PatternMatchResult,
  originalRiskScore: number // 0-100
): UnifiedRiskResult {
  // Convert AI probability (0-1) to 0-100 score
  const aiScore = Math.round(aiProbability * 100);

  // Recruiter score: use provided score or default to neutral (50)
  const recruiterScore = recruiterEmailScore ?? 50;

  // Calculate threat score using hybrid method
  const threatScore = calculateThreatScore(patternResult, originalRiskScore);

  const scores: UnifiedRiskScores = {
    aiScore,
    recruiterScore,
    threatScore,
  };

  const finalScore = calculateFinalScore(scores);
  const riskLevel = getRiskLevel(finalScore);
  const confidence = calculateConfidence(scores);

  return {
    finalScore,
    riskLevel,
    confidence,
    breakdown: {
      aiScore,
      recruiterScore,
      threatScore,
    },
  };
}
