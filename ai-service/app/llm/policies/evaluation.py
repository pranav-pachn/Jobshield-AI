from typing import Dict, List
from app.llm.schemas import LLMTask

# Evaluation policy maps tasks to exactly one provider and no fallbacks.
# This ensures deterministic behavior for benchmark runs.
EVALUATION_ROUTING_POLICY: Dict[LLMTask, Dict[str, List[str]]] = {
    LLMTask.FAST_EXTRACTION: {
        "primary": "gemini_flash_lite",
        "fallbacks": []
    },
    LLMTask.FAST_CLASSIFICATION: {
        "primary": "gemini_flash_lite",
        "fallbacks": []
    },
    LLMTask.INVESTIGATION_REASONING: {
        "primary": "gemini_flash",
        "fallbacks": []
    },
    LLMTask.EVIDENCE_SYNTHESIS: {
        "primary": "gemini_flash",
        "fallbacks": []
    },
    LLMTask.FINAL_SYNTHESIS: {
        "primary": "gemini_flash",
        "fallbacks": []
    },
    LLMTask.EXPLAINABILITY: {
        "primary": "gemini_flash",
        "fallbacks": []
    }
}
