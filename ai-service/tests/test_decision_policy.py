import pytest
from app.evaluation.decision_policy import evaluate
from app.schemas.investigation_trace import InvestigationTrace
from app.schemas.agent_contracts import InvestigationInput, InvestigationState, DecisionPolicyResult
from app.evaluation.models import BetterEvaluation, EvaluationDimension, EvidenceQuality

def create_mock_trace(
    state: str = InvestigationState.COMPLETED,
    overall_risk: float = 0.0,
    confidence: float = 0.0,
    evidence_quality: str = "High",
    sources: int = 1,
    content_risk: float = 0.0,
    threat_match: float = 0.0
) -> InvestigationTrace:
    return InvestigationTrace(
        investigationId="test",
        state=state,
        input=InvestigationInput(jobText="test"),
        agentTraces=[],
        createdAt="2026-01-01T00:00:00Z",
        evaluation=BetterEvaluation(
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
    )

def test_degraded_investigation():
    trace = create_mock_trace(state=InvestigationState.DEGRADED, overall_risk=100.0, confidence=100.0)
    result = evaluate(trace)
    assert result.decision == "HUMAN_REVIEW"
    assert result.reason == "DEGRADED_INVESTIGATION"

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
