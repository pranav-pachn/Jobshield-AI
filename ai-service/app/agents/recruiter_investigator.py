import logging
import json
from app.schemas.agent_contracts import InvestigationInput, RecruiterInvestigatorOutput
from services.llm_service import call_llm_json, AGENT_RECRUITER
from app.orchestrator.budget import BudgetController

logger = logging.getLogger(__name__)

async def run_recruiter_investigator(
    input_data: InvestigationInput,
    investigation_id: str = None,
    budget: BudgetController = None
) -> RecruiterInvestigatorOutput:
    """
    Agent 2 — Recruiter Investigator
    Investigates recruiter identity, email/domain consistency, and leverages pre-computed TS intelligence.
    """
    logger.info("Running Recruiter Investigator...")
    
    # Check if we have enough information to investigate
    has_contact_info = any([
        input_data.recruiterName,
        input_data.email,
        input_data.emailDomain,
        input_data.company,
        input_data.linkedinUrl,
        input_data.phone
    ])
    
    if not has_contact_info:
        logger.info("Insufficient recruiter information. Skipping recruiter investigation.")
        out = RecruiterInvestigatorOutput(
            identitySignals=[],
            consistencyScore=0,
            status="insufficient_evidence"
        )
        from app.schemas.agent_contracts import LLMExecutionResult
        return LLMExecutionResult(output=out, status="COMPLETE", providerAttempts=[], degradationReason=None)
        
    system_prompt = """You are the Recruiter Investigator agent for JobShield.
Your job is to investigate consistency and legitimacy of the recruiter and company identity.

Input includes recruiter details, company details, and pre-computed Domain/Recruiter intelligence (if available).

Look for:
- email/domain mismatch (e.g. recruiter claims Microsoft, but email is microsoft-careers-example.com)
- suspicious free email providers used for corporate roles
- recruiter/company inconsistency
- domain age/reputation (based on provided TS intelligence context)
- contact information inconsistencies
- recruiter claims vs job posting

Do NOT hallucinate external web access. If information is missing, focus on structural consistency of what is provided.
You must NOT decide the final verdict.

Output your analysis strictly in the following JSON format:
{
  "identitySignals": [
    {
      "signal": "string (short label like 'email_domain_mismatch')",
      "severity": "low|medium|high|critical",
      "confidence": float (0.0 to 1.0),
      "evidence": "string (explanation of the inconsistency or finding)"
    }
  ],
  "consistencyScore": float (0 to 100, where 100 is highly consistent/safe, 0 is highly inconsistent/risky),
  "status": "success"
}
"""
    
    context_data = {
        "jobText": input_data.jobText,
        "recruiterName": input_data.recruiterName,
        "email": input_data.email,
        "emailDomain": input_data.emailDomain,
        "company": input_data.company,
        "companyDomain": input_data.companyDomain,
        "linkedinUrl": input_data.linkedinUrl,
        "phone": input_data.phone,
        "preComputedIntelligence": input_data.recruiterContext
    }
    
    user_prompt = f"=== RECRUITER & COMPANY DATA ===\n{json.dumps(context_data, indent=2)}"
    
    try:
        response = await call_llm_json(
            system_prompt,
            user_prompt,
            RecruiterInvestigatorOutput,
            max_tokens=500,
            agent_name=AGENT_RECRUITER,
            investigation_id=investigation_id,
            budget=budget
        )
        return response
    except Exception as e:
        logger.error(f"Recruiter investigator failed: {e}")
        raise e
