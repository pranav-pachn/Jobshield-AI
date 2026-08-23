import os
from typing import List
from dotenv import load_dotenv

load_dotenv()

class LLMConfig:
    # API Keys
    GEMINI_API_KEYS = [k.strip() for k in os.getenv("GEMINI_API_KEY", "").split(",") if k.strip()]
    GROQ_API_KEYS = [k.strip() for k in os.getenv("GROQ_API_KEY", "").split(",") if k.strip()]
    CEREBRAS_API_KEYS = [k.strip() for k in os.getenv("CEREBRAS_API_KEY", "").split(",") if k.strip()]
    NVIDIA_API_KEYS = [k.strip() for k in os.getenv("NVIDIA_API_KEY", "").split(",") if k.strip()]
    OPENROUTER_API_KEYS = [k.strip() for k in os.getenv("OPENROUTER_API_KEY", "").split(",") if k.strip()]

    # Models
    GEMINI_FLASH_LITE_MODEL = os.getenv("GEMINI_FLASH_LITE_MODEL", "gemini-3.5-flash-lite")
    GEMINI_FLASH_MODEL = os.getenv("GEMINI_FLASH_MODEL", "gemini-3.7-flash")
    GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
    CEREBRAS_MODEL = os.getenv("CEREBRAS_MODEL", "llama3.1-8b")
    NVIDIA_MODEL = os.getenv("NVIDIA_MODEL", "meta/llama-3.1-70b-instruct")
    OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "openrouter/auto")

    # Timeouts and Limits
    DEFAULT_TIMEOUT = float(os.getenv("LLM_TIMEOUT", "60.0"))
    MAX_RETRIES = int(os.getenv("LLM_MAX_RETRIES", "2"))
    
    # Circuit Breaker
    CIRCUIT_BREAKER_COOLDOWN = float(os.getenv("LLM_CIRCUIT_BREAKER_COOLDOWN", "15.0"))
    CIRCUIT_BREAKER_FAILURE_THRESHOLD = int(os.getenv("LLM_CIRCUIT_BREAKER_THRESHOLD", "5"))

config = LLMConfig()
