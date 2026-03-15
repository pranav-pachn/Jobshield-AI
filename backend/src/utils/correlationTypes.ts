/**
 * Correlation Types and Confidence Scores
 * 
 * Define all possible correlation types between scam entities
 * and their corresponding confidence scores
 */

export enum CorrelationType {
  SHARED_WALLET = 'shared_wallet',
  SHARED_EMAIL_EXACT = 'shared_email_exact',
  SHARED_PHONE = 'shared_phone',
  SHARED_EMAIL_DOMAIN = 'shared_email_domain',
  TEXTUAL_SIMILARITY = 'textual_similarity',
}

/**
 * Confidence scores for each correlation type
 * Ranges from 0-1, representing how confident we are in the correlation
 */
export const CORRELATION_CONFIDENCE: Record<CorrelationType, number> = {
  [CorrelationType.SHARED_WALLET]: 0.95,           // Highest confidence - exact wallet match
  [CorrelationType.SHARED_EMAIL_EXACT]: 0.85,      // High confidence - exact email match
  [CorrelationType.SHARED_PHONE]: 0.75,            // Medium-high confidence - exact phone match
  [CorrelationType.SHARED_EMAIL_DOMAIN]: 0.65,     // Medium confidence - same email domain
  [CorrelationType.TEXTUAL_SIMILARITY]: 0.45,      // Lower confidence - text pattern similarity
};

/**
 * Human-readable labels for correlation types
 */
export const CORRELATION_LABELS: Record<CorrelationType, string> = {
  [CorrelationType.SHARED_WALLET]: 'Shared Wallet Address',
  [CorrelationType.SHARED_EMAIL_EXACT]: 'Exact Email Match',
  [CorrelationType.SHARED_PHONE]: 'Shared Phone Number',
  [CorrelationType.SHARED_EMAIL_DOMAIN]: 'Email Domain Match',
  [CorrelationType.TEXTUAL_SIMILARITY]: 'Text Pattern Similarity',
};

/**
 * Color coding for correlation types (for graph visualization)
 */
export const CORRELATION_COLORS: Record<CorrelationType, string> = {
  [CorrelationType.SHARED_WALLET]: '#ef4444',      // Red - highest threat
  [CorrelationType.SHARED_EMAIL_EXACT]: '#f97316',  // Orange-red
  [CorrelationType.SHARED_PHONE]: '#eab308',        // Yellow
  [CorrelationType.SHARED_EMAIL_DOMAIN]: '#3b82f6', // Blue
  [CorrelationType.TEXTUAL_SIMILARITY]: '#8b5cf6',  // Purple - lowest threat
};

/**
 * Entity types that can appear in the scam network graph
 */
export enum EntityType {
  JOB = 'job',
  RECRUITER = 'recruiter',
  DOMAIN = 'domain',
  REPORT = 'report',
}

/**
 * Risk levels based on correlation strength
 */
export enum RiskLevel {
  CRITICAL = 'critical',  // Confidence >= 0.85
  HIGH = 'high',          // Confidence >= 0.70
  MEDIUM = 'medium',      // Confidence >= 0.50
  LOW = 'low',            // Confidence < 0.50
}

/**
 * Get risk level from confidence score
 */
export function getRiskLevelFromConfidence(confidence: number): RiskLevel {
  if (confidence >= 0.85) return RiskLevel.CRITICAL;
  if (confidence >= 0.70) return RiskLevel.HIGH;
  if (confidence >= 0.50) return RiskLevel.MEDIUM;
  return RiskLevel.LOW;
}

/**
 * Get all correlation types as array
 */
export function getAllCorrelationTypes(): CorrelationType[] {
  return Object.values(CorrelationType);
}

/**
 * Filter correlations by confidence threshold
 */
export function getCorrelationsAboveThreshold(
  threshold: number
): CorrelationType[] {
  return Object.entries(CORRELATION_CONFIDENCE)
    .filter(([_, confidence]) => confidence >= threshold)
    .map(([type]) => type as CorrelationType);
}
