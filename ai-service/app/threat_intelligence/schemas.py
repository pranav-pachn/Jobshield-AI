from pydantic import BaseModel
from typing import List, Optional

class ThreatIndicatorResult(BaseModel):
    type: str
    value: str
    confidence: float
    context: Optional[str] = None

class ThreatExtractionOutput(BaseModel):
    indicators: List[ThreatIndicatorResult]
