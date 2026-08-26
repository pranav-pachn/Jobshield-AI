import logging
from app.schemas.agent_contracts import InvestigationInput, ContentInvestigatorOutput
from services.llm_service import call_llm_json, AGENT_CONTENT
from app.orchestrator.budget import BudgetController

logger = logging.getLogger(__name__)

async def run_content_investigator(
    input_data: InvestigationInput,
    max_tokens: int = 1000,
    investigation_id: str = None,
    budget: BudgetController = None
) -> ContentInvestigatorOutput:
    """
    Agent 1 — Content Investigator
    Focuses only on the job posting itself.
    """
    logger.info("Running Content Investigator...")
    system_prompt = """You are the Content Investigator agent for JobShield.
Your focus is ONLY on the job posting text.

Analyze the text for:
- compensation anomalies (e.g. unrealistic salary, "earn thousands weekly")
- urgency / pressure (e.g. "immediate start", "limited slots")
- payment requests (e.g. "registration fee", "wire transfer", "purchase equipment")
- personal information requests (e.g. asking for SSN, bank details prematurely)
- crypto/payment instructions
- vague responsibilities (e.g. "no experience needed" for high pay)
- suspicious hiring process (e.g. "no interview required")
- language manipulation (e.g. grammatical/language anomalies)
- remote-work scam patterns

You must NOT decide the final verdict.

Output your analysis strictly in the following JSON format:
{
  "riskSignals": [
    {
      "signal": "string (short label like 'upfront_payment')",
      "severity": "low|medium|high|critical",
      "confidence": float (0.0 to 1.0),
      "evidence": "string (quote or exact description from text)"
    }
  ],
  "riskScore": float (0 to 100),
  "confidence": float (0.0 to 1.0)
}
"""
    user_prompt = f"=== JOB TEXT TO ANALYZE ===\n{input_data.jobText}"
    
    try:
        response = await call_llm_json(
            system_prompt,
            user_prompt,
            ContentInvestigatorOutput,
            max_tokens=max_tokens,
            agent_name=AGENT_CONTENT,
            investigation_id=investigation_id,
            budget=budget
        )
        return response
    except Exception as e:
        logger.error(f"Content investigator failed: {e}")
        raise e
