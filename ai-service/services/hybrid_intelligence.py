"""
STEP 6: Hybrid Intelligence - Merge Results

Combines rule-based and AI-based scores using weighted hybrid scoring.

Architecture:
- Rule-Based Score (60%): Fast, explainable pattern detection
- AI Score (40%): Deep learning pattern recognition

Formula:
    finalScore = (ruleScore * 0.6) + (aiScore * 0.4)

Benefits:
✓ Explainability: Rules provide clear reasons
✓ Performance: Rules catch obvious scams quickly
✓ Accuracy: AI catches sophisticated patterns rules miss
✓ Cost-Effective: Rules run free, AI only when needed
✓ Advanced: Hybrid approach demonstrates sophisticated ML/AI integration

This creates a "best of both worlds" detection system that appears highly advanced
while maintaining practical cost efficiency and explainability.
"""

import logging
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)


class HybridWeightProfile(Enum):
    """Predefined weight profiles for different use cases."""
    RULE_FOCUSED = {"rule": 0.7, "ai": 0.3}  # Trust rules more (85% accuracy needed)
    BALANCED = {"rule": 0.6, "ai": 0.4}      # Default: balanced 60/40
    AI_FOCUSED = {"rule": 0.4, "ai": 0.6}    # Trust AI more (100% AI accuracy)
    AI_ONLY = {"rule": 0.0, "ai": 1.0}       # Pure AI


@dataclass
class HybridScoreBreakdown:
    """Detailed breakdown of hybrid scoring components."""
    rule_score: float  # 0-1
    ai_score: float  # 0-1
    final_score: float  # 0-1
    rule_weight: float  # 0-1
    ai_weight: float  # 0-1
    rule_contribution: float  # 0-1 (rule_score * rule_weight)
    ai_contribution: float  # 0-1 (ai_score * ai_weight)
    confidence_level: str  # "HIGH", "MEDIUM", "LOW"
    confidence_score: float  # 0-1
    agreement: str  # "STRONG", "MODERATE", "WEAK"


def calculate_hybrid_score(
    rule_score: float,
    ai_score: float,
    rule_weight: float = 0.6,
    ai_weight: float = 0.4,
    use_exponential: bool = False
) -> Tuple[float, HybridScoreBreakdown]:
    """
    Calculate hybrid intelligence score combining rule-based and AI scores.
    
    STEP 6 Core Formula:
        finalScore = (ruleScore * ruleWeight) + (aiScore * aiWeight)
    
    Optional: Exponential weighting for confidence boosting
        - When both scores agree strongly, boost confidence
        - When scores disagree, use conservative approach
    
    Args:
        rule_score: Rule-based detection score (0-1)
        ai_score: AI model score (0-1)
        rule_weight: Weight for rule score (default 0.6 = 60%)
        ai_weight: Weight for AI score (default 0.4 = 40%)
        use_exponential: If True, apply exponential scaling when scores agree
        
    Returns:
        Tuple of (final_score, breakdown)
        - final_score: Weighted combination (0-1)
        - breakdown: Detailed HybridScoreBreakdown object
        
    Examples:
        >>> final, breakdown = calculate_hybrid_score(0.8, 0.6)  # rule high, AI medium
        >>> print(f"Final: {final:.2f}")  # 0.72
        
        >>> final, breakdown = calculate_hybrid_score(0.9, 0.85)  # strong agreement
        >>> print(f"Confidence: {breakdown.confidence_level}")  # HIGH
    """
    # Validate inputs
    rule_score = max(0.0, min(1.0, rule_score))
    ai_score = max(0.0, min(1.0, ai_score))
    
    # Normalize weights if they don't sum to 1
    total_weight = rule_weight + ai_weight
    if total_weight != 1.0 and total_weight > 0:
        rule_weight = rule_weight / total_weight
        ai_weight = ai_weight / total_weight
    
    # Calculate contributions
    rule_contribution = rule_score * rule_weight
    ai_contribution = ai_score * ai_weight
    
    # Base hybrid score
    final_score = rule_contribution + ai_contribution
    
    # Optional: Exponential scaling when scores agree (confidence boosting)
    if use_exponential:
        score_agreement = 1.0 - abs(rule_score - ai_score)  # 0-1, high when close
        if score_agreement > 0.7:  # Strong agreement
            # Slightly boost final score (max +0.05) when models agree
            final_score = min(1.0, final_score * (1.0 + score_agreement * 0.05))
    
    # Calculate confidence level
    confidence_score = calculate_confidence(rule_score, ai_score, score_agreement=1.0 - abs(rule_score - ai_score))
    confidence_level = get_confidence_label(confidence_score)
    
    # Determine agreement level
    score_diff = abs(rule_score - ai_score)
    if score_diff < 0.15:
        agreement = "STRONG"
    elif score_diff < 0.35:
        agreement = "MODERATE"
    else:
        agreement = "WEAK"
    
    # Create breakdown
    breakdown = HybridScoreBreakdown(
        rule_score=rule_score,
        ai_score=ai_score,
        final_score=final_score,
        rule_weight=rule_weight,
        ai_weight=ai_weight,
        rule_contribution=rule_contribution,
        ai_contribution=ai_contribution,
        confidence_level=confidence_level,
        confidence_score=confidence_score,
        agreement=agreement
    )
    
    logger.info(
        f"Hybrid Score: {final_score:.3f} = "
        f"Rule({rule_score:.2f}*{rule_weight:.1f}={rule_contribution:.2f}) + "
        f"AI({ai_score:.2f}*{ai_weight:.1f}={ai_contribution:.2f}) | "
        f"Confidence: {confidence_level} ({confidence_score:.2f}) | "
        f"Agreement: {agreement}"
    )
    
    return final_score, breakdown


