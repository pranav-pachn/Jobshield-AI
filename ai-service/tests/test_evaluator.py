import pytest
from app.schemas.agent_contracts import (
    ContentInvestigatorOutput,
    RecruiterInvestigatorOutput,
    ThreatIntelligenceOutput,
    AgentFailure,
    Signal,
    ThreatMatch,
    EvidenceBundle,
    FinalDecisionOutput,
    InvestigationInput
)
from app.schemas.investigation_trace import InvestigationTrace, AgentTrace
from app.evaluation.evaluator import (
    calculate_content_risk,
    calculate_recruiter_trust,
    calculate_threat_match,
    calculate_historical_similarity,
    calculate_overall_risk,
    calculate_evidence_quality,
    evaluate
)
from datetime import datetime, timezone

def test_content_risk_from_signals():
    out = ContentInvestigatorOutput(
        riskSignals=[
            Signal(signal="A", severity="critical", confidence=1.0, evidence=""),
            Signal(signal="B", severity="high", confidence=0.8, evidence="")
        ],
        riskScore=0.0,
        confidence=0.0
    )
    # critical * 1.0 * 100 = 100
    # high * 0.8 * 100 = 0.75 * 0.8 * 100 = 60
    # total = 160 -> clamped to 100
    assert calculate_content_risk(out) == 100.0

def test_content_risk_falls_back_to_riskScore():
    out = ContentInvestigatorOutput(
        riskSignals=[],
        riskScore=42.5,
        confidence=0.0
    )
    assert calculate_content_risk(out) == 42.5

def test_content_risk_agent_failure():
    out = AgentFailure(agent="content_investigator", reason="error", fallback="empty_results")
    assert calculate_content_risk(out) == 0.0

def test_recruiter_trust_success():
    out = RecruiterInvestigatorOutput(
        identitySignals=[],
        consistencyScore=24.0,
        status="success"
    )
    assert calculate_recruiter_trust(out) == 24.0

def test_recruiter_trust_insufficient_evidence():
    out = RecruiterInvestigatorOutput(
        identitySignals=[],
        consistencyScore=0.0,
        status="insufficient_evidence"
    )
    assert calculate_recruiter_trust(out) == 50.0

def test_recruiter_trust_agent_failure():
    out = AgentFailure(agent="recruiter", reason="error", fallback="insufficient_evidence")
    assert calculate_recruiter_trust(out) == 50.0

def test_threat_match_peak_selection():
    out = ThreatIntelligenceOutput(
        matches=[
            ThreatMatch(sourceId="1", similarity=0.9, relevance="low", evidenceQuality="high", agentConfidence=0.9, evidence=""),
            ThreatMatch(sourceId="2", similarity=0.8, relevance="high", evidenceQuality="high", agentConfidence=0.9, evidence="")
        ],
        confidence=1.0
    )
    # match 1: 0.9 * 0.5 * 100 = 45
    # match 2: 0.8 * 1.0 * 100 = 80
    assert calculate_threat_match(out) == 80.0

def test_threat_match_empty():
    out = ThreatIntelligenceOutput(matches=[], confidence=1.0)
    assert calculate_threat_match(out) == 0.0

def test_historical_similarity():
    out = ThreatIntelligenceOutput(
        matches=[
            ThreatMatch(sourceId="1", similarity=0.93, relevance="low", evidenceQuality="high", agentConfidence=0.9, evidence=""),
            ThreatMatch(sourceId="2", similarity=0.8, relevance="high", evidenceQuality="high", agentConfidence=0.9, evidence="")
        ],
        confidence=1.0
    )
    assert calculate_historical_similarity(out) == 93.0

def test_overall_risk_semantics():
    # content_risk = 91
    # recruiter_trust = 24 -> risk = 76
    # threat_match = 87
    # historical_similarity = 93
    # 91 * 0.35 + 76 * 0.20 + 87 * 0.25 + 93 * 0.20
    # = 31.85 + 15.2 + 21.75 + 18.6 = 87.4
    assert calculate_overall_risk(91.0, 24.0, 87.0, 93.0) == 87.4

def test_overall_risk_bounds():
    assert calculate_overall_risk(200.0, -50.0, 150.0, 200.0) == 100.0
    assert calculate_overall_risk(0.0, 100.0, 0.0, 0.0) == 0.0

def test_evidence_quality_high():
    bundle = EvidenceBundle(
        contentEvidence=[], recruiterEvidence=[], threatEvidence=[],
        supportingSignals=5, # 5 * 5 = 25 (capped at 20)
        contradictions=0,
        contradictionDetails=[],
        missingEvidence=[],
        overallEvidenceConfidence=0.9, # 90
        investigationMetadata={}
    )
    # 90 + 20 - 0 - 0 = 110 -> 100
    q = calculate_evidence_quality(bundle)
    assert q.score == 100.0
    assert q.level == "High"

