import logging

logger = logging.getLogger(__name__)

PRICING_VERSION = "2026-08"

# Cost per 1M tokens
MODEL_PRICING = {
    "gemini": {
        "gemini-1.5-pro": {"input": 3.50, "output": 10.50},
        "gemini-1.5-flash": {"input": 0.075, "output": 0.30}
    },
    "groq": {
        "llama3-70b-8192": {"input": 0.59, "output": 0.79},
        "llama3-8b-8192": {"input": 0.05, "output": 0.08}
    },
    "cerebras": {
        "llama3.1-70b": {"input": 0.60, "output": 0.60},
        "llama3.1-8b": {"input": 0.10, "output": 0.10}
    }
}

def estimate_cost(provider: str, model: str, input_tokens: int, output_tokens: int) -> float:
    """Calculates the estimated cost for a given provider and model."""
    provider = provider.lower()
    if provider not in MODEL_PRICING:
        return None
    
    model_pricing = MODEL_PRICING[provider].get(model)
    if not model_pricing:
        return None
        
    input_cost = (input_tokens / 1_000_000) * model_pricing["input"]
    output_cost = (output_tokens / 1_000_000) * model_pricing["output"]
    return round(input_cost + output_cost, 6)
