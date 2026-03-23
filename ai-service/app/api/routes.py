from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional

try:
    from ..services.scam_detection import detect_scam_async
except ImportError:
    # Fallback for direct execution
    from services.scam_detection import detect_scam_async

router = APIRouter()


class AnalysisRequest(BaseModel):
    text: str


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
    )
