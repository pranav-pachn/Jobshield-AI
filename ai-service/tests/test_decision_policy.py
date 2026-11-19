import pytest
from app.evaluation.decision_policy import evaluate
from app.schemas.investigation_trace import InvestigationTrace
from app.schemas.agent_contracts import InvestigationInput, InvestigationState, DecisionPolicyResult, FinalDecisionOutput
from app.evaluation.models import BetterEvaluation, EvaluationDimension, EvidenceQuality

def create_mock_trace(
    state: str = InvestigationState.COMPLETED,
    overall_risk: float = 0.0,
    confidence: float = 0.0,
    evidence_quality: str = "High",
    sources: int = 1,
    content_risk: float = 0.0,
    threat_match: float = 0.0,
    include_evaluation: bool = True,
    include_final_decision: bool = True
) -> InvestigationTrace:
    evaluation = None
    if include_evaluation:
        evaluation = BetterEvaluation(
            overall_risk=EvaluationDimension(score=overall_risk, label=""),
            confidence=confidence,
            evidence_quality=EvidenceQuality(level=evidence_quality, score=0),
            sources_used=sources,
            content_risk=EvaluationDimension(score=content_risk, label=""),
            recruiter_trust=EvaluationDimension(score=0.0, label=""),
            threat_match=EvaluationDimension(score=threat_match, label=""),
            historical_similarity=EvaluationDimension(score=0.0, label=""),
            contradictions=0,
            missing_evidence=0
        )
    final_decision = None
    if include_final_decision:
        final_decision = FinalDecisionOutput(
            verdict="SAFE" if overall_risk < 50 else "HIGH_RISK",
            riskScore=overall_risk,
            confidence=confidence / 100.0,
            why=["mock evaluation reasoning"]
        )

    return InvestigationTrace(
        investigationId="test",
        state=state,
        input=InvestigationInput(jobText="test"),
        agentTraces=[],
        createdAt="2026-01-01T00:00:00Z",
        evaluation=evaluation,
        finalDecision=final_decision
    )

def test_degraded_investigation_cannot_produce_safe_or_scam():
    # High risk + high confidence must still be HUMAN_REVIEW when DEGRADED
    trace = create_mock_trace(state=InvestigationState.DEGRADED, overall_risk=95.0, confidence=95.0)
    result = evaluate(trace)
    assert result.decision == "HUMAN_REVIEW"
    assert result.reason == "DEGRADED_INVESTIGATION"

    # Low risk + high confidence must still be HUMAN_REVIEW when DEGRADED
    trace_safe = create_mock_trace(state=InvestigationState.DEGRADED, overall_risk=10.0, confidence=95.0)
    result_safe = evaluate(trace_safe)
    assert result_safe.decision == "HUMAN_REVIEW"
    assert result_safe.reason == "DEGRADED_INVESTIGATION"

def test_partial_investigation_cannot_produce_safe_or_scam():
    # High risk + high confidence must be HUMAN_REVIEW when PARTIAL
    trace = create_mock_trace(state=InvestigationState.PARTIAL, overall_risk=90.0, confidence=90.0)
    result = evaluate(trace)
    assert result.decision == "HUMAN_REVIEW"
    assert result.reason == "PARTIAL_INVESTIGATION"

    # Low risk + high confidence must be HUMAN_REVIEW when PARTIAL
    trace_safe = create_mock_trace(state=InvestigationState.PARTIAL, overall_risk=15.0, confidence=85.0)
    result_safe = evaluate(trace_safe)
    assert result_safe.decision == "HUMAN_REVIEW"
    assert result_safe.reason == "PARTIAL_INVESTIGATION"

def test_failed_investigation_cannot_produce_normal_verdicts():
    # FAILED must remain an operational failure (decision="FAILED"), not SAFE/SCAM/normal HUMAN_REVIEW
    trace = create_mock_trace(state=InvestigationState.FAILED, overall_risk=95.0, confidence=95.0)
    result = evaluate(trace)
    assert result.decision == "FAILED"
    assert result.reason == "INVESTIGATION_FAILED"

def test_in_progress_state_cannot_produce_safe_or_scam():
    # In-progress state (e.g. INVESTIGATING) must return FAILED
    trace = create_mock_trace(state=InvestigationState.INVESTIGATING, overall_risk=10.0, confidence=90.0)
    result = evaluate(trace)
    assert result.decision == "FAILED"
    assert result.reason == "INCOMPLETE_INVESTIGATION"

def test_missing_evaluation_data_produces_failed():
    # Trace marked COMPLETED but missing evaluation must fail
    trace = create_mock_trace(state=InvestigationState.COMPLETED, include_evaluation=False)
    result = evaluate(trace)
    assert result.decision == "FAILED"
    assert result.reason == "MISSING_FINAL_DECISION"

