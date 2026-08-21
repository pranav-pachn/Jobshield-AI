import asyncio
import logging
import uuid
import time

from datetime import datetime, timezone

from app.schemas.agent_contracts import (
    InvestigationInput,
    InvestigationState,
    AgentFailure
)
from app.schemas.investigation_trace import InvestigationTrace, AgentTrace
from app.agents.content_investigator import run_content_investigator
from app.agents.recruiter_investigator import run_recruiter_investigator
from app.agents.threat_intelligence_agent import run_threat_intelligence_agent
from app.agents.evidence_aggregator import run_evidence_aggregator
from app.agents.final_decision_agent import run_final_decision_agent

logger = logging.getLogger(__name__)


def create_agent_trace(agent_name: str, start_time: float, result, status: str, exception=None) -> AgentTrace:
    end_time = time.time()
    
    provider_attempts = []
    output = result
    
    if hasattr(result, "providerAttempts"):
        provider_attempts = result.providerAttempts
        output = result.output
        if hasattr(result, "status") and status == "success":
            status = result.status.lower()
            
    if exception and not isinstance(output, AgentFailure):
        output = AgentFailure(
            agent=agent_name,
            status="failed",
            reason=str(exception),
            fallback="insufficient_evidence" if agent_name == "recruiter_investigator" else "empty_results"
        )
        status = "failed"
        
    input_tokens = getattr(result, "inputTokens", None)
    output_tokens = getattr(result, "outputTokens", None)
    total_tokens = getattr(result, "totalTokens", None)
    finish_reason = getattr(result, "finishReason", None)

    return AgentTrace(
        agentName=agent_name,
        startedAt=datetime.fromtimestamp(start_time, tz=timezone.utc),
        completedAt=datetime.fromtimestamp(end_time, tz=timezone.utc),
        latencyMs=int((end_time - start_time) * 1000),
        status=status,
        providerAttempts=provider_attempts,
        inputTokens=input_tokens,
        outputTokens=output_tokens,
        totalTokens=total_tokens,
        finishReason=finish_reason,
        output=output
    )

from app.utils.context_budgeter import extract_critical_sections
import os

def _get_budget_params():
    policy = os.getenv("CONTEXT_POLICY", "baseline")
    if policy == "optimized":
        return {
            "budget_job_context": True,
            "rag_limit": 1,
            "content_max_tokens": 800,
            "threat_max_tokens": 800,
            "final_max_tokens": 800
        }
    else:
        return {
            "budget_job_context": False,
            "rag_limit": 3,
            "content_max_tokens": 1000,
            "threat_max_tokens": 1500,
            "final_max_tokens": 1500
        }

