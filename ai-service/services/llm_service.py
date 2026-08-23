import logging
from typing import Type, TypeVar
from pydantic import BaseModel

from app.schemas.agent_contracts import LLMExecutionResult, ProviderAttempt
from app.llm.gateway import gateway
from app.llm.schemas import LLMTask

logger = logging.getLogger(__name__)

# --- Agent Constants ---
AGENT_CONTENT = "CONTENT"
AGENT_RECRUITER = "RECRUITER"
AGENT_THREAT = "THREAT"
AGENT_FINAL = "FINAL"

T = TypeVar('T', bound=BaseModel)

def _map_agent_to_task(agent_name: str) -> LLMTask:
    """Map legacy agent names to new LLM tasks."""
    mapping = {
        AGENT_CONTENT: LLMTask.FAST_EXTRACTION,
        AGENT_RECRUITER: LLMTask.FAST_EXTRACTION,
        AGENT_THREAT: LLMTask.INVESTIGATION_REASONING,
        AGENT_FINAL: LLMTask.FINAL_SYNTHESIS
    }
    return mapping.get(agent_name, LLMTask.INVESTIGATION_REASONING)

async def call_llm_json(
    system_prompt: str, 
    user_prompt: str, 
    response_model: Type[T], 
    max_tokens: int = 1000, 
    agent_name: str = None
) -> LLMExecutionResult[T]:
    """
    Legacy wrapper for backwards compatibility.
    Calls the new LLM Gateway.
    """
    task = _map_agent_to_task(agent_name)
    
    try:
        gw_response = await gateway.generate(
            task=task,
            prompt=user_prompt,
            system_prompt=system_prompt,
            response_model=response_model,
            max_tokens=max_tokens
        )
        
        # Map metadata back to legacy ProviderAttempt format
        attempts = []
        if gw_response.metadata:
            attempts.append(
                ProviderAttempt(
                    provider=gw_response.provider,
                    model=gw_response.model,
                    status="SUCCESS",
                    latencyMs=gw_response.latency_ms,
                    inputTokens=gw_response.usage.input_tokens if gw_response.usage else None,
                    outputTokens=gw_response.usage.output_tokens if gw_response.usage else None,
                    totalTokens=gw_response.usage.total_tokens if gw_response.usage else None,
                    finishReason=None
                )
            )
            
        return LLMExecutionResult(
            output=gw_response.parsed_output,
            status="COMPLETE",
            providerAttempts=attempts,
            inputTokens=gw_response.usage.input_tokens if gw_response.usage else None,
            outputTokens=gw_response.usage.output_tokens if gw_response.usage else None,
            totalLatencyMs=gw_response.latency_ms
        )
    except Exception as e:
        logger.error(f"Legacy call_llm_json failed via Gateway: {e}")
        # Return a FAILED result
        return LLMExecutionResult(
            output=None,
            status="FAILED",
            providerAttempts=[],
            degradationReason=str(e)
        )

async def evaluate_risk_with_llm(job_text: str, context: str) -> dict:
    """Evaluates the job text using the preferred LLM provider and the retrieved RAG context."""
    system_prompt = """You are analyzing a job offer for potential employment fraud.

Retrieved threat intelligence is supporting evidence, not a required template that the job must exactly match.

Use the retrieved sources to:
1. identify documented scam patterns,
2. corroborate suspicious signals,
3. provide evidence for your reasoning.

Do NOT require the job offer to exactly match a retrieved example.

A job can still be fraudulent even if its wording, mechanism, organization, or details differ from the retrieved examples.

Also analyze the job independently using your general reasoning about employment fraud.

Distinguish:
- observed signals in the job
- retrieved evidence
- your inference

If retrieved evidence is weak or unrelated, do not force a match.

Never claim that a source supports a statement unless the retrieved content actually supports it.

Output your analysis strictly in the following JSON format:
{
  "scam_probability": <float between 0.0 and 1.0>,
  "risk_level": "<LOW, MEDIUM, or HIGH>",
  "suspicious_phrases": ["<phrase1>", "<phrase2>"],
  "reasons": ["<reason1 based on context>", "<reason2>"]
}"""
    user_prompt = f"=== THREAT INTELLIGENCE CONTEXT ===\n{context}\n\n=== JOB TEXT TO ANALYZE ===\n{job_text}"
    
    class LegacyEval(BaseModel):
        scam_probability: float
        risk_level: str
        suspicious_phrases: list[str]
        reasons: list[str]
        
    res = await call_llm_json(system_prompt, user_prompt, LegacyEval, max_tokens=500, agent_name=AGENT_FINAL)
    if res.output:
        return res.output.model_dump()
    return {}