def test_completed_missing_final_decision_high_risk_produces_failed():
    # Invariant 5: COMPLETED + evaluation present + finalDecision missing + high risk -> FAILED
    trace = create_mock_trace(
        state=InvestigationState.COMPLETED,
        overall_risk=95.0,
        confidence=90.0,
        include_evaluation=True,
        include_final_decision=False
    )
    result = evaluate(trace)
    assert result.decision == "FAILED"
    assert result.reason == "MISSING_FINAL_DECISION"
    assert result.risk == 95.0
    assert result.confidence == 90.0

def test_completed_missing_final_decision_low_risk_produces_failed():
    # Invariant 5: COMPLETED + evaluation present + finalDecision missing + low risk -> FAILED
    trace = create_mock_trace(
        state=InvestigationState.COMPLETED,
        overall_risk=15.0,
        confidence=90.0,
        include_evaluation=True,
        include_final_decision=False
    )
    result = evaluate(trace)
    assert result.decision == "FAILED"
    assert result.reason == "MISSING_FINAL_DECISION"
    assert result.risk == 15.0
    assert result.confidence == 90.0

def test_completed_with_valid_final_decision_preserves_policy_behavior():
    # COMPLETED + evaluation present + valid finalDecision -> policy behavior unchanged
    # High risk -> SCAM
    trace_scam = create_mock_trace(
        state=InvestigationState.COMPLETED,
        overall_risk=85.0,
        confidence=80.0,
        include_evaluation=True,
        include_final_decision=True
    )
    result_scam = evaluate(trace_scam)
    assert result_scam.decision == "SCAM"
    assert result_scam.reason == "SCAM_CONFIDENT"

    # Low risk -> SAFE
    trace_safe = create_mock_trace(
        state=InvestigationState.COMPLETED,
        overall_risk=20.0,
        confidence=80.0,
        include_evaluation=True,
        include_final_decision=True
    )
    result_safe = evaluate(trace_safe)
    assert result_safe.decision == "SAFE"
    assert result_safe.reason == "SAFE_CONFIDENT"

def test_insufficient_evidence_quality():
    trace = create_mock_trace(evidence_quality="Low", overall_risk=100.0, confidence=100.0)
    result = evaluate(trace)
    assert result.decision == "HUMAN_REVIEW"
    assert result.reason == "INSUFFICIENT_EVIDENCE"

def test_no_sources():
    trace = create_mock_trace(sources=0, overall_risk=100.0, confidence=100.0)
    result = evaluate(trace)
    assert result.decision == "HUMAN_REVIEW"
    assert result.reason == "INSUFFICIENT_EVIDENCE"

def test_evidence_disagreement():
    trace = create_mock_trace(content_risk=75.0, threat_match=40.0, overall_risk=100.0, confidence=100.0)
    result = evaluate(trace)
    assert result.decision == "HUMAN_REVIEW"
    assert result.reason == "EVIDENCE_DISAGREEMENT"

# SCAM boundary tests (Risk >= 75 AND Conf >= 75)
@pytest.mark.parametrize("risk,conf,expected", [
    (75.0, 75.0, "SCAM"),
    (74.9, 75.0, "HUMAN_REVIEW"),
    (75.0, 74.9, "HUMAN_REVIEW"),
    (74.9, 74.9, "HUMAN_REVIEW"),
    (80.0, 90.0, "SCAM")
])
def test_scam_boundaries(risk, conf, expected):
    trace = create_mock_trace(overall_risk=risk, confidence=conf)
    result = evaluate(trace)
    assert result.decision == expected

# SAFE boundary tests (Risk < 50 AND Conf >= 65)
@pytest.mark.parametrize("risk,conf,expected", [
    (49.9, 65.0, "SAFE"),
    (50.0, 65.0, "HUMAN_REVIEW"),
    (49.9, 64.9, "HUMAN_REVIEW"),
    (50.0, 64.9, "HUMAN_REVIEW"),
    (10.0, 90.0, "SAFE")
])
def test_safe_boundaries(risk, conf, expected):
    trace = create_mock_trace(overall_risk=risk, confidence=conf)
    result = evaluate(trace)
    assert result.decision == expected

def test_ambiguous_middle():
    # Between 50 and 75 risk
    trace = create_mock_trace(overall_risk=60.0, confidence=90.0)
    result = evaluate(trace)
    assert result.decision == "HUMAN_REVIEW"
    assert result.reason == "AMBIGUOUS_EVIDENCE"
