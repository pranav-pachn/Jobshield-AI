import logging
from typing import Union, List, Dict, Any
from app.schemas.agent_contracts import (
    ContentInvestigatorOutput,
    RecruiterInvestigatorOutput,
    ThreatIntelligenceOutput,
    EvidenceBundle,
    ContradictionDetail,
    AgentFailure,
    Signal,
    ThreatMatch
)

logger = logging.getLogger(__name__)

def run_evidence_aggregator(
    content_result: Union[ContentInvestigatorOutput, AgentFailure],
    recruiter_result: Union[RecruiterInvestigatorOutput, AgentFailure],
    threat_result: Union[ThreatIntelligenceOutput, AgentFailure],
    investigation_metadata: Dict[str, Any]
) -> EvidenceBundle:
    """
    Agent 4 — Evidence Aggregator
    Deterministic aggregation of evidence. No LLM calls.
    """
    logger.info("Running Evidence Aggregator...")

    content_evidence: List[Signal] = []
    recruiter_evidence: List[Signal] = []
    threat_evidence: List[ThreatMatch] = []
    missing_evidence: List[str] = []
    contradiction_details: List[ContradictionDetail] = []
    
    # Process Content Investigator
    if isinstance(content_result, AgentFailure):
        missing_evidence.append(f"Content analysis failed: {content_result.reason}")
        content_score = 0
        content_conf = 0.0
    else:
        content_evidence = content_result.riskSignals
        content_score = content_result.riskScore
        content_conf = content_result.confidence

    # Process Recruiter Investigator
    if isinstance(recruiter_result, AgentFailure):
        missing_evidence.append(f"Recruiter identity could not be verified (failed): {recruiter_result.reason}")
        recruiter_score = 50 # neutral
        recruiter_conf = 0.0
        recruiter_status = recruiter_result.fallback
    elif recruiter_result.status == "insufficient_evidence":
        missing_evidence.append("Recruiter identity could not be independently classified (insufficient evidence provided)")
        recruiter_score = 50 # neutral
        recruiter_conf = 0.0
        recruiter_status = "insufficient_evidence"
    else:
        recruiter_evidence = recruiter_result.identitySignals
        recruiter_score = recruiter_result.consistencyScore
        recruiter_conf = 1.0
        recruiter_status = "success"

    # Process Threat Intelligence
    if isinstance(threat_result, AgentFailure):
        missing_evidence.append(f"Threat intelligence search failed: {threat_result.reason}")
        threat_conf = 0.0
    else:
        threat_evidence = threat_result.matches
        threat_conf = threat_result.confidence

    supporting_signals = len(content_evidence) + len(threat_evidence) + len([s for s in recruiter_evidence if s.severity in ['high', 'critical']])

    # Contradiction Detection
    # Example: Content has high risk, but Recruiter identity is highly consistent
    if content_score >= 70 and recruiter_status == "success" and recruiter_score >= 80:
        contradiction_details.append(
            ContradictionDetail(
                description="Scam indicators in content are strong, but recruiter/company identity appears legitimate.",
                agents=["content_investigator", "recruiter_investigator"]
            )
        )
        
    # Example: Threat intel found a match, but content looks totally benign
    if threat_evidence and any(m.relevance == "high" for m in threat_evidence) and content_score <= 30:
         contradiction_details.append(
            ContradictionDetail(
                description="Job matches known threat patterns strongly, but the content itself shows few overt scam signals.",
                agents=["content_investigator", "threat_intelligence"]
            )
        )

    # Calculate overall confidence
    # Simple weighted average of active agents
    active_confs = []
    weights = []
    
    if not isinstance(content_result, AgentFailure):
        active_confs.append(content_conf)
        weights.append(1.0)
        
    if recruiter_status == "success":
        active_confs.append(recruiter_conf)
        weights.append(1.0)
        
    if not isinstance(threat_result, AgentFailure):
        # Boost confidence slightly if high similarity threats were found
        base_threat_conf = threat_conf
        if any(m.similarity > 0.85 and m.relevance == "high" for m in threat_evidence):
            base_threat_conf = min(1.0, base_threat_conf + 0.1)
        active_confs.append(base_threat_conf)
        weights.append(1.5) # threat intel has slightly higher weight if available
        
    if sum(weights) > 0:
        overall_conf = sum(c * w for c, w in zip(active_confs, weights)) / sum(weights)
    else:
        overall_conf = 0.0

    return EvidenceBundle(
        contentEvidence=content_evidence,
        recruiterEvidence=recruiter_evidence,
        threatEvidence=threat_evidence,
        supportingSignals=supporting_signals,
        contradictions=len(contradiction_details),
        contradictionDetails=contradiction_details,
        missingEvidence=missing_evidence,
        overallEvidenceConfidence=round(overall_conf, 2),
        investigationMetadata=investigation_metadata
    )