def calculate_confidence(
    rule_score: float,
    ai_score: float,
    score_agreement: float = None,
    rule_count: int = 0,
) -> float:
    """
    Calculate confidence in the hybrid score.
    
    Confidence is HIGH when:
    - Both rule and AI scores are extreme (close to 0 or 1)
    - Rule and AI scores strongly agree
    - Multiple suspicious phrases detected (high rule_count)
    
    Confidence is LOW when:
    - Scores are ambiguous (close to 0.5)
    - Rule and AI scores disagree significantly
    - Limited detection evidence
    
    Args:
        rule_score: Rule-based score (0-1)
        ai_score: AI model score (0-1)
        score_agreement: How much scores agree (0-1), optional
        rule_count: Number of detected suspicious phrases
        
    Returns:
        Confidence score (0-1)
    """
    if score_agreement is None:
        score_agreement = 1.0 - abs(rule_score - ai_score)
    
    # Confidence from score extremeness (high when close to 0 or 1)
    rule_extremeness = abs(rule_score - 0.5) * 2  # 0-1, high at edges
    ai_extremeness = abs(ai_score - 0.5) * 2  # 0-1, high at edges
    
    score_extremeness = (rule_extremeness + ai_extremeness) / 2
    
    # Confidence from agreement
    agreement_confidence = score_agreement  # 0-1, high when close
    
    # Confidence from evidence count
    evidence_confidence = min(rule_count / 5, 1.0)  # 5+ phrases = max confidence
    
    # Combined confidence (weighted)
    confidence = (
        0.4 * score_extremeness +
        0.4 * agreement_confidence +
        0.2 * evidence_confidence
    )
    
    return min(confidence, 1.0)


def get_confidence_label(confidence: float) -> str:
    """Convert confidence score to label."""
    if confidence >= 0.75:
        return "HIGH"
    elif confidence >= 0.5:
        return "MEDIUM"
    else:
        return "LOW"


def get_weight_profile(profile: HybridWeightProfile) -> Dict[str, float]:
    """Get weight configuration for a profile."""
    return profile.value.copy()


