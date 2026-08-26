from typing import Optional, Dict
from pydantic import BaseModel
from datetime import datetime, timezone

class LLMInvocationRecord(BaseModel):
    investigationId: str
    requestId: str
    task: str
    provider: str
    model: str
    startedAt: Optional[str] = None
    completedAt: Optional[str] = None
    latencyMs: int
    
    inputTokens: Optional[int] = None
    outputTokens: Optional[int] = None
    totalTokens: Optional[int] = None
    
    success: bool
    attempt: int
    fallbackUsed: bool
    fallbackReason: Optional[str] = None
    
    errorType: Optional[str] = None
    routingPolicy: str
    
    estimatedCost: Optional[float] = None
    pricingVersion: str
    
    # Exclude raw prompt/response
