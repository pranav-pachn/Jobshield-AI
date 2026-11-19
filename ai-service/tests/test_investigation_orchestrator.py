import pytest
import json
import asyncio
from unittest.mock import AsyncMock, patch, MagicMock
from app.schemas.agent_contracts import (
    InvestigationInput,
    ContentInvestigatorOutput,
    RecruiterInvestigatorOutput,
    ThreatIntelligenceOutput,
    FinalDecisionOutput,
    EvidenceBundle,
    InvestigationState,
    LLMExecutionResult,
    AgentFailure
)
from app.orchestrator.investigation_orchestrator import (
    orchestrate_investigation,
    orchestrate_investigation_stream
)
from app.agents.final_decision_agent import run_final_decision_agent


def _mock_success_bundle():
    from app.schemas.agent_contracts import ThreatMatch
    return EvidenceBundle(
        contentEvidence=[], recruiterEvidence=[],
        threatEvidence=[ThreatMatch(sourceId="threat-source-1", similarity=0.1, evidenceQuality="high", relevance="low", agentConfidence=0.9, evidence="none")],
        supportingSignals=1, contradictions=0, contradictionDetails=[],
        missingEvidence=[], overallEvidenceConfidence=0.9, investigationMetadata={}
    )


def _mock_complete_final_decision(risk=20.0, conf=0.9):
    return LLMExecutionResult(
        status="COMPLETE",
        output=FinalDecisionOutput(
            verdict="SAFE" if risk < 50 else "HIGH_RISK",
            riskScore=risk,
            confidence=conf,
            why=["Reasonable explanation"],
            evidence=[{"source": "test", "claim": "valid claim"}],
            contradictions=[],
            recommendations=["Standard advice"]
        )
    )


# -------------------------------------------------------------
# 1. Regular Orchestration Tests
# -------------------------------------------------------------

@pytest.mark.asyncio
@patch('app.orchestrator.investigation_orchestrator.run_content_investigator')
@patch('app.orchestrator.investigation_orchestrator.run_recruiter_investigator')
@patch('app.orchestrator.investigation_orchestrator.run_threat_intelligence_agent')
@patch('app.orchestrator.investigation_orchestrator.run_evidence_aggregator')
@patch('app.orchestrator.investigation_orchestrator.run_final_decision_agent')
async def test_orchestrator_all_success_completed(
    mock_final, mock_agg, mock_threat, mock_recruiter, mock_content
):
    mock_content.return_value = LLMExecutionResult(status="COMPLETE", output=ContentInvestigatorOutput(riskSignals=[], riskScore=20.0, confidence=0.9))
    mock_recruiter.return_value = LLMExecutionResult(status="COMPLETE", output=RecruiterInvestigatorOutput(identitySignals=[], consistencyScore=80.0, status="success"))
    mock_threat.return_value = LLMExecutionResult(status="COMPLETE", output=ThreatIntelligenceOutput(matches=[], confidence=1.0, status="success"))
    mock_agg.return_value = _mock_success_bundle()
    mock_final.return_value = _mock_complete_final_decision(risk=20.0, conf=0.9)

    input_data = InvestigationInput(jobText="Valid job description.", recruiterName="Jane")
    trace = await orchestrate_investigation(input_data)

    assert trace.state == InvestigationState.COMPLETED
    assert trace.finalDecision is not None
    assert trace.finalDecision.verdict == "SAFE"
    assert len(trace.agentTraces) == 5
    assert all(t.status in ("success", "complete") for t in trace.agentTraces)