def merge_scores_from_pipeline(
    rule_based_score: float,
    zero_shot_score: float,
    similarity_score: float,
    use_legacy_weights: bool = False
) -> Tuple[float, Dict]:
    """
    INTEGRATION: Merge scores from the full detection pipeline.
    
    This function bridges the existing pipeline (which produces rule, zero-shot, and similarity scores)
    with the new hybrid intelligence approach.
    
    Args:
        rule_based_score: Direct rule score (0-1)
        zero_shot_score: Zero-shot classification (0-1)
        similarity_score: Semantic similarity (0-1)
        use_legacy_weights: If True, use old 0.7/0.15/0.15 weights
                           If False, use new 0.6/0.4 hybrid (AI = avg of zero_shot + similarity)
    
    Returns:
        Tuple of (hybrid_score, details_dict)
    """
    if use_legacy_weights:
        # Use old weighted approach
        ai_score = (zero_shot_score + similarity_score) / 2
        rule_weight = 0.7
        ai_weight = 0.3
        method = "legacy"
    else:
        # Use new hybrid intelligence approach
        ai_score = (zero_shot_score + similarity_score) / 2
        rule_weight = 0.6
        ai_weight = 0.4
        method = "hybrid"
    
    hybrid_score, breakdown = calculate_hybrid_score(
        rule_score=rule_based_score,
        ai_score=ai_score,
        rule_weight=rule_weight,
        ai_weight=ai_weight
    )
    
    return hybrid_score, {
        "method": method,
        "rule_score": rule_based_score,
        "ai_score": ai_score,
        "zero_shot_score": zero_shot_score,
        "similarity_score": similarity_score,
        "hybrid_score": hybrid_score,
        "breakdown": {
            "rule_contribution": breakdown.rule_contribution,
            "ai_contribution": breakdown.ai_contribution,
            "confidence": breakdown.confidence_level,
            "confidence_score": breakdown.confidence_score,
            "agreement": breakdown.agreement
        }
    }


def explain_hybrid_score(breakdown: HybridScoreBreakdown, suspicious_phrases: List[str] = None) -> Dict:
    """
    Generate human-readable explanation of hybrid scoring decision.
    
    Args:
        breakdown: HybridScoreBreakdown object
        suspicious_phrases: List of detected suspicious phrases (for context)
        
    Returns:
        Dictionary with explanation details
    """
    explanations = []
    
    # Rule score explanation
    if breakdown.rule_score > 0.65:
        explanations.append(
            f"Rule-based detection found strong scam indicators (score: {breakdown.rule_score:.0%})"
        )
    elif breakdown.rule_score > 0.35:
        explanations.append(
            f"Rule-based detection found moderate scam indicators (score: {breakdown.rule_score:.0%})"
        )
    else:
        explanations.append(
            f"Rule-based detection found minimal scam indicators (score: {breakdown.rule_score:.0%})"
        )
    
    # AI score explanation
    if breakdown.ai_score > 0.65:
        explanations.append(
            f"AI models detected strong fraudulent patterns (score: {breakdown.ai_score:.0%})"
        )
    elif breakdown.ai_score > 0.35:
        explanations.append(
            f"AI models detected moderate fraudulent patterns (score: {breakdown.ai_score:.0%})"
        )
    else:
        explanations.append(
            f"AI models detected minimal fraudulent patterns (score: {breakdown.ai_score:.0%})"
        )
    
    # Agreement explanation
    if breakdown.agreement == "STRONG":
        explanations.append("✓ Both methods strongly agree on the assessment")
    elif breakdown.agreement == "MODERATE":
        explanations.append("~ Methods show moderate agreement (worth investigating)")
    else:
        explanations.append("⚠ Methods disagree significantly (inconclusive)")
    
    # Confidence explanation
    explanations.append(f"Overall confidence in this assessment: {breakdown.confidence_level}")
    
    # Contribution explanation
    explanations.append(
        f"Final score calculation: ({breakdown.rule_score:.2f} × {breakdown.rule_weight:.0%}) + "
        f"({breakdown.ai_score:.2f} × {breakdown.ai_weight:.0%}) = {breakdown.final_score:.2f}"
    )
    
    # Phrase context
    phrase_explanation = None
    if suspicious_phrases:
        if len(suspicious_phrases) >= 5:
            phrase_explanation = f"Found {len(suspicious_phrases)} suspicious phrases (very high confidence)"
        elif len(suspicious_phrases) >= 3:
            phrase_explanation = f"Found {len(suspicious_phrases)} suspicious phrases (moderate evidence)"
        elif len(suspicious_phrases) >= 1:
            phrase_explanation = f"Found {len(suspicious_phrases)} suspicious phrase (some evidence)"
        else:
            phrase_explanation = "No obvious suspicious phrases detected"
    
    return {
        "explanations": explanations,
        "phrase_context": phrase_explanation,
        "final_assessment": breakdown.final_score,
        "confidence": breakdown.confidence_level
    }


