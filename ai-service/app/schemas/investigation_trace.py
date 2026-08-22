from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel
from datetime import datetime
from app.evaluation.models import BetterEvaluation
from .agent_contracts import (
    InvestigationInput,
    ContentInvestigatorOutput,
    RecruiterInvestigatorOutput,
    ThreatIntelligenceOutput,
    EvidenceBundle,
    FinalDecisionOutput,
    AgentFailure,
    ProviderAttempt
)

class AgentTrace(BaseModel):
    agentName: str
    startedAt: datetime
    completedAt: datetime
    latencyMs: int
    providerAttempts: List[ProviderAttempt] = []
    inputTokens: Optional[int] = None
    outputTokens: Optional[int] = None
    totalTokens: Optional[int] = None
    finishReason: Optional[str] = None
    status: str
    output: Union[
        ContentInvestigatorOutput,
        RecruiterInvestigatorOutput,
        ThreatIntelligenceOutput,
        EvidenceBundle,
        FinalDecisionOutput,
        AgentFailure,
        Dict[str, Any]
    ]

class InvestigationTrace(BaseModel):
    investigationId: str
    state: str
    input: InvestigationInput
    agentTraces: List[AgentTrace]
    contentFindings: Optional[Union[ContentInvestigatorOutput, AgentFailure]] = None
    recruiterFindings: Optional[Union[RecruiterInvestigatorOutput, AgentFailure]] = None
    threatFindings: Optional[Union[ThreatIntelligenceOutput, AgentFailure]] = None
    evidenceAggregation: Optional[EvidenceBundle] = None
    finalDecision: Optional[FinalDecisionOutput] = None
    createdAt: datetime
    completedAt: Optional[datetime] = None
    totalLatencyMs: Optional[int] = None
    degradationReason: Optional[str] = None
    evaluation: Optional[BetterEvaluation] = None
