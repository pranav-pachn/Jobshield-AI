from app.schemas.investigation_trace import InvestigationTrace
from app.schemas.agent_contracts import DecisionPolicyResult, InvestigationState

def evaluate(trace: InvestigationTrace) -> DecisionPolicyResult:
    """
    Decision Policy V1
    Deterministically evaluates the investigation trace to produce a final SAFE, SCAM, or HUMAN_REVIEW decision.
    """
    # Extract evaluation scores
    risk = 0.0
    confidence = 0.0
    evidence_quality = "UNKNOWN"
    sources = 0
    content_risk = 0.0
    threat_match = 0.0

    if trace.evaluation:
        be = trace.evaluation
        if be.overall_risk:
            risk = be.overall_risk.score
        if be.confidence:
            confidence = be.confidence
        if be.evidence_quality:
            evidence_quality = be.evidence_quality.level
        if be.sources_used is not None:
            sources = be.sources_used
        if be.content_risk:
            content_risk = be.content_risk.score
        if be.threat_match:
            threat_match = be.threat_match.score

    # 1. DEGRADED? -> HUMAN_REVIEW
    if trace.state == InvestigationState.DEGRADED:
        return DecisionPolicyResult(
            decision="HUMAN_REVIEW",
            policy_version="v1",
            reason="DEGRADED_INVESTIGATION",
            risk=risk,
            confidence=confidence
        )

    # 2. Evidence critically insufficient? -> HUMAN_REVIEW
    if evidence_quality == "Low" or sources == 0:
        return DecisionPolicyResult(
            decision="HUMAN_REVIEW",
            policy_version="v1",
            reason="INSUFFICIENT_EVIDENCE",
            risk=risk,
            confidence=confidence
        )

    # 3. Strong evidence disagreement? -> HUMAN_REVIEW
    if content_risk >= 70 and threat_match < 50:
        return DecisionPolicyResult(
            decision="HUMAN_REVIEW",
            policy_version="v1",
            reason="EVIDENCE_DISAGREEMENT",
            risk=risk,
            confidence=confidence
        )

    # 4. SCAM threshold
    if risk >= 75 and confidence >= 75:
        return DecisionPolicyResult(
            decision="SCAM",
            policy_version="v1",
            reason="SCAM_CONFIDENT",
            risk=risk,
            confidence=confidence
        )

    # 5. SAFE threshold
    if risk < 50 and confidence >= 65:
        return DecisionPolicyResult(
            decision="SAFE",
            policy_version="v1",
            reason="SAFE_CONFIDENT",
            risk=risk,
            confidence=confidence
        )

    # 6. Otherwise -> HUMAN_REVIEW
    return DecisionPolicyResult(
        decision="HUMAN_REVIEW",
        policy_version="v1",
        reason="AMBIGUOUS_EVIDENCE",
        risk=risk,
        confidence=confidence
    )
