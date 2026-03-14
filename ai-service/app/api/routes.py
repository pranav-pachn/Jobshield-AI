from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

from services.scam_detection import detect_scam_async

router = APIRouter()


class AnalysisRequest(BaseModel):
    text: str


class AnalysisResponse(BaseModel):
    scam_probability: float
    risk_level: str
    suspicious_phrases: List[str]
    reasons: List[str]


@router.post("/analyze", response_model=AnalysisResponse)
@router.post("/analyze-job", response_model=AnalysisResponse)
async def analyze_job(request: AnalysisRequest):
    """Analyze job posting or recruiter message for scam indicators."""
    if not request.text or len(request.text.strip()) == 0:
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    result = await detect_scam_async(request.text)

    return AnalysisResponse(
        scam_probability=result["scam_probability"],
        risk_level=result["risk_level"],
        suspicious_phrases=result["suspicious_phrases"],
        reasons=result["reasons"],
    )