@pytest.mark.asyncio
@patch('app.orchestrator.investigation_orchestrator.run_content_investigator')
@patch('app.orchestrator.investigation_orchestrator.run_recruiter_investigator')
@patch('app.orchestrator.investigation_orchestrator.run_threat_intelligence_agent')
@patch('app.orchestrator.investigation_orchestrator.run_evidence_aggregator')
@patch('app.orchestrator.investigation_orchestrator.run_final_decision_agent')
async def test_orchestrator_upstream_failure_preserves_degraded(
    mock_final, mock_agg, mock_threat, mock_recruiter, mock_content
):
    mock_content.return_value = LLMExecutionResult(status="COMPLETE", output=ContentInvestigatorOutput(riskSignals=[], riskScore=20.0, confidence=0.9))
    mock_recruiter.side_effect = Exception("Recruiter API 429 rate limit")
    mock_threat.return_value = LLMExecutionResult(status="COMPLETE", output=ThreatIntelligenceOutput(matches=[], confidence=1.0, status="success"))
    mock_agg.return_value = _mock_success_bundle()
    mock_final.return_value = _mock_complete_final_decision()

    input_data = InvestigationInput(jobText="Valid job description.")
    trace = await orchestrate_investigation(input_data)

    assert trace.state == InvestigationState.DEGRADED
    assert trace.degradationReason == "upstream_agent_failures"
    assert trace.decisionPolicy.decision == "HUMAN_REVIEW"
    assert trace.decisionPolicy.reason == "DEGRADED_INVESTIGATION"


@pytest.mark.asyncio
@patch('app.orchestrator.investigation_orchestrator.run_content_investigator')
@patch('app.orchestrator.investigation_orchestrator.run_recruiter_investigator')
@patch('app.orchestrator.investigation_orchestrator.run_threat_intelligence_agent')
@patch('app.orchestrator.investigation_orchestrator.run_evidence_aggregator')
@patch('app.orchestrator.investigation_orchestrator.run_final_decision_agent')
async def test_orchestrator_final_partial_preserves_partial(
    mock_final, mock_agg, mock_threat, mock_recruiter, mock_content
):
    mock_content.return_value = LLMExecutionResult(status="COMPLETE", output=ContentInvestigatorOutput(riskSignals=[], riskScore=20.0, confidence=0.9))
    mock_recruiter.return_value = LLMExecutionResult(status="COMPLETE", output=RecruiterInvestigatorOutput(identitySignals=[], consistencyScore=80.0, status="success"))
    mock_threat.return_value = LLMExecutionResult(status="COMPLETE", output=ThreatIntelligenceOutput(matches=[], confidence=1.0, status="success"))
    mock_agg.return_value = _mock_success_bundle()
    mock_final.return_value = LLMExecutionResult(
        status="PARTIAL",
        output=FinalDecisionOutput(
            verdict="SAFE", riskScore=15.0, confidence=0.8,
            why=["Partial reasoning"], evidence=[], contradictions=[], recommendations=[]
        ),
        degradationReason="missing_evidence"
    )

    input_data = InvestigationInput(jobText="Valid job description.")
    trace = await orchestrate_investigation(input_data)

    assert trace.state == InvestigationState.PARTIAL
    assert trace.degradationReason == "missing_evidence"
    assert trace.decisionPolicy.decision == "HUMAN_REVIEW"
    assert trace.decisionPolicy.reason == "PARTIAL_INVESTIGATION"


@pytest.mark.asyncio
@patch('app.orchestrator.investigation_orchestrator.run_content_investigator')
@patch('app.orchestrator.investigation_orchestrator.run_recruiter_investigator')
@patch('app.orchestrator.investigation_orchestrator.run_threat_intelligence_agent')
@patch('app.orchestrator.investigation_orchestrator.run_evidence_aggregator')
@patch('app.orchestrator.investigation_orchestrator.run_final_decision_agent')
async def test_orchestrator_final_failed_preserves_failed(
    mock_final, mock_agg, mock_threat, mock_recruiter, mock_content
):
    mock_content.return_value = LLMExecutionResult(status="COMPLETE", output=ContentInvestigatorOutput(riskSignals=[], riskScore=20.0, confidence=0.9))
    mock_recruiter.return_value = LLMExecutionResult(status="COMPLETE", output=RecruiterInvestigatorOutput(identitySignals=[], consistencyScore=80.0, status="success"))
    mock_threat.return_value = LLMExecutionResult(status="COMPLETE", output=ThreatIntelligenceOutput(matches=[], confidence=1.0, status="success"))
    mock_agg.return_value = _mock_success_bundle()
    mock_final.return_value = LLMExecutionResult(status="FAILED", output=None, degradationReason="all_providers_exhausted")

    input_data = InvestigationInput(jobText="Valid job description.")
    trace = await orchestrate_investigation(input_data)

    assert trace.state == InvestigationState.FAILED
    assert trace.decisionPolicy.decision == "FAILED"
    assert trace.decisionPolicy.reason == "INVESTIGATION_FAILED"
    assert trace.evaluation is None


