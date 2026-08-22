from pydantic import BaseModel, Field
from typing import Literal


class EvaluationDimension(BaseModel):
    score: float = Field(ge=0, le=100)
    label: str  # "Low" | "Medium" | "High" | "Very High"


class EvidenceQuality(BaseModel):
    level: Literal["Low", "Medium", "High"]
    score: float = Field(ge=0, le=100)


class BetterEvaluation(BaseModel):
    content_risk: EvaluationDimension
    recruiter_trust: EvaluationDimension
    threat_match: EvaluationDimension
    historical_similarity: EvaluationDimension
    overall_risk: EvaluationDimension
    evidence_quality: EvidenceQuality
    confidence: float = Field(ge=0, le=100)
    sources_used: int = Field(ge=0)
    contradictions: int = Field(ge=0)
    missing_evidence: int = Field(ge=0)
