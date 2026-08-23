from typing import Dict, List
from app.llm.schemas import LLMTask

# Map each task to a primary provider and an ordered list of fallbacks
PRODUCTION_ROUTING_POLICY: Dict[LLMTask, Dict[str, List[str]]] = {
    LLMTask.FAST_EXTRACTION: {
        "primary": "gemini_flash_lite",
        "fallbacks": ["groq", "cerebras", "openrouter"]
    },
    LLMTask.FAST_CLASSIFICATION: {
        "primary": "gemini_flash_lite",
        "fallbacks": ["groq", "cerebras", "openrouter"]
    },
    LLMTask.INVESTIGATION_REASONING: {
        "primary": "gemini_flash",
        "fallbacks": ["openrouter", "nvidia"]
    },
    LLMTask.EVIDENCE_SYNTHESIS: {
        "primary": "gemini_flash",
        "fallbacks": ["openrouter", "nvidia"]
    },
    LLMTask.FINAL_SYNTHESIS: {
        "primary": "gemini_flash",
        "fallbacks": ["openrouter", "nvidia"]
    },
    LLMTask.EXPLAINABILITY: {
        "primary": "gemini_flash",
        "fallbacks": ["openrouter", "nvidia"]
    }
}