@pytest.mark.asyncio
@patch('app.orchestrator.investigation_orchestrator.run_content_investigator')
@patch('app.orchestrator.investigation_orchestrator.run_recruiter_investigator')
@patch('app.orchestrator.investigation_orchestrator.run_threat_intelligence_agent')
@patch('app.orchestrator.investigation_orchestrator.run_evidence_aggregator')
@patch('app.orchestrator.investigation_orchestrator.run_final_decision_agent')
async def test_orchestrator_final_missing_output_fails(
    mock_final, mock_agg, mock_threat, mock_recruiter, mock_content
):
    mock_content.return_value = LLMExecutionResult(status="COMPLETE", output=ContentInvestigatorOutput(riskSignals=[], riskScore=20.0, confidence=0.9))
    mock_recruiter.return_value = LLMExecutionResult(status="COMPLETE", output=RecruiterInvestigatorOutput(identitySignals=[], consistencyScore=80.0, status="success"))
    mock_threat.return_value = LLMExecutionResult(status="COMPLETE", output=ThreatIntelligenceOutput(matches=[], confidence=1.0, status="success"))
    mock_agg.return_value = _mock_success_bundle()
    # status claims COMPLETE, but output is unexpectedly None
    mock_final.return_value = LLMExecutionResult(status="COMPLETE", output=None)

    input_data = InvestigationInput(jobText="Valid job description.")
    trace = await orchestrate_investigation(input_data)

    assert trace.state == InvestigationState.FAILED
    assert trace.decisionPolicy.decision == "FAILED"


@pytest.mark.asyncio
@patch('app.orchestrator.investigation_orchestrator.run_content_investigator')
@patch('app.orchestrator.investigation_orchestrator.run_recruiter_investigator')
@patch('app.orchestrator.investigation_orchestrator.run_threat_intelligence_agent')
@patch('app.orchestrator.investigation_orchestrator.run_evidence_aggregator')
async def test_orchestrator_aggregator_failure_fails_fast(
    mock_agg, mock_threat, mock_recruiter, mock_content
):
    mock_content.return_value = LLMExecutionResult(status="COMPLETE", output=ContentInvestigatorOutput(riskSignals=[], riskScore=20.0, confidence=0.9))
    mock_recruiter.return_value = LLMExecutionResult(status="COMPLETE", output=RecruiterInvestigatorOutput(identitySignals=[], consistencyScore=80.0, status="success"))
    mock_threat.return_value = LLMExecutionResult(status="COMPLETE", output=ThreatIntelligenceOutput(matches=[], confidence=1.0, status="success"))
    mock_agg.side_effect = RuntimeError("Evidence schema corruption")

    input_data = InvestigationInput(jobText="Valid job description.")
    trace = await orchestrate_investigation(input_data)

    assert trace.state == InvestigationState.FAILED
    assert "evidence_aggregation_failed" in trace.degradationReason
    assert trace.decisionPolicy.decision == "FAILED"


# -------------------------------------------------------------
# 2. SSE Streaming Orchestration Tests
# -------------------------------------------------------------

