from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional

from services.scam_detection import detect_scam_async
from services.rag_retrieval import embed_query, retrieve_chunks, format_context

router = APIRouter()

import os
import time
import asyncio
from fastapi import BackgroundTasks, Response, status, Request
from fastapi.responses import StreamingResponse
from app.schemas.agent_contracts import InvestigationInput
from app.orchestrator.investigation_orchestrator import orchestrate_investigation_stream

MAX_ACTIVE = int(os.environ.get("INVESTIGATION_MAX_ACTIVE", 20))
MAX_QUEUED = int(os.environ.get("INVESTIGATION_MAX_QUEUED", 30))

_active_sem = asyncio.Semaphore(MAX_ACTIVE)
_queue_sem = asyncio.Semaphore(MAX_QUEUED)

class InvestigationMetrics:
    active_count = 0
    queued_count = 0
    rejected_count = 0
    total_queue_wait_ms = 0
    total_admitted = 0


class AnalysisRequest(BaseModel):
    text: str

class ThreatSearchRequest(BaseModel):
    query: str
    limit: Optional[int] = 5

class ThreatSearchResponse(BaseModel):
    query: str
    context: str
    chunks: List[Dict]


class HybridIntelligence(BaseModel):
    """STEP 6: Hybrid Intelligence Score Details"""
    method: str  # "hybrid_60_40"
    formula: str  # finalScore = (ruleScore * 0.6) + (aiScore * 0.4)
    rule_based_score: float  # 0-1
    ai_score: float  # 0-1
    rule_weight: float  # 0.6
    ai_weight: float  # 0.4
    rule_contribution: float  # rule_score * weight
    ai_contribution: float  # ai_score * weight
    confidence_level: str  # "HIGH", "MEDIUM", "LOW"
    confidence_score: float  # 0-1
    agreement: str  # "STRONG", "MODERATE", "WEAK"


class AnalysisResponse(BaseModel):
    scam_probability: float
    risk_level: str
    suspicious_phrases: List[str]
    reasons: List[str]
    # STEP 3: Heuristic risk score additions
    heuristic_score: int  # 0-100 scale
    heuristic_flag: str  # "HIGH", "MEDIUM", "LOW"
    ai_models_used: bool  # Transparency: was AI processing used?
    # STEP 4: Conditional AI trigger information
    text_complexity: Optional[float] = None  # Text complexity 0-1
    heuristic_confidence: Optional[float] = None  # Confidence in heuristic 0-1
    ai_decision_reason: Optional[str] = None  # Why AI was/wasn't called
    # STEP 6: Hybrid Intelligence - Merge Results
    hybrid_intelligence: Optional[HybridIntelligence] = None
    # Optional detailed breakdown (for comprehensive analysis)
    component_scores: Optional[Dict] = None
    phrase_details: Optional[Dict] = None
    rag_evidence: Optional[List[Dict]] = None


@router.post("/analyze", response_model=AnalysisResponse)
@router.post("/analyze-job", response_model=AnalysisResponse)
async def analyze_job(request: AnalysisRequest):
    """
    Analyze job posting or recruiter message for scam indicators.
    
    STEP 3 Optimization: Uses heuristic risk scoring to determine if AI processing is needed.
    - If heuristic risk > 40: Classified as HIGH immediately (AI models skipped → cost savings)
    - If heuristic risk > 20: Classified as MEDIUM (AI verification enabled)
    - Otherwise: LOW risk (minimal AI processing)
    
    STEP 6 Enhancement: Hybrid Intelligence merges results with formula:
    finalScore = (ruleScore * 0.6) + (aiScore * 0.4)
    - 60% weight to rule-based detection (explainable, reliable)
    - 40% weight to AI models (sophisticated pattern detection)
    """
    if not request.text or len(request.text.strip()) == 0:
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    result = await detect_scam_async(request.text)

    # STEP 6: Parse hybrid intelligence details if available
    hybrid_intel = None
    if "hybrid_intelligence" in result:
        hi = result["hybrid_intelligence"]
        hybrid_intel = HybridIntelligence(
            method=hi.get("method", "hybrid_60_40"),
            formula=hi.get("formula", "finalScore = (ruleScore * 0.6) + (aiScore * 0.4)"),
            rule_based_score=hi.get("rule_based_score", 0.0),
            ai_score=hi.get("ai_score", 0.0),
            rule_weight=hi.get("rule_weight", 0.6),
            ai_weight=hi.get("ai_weight", 0.4),
            rule_contribution=hi.get("rule_contribution", 0.0),
            ai_contribution=hi.get("ai_contribution", 0.0),
            confidence_level=hi.get("confidence_level", "LOW"),
            confidence_score=hi.get("confidence_score", 0.0),
            agreement=hi.get("agreement", "WEAK"),
        )

    return AnalysisResponse(
        scam_probability=result["scam_probability"],
        risk_level=result["risk_level"],
        suspicious_phrases=result["suspicious_phrases"],
        reasons=result["reasons"],
        heuristic_score=result["heuristic_score"],
        heuristic_flag=result["heuristic_flag"],
        ai_models_used=result["ai_models_used"],
        text_complexity=result.get("text_complexity"),
        heuristic_confidence=result.get("heuristic_confidence"),
        ai_decision_reason=result.get("ai_decision_reason"),
        hybrid_intelligence=hybrid_intel,
        component_scores=result.get("component_scores"),
        phrase_details=result.get("phrase_details"),
        rag_evidence=result.get("rag_evidence"),
    )

