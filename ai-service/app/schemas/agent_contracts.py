from typing import List, Optional, Dict, Any, Literal, TypeVar, Generic
from pydantic import BaseModel, Field
from enum import Enum

class InvestigationState(str, Enum):
    RECEIVED = "RECEIVED"
    PLANNING = "PLANNING"
    INVESTIGATING = "INVESTIGATING"
    EVIDENCE_AGGREGATION = "EVIDENCE_AGGREGATION"
    CONTRADICTION_ANALYSIS = "CONTRADICTION_ANALYSIS"
    FINAL_DECISION = "FINAL_DECISION"
    COMPLETED = "COMPLETED"
    PARTIAL = "PARTIAL"
    DEGRADED = "DEGRADED"
    FAILED = "FAILED"

class ProviderAttempt(BaseModel):
    provider: str
    model: str
    status: Literal["SUCCESS", "RATE_LIMITED", "NO_CREDITS", "AUTH_FAILED", "MODEL_UNAVAILABLE", "TIMEOUT", "NETWORK_ERROR", "VALIDATION_FAILED", "MALFORMED_JSON", "EMPTY_RESPONSE", "UNKNOWN_ERROR", "HIT"]
    latencyMs: int
    queueWaitMs: int = 0
    error: Optional[str] = None
    inputTokens: Optional[int] = None
    outputTokens: Optional[int] = None
    finishReason: Optional[str] = None
    totalTokens: Optional[int] = None

T = TypeVar('T')

class LLMExecutionResult(BaseModel, Generic[T]):
    output: Optional[T] = None
    status: Literal["COMPLETE", "PARTIAL", "FAILED"]
    providerAttempts: List[ProviderAttempt] = Field(default_factory=list)
    degradationReason: Optional[str] = None
    inputTokens: Optional[int] = None
    outputTokens: Optional[int] = None
    totalLatencyMs: Optional[int] = None
    finishReason: Optional[str] = None

class InvestigationInput(BaseModel):
    jobText: str
    recruiterName: Optional[str] = None
    email: Optional[str] = None
    emailDomain: Optional[str] = None
    company: Optional[str] = None
    companyDomain: Optional[str] = None
    linkedinUrl: Optional[str] = None
    phone: Optional[str] = None
    jobUrl: Optional[str] = None
    recruiterContext: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Pre-computed TS intelligence")

class Signal(BaseModel):
    signal: str
    severity: Literal["low", "medium", "high", "critical"]
    confidence: float
    evidence: str

class ContentInvestigatorOutput(BaseModel):
    agent: Literal["content_investigator"] = "content_investigator"
    riskSignals: List[Signal]
    riskScore: float = Field(ge=0, le=100)
    confidence: float = Field(ge=0, le=1)

class RecruiterInvestigatorOutput(BaseModel):
    agent: Literal["recruiter_investigator"] = "recruiter_investigator"
    identitySignals: List[Signal]
    consistencyScore: float = Field(ge=0, le=100)
    status: Literal["success", "insufficient_evidence", "failed"]

class ThreatMatch(BaseModel):
    sourceId: str
    similarity: float = Field(ge=0, le=1)
    evidenceQuality: str
    relevance: Literal["low", "medium", "high"]
    agentConfidence: float = Field(ge=0, le=1)
    evidence: str

class ThreatIntelligenceOutput(BaseModel):
    agent: Literal["threat_intelligence"] = "threat_intelligence"
    matches: List[ThreatMatch]
    confidence: float = Field(ge=0, le=1)
    status: Literal["success", "failed"] = "success"

class ContradictionDetail(BaseModel):
    description: str
    agents: List[str]

class EvidenceBundle(BaseModel):
    contentEvidence: List[Signal]
    recruiterEvidence: List[Signal]
    threatEvidence: List[ThreatMatch]
    supportingSignals: int
    contradictions: int
    contradictionDetails: List[ContradictionDetail]
    missingEvidence: List[str]
    overallEvidenceConfidence: float
    investigationMetadata: Dict[str, Any]

class FinalDecisionOutput(BaseModel):
    verdict: Literal["SAFE", "LOW_RISK", "MEDIUM_RISK", "HIGH_RISK", "CRITICAL"]
    riskScore: float = Field(ge=0, le=100)
    confidence: float = Field(ge=0, le=1)
    why: List[str] = Field(default_factory=list)
    evidence: List[Dict[str, Any]] = Field(default_factory=list)
    contradictions: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)

class AgentFailure(BaseModel):
    agent: str
    status: Literal["failed"] = "failed"
    reason: str
    fallback: Literal["insufficient_evidence", "empty_results"]