@pytest.mark.asyncio
@patch('app.orchestrator.investigation_orchestrator.run_content_investigator')
@patch('app.orchestrator.investigation_orchestrator.run_recruiter_investigator')
@patch('app.orchestrator.investigation_orchestrator.run_threat_intelligence_agent')
@patch('app.orchestrator.investigation_orchestrator.run_evidence_aggregator')
@patch('app.orchestrator.investigation_orchestrator.run_final_decision_agent')
async def test_sse_stream_all_success_completed(
    mock_final, mock_agg, mock_threat, mock_recruiter, mock_content
):
    mock_content.return_value = LLMExecutionResult(status="COMPLETE", output=ContentInvestigatorOutput(riskSignals=[], riskScore=20.0, confidence=0.9))
    mock_recruiter.return_value = LLMExecutionResult(status="COMPLETE", output=RecruiterInvestigatorOutput(identitySignals=[], consistencyScore=80.0, status="success"))
    mock_threat.return_value = LLMExecutionResult(status="COMPLETE", output=ThreatIntelligenceOutput(matches=[], confidence=1.0, status="success"))
    mock_agg.return_value = _mock_success_bundle()
    mock_final.return_value = _mock_complete_final_decision()

    input_data = InvestigationInput(jobText="Valid job description.")
    events = []
    async for chunk in orchestrate_investigation_stream(input_data):
        if chunk.startswith("data: "):
            events.append(json.loads(chunk[6:].strip()))

    complete_event = next(e for e in events if e.get("event") == "COMPLETE")
    assert complete_event["trace"]["state"] == InvestigationState.COMPLETED
    assert complete_event["trace"]["decisionPolicy"]["decision"] == "SAFE"


@pytest.mark.asyncio
@patch('app.orchestrator.investigation_orchestrator.run_content_investigator')
@patch('app.orchestrator.investigation_orchestrator.run_recruiter_investigator')
@patch('app.orchestrator.investigation_orchestrator.run_threat_intelligence_agent')
@patch('app.orchestrator.investigation_orchestrator.run_evidence_aggregator')
@patch('app.orchestrator.investigation_orchestrator.run_final_decision_agent')
async def test_sse_stream_upstream_failure_preserves_degraded(
    mock_final, mock_agg, mock_threat, mock_recruiter, mock_content
):
    mock_content.return_value = LLMExecutionResult(status="FAILED", output=None, degradationReason="content_error")
    mock_recruiter.return_value = LLMExecutionResult(status="COMPLETE", output=RecruiterInvestigatorOutput(identitySignals=[], consistencyScore=80.0, status="success"))
    mock_threat.return_value = LLMExecutionResult(status="COMPLETE", output=ThreatIntelligenceOutput(matches=[], confidence=1.0, status="success"))
    mock_agg.return_value = _mock_success_bundle()
    mock_final.return_value = _mock_complete_final_decision()

    input_data = InvestigationInput(jobText="Valid job description.")
    events = []
    async for chunk in orchestrate_investigation_stream(input_data):
        if chunk.startswith("data: "):
            events.append(json.loads(chunk[6:].strip()))

    # Verify agent completion event reports actual failed status
    content_event = next(e for e in events if e.get("event") == "AGENT_COMPLETED" and e.get("agent") == "content_investigator")
    assert content_event["trace"]["status"] == "failed"

    complete_event = next(e for e in events if e.get("event") == "COMPLETE")
    assert complete_event["trace"]["state"] == InvestigationState.DEGRADED
    assert complete_event["trace"]["decisionPolicy"]["decision"] == "HUMAN_REVIEW"


@pytest.mark.asyncio
@patch('app.orchestrator.investigation_orchestrator.run_content_investigator')
@patch('app.orchestrator.investigation_orchestrator.run_recruiter_investigator')
@patch('app.orchestrator.investigation_orchestrator.run_threat_intelligence_agent')
@patch('app.orchestrator.investigation_orchestrator.run_evidence_aggregator')
@patch('app.orchestrator.investigation_orchestrator.run_final_decision_agent')
async def test_sse_stream_final_partial_preserves_partial(
    mock_final, mock_agg, mock_threat, mock_recruiter, mock_content
):
    mock_content.return_value = LLMExecutionResult(status="COMPLETE", output=ContentInvestigatorOutput(riskSignals=[], riskScore=20.0, confidence=0.9))
    mock_recruiter.return_value = LLMExecutionResult(status="COMPLETE", output=RecruiterInvestigatorOutput(identitySignals=[], consistencyScore=80.0, status="success"))
    mock_threat.return_value = LLMExecutionResult(status="COMPLETE", output=ThreatIntelligenceOutput(matches=[], confidence=1.0, status="success"))
    mock_agg.return_value = _mock_success_bundle()
    mock_final.return_value = LLMExecutionResult(
        status="PARTIAL",
        output=FinalDecisionOutput(
            verdict="SAFE", riskScore=20.0, confidence=0.9,
            why=["Partial"], evidence=[], contradictions=[], recommendations=[]
        ),
        degradationReason="missing_recommendations"
    )

    input_data = InvestigationInput(jobText="Valid job description.")
    events = []
    async for chunk in orchestrate_investigation_stream(input_data):
        if chunk.startswith("data: "):
            events.append(json.loads(chunk[6:].strip()))

    complete_event = next(e for e in events if e.get("event") == "COMPLETE")
    assert complete_event["trace"]["state"] == InvestigationState.PARTIAL
    assert complete_event["trace"]["decisionPolicy"]["decision"] == "HUMAN_REVIEW"