def test_evidence_quality_degraded():
    bundle = EvidenceBundle(
        contentEvidence=[], recruiterEvidence=[], threatEvidence=[],
        supportingSignals=2, # +10
        contradictions=1, # -10
        contradictionDetails=[],
        missingEvidence=["test"], # -8
        overallEvidenceConfidence=0.5, # 50
        investigationMetadata={}
    )
    # 50 + 10 - 10 - 8 = 42
    q = calculate_evidence_quality(bundle)
    assert q.score == 42.0
    assert q.level == "Medium"

def test_evidence_quality_level_thresholds():
    bundle = EvidenceBundle(
        contentEvidence=[], recruiterEvidence=[], threatEvidence=[],
        supportingSignals=0, contradictions=0, contradictionDetails=[], missingEvidence=[],
        overallEvidenceConfidence=0.39, investigationMetadata={}
    )
    assert calculate_evidence_quality(bundle).level == "Low"

def test_deterministic_output():
    dt = datetime.now(timezone.utc)
    trace = InvestigationTrace(
        investigationId="1",
        state="COMPLETED",
        input=InvestigationInput(jobText="test"),
        agentTraces=[],
        createdAt=dt,
        contentFindings=ContentInvestigatorOutput(riskSignals=[], riskScore=91, confidence=0.9),
        recruiterFindings=RecruiterInvestigatorOutput(identitySignals=[], consistencyScore=24, status="success"),
        threatFindings=ThreatIntelligenceOutput(
            matches=[ThreatMatch(sourceId="src1", similarity=0.93, evidenceQuality="high", relevance="high", agentConfidence=0.9, evidence="")],
            confidence=0.9
        ),
        evidenceAggregation=EvidenceBundle(
            contentEvidence=[], recruiterEvidence=[], threatEvidence=[
                ThreatMatch(sourceId="src1", similarity=0.93, evidenceQuality="high", relevance="high", agentConfidence=0.9, evidence="")
            ],
            supportingSignals=4, contradictions=1, contradictionDetails=[], missingEvidence=[],
            overallEvidenceConfidence=0.92, investigationMetadata={}
        ),
        finalDecision=FinalDecisionOutput(verdict="HIGH_RISK", riskScore=89, confidence=0.94, why=[], evidence=[], contradictions=[], recommendations=[])
    )
    
    eval1 = evaluate(trace)
    eval2 = evaluate(trace)
    assert eval1.model_dump() == eval2.model_dump()
    assert eval1.sources_used == 1
    assert eval1.missing_evidence == 0

def test_sources_counted():
    bundle = EvidenceBundle(
        contentEvidence=[], recruiterEvidence=[],
        threatEvidence=[
            ThreatMatch(sourceId="1", similarity=0.9, relevance="high", evidenceQuality="high", agentConfidence=0.9, evidence=""),
            ThreatMatch(sourceId="1", similarity=0.8, relevance="low", evidenceQuality="high", agentConfidence=0.8, evidence=""),
            ThreatMatch(sourceId="2", similarity=0.7, relevance="medium", evidenceQuality="high", agentConfidence=0.7, evidence=""),
        ],
        supportingSignals=0, contradictions=0, contradictionDetails=[], missingEvidence=[], overallEvidenceConfidence=0.5, investigationMetadata={}
    )
    trace = InvestigationTrace(
        investigationId="1", state="COMPLETED", input=InvestigationInput(jobText=""), agentTraces=[], createdAt=datetime.now(),
        evidenceAggregation=bundle, finalDecision=FinalDecisionOutput(verdict="SAFE", riskScore=0, confidence=0, why=[], evidence=[], contradictions=[], recommendations=[])
    )
    assert evaluate(trace).sources_used == 2

def test_missing_evidence_count():
    bundle = EvidenceBundle(
        contentEvidence=[], recruiterEvidence=[], threatEvidence=[],
        supportingSignals=0, contradictions=0, contradictionDetails=[],
        missingEvidence=["a", "b"], overallEvidenceConfidence=0.5, investigationMetadata={}
    )
    trace = InvestigationTrace(
        investigationId="1", state="COMPLETED", input=InvestigationInput(jobText=""), agentTraces=[], createdAt=datetime.now(),
        evidenceAggregation=bundle, finalDecision=FinalDecisionOutput(verdict="SAFE", riskScore=0, confidence=0, why=[], evidence=[], contradictions=[], recommendations=[])
    )
    assert evaluate(trace).missing_evidence == 2

def test_empty_trace():
    trace = InvestigationTrace(
        investigationId="1", state="COMPLETED", input=InvestigationInput(jobText=""), agentTraces=[], createdAt=datetime.now()
    )
    ev = evaluate(trace)
    assert ev.content_risk.score == 0.0
    assert ev.recruiter_trust.score == 50.0
    assert ev.overall_risk.score == 10.0 # 50 recruiter risk * 0.20 = 10
    assert ev.evidence_quality.level == "Low"

def test_score_label_boundaries():
    from app.evaluation.evaluator import score_to_label
    assert score_to_label(80.0) == "Very High"
    assert score_to_label(79.9) == "High"
    assert score_to_label(60.0) == "High"
    assert score_to_label(59.9) == "Medium"
    assert score_to_label(40.0) == "Medium"
    assert score_to_label(39.9) == "Low"