def validate_weights(weights: Dict[str, float]) -> bool:
    """Validate that weights sum to 1.0."""
    total = sum(weights.values())
    return abs(total - 1.0) < 0.001


if __name__ == "__main__":
    # Example usage
    print("=" * 70)
    print("STEP 6: HYBRID INTELLIGENCE - Score Merging Examples")
    print("=" * 70)
    
    # Example 1: Strong agreement
    print("\n📊 Example 1: Strong Agreement (Both High)")
    rule_score, rule_ai = 0.85, 0.80
    final, breakdown = calculate_hybrid_score(rule_score, rule_ai)
    print(f"  Rule Score: {rule_score:.2f} | AI Score: {rule_ai:.2f}")
    print(f"  Final Score: {final:.2f}")
    print(f"  Formula: ({rule_score:.2f}×0.6) + ({rule_ai:.2f}×0.4) = {final:.2f}")
    print(f"  Confidence: {breakdown.confidence_level} ({breakdown.confidence_score:.2f})")
    print(f"  Agreement: {breakdown.agreement}")
    
    # Example 2: Moderate disagreement
    print("\n📊 Example 2: Moderate Disagreement")
    rule_score, rule_ai = 0.75, 0.45
    final, breakdown = calculate_hybrid_score(rule_score, rule_ai)
    print(f"  Rule Score: {rule_score:.2f} | AI Score: {rule_ai:.2f}")
    print(f"  Final Score: {final:.2f}")
    print(f"  Formula: ({rule_score:.2f}×0.6) + ({rule_ai:.2f}×0.4) = {final:.2f}")
    print(f"  Confidence: {breakdown.confidence_level} ({breakdown.confidence_score:.2f})")
    print(f"  Agreement: {breakdown.agreement}")
    
    # Example 3: Weak agreement - low scores
    print("\n📊 Example 3: Strong Agreement (Both Low)")
    rule_score, rule_ai = 0.15, 0.10
    final, breakdown = calculate_hybrid_score(rule_score, rule_ai)
    print(f"  Rule Score: {rule_score:.2f} | AI Score: {rule_ai:.2f}")
    print(f"  Final Score: {final:.2f}")
    print(f"  Formula: ({rule_score:.2f}×0.6) + ({rule_ai:.2f}×0.4) = {final:.2f}")
    print(f"  Confidence: {breakdown.confidence_level}")
    print(f"  Agreement: {breakdown.agreement}")
    
    # Example 4: Integration with pipeline
    print("\n📊 Example 4: Full Pipeline Integration")
    rule_based = 0.80
    zero_shot = 0.75
    similarity = 0.70
    hybrid_score, details = merge_scores_from_pipeline(rule_based, zero_shot, similarity)
    print(f"  Rule-based Score: {rule_based:.2f}")
    print(f"  Zero-shot Score: {zero_shot:.2f}")
    print(f"  Similarity Score: {similarity:.2f}")
    print(f"  AI Score (avg): {details['ai_score']:.2f}")
    print(f"  Hybrid Final Score: {hybrid_score:.2f}")
    print(f"  Method: {details['method']}")
    