@pytest.mark.asyncio
@patch('app.orchestrator.investigation_orchestrator.run_content_investigator')
@patch('app.orchestrator.investigation_orchestrator.run_recruiter_investigator')
@patch('app.orchestrator.investigation_orchestrator.run_threat_intelligence_agent')
@patch('app.orchestrator.investigation_orchestrator.run_evidence_aggregator')
@patch('app.orchestrator.investigation_orchestrator.run_final_decision_agent')
async def test_sse_stream_final_failed_preserves_failed(
    mock_final, mock_agg, mock_threat, mock_recruiter, mock_content
):
    mock_content.return_value = LLMExecutionResult(status="COMPLETE", output=ContentInvestigatorOutput(riskSignals=[], riskScore=20.0, confidence=0.9))
    mock_recruiter.return_value = LLMExecutionResult(status="COMPLETE", output=RecruiterInvestigatorOutput(identitySignals=[], consistencyScore=80.0, status="success"))
    mock_threat.return_value = LLMExecutionResult(status="COMPLETE", output=ThreatIntelligenceOutput(matches=[], confidence=1.0, status="success"))
    mock_agg.return_value = _mock_success_bundle()
    mock_final.return_value = LLMExecutionResult(status="FAILED", output=None, degradationReason="gateway_down")

    input_data = InvestigationInput(jobText="Valid job description.")
    events = []
    async for chunk in orchestrate_investigation_stream(input_data):
        if chunk.startswith("data: "):
            events.append(json.loads(chunk[6:].strip()))

    final_event = next(e for e in events if e.get("event") == "AGENT_COMPLETED" and e.get("agent") == "final_decision_agent")
    assert final_event["trace"]["status"] == "failed"

    complete_event = next(e for e in events if e.get("event") == "COMPLETE")
    assert complete_event["trace"]["state"] == InvestigationState.FAILED
    assert complete_event["trace"]["decisionPolicy"]["decision"] == "FAILED"


@pytest.mark.asyncio
@patch('app.orchestrator.investigation_orchestrator.run_content_investigator')
@patch('app.orchestrator.investigation_orchestrator.run_recruiter_investigator')
@patch('app.orchestrator.investigation_orchestrator.run_threat_intelligence_agent')
@patch('app.orchestrator.investigation_orchestrator.run_evidence_aggregator')
async def test_sse_stream_aggregator_failure_emits_structured_failed_complete(
    mock_agg, mock_threat, mock_recruiter, mock_content
):
    mock_content.return_value = LLMExecutionResult(status="COMPLETE", output=ContentInvestigatorOutput(riskSignals=[], riskScore=20.0, confidence=0.9))
    mock_recruiter.return_value = LLMExecutionResult(status="COMPLETE", output=RecruiterInvestigatorOutput(identitySignals=[], consistencyScore=80.0, status="success"))
    mock_threat.return_value = LLMExecutionResult(status="COMPLETE", output=ThreatIntelligenceOutput(matches=[], confidence=1.0, status="success"))
    mock_agg.side_effect = RuntimeError("Aggregation failure")

    input_data = InvestigationInput(jobText="Valid job description.")
    events = []
    async for chunk in orchestrate_investigation_stream(input_data):
        if chunk.startswith("data: "):
            events.append(json.loads(chunk[6:].strip()))

    agg_event = next(e for e in events if e.get("event") == "AGENT_COMPLETED" and e.get("agent") == "evidence_aggregator")
    assert agg_event["trace"]["status"] == "failed"

    complete_event = next(e for e in events if e.get("event") == "COMPLETE")
    assert complete_event["trace"]["state"] == InvestigationState.FAILED
    assert complete_event["trace"]["decisionPolicy"]["decision"] == "FAILED"


