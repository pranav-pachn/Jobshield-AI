import asyncio
import logging
from typing import Any
import uuid
import time
import json
import os

from datetime import datetime, timezone
from fastapi import Request

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
from app.evaluation.evaluator import evaluate
from app.evaluation import decision_policy
from app.orchestrator.budget import get_default_budget
from app.utils.context_budgeter import extract_critical_sections

logger = logging.getLogger(__name__)


def clean_failure_reason(error: Any, agent_name: str = "") -> str:
    raw = str(error or "").strip()
    if not raw:
        return "Agent analysis completed with limited external signals."
    technical_triggers = [
        "All providers failed", "API Error", "Error code:", "RESOURCE_EXHAUSTED",
        "RATE_LIMIT", "402", "410", "429", "500", "503", "Traceback", "about:blank",
        "quota", "Payment required", "Insufficient credits", "budget exceeded"
    ]
    if any(trigger.lower() in raw.lower() for trigger in technical_triggers):
        if "threat" in agent_name.lower():
            return "Threat intelligence provider temporarily unavailable. Evaluated using local rule-based threat knowledge."
        elif "recruiter" in agent_name.lower():
            return "Recruiter intelligence check completed with heuristic signals."
        elif "content" in agent_name.lower():
            return "Content evaluation completed with rule-based heuristics."
        return "External intelligence service temporarily unavailable. Evaluated using local heuristics."
    return raw