async def orchestrate_investigation(
    input_data: InvestigationInput,
    budget_job_context: bool = None,
    rag_limit: int = None,
    content_max_tokens: int = None,
    threat_max_tokens: int = None,
    final_max_tokens: int = None
) -> InvestigationTrace:
    """
    Coordinates the parallel execution of the investigator agents, aggregates the evidence,
    and runs the final decision agent, while maintaining an explicit state machine and trace.
    """
    investigation_id = str(uuid.uuid4())
    start_time_total = time.time()
    
    trace = InvestigationTrace(
        investigationId=investigation_id,
        state=InvestigationState.RECEIVED,
        input=input_data,
        agentTraces=[],
        createdAt=datetime.fromtimestamp(start_time_total, tz=timezone.utc)
    )
    
    params = _get_budget_params()
    budget_job_context = budget_job_context if budget_job_context is not None else params["budget_job_context"]
    rag_limit = rag_limit if rag_limit is not None else params["rag_limit"]
    content_max_tokens = content_max_tokens if content_max_tokens is not None else params["content_max_tokens"]
    threat_max_tokens = threat_max_tokens if threat_max_tokens is not None else params["threat_max_tokens"]
    final_max_tokens = final_max_tokens if final_max_tokens is not None else params["final_max_tokens"]
    
    if budget_job_context:
        budgeted_input = input_data.model_copy()
        budgeted_input.jobText = extract_critical_sections(budgeted_input.jobText)
        active_input = budgeted_input
    else:
        active_input = input_data
        
    trace.state = InvestigationState.PLANNING
    trace.state = InvestigationState.INVESTIGATING
    
    start_content = time.time()
    content_task = asyncio.create_task(run_content_investigator(active_input, max_tokens=content_max_tokens))
    
    start_recruiter = time.time()
    recruiter_task = asyncio.create_task(run_recruiter_investigator(active_input))
    
    start_threat = time.time()
    threat_task = asyncio.create_task(run_threat_intelligence_agent(active_input, rag_limit=rag_limit, max_tokens=threat_max_tokens))
    
    results = await asyncio.gather(content_task, recruiter_task, threat_task, return_exceptions=True)
    content_res, recruiter_res, threat_res = results
   
    # Process Content Agent
    if isinstance(content_res, Exception):
        logger.error(f"Content Investigator failed: {content_res}")
        trace.contentFindings = AgentFailure(agent="content_investigator", reason=str(content_res), fallback="empty_results")
        trace.agentTraces.append(create_agent_trace("content_investigator", start_content, trace.contentFindings, "failed", content_res))
    elif content_res.status == "FAILED":
        trace.contentFindings = AgentFailure(agent="content_investigator", reason=content_res.degradationReason or "LLM failed", fallback="empty_results")
        trace.agentTraces.append(create_agent_trace("content_investigator", start_content, content_res, "failed"))
    else:
        trace.contentFindings = content_res.output
        trace.agentTraces.append(create_agent_trace("content_investigator", start_content, content_res, "success"))
        
    # Process Recruiter Agent
    if isinstance(recruiter_res, Exception):
        logger.error(f"Recruiter Investigator failed: {recruiter_res}")
        trace.recruiterFindings = AgentFailure(agent="recruiter_investigator", reason=str(recruiter_res), fallback="insufficient_evidence")
        trace.agentTraces.append(create_agent_trace("recruiter_investigator", start_recruiter, trace.recruiterFindings, "failed", recruiter_res))
    elif recruiter_res.status == "FAILED":
        trace.recruiterFindings = AgentFailure(agent="recruiter_investigator", reason=recruiter_res.degradationReason or "LLM failed", fallback="insufficient_evidence")
        trace.agentTraces.append(create_agent_trace("recruiter_investigator", start_recruiter, recruiter_res, "failed"))
    else:
        trace.recruiterFindings = recruiter_res.output
        trace.agentTraces.append(create_agent_trace("recruiter_investigator", start_recruiter, recruiter_res, recruiter_res.output.status if recruiter_res.output else "success"))
        
    # Process Threat Agent
    if isinstance(threat_res, Exception):
        logger.error(f"Threat Intelligence Agent failed: {threat_res}")
        trace.threatFindings = AgentFailure(agent="threat_intelligence", reason=str(threat_res), fallback="empty_results")
        trace.agentTraces.append(create_agent_trace("threat_intelligence", start_threat, trace.threatFindings, "failed", threat_res))
    elif threat_res.status == "FAILED":
        trace.threatFindings = AgentFailure(agent="threat_intelligence", reason=threat_res.degradationReason or "LLM failed", fallback="empty_results")
        trace.agentTraces.append(create_agent_trace("threat_intelligence", start_threat, threat_res, "failed"))
    else:
        trace.threatFindings = threat_res.output
        trace.agentTraces.append(create_agent_trace("threat_intelligence", start_threat, threat_res, threat_res.output.status if threat_res.output else "success"))

    has_agent_failures = any(isinstance(f, AgentFailure) for f in [trace.contentFindings, trace.recruiterFindings, trace.threatFindings])

    # Evidence Aggregation
    trace.state = InvestigationState.EVIDENCE_AGGREGATION
    start_aggregator = time.time()
    try:
        investigation_metadata = {"investigationId": investigation_id}
        evidence_bundle = run_evidence_aggregator(trace.contentFindings, trace.recruiterFindings, trace.threatFindings, investigation_metadata)
        trace.evidenceAggregation = evidence_bundle
        trace.agentTraces.append(create_agent_trace("evidence_aggregator", start_aggregator, evidence_bundle, "success"))
    except Exception as e:
        logger.error(f"Evidence Aggregator failed: {e}")
        trace.state = InvestigationState.FAILED
        trace.completedAt = datetime.now(timezone.utc)
        return trace    # Final Decision
    trace.state = InvestigationState.FINAL_DECISION
    start_decision = time.time()
    try:
        final_decision_res = await run_final_decision_agent(active_input, evidence_bundle, max_tokens=final_max_tokens)
        if final_decision_res.status == "FAILED":
            trace.state = InvestigationState.FAILED
            trace.agentTraces.append(create_agent_trace("final_decision_agent", start_decision, final_decision_res, "failed"))
        else:
            trace.finalDecision = final_decision_res.output
            trace.agentTraces.append(create_agent_trace("final_decision_agent", start_decision, final_decision_res, "success"))
            
            if final_decision_res.status == "PARTIAL":
                trace.state = InvestigationState.PARTIAL
                trace.degradationReason = final_decision_res.degradationReason
            elif has_agent_failures:
                trace.state = InvestigationState.DEGRADED
                trace.degradationReason = "upstream_agent_failures"
            else:
                trace.state = InvestigationState.COMPLETED
                
    except Exception as e:
        logger.error(f"Final Decision Agent failed: {e}")
        trace.state = InvestigationState.FAILED
        trace.completedAt = datetime.now(timezone.utc)
        trace.agentTraces.append(create_agent_trace("final_decision_agent", start_decision, None, "failed", e))
        return trace
        
    if trace.state not in [InvestigationState.FAILED, InvestigationState.DEGRADED, InvestigationState.PARTIAL]:
        trace.state = InvestigationState.COMPLETED
        
    end_time_total = time.time()
    trace.completedAt = datetime.fromtimestamp(end_time_total, tz=timezone.utc)
    trace.totalLatencyMs = int((end_time_total - start_time_total) * 1000)
    
    return trace
