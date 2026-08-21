import pytest
from unittest.mock import AsyncMock, patch
from app.schemas.agent_contracts import (
    InvestigationInput,
    ContentInvestigatorOutput,
    RecruiterInvestigatorOutput,
    ThreatIntelligenceOutput,
    FinalDecisionOutput,
    EvidenceBundle,
    InvestigationState
)
from app.orchestrator.investigation_orchestrator import orchestrate_investigation

@pytest.mark.asyncio
@patch('app.orchestrator.investigation_orchestrator.run_content_investigator')
@patch('app.orchestrator.investigation_orchestrator.run_recruiter_investigator')
@patch('app.orchestrator.investigation_orchestrator.run_threat_intelligence_agent')
@patch('app.orchestrator.investigation_orchestrator.run_evidence_aggregator')
@patch('app.orchestrator.investigation_orchestrator.run_final_decision_agent')
async def test_investigation_orchestrator_success(
    mock_final_decision,
    mock_aggregator,
    mock_threat,
    mock_recruiter,
    mock_content
):
    # Setup mocks
    mock_content.return_value = ContentInvestigatorOutput(
        riskSignals=[], riskScore=20.0, confidence=0.9
    )
    mock_recruiter.return_value = RecruiterInvestigatorOutput(
        identitySignals=[], consistencyScore=80.0, status="success"
    )
    mock_threat.return_value = ThreatIntelligenceOutput(
        matches=[], confidence=1.0, status="success"
    )
    
    mock_bundle = EvidenceBundle(
        contentEvidence=[], recruiterEvidence=[], threatEvidence=[],
        supportingSignals=0, contradictions=0, contradictionDetails=[],
        missingEvidence=[], overallEvidenceConfidence=0.9, investigationMetadata={}
    )
    mock_aggregator.return_value = mock_bundle
    
    mock_final_decision.return_value = FinalDecisionOutput(
        verdict="LOW_RISK", riskScore=20.0, confidence=0.9,
        why=[], evidence=[], contradictions=[], recommendations=[]
    )
    
    input_data = InvestigationInput(
        jobText="Valid job description here.",
        recruiterName="John Doe"
    )
    
    # Run orchestrator
    trace = await orchestrate_investigation(input_data)
    
    # Verify state and traces
    assert trace.state == InvestigationState.COMPLETED
    assert trace.investigationId is not None
    assert len(trace.agentTraces) == 5
    assert trace.finalDecision.verdict == "LOW_RISK"
    
    mock_content.assert_called_once_with(input_data)
    mock_recruiter.assert_called_once_with(input_data)
    mock_threat.assert_called_once_with(input_data)
    mock_aggregator.assert_called_once()
    mock_final_decision.assert_called_once_with(input_data, mock_bundle)

@pytest.mark.asyncio
@patch('app.orchestrator.investigation_orchestrator.run_content_investigator')
@patch('app.orchestrator.investigation_orchestrator.run_recruiter_investigator')
@patch('app.orchestrator.investigation_orchestrator.run_threat_intelligence_agent')
async def test_investigation_orchestrator_agent_failure(
    mock_threat,
    mock_recruiter,
    mock_content
):
    # Setup mock to fail recruiter agent
    mock_content.return_value = ContentInvestigatorOutput(
        riskSignals=[], riskScore=20.0, confidence=0.9
    )
    mock_recruiter.side_effect = Exception("API rate limit")
    mock_threat.return_value = ThreatIntelligenceOutput(
        matches=[], confidence=1.0, status="success"
    )
    
    # We won't mock aggregator and final_decision, let them run or fail. 
    # Actually, to avoid calling LLM in test, we should mock them too.
    
    with patch('app.orchestrator.investigation_orchestrator.run_evidence_aggregator') as mock_agg, \
         patch('app.orchestrator.investigation_orchestrator.run_final_decision_agent') as mock_final:
             
        mock_bundle = EvidenceBundle(
            contentEvidence=[], recruiterEvidence=[], threatEvidence=[],
            supportingSignals=0, contradictions=0, contradictionDetails=[],
            missingEvidence=[], overallEvidenceConfidence=0.9, investigationMetadata={}
        )
        mock_agg.return_value = mock_bundle
        mock_final.return_value = FinalDecisionOutput(
            verdict="LOW_RISK", riskScore=20.0, confidence=0.9,
            why=[], evidence=[], contradictions=[], recommendations=[]
        )

        input_data = InvestigationInput(
            jobText="Valid job description here.",
            recruiterName="John Doe"
        )
        
        trace = await orchestrate_investigation(input_data)
        
        assert trace.state == InvestigationState.COMPLETED
        assert getattr(trace.recruiterFindings, "status", None) == "failed"
        assert trace.recruiterFindings.fallback == "insufficient_evidence"
        
        # Verify the failure trace is recorded
        recruiter_trace = next(t for t in trace.agentTraces if t.agentName == "recruiter_investigator")
        assert recruiter_trace.status == "failed"