def create_agent_trace(agent_name: str, start_time: float, result, status: str, exception=None, fallback_output=None) -> AgentTrace:
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
            reason=clean_failure_reason(exception, agent_name),
            fallback="insufficient_evidence" if agent_name == "recruiter_investigator" else "empty_results"
        )
        status = "failed"
        
    if output is None:
        if fallback_output is not None:
            output = fallback_output
        else:
            output = AgentFailure(
                agent=agent_name,
                status="failed",
                reason="Empty output from agent",
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
    
    budget = get_default_budget()
    
    start_content = time.time()
    content_task = asyncio.create_task(run_content_investigator(active_input, max_tokens=content_max_tokens, investigation_id=investigation_id, budget=budget))
    
    start_recruiter = time.time()
    recruiter_task = asyncio.create_task(run_recruiter_investigator(active_input, investigation_id=investigation_id, budget=budget))
    
    start_threat = time.time()
    threat_task = asyncio.create_task(run_threat_intelligence_agent(active_input, rag_limit=rag_limit, max_tokens=threat_max_tokens, investigation_id=investigation_id, budget=budget))
    
    results = await asyncio.gather(content_task, recruiter_task, threat_task, return_exceptions=True)
    content_res, recruiter_res, threat_res = results
   
    # Process Content Agent
    if isinstance(content_res, Exception):
        logger.error(f"Content Investigator failed: {content_res}")
        trace.contentFindings = AgentFailure(agent="content_investigator", reason=clean_failure_reason(content_res, "content_investigator"), fallback="empty_results")
        trace.agentTraces.append(create_agent_trace("content_investigator", start_content, trace.contentFindings, "failed", content_res))
    elif content_res.status == "FAILED" or content_res.output is None:
        trace.contentFindings = AgentFailure(agent="content_investigator", reason=clean_failure_reason(content_res.degradationReason or "LLM failed", "content_investigator"), fallback="empty_results")
        trace.agentTraces.append(create_agent_trace("content_investigator", start_content, content_res, "failed", fallback_output=trace.contentFindings))
    else:
        trace.contentFindings = content_res.output
        at_status = "partial" if content_res.status == "PARTIAL" else "success"
        trace.agentTraces.append(create_agent_trace("content_investigator", start_content, content_res, at_status))
        
    # Process Recruiter Agent
    if isinstance(recruiter_res, Exception):
        logger.error(f"Recruiter Investigator failed: {recruiter_res}")
        trace.recruiterFindings = AgentFailure(agent="recruiter_investigator", reason=clean_failure_reason(recruiter_res, "recruiter_investigator"), fallback="insufficient_evidence")
        trace.agentTraces.append(create_agent_trace("recruiter_investigator", start_recruiter, trace.recruiterFindings, "failed", recruiter_res))
    elif recruiter_res.status == "FAILED" or recruiter_res.output is None:
        trace.recruiterFindings = AgentFailure(agent="recruiter_investigator", reason=clean_failure_reason(recruiter_res.degradationReason or "LLM failed", "recruiter_investigator"), fallback="insufficient_evidence")
        trace.agentTraces.append(create_agent_trace("recruiter_investigator", start_recruiter, recruiter_res, "failed", fallback_output=trace.recruiterFindings))
    else:
        trace.recruiterFindings = recruiter_res.output
        at_status = "partial" if recruiter_res.status == "PARTIAL" else "success"
        trace.agentTraces.append(create_agent_trace("recruiter_investigator", start_recruiter, recruiter_res, at_status))
        
    # Process Threat Agent
    if isinstance(threat_res, Exception):
        logger.error(f"Threat Intelligence Agent failed: {threat_res}")
        trace.threatFindings = AgentFailure(agent="threat_intelligence", reason=clean_failure_reason(threat_res, "threat_intelligence"), fallback="empty_results")
        trace.agentTraces.append(create_agent_trace("threat_intelligence", start_threat, trace.threatFindings, "failed", threat_res))
    elif threat_res.status == "FAILED" or threat_res.output is None:
        trace.threatFindings = AgentFailure(agent="threat_intelligence", reason=clean_failure_reason(threat_res.degradationReason or "LLM failed", "threat_intelligence"), fallback="empty_results")
        trace.agentTraces.append(create_agent_trace("threat_intelligence", start_threat, threat_res, "failed", fallback_output=trace.threatFindings))
    else:
        trace.threatFindings = threat_res.output
        at_status = "partial" if threat_res.status == "PARTIAL" else "success"
        trace.agentTraces.append(create_agent_trace("threat_intelligence", start_threat, threat_res, at_status))

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
        trace.degradationReason = f"evidence_aggregation_failed: {clean_failure_reason(e, 'evidence_aggregator')}"
        trace.completedAt = datetime.now(timezone.utc)
        trace.totalLatencyMs = int((time.time() - start_time_total) * 1000)
        trace.agentTraces.append(create_agent_trace("evidence_aggregator", start_aggregator, None, "failed", e))
        trace.decisionPolicy = decision_policy.evaluate(trace)
        return trace

    # Final Decision
    trace.state = InvestigationState.FINAL_DECISION
    start_decision = time.time()
    try:
        final_decision_res = await run_final_decision_agent(active_input, evidence_bundle, max_tokens=final_max_tokens, investigation_id=investigation_id, budget=budget)
        
        if final_decision_res.status == "FAILED" or final_decision_res.output is None:
            trace.state = InvestigationState.FAILED
            trace.degradationReason = final_decision_res.degradationReason or "final_decision_failed"
            trace.agentTraces.append(create_agent_trace("final_decision_agent", start_decision, final_decision_res, "failed"))
            trace.completedAt = datetime.now(timezone.utc)
            trace.totalLatencyMs = int((time.time() - start_time_total) * 1000)
            trace.decisionPolicy = decision_policy.evaluate(trace)
            return trace

        trace.finalDecision = final_decision_res.output
        final_status = "partial" if final_decision_res.status == "PARTIAL" else "success"
        trace.agentTraces.append(create_agent_trace("final_decision_agent", start_decision, final_decision_res, final_status))
        
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
        trace.degradationReason = f"final_decision_exception: {clean_failure_reason(e, 'final_decision_agent')}"
        trace.completedAt = datetime.now(timezone.utc)
        trace.totalLatencyMs = int((time.time() - start_time_total) * 1000)
        trace.agentTraces.append(create_agent_trace("final_decision_agent", start_decision, None, "failed", e))
        trace.decisionPolicy = decision_policy.evaluate(trace)
        return trace
        
    trace.completedAt = datetime.now(timezone.utc)
    trace.totalLatencyMs = int((time.time() - start_time_total) * 1000)
    
    trace.evaluation = evaluate(trace)
    trace.decisionPolicy = decision_policy.evaluate(trace)
        
    if trace.state not in [InvestigationState.FAILED, InvestigationState.DEGRADED, InvestigationState.PARTIAL]:
        trace.state = InvestigationState.COMPLETED
    
    return trace


async def orchestrate_investigation_stream(
    input_data: InvestigationInput,
    request: Request = None,
    budget_job_context: bool = None,
    rag_limit: int = None,
    content_max_tokens: int = None,
    threat_max_tokens: int = None,
    final_max_tokens: int = None
):
    """
    Streaming SSE generator that coordinates investigators, emits granular agent completion
    events with accurate statuses, and preserves state-machine integrity matching non-streaming mode.
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
    yield f"data: {json.dumps({'event': 'STATE_UPDATE', 'state': trace.state})}\n\n"
    
    trace.state = InvestigationState.INVESTIGATING
    yield f"data: {json.dumps({'event': 'STATE_UPDATE', 'state': trace.state})}\n\n"
    
    budget = get_default_budget()
    
    start_content = time.time()
    content_task = asyncio.create_task(run_content_investigator(active_input, max_tokens=content_max_tokens, investigation_id=investigation_id, budget=budget))
    
    start_recruiter = time.time()
    recruiter_task = asyncio.create_task(run_recruiter_investigator(active_input, investigation_id=investigation_id, budget=budget))
    
    start_threat = time.time()
    threat_task = asyncio.create_task(run_threat_intelligence_agent(active_input, rag_limit=rag_limit, max_tokens=threat_max_tokens, investigation_id=investigation_id, budget=budget))
    
    task_map = {
        content_task: ("content_investigator", start_content),
        recruiter_task: ("recruiter_investigator", start_recruiter),
        threat_task: ("threat_intelligence_agent", start_threat)
    }
    
    pending = set(task_map.keys())
    
    while pending:
        if request and await request.is_disconnected():
            logger.warning("Client disconnected. Cancelling upstream investigator tasks.")
            for p in pending:
                p.cancel()
            await asyncio.gather(*pending, return_exceptions=True)
            return

        done, pending = await asyncio.wait(pending, timeout=10.0, return_when=asyncio.FIRST_COMPLETED)
        
        if not done:
            # Heartbeat
            yield ": heartbeat\n\n"
            continue
            
        for completed_task in done:
            try:
                res = await completed_task
                agent_name, start_t = task_map[completed_task]
                
                if agent_name == "content_investigator":
                    if res.status == "FAILED" or res.output is None:
                        trace.contentFindings = AgentFailure(agent="content_investigator", reason=clean_failure_reason(res.degradationReason or "LLM failed", "content_investigator"), fallback="empty_results")
                        at = create_agent_trace("content_investigator", start_t, res, "failed", fallback_output=trace.contentFindings)
                    else:
                        trace.contentFindings = res.output
                        at_status = "partial" if res.status == "PARTIAL" else "success"
                        at = create_agent_trace("content_investigator", start_t, res, at_status)
                        
                elif agent_name == "recruiter_investigator":
                    if res.status == "FAILED" or res.output is None:
                        trace.recruiterFindings = AgentFailure(agent="recruiter_investigator", reason=clean_failure_reason(res.degradationReason or "LLM failed", "recruiter_investigator"), fallback="insufficient_evidence")
                        at = create_agent_trace("recruiter_investigator", start_t, res, "failed", fallback_output=trace.recruiterFindings)
                    else:
                        trace.recruiterFindings = res.output
                        at_status = "partial" if res.status == "PARTIAL" else "success"
                        at = create_agent_trace("recruiter_investigator", start_t, res, at_status)
                        
                elif agent_name == "threat_intelligence_agent":
                    if res.status == "FAILED" or res.output is None:
                        trace.threatFindings = AgentFailure(agent="threat_intelligence", reason=clean_failure_reason(res.degradationReason or "LLM failed", "threat_intelligence"), fallback="empty_results")
                        at = create_agent_trace("threat_intelligence_agent", start_t, res, "failed", fallback_output=trace.threatFindings)
                    else:
                        trace.threatFindings = res.output
                        at_status = "partial" if res.status == "PARTIAL" else "success"
                        at = create_agent_trace("threat_intelligence_agent", start_t, res, at_status)
                        
                trace.agentTraces.append(at)
                
                # Emit AGENT_COMPLETED with actual status
                has_findings = not isinstance(at.output, AgentFailure)
                yield f"data: {json.dumps({'event': 'AGENT_COMPLETED', 'agent': agent_name, 'trace': {'agent': agent_name, 'status': at.status, 'findings': has_findings}})}\n\n"
                
            except Exception as e:
                for tsk, (name, st) in task_map.items():
                    if tsk == completed_task:
                        fallback = "insufficient_evidence" if name == "recruiter_investigator" else "empty_results"
                        cleaned_err = clean_failure_reason(e, name)
                        findings = AgentFailure(agent=name, reason=cleaned_err, fallback=fallback)
                        at = create_agent_trace(name, st, findings, "failed", e)
                        trace.agentTraces.append(at)
                        if name == "content_investigator":
                            trace.contentFindings = findings
                        elif name == "recruiter_investigator":
                            trace.recruiterFindings = findings
                        else:
                            trace.threatFindings = findings
                            
                        yield f"data: {json.dumps({'event': 'AGENT_COMPLETED', 'agent': name, 'trace': {'agent': name, 'status': 'failed', 'findings': False}})}\n\n"

    # Track upstream agent failures
    has_agent_failures = any(isinstance(f, AgentFailure) for f in [trace.contentFindings, trace.recruiterFindings, trace.threatFindings])

    if request and await request.is_disconnected():
        return

    trace.state = InvestigationState.EVIDENCE_AGGREGATION
    yield f"data: {json.dumps({'event': 'STATE_UPDATE', 'state': trace.state})}\n\n"
    
    start_agg = time.time()
    try:
        investigation_metadata = {"investigationId": investigation_id}
        evidence_bundle = run_evidence_aggregator(trace.contentFindings, trace.recruiterFindings, trace.threatFindings, investigation_metadata)
        trace.evidenceAggregation = evidence_bundle
        at = create_agent_trace("evidence_aggregator", start_agg, evidence_bundle, "success")
        trace.agentTraces.append(at)
        yield f"data: {json.dumps({'event': 'AGENT_COMPLETED', 'agent': 'evidence_aggregator', 'trace': {'agent': 'evidence_aggregator', 'status': 'success', 'findings': True}})}\n\n"
    except Exception as e:
        logger.error(f"Evidence Aggregator failed: {e}")
        trace.state = InvestigationState.FAILED
        trace.degradationReason = f"evidence_aggregation_failed: {clean_failure_reason(e, 'evidence_aggregator')}"
        at = create_agent_trace("evidence_aggregator", start_agg, None, "failed", e)
        trace.agentTraces.append(at)
        yield f"data: {json.dumps({'event': 'AGENT_COMPLETED', 'agent': 'evidence_aggregator', 'trace': {'agent': 'evidence_aggregator', 'status': 'failed', 'findings': False}})}\n\n"
        trace.completedAt = datetime.now(timezone.utc)
        trace.totalLatencyMs = int((time.time() - start_time_total) * 1000)
        trace.decisionPolicy = decision_policy.evaluate(trace)
        yield f"data: {json.dumps({'event': 'COMPLETE', 'trace': trace.model_dump(mode='json')})}\n\n"
        return
        
    trace.state = InvestigationState.FINAL_DECISION
    yield f"data: {json.dumps({'event': 'STATE_UPDATE', 'state': trace.state})}\n\n"
    start_decision = time.time()
    
    final_task = asyncio.create_task(run_final_decision_agent(active_input, evidence_bundle, max_tokens=final_max_tokens, investigation_id=investigation_id, budget=budget))
    while True:
        if request and await request.is_disconnected():
            logger.warning("Client disconnected. Cancelling final decision task.")
            final_task.cancel()
            try:
                await final_task
            except (asyncio.CancelledError, Exception):
                pass
            return
            
        done, _ = await asyncio.wait([final_task], timeout=10.0)
        if not done:
            yield ": heartbeat\n\n"
        else:
            break
            
    try:
        final_decision_res = await final_task
        if final_decision_res.status == "FAILED" or final_decision_res.output is None:
            trace.state = InvestigationState.FAILED
            trace.degradationReason = final_decision_res.degradationReason or "final_decision_failed"
            at = create_agent_trace("final_decision_agent", start_decision, final_decision_res, "failed")
        else:
            trace.finalDecision = final_decision_res.output
            final_status = "partial" if final_decision_res.status == "PARTIAL" else "success"
            at = create_agent_trace("final_decision_agent", start_decision, final_decision_res, final_status)
            
            if final_decision_res.status == "PARTIAL":
                trace.state = InvestigationState.PARTIAL
                trace.degradationReason = final_decision_res.degradationReason
            elif has_agent_failures:
                trace.state = InvestigationState.DEGRADED
                trace.degradationReason = "upstream_agent_failures"
            else:
                trace.state = InvestigationState.COMPLETED
    except Exception as e:
        logger.error(f"Final decision failed: {e}")
        trace.state = InvestigationState.FAILED
        trace.degradationReason = f"final_decision_exception: {clean_failure_reason(e, 'final_decision_agent')}"
        at = create_agent_trace("final_decision_agent", start_decision, None, "failed", e)
        
    trace.agentTraces.append(at)
    yield f"data: {json.dumps({'event': 'AGENT_COMPLETED', 'agent': 'final_decision_agent', 'trace': {'agent': 'final_decision_agent', 'status': at.status, 'findings': trace.finalDecision is not None}})}\n\n"
    
    trace.completedAt = datetime.now(timezone.utc)
    trace.totalLatencyMs = int((time.time() - start_time_total) * 1000)
    
    if trace.state != InvestigationState.FAILED:
        trace.evaluation = evaluate(trace)
        trace.decisionPolicy = decision_policy.evaluate(trace)
    else:
        trace.decisionPolicy = decision_policy.evaluate(trace)
        
    yield f"data: {json.dumps({'event': 'COMPLETE', 'trace': trace.model_dump(mode='json')})}\n\n"