@pytest.mark.asyncio
@patch('app.orchestrator.investigation_orchestrator.run_content_investigator')
@patch('app.orchestrator.investigation_orchestrator.run_recruiter_investigator')
@patch('app.orchestrator.investigation_orchestrator.run_threat_intelligence_agent')
async def test_sse_stream_disconnect_cancels_and_awaits(
    mock_threat, mock_recruiter, mock_content
):
    # Mock long running tasks
    async def slow_agent(*args, **kwargs):
        await asyncio.sleep(5)
        return LLMExecutionResult(status="COMPLETE", output=None)

    mock_content.side_effect = slow_agent
    mock_recruiter.side_effect = slow_agent
    mock_threat.side_effect = slow_agent

    mock_request = MagicMock()
    # First call returns False, then True (disconnected)
    mock_request.is_disconnected = AsyncMock(side_effect=[False, True])

    input_data = InvestigationInput(jobText="Valid job text")
    events = []
    async for chunk in orchestrate_investigation_stream(input_data, request=mock_request):
        events.append(chunk)

    # After disconnect, generator returns cleanly without reaching the final COMPLETE event
    assert not any('"event": "COMPLETE"' in e for e in events)


# -------------------------------------------------------------
# 3. Final Decision Agent Hardening Tests
# -------------------------------------------------------------

@pytest.mark.asyncio
@patch('app.agents.final_decision_agent.call_llm_json')
async def test_final_decision_agent_missing_output_fails(mock_call):
    mock_call.return_value = LLMExecutionResult(status="COMPLETE", output=None)
    res = await run_final_decision_agent(InvestigationInput(jobText="test"), _mock_success_bundle())
    assert res.status == "FAILED"
    assert res.degradationReason == "missing_final_decision_output"


@pytest.mark.asyncio
@patch('app.agents.final_decision_agent.call_llm_json')
async def test_final_decision_agent_empty_contradictions_not_partial(mock_call):
    # Zero contradictions is legitimate; must remain COMPLETE
    output = FinalDecisionOutput(
        verdict="SAFE",
        riskScore=10.0,
        confidence=0.9,
        why=["Clear proof"],
        evidence=[{"source": "test", "claim": "no flags"}],
        contradictions=[],
        recommendations=["Proceed"]
    )
    mock_call.return_value = LLMExecutionResult(status="COMPLETE", output=output)
    res = await run_final_decision_agent(InvestigationInput(jobText="test"), _mock_success_bundle())
    assert res.status == "COMPLETE"
    assert res.output.contradictions == []


@pytest.mark.asyncio
@patch('app.agents.final_decision_agent.call_llm_json')
async def test_final_decision_agent_missing_recommendations_demotes_to_partial(mock_call):
    output = FinalDecisionOutput(
        verdict="SAFE",
        riskScore=10.0,
        confidence=0.9,
        why=["Clear proof"],
        evidence=[{"source": "test", "claim": "no flags"}],
        contradictions=[],
        recommendations=[]
    )
    mock_call.return_value = LLMExecutionResult(status="COMPLETE", output=output)
    res = await run_final_decision_agent(InvestigationInput(jobText="test"), _mock_success_bundle())
    assert res.status == "PARTIAL"
    assert "missing_recommendations" in res.degradationReason


@pytest.mark.asyncio
@patch('app.agents.final_decision_agent.call_llm_json')
async def test_final_decision_agent_invalid_fields_fails(mock_call):
    output = FinalDecisionOutput(
        verdict="SAFE",
        riskScore=10.0,
        confidence=0.9,
        why=[],  # Empty why explanation is invalid
        evidence=[{"source": "test", "claim": "claim"}],
        contradictions=[],
        recommendations=["advice"]
    )
    mock_call.return_value = LLMExecutionResult(status="COMPLETE", output=output)
    res = await run_final_decision_agent(InvestigationInput(jobText="test"), _mock_success_bundle())
    assert res.status == "FAILED"
    assert res.degradationReason == "missing_decision_explanation"
