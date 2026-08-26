import logging
from typing import List
from app.threat_intelligence.schemas import ThreatExtractionOutput, ThreatIndicatorResult
from app.threat_intelligence.normalizer import normalize_indicator
from services.llm_service import call_llm_json, AGENT_THREAT

logger = logging.getLogger(__name__)

async def extract_indicators_with_llm(job_text: str, max_tokens: int = 1000) -> List[ThreatIndicatorResult]:
    """
    Use the LLM to extract threat indicators contextually (TELEGRAM, WHATSAPP, COMPANY, SCAM_PHRASE)
    where simple regex might fail.
    """
    system_prompt = """You are a Threat Indicator Extraction Assistant.
Your task is to identify and extract potential threat indicators from a job posting.
Extract indicators ONLY if you are confident they represent contact methods, companies, or highly suspicious phrases.

Supported types:
- TELEGRAM: Telegram usernames or links (e.g. "t.me/scammer", "Telegram: @scammer")
- WHATSAPP: WhatsApp numbers or links (e.g. "wa.me/1234567890", "WhatsApp: +1234567890")
- COMPANY: The name of the company supposedly hiring.
- SCAM_PHRASE: Highly suspicious phrases (e.g. "pay registration fee", "no experience required earn $500/day").

Return the data strictly in this JSON format:
{
  "indicators": [
    {
      "type": "TELEGRAM|WHATSAPP|COMPANY|SCAM_PHRASE",
      "value": "string",
      "confidence": float (0.0 to 1.0),
      "context": "string (the sentence where you found it)"
    }
  ]
}
"""
    user_prompt = f"=== JOB TEXT ===\n{job_text}"
    
    try:
        response = await call_llm_json(
            system_prompt, 
            user_prompt, 
            ThreatExtractionOutput, 
            max_tokens=max_tokens, 
            agent_name=f"{AGENT_THREAT}_extractor"
        )
        
        extracted = []
        if response and response.output and response.output.indicators:
            for ind in response.output.indicators:
                ind.value = normalize_indicator(ind.type, ind.value)
                if ind.value:
                    extracted.append(ind)
        
        return extracted
    except Exception as e:
        logger.error(f"Failed to extract indicators with LLM: {e}")
        return []
