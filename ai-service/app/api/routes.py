from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.pipelines.scam_detection import detect_scam

router = APIRouter()


class AnalysisRequest(BaseModel):
    text: str


class AnalysisResponse(BaseModel):
    risk_score: int
    risk_level: str
    features: dict


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_job(request: AnalysisRequest):
    """Analyze job posting or recruiter message for scam indicators."""
    if not request.text or len(request.text.strip()) == 0:
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    
    result = detect_scam(request.text)
    return AnalysisResponse(
        risk_score=result["risk_score"],
        risk_level=result["risk_level"],
        features=result["features"],
    )
