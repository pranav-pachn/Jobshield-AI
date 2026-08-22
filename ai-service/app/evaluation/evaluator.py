import logging
from typing import Union, List

from app.schemas.agent_contracts import (
    ContentInvestigatorOutput,
    RecruiterInvestigatorOutput,
    ThreatIntelligenceOutput,
    EvidenceBundle,
    AgentFailure,
    Signal,
    ThreatMatch
)
from app.schemas.investigation_trace import InvestigationTrace
from app.evaluation.models import BetterEvaluation, EvaluationDimension, EvidenceQuality

logger = logging.getLogger(__name__)

def clamp(value: float, min_val: float, max_val: float) -> float:
    return max(min_val, min(value, max_val))

def score_to_label(score: float) -> str:
    if score >= 80:
        return "Very High"
    if score >= 60:
        return "High"
    if score >= 40:
        return "Medium"
    return "Low"

def calculate_content_risk(content: Union[ContentInvestigatorOutput, AgentFailure, None]) -> float:
    if content is None or isinstance(content, AgentFailure):
        return 0.0
    
    if not content.riskSignals:
        return float(content.riskScore)
        
    severity_weights = {
        "low": 0.25,
        "medium": 0.5,
        "high": 0.75,
        "critical": 1.0
    }
    
    weighted_sum = 0.0
    for signal in content.riskSignals:
        weight = severity_weights.get(signal.severity, 0.5)
        weighted_sum += weight * signal.confidence * 100
        
    return clamp(weighted_sum, 0.0, 100.0)

def calculate_recruiter_trust(recruiter: Union[RecruiterInvestigatorOutput, AgentFailure, None]) -> float:
    if recruiter is None or isinstance(recruiter, AgentFailure):
        return 50.0
    if recruiter.status == "insufficient_evidence":
        return 50.0
    return float(recruiter.consistencyScore)

def calculate_threat_match(threat: Union[ThreatIntelligenceOutput, AgentFailure, None]) -> float:
    if threat is None or isinstance(threat, AgentFailure) or not threat.matches:
        return 0.0
        
    relevance_weights = {
        "low": 0.5,
        "medium": 0.75,
        "high": 1.0
    }
    
    max_score = 0.0
    for match in threat.matches:
        weight = relevance_weights.get(match.relevance, 0.5)
        score = match.similarity * weight * 100
        if score > max_score:
            max_score = score
            
    return clamp(max_score, 0.0, 100.0)

def calculate_historical_similarity(threat: Union[ThreatIntelligenceOutput, AgentFailure, None]) -> float:
    if threat is None or isinstance(threat, AgentFailure) or not threat.matches:
        return 0.0
    
    max_sim = max(match.similarity for match in threat.matches)
    return clamp(max_sim * 100, 0.0, 100.0)

def calculate_overall_risk(content_risk: float, recruiter_trust: float, threat_match: float, historical_similarity: float) -> float:
    # Recruiter risk is the inverse of trust
    recruiter_risk = 100.0 - recruiter_trust
    
    # These weights are V1 policy weights, not ML-learned weights.
    # They should be validated against the Phase 4 holdout dataset later.
    score = (
        content_risk * 0.35
        + recruiter_risk * 0.20
        + threat_match * 0.25
        + historical_similarity * 0.20
    )
    
    return clamp(round(score, 1), 0.0, 100.0)

def calculate_evidence_quality(bundle: EvidenceBundle) -> EvidenceQuality:
    base = bundle.overallEvidenceConfidence * 100
    signal_bonus = min(bundle.supportingSignals * 5, 20)
    contradiction_penalty = bundle.contradictions * 10
    missing_penalty = len(bundle.missingEvidence) * 8
    
    score = clamp(base + signal_bonus - contradiction_penalty - missing_penalty, 0.0, 100.0)
    
    if score >= 70:
        level = "High"
    elif score >= 40:
        level = "Medium"
    else:
        level = "Low"
        
    return EvidenceQuality(level=level, score=round(score, 1))

def evaluate(trace: InvestigationTrace) -> BetterEvaluation:
    # Content Risk
    c_risk_val = calculate_content_risk(trace.contentFindings)
    content_risk = EvaluationDimension(score=round(c_risk_val, 1), label=score_to_label(c_risk_val))
    
    # Recruiter Trust
    r_trust_val = calculate_recruiter_trust(trace.recruiterFindings)
    recruiter_trust = EvaluationDimension(score=round(r_trust_val, 1), label=score_to_label(r_trust_val))
    
    # Threat Match
    t_match_val = calculate_threat_match(trace.threatFindings)
    threat_match = EvaluationDimension(score=round(t_match_val, 1), label=score_to_label(t_match_val))
    
    # Historical Similarity
    h_sim_val = calculate_historical_similarity(trace.threatFindings)
    historical_similarity = EvaluationDimension(score=round(h_sim_val, 1), label=score_to_label(h_sim_val))
    
    # Overall Risk
    o_risk_val = calculate_overall_risk(c_risk_val, r_trust_val, t_match_val, h_sim_val)
    overall_risk = EvaluationDimension(score=round(o_risk_val, 1), label=score_to_label(o_risk_val))
    
    # Evidence Quality, Sources Used, Contradictions, Missing Evidence
    if trace.evidenceAggregation:
        bundle = trace.evidenceAggregation
        evidence_quality = calculate_evidence_quality(bundle)
        sources_used = len(set(m.sourceId for m in bundle.threatEvidence)) if bundle.threatEvidence else 0
        contradictions = bundle.contradictions
        missing_evidence = len(bundle.missingEvidence)
    else:
        # Fallback if aggregation didn't run or failed
        evidence_quality = EvidenceQuality(level="Low", score=0.0)
        sources_used = 0
        contradictions = 0
        missing_evidence = 0
        
    # Confidence
    confidence_val = round(trace.finalDecision.confidence * 100, 1) if trace.finalDecision else 0.0
    
    return BetterEvaluation(
        content_risk=content_risk,
        recruiter_trust=recruiter_trust,
        threat_match=threat_match,
        historical_similarity=historical_similarity,
        overall_risk=overall_risk,
        evidence_quality=evidence_quality,
        confidence=confidence_val,
        sources_used=sources_used,
        contradictions=contradictions,
        missing_evidence=missing_evidence
    )
