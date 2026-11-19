import logging
import json
from app.schemas.agent_contracts import (
    InvestigationInput,
    EvidenceBundle,
    FinalDecisionOutput,
    LLMExecutionResult
)
from services.llm_service import call_llm_json, AGENT_FINAL
from app.orchestrator.budget import BudgetController

logger = logging.getLogger(__name__)

async def run_final_decision_agent(
    input_data: InvestigationInput,
    evidence_bundle: EvidenceBundle,
    max_tokens: int = 1500,
    investigation_id: str = None,
    budget: BudgetController = None
) -> LLMExecutionResult[FinalDecisionOutput]:
    """
    Agent 5 — Final Decision Agent
    Synthesizes the aggregated EvidenceBundle and original inputs to produce the final auditable decision.
    """
    logger.info("Running Final Decision Agent...")
    
    system_prompt = """You are the Final Decision Agent for JobShield.
Your job is to synthesize an aggregated EvidenceBundle and the original job posting into a final fraud assessment.

You MUST NOT independently reinvestigate everything. Your role is synthesis and reasoning over the provided evidence.

Review the evidence, contradictions, and missing information carefully.
Produce an auditable final decision.

Output your analysis strictly in the following JSON format:
{
  "verdict": "SAFE|LOW_RISK|MEDIUM_RISK|HIGH_RISK|CRITICAL",
  "riskScore": float (0 to 100),
  "confidence": float (0.0 to 1.0),
  "why": ["string (human-readable reasoning)"],
  "evidence": [
    {
      "source": "string (agent name or threat source)",
      "claim": "string (what the evidence says)"
    }
  ],
  "contradictions": ["string (how you resolved any contradictions, or none)"],
  "recommendations": ["string (actionable advice for the candidate)"]
}
"""

    user_prompt = f"=== JOB TEXT ===\n{input_data.jobText}\n\n=== EVIDENCE BUNDLE ===\n{evidence_bundle.model_dump_json(indent=2)}"
    
    try:
        response = await call_llm_json(
            system_prompt,
            user_prompt,
            FinalDecisionOutput,
            max_tokens=max_tokens,
            agent_name=AGENT_FINAL,
            investigation_id=investigation_id,
            budget=budget
        )
        
        # 1. Missing output must never be treated as success
        if response.output is None:
            response.status = "FAILED"
            if not response.degradationReason:
                response.degradationReason = "missing_final_decision_output"
            return response

        # 2. A FAILED response must remain FAILED
        if response.status == "FAILED":
            return response

        out = response.output

        # 3. Validate required fields are usable before accepting as COMPLETE
        valid_verdicts = {"SAFE", "LOW_RISK", "MEDIUM_RISK", "HIGH_RISK", "CRITICAL"}
        if out.verdict not in valid_verdicts:
            response.status = "FAILED"
            response.degradationReason = f"invalid_verdict_{out.verdict}"
            return response

        if not isinstance(out.riskScore, (int, float)) or out.riskScore < 0.0 or out.riskScore > 100.0:
            response.status = "FAILED"
            response.degradationReason = "invalid_risk_score_bounds"
            return response

        if not isinstance(out.confidence, (int, float)) or out.confidence < 0.0 or out.confidence > 1.0:
            response.status = "FAILED"
            response.degradationReason = "invalid_confidence_bounds"
            return response

        if not out.why or not any(isinstance(w, str) and w.strip() for w in out.why):
            response.status = "FAILED"
            response.degradationReason = "missing_decision_explanation"
            return response

        # 4. Partial check: empty contradictions does NOT imply incomplete decision
        # Zero contradictions is legitimate when evidence is fully aligned.
        missing = []
        if not out.evidence:
            missing.append("evidence")
        if not out.recommendations:
            missing.append("recommendations")

        if missing and response.status == "COMPLETE":
            response.status = "PARTIAL"
            response.degradationReason = f"missing_{'_'.join(missing)}"
            
        return response
    except Exception as e:
        logger.error(f"Final decision agent failed: {e}")
        raise
