from enum import Enum
from typing import Any, Dict, List, Optional, TypeVar, Generic, Type
from pydantic import BaseModel, Field

T = TypeVar('T')

class LLMTask(str, Enum):
    FAST_EXTRACTION = "fast_extraction"
    FAST_CLASSIFICATION = "fast_classification"
    INVESTIGATION_REASONING = "investigation_reasoning"
    EVIDENCE_SYNTHESIS = "evidence_synthesis"
    FINAL_SYNTHESIS = "final_synthesis"
    EXPLAINABILITY = "explainability"

class TokenUsage(BaseModel):
    input_tokens: int = 0
    output_tokens: int = 0
    total_tokens: int = 0

class LLMRequest(BaseModel):
    task: LLMTask
    prompt: str
    system_prompt: Optional[str] = None
    max_tokens: int = 1000
    temperature: float = 0.1
    response_model: Optional[Type[BaseModel]] = None
    
    class Config:
        arbitrary_types_allowed = True

class ProviderMetadata(BaseModel):
    provider: str
    model: str
    latency_ms: float
    attempts: int
    fallback_used: bool
    routing_policy: str
    error: Optional[str] = None

class LLMResponse(BaseModel, Generic[T]):
    content: Optional[str] = None
    parsed_output: Optional[T] = None
    provider: str
    model: str
    latency_ms: int
    request_id: Optional[str] = None
    usage: Optional[TokenUsage] = None
    fallback_used: bool = False
    metadata: ProviderMetadata