@router.post("/threat-intelligence/search", response_model=ThreatSearchResponse)
async def search_threats(request: ThreatSearchRequest):
    """
    Search for relevant threat intelligence using RAG.
    Returns the vector search chunks and a formatted context string.
    """
    if not request.query or len(request.query.strip()) == 0:
        raise HTTPException(status_code=400, detail="Query cannot be empty")
        
    try:
        embedding = embed_query(request.query)
        chunks = retrieve_chunks(embedding, limit=request.limit)
        context = format_context(chunks)
        
        return ThreatSearchResponse(
            query=request.query,
            context=context,
            chunks=chunks
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

from app.schemas.agent_contracts import InvestigationInput
from app.schemas.investigation_trace import InvestigationTrace
from app.orchestrator.investigation_orchestrator import orchestrate_investigation

@router.post("/investigate", response_model=InvestigationTrace)
async def investigate_job(request: InvestigationInput, response: Response):
    """
    Phase 2/3: Full multi-agent investigation with B8 Admission Control.
    """
    if not request.jobText or len(request.jobText.strip()) == 0:
        raise HTTPException(status_code=400, detail="jobText cannot be empty")
        
    # B8: Global Admission Control
    if _queue_sem.locked():
        InvestigationMetrics.rejected_count += 1
        raise HTTPException(
            status_code=503, 
            detail="Investigation capacity temporarily reached. Please retry shortly."
        )
        
    async with _queue_sem:
        InvestigationMetrics.queued_count += 1
        queue_start = time.time()
        
        # Wait to become active
        async with _active_sem:
            queue_wait = time.time() - queue_start
            InvestigationMetrics.queued_count -= 1
            InvestigationMetrics.active_count += 1
            InvestigationMetrics.total_queue_wait_ms += int(queue_wait * 1000)
            InvestigationMetrics.total_admitted += 1
            
            try:
                trace = await orchestrate_investigation(request)
            finally:
                InvestigationMetrics.active_count -= 1
                
    return trace

from fastapi.responses import StreamingResponse
from app.orchestrator.investigation_orchestrator import orchestrate_investigation_stream

@router.post("/investigate/stream")
async def investigate_job_stream(request_data: InvestigationInput, request: Request):
    """
    Phase 3C-4: Progressive streaming investigation.
    """
    if not request_data.jobText or len(request_data.jobText.strip()) == 0:
        raise HTTPException(status_code=400, detail="jobText cannot be empty")
        
    # B8: Global Admission Control
    if _queue_sem.locked():
        InvestigationMetrics.rejected_count += 1
        raise HTTPException(
            status_code=503, 
            detail="Investigation capacity temporarily reached. Please retry shortly."
        )
        
    async def event_generator():
        async with _queue_sem:
            InvestigationMetrics.queued_count += 1
            queue_start = time.time()
            
            async with _active_sem:
                queue_wait = time.time() - queue_start
                InvestigationMetrics.queued_count -= 1
                InvestigationMetrics.active_count += 1
                InvestigationMetrics.total_queue_wait_ms += int(queue_wait * 1000)
                InvestigationMetrics.total_admitted += 1
                
                try:
                    async for event in orchestrate_investigation_stream(request_data, request=request):
                        yield event
                finally:
                    InvestigationMetrics.active_count -= 1

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.get("/metrics/admission")
async def get_admission_metrics():
    return {
        "max_active": MAX_ACTIVE,
        "max_queued": MAX_QUEUED,
        "active_count": InvestigationMetrics.active_count,
        "queue_depth": InvestigationMetrics.queued_count,
        "rejected_count": InvestigationMetrics.rejected_count,
        "avg_queue_wait_ms": (InvestigationMetrics.total_queue_wait_ms / InvestigationMetrics.total_admitted) if InvestigationMetrics.total_admitted > 0 else 0
    }

