import os
import logging
import json
import time
import random
import asyncio
from openai import AsyncOpenAI
from dotenv import load_dotenv
from typing import Type, TypeVar, Optional
from pydantic import BaseModel, ValidationError
from app.schemas.agent_contracts import LLMExecutionResult, ProviderAttempt

# Try to load env for standalone testing
load_dotenv(dotenv_path='../.env')

logger = logging.getLogger(__name__)

# --- Agent Constants ---
AGENT_CONTENT = "CONTENT"
AGENT_RECRUITER = "RECRUITER"
AGENT_THREAT = "THREAT"
AGENT_FINAL = "FINAL"

# --- Global Circuit Breaker & Concurrency State ---
class ProviderState:
    def __init__(self, name: str, concurrency_limit: int):
        self.name = name
        self.semaphore = asyncio.Semaphore(concurrency_limit)
        self.breaker_lock = asyncio.Lock()
        self.state = "CLOSED"  # CLOSED, OPEN, HALF_OPEN
        self.cooldown_until = 0.0

_provider_states = {
    "Groq": ProviderState("Groq", 5),
    "NVIDIA": ProviderState("NVIDIA", 10),
    "OpenRouter": ProviderState("OpenRouter", 10),
    "Cerebras": ProviderState("Cerebras", 5)
}

def get_provider_state(name: str) -> ProviderState:
    if name not in _provider_states:
        # Determine base concurrency limit from provider type
        base_name = name.split("_")[0]
        limit = 5 if base_name in ["Groq", "Cerebras"] else 10
        _provider_states[name] = ProviderState(name, limit)
    return _provider_states[name]

global_disabled_providers = set()

NVIDIA_API_KEYS = []
raw_nv_keys = os.getenv('NVIDIA_API_KEY', '')
if raw_nv_keys:
    NVIDIA_API_KEYS = [k.strip() for k in raw_nv_keys.split(',') if k.strip()]
NVIDIA_MODEL = os.getenv('NVIDIA_MODEL', 'meta/llama-3.1-70b-instruct')

OPENROUTER_API_KEYS = []
raw_or_keys = os.getenv('OPENROUTER_API_KEY', '')
if raw_or_keys:
    OPENROUTER_API_KEYS = [k.strip() for k in raw_or_keys.split(',') if k.strip()]
OPENROUTER_MODEL = os.getenv('OPENROUTER_MODEL', 'openrouter/auto')

GROQ_API_KEYS = []
raw_groq_keys = os.getenv('GROQ_API_KEY', '')
if raw_groq_keys:
    GROQ_API_KEYS = [k.strip() for k in raw_groq_keys.split(',') if k.strip()]
GROQ_MODEL = os.getenv('GROQ_MODEL', 'llama-3.1-8b-instant')

CEREBRAS_API_KEYS = []
raw_cerebras_keys = os.getenv('CEREBRAS_API_KEY', '')
if raw_cerebras_keys:
    CEREBRAS_API_KEYS = [k.strip() for k in raw_cerebras_keys.split(',') if k.strip()]
CEREBRAS_MODEL = os.getenv('CEREBRAS_MODEL', 'llama3.1-8b')


from typing import Type, TypeVar
from pydantic import BaseModel, ValidationError
from app.schemas.agent_contracts import LLMExecutionResult, ProviderAttempt

T = TypeVar('T', bound=BaseModel)

def _map_exception_to_status(e: Exception) -> str:
    err_str = str(e).lower()
    if '429' in err_str or 'rate limit' in err_str:
        return "RATE_LIMITED"
    if '402' in err_str or 'insufficient credits' in err_str:
        return "NO_CREDITS"
    if '404' in err_str or 'not_found' in err_str:
        return "MODEL_UNAVAILABLE"
    if 'timeout' in err_str:
        return "TIMEOUT"
    if 'connection' in err_str or 'network' in err_str:
        return "NETWORK_ERROR"
    if 'auth' in err_str or '401' in err_str or '403' in err_str:
        return "AUTH_FAILED"
    return "UNKNOWN_ERROR"

def resolve_provider_route(agent_name: str = None) -> list[str]:
    """Resolves the configured fallback route for a given agent."""
    if agent_name:
        agent_route_env = os.getenv(f'LLM_ROUTE_{agent_name}', '')
        if agent_route_env:
            return [p.strip().lower() for p in agent_route_env.split(',') if p.strip()]
            
    # Fallback to global route
    provider_order_env = os.getenv('LLM_PROVIDER_ORDER', 'groq,cerebras,nvidia,openrouter')
    return [p.strip().lower() for p in provider_order_env.split(',') if p.strip()]

async def call_llm_json(system_prompt: str, user_prompt: str, response_model: Type[T], max_tokens: int = 1000, agent_name: str = None) -> LLMExecutionResult[T]:
    """Generic function to call LLM, expect JSON, validate with Pydantic, with multi-provider fallback."""
    attempts: list[ProviderAttempt] = []
    
    # 1. Resolve agent-specific or global routing order
    order = resolve_provider_route(agent_name)
    
    # 2. Build provider lists based on configuration
    providers = []
    for p_name in order:
        if p_name == 'cerebras':
            continue  # B1: Remove Cerebras from JSON route
        if p_name == 'nvidia':
            for i, nv_key in enumerate(NVIDIA_API_KEYS):
                providers.append({"name": "NVIDIA", "key": nv_key, "url": "https://integrate.api.nvidia.com/v1", "model": NVIDIA_MODEL, "id": f"NVIDIA_{i}"})
        elif p_name == 'groq':
            for i, groq_key in enumerate(GROQ_API_KEYS):
                providers.append({"name": "Groq", "key": groq_key, "url": "https://api.groq.com/openai/v1", "model": GROQ_MODEL, "id": f"Groq_{i}"})
        elif p_name == 'openrouter':
            for i, or_key in enumerate(OPENROUTER_API_KEYS):
                providers.append({"name": "OpenRouter", "key": or_key, "url": "https://openrouter.ai/api/v1", "model": OPENROUTER_MODEL, "id": f"OpenRouter_{i}"})
            
    run_disabled_providers = set()
    max_retries = 2
    
    for attempt_num in range(max_retries):
        for p in providers:
            if p["id"] in run_disabled_providers or p["id"] in global_disabled_providers:
                continue
                
            p_state = get_provider_state(p["id"])
            
            # Check Circuit Breaker BEFORE acquiring semaphore
            async with p_state.breaker_lock:
                if p_state.state == "OPEN":
                    if time.time() > p_state.cooldown_until:
                        p_state.state = "HALF_OPEN"
                    else:
                        continue  # Skip this provider
                        
            start_time = time.time()
            latency = 0
            status = "UNKNOWN"
            error_str = ""
            success = False
            parsed_output = None
            input_tokens = None
            output_tokens = None
            total_tokens = None
            finish_reason = None
            
            queue_start = time.time()
            queue_wait_ms = 0
            
            # Acquire semaphore (B2)
            try:
                async with p_state.semaphore:
                    queue_wait_ms = int((time.time() - queue_start) * 1000)
                    start_time = time.time()  # Reset start time to measure only network latency
                    logger.info(f"[LLM] Provider: {p['name']} (Model {p['model']}, Attempt {attempt_num+1}) - Queue wait: {queue_wait_ms}ms")
                    client = AsyncOpenAI(base_url=p["url"], api_key=p["key"], timeout=90.0)
                    
                    kwargs = {
                        "model": p["model"],
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt}
                        ],
                        "temperature": 0.1,
                        "max_tokens": max_tokens
                    }
                    
                    if p["name"] not in ["NVIDIA", "Cerebras"]:
                        kwargs["response_format"] = {"type": "json_object"}
                        
                    response = await client.chat.completions.create(**kwargs)
                    latency = int((time.time() - start_time) * 1000)
                    
                    usage = getattr(response, "usage", None)
                    if usage:
                        input_tokens = getattr(usage, "prompt_tokens", None)
                        output_tokens = getattr(usage, "completion_tokens", None)
                        if input_tokens is not None and output_tokens is not None:
                            total_tokens = input_tokens + output_tokens
                        else:
                            total_tokens = getattr(usage, "total_tokens", None)
                            
                    finish_reason = getattr(response.choices[0], "finish_reason", None) if hasattr(response, "choices") and response.choices else None
                    
                    content = response.choices[0].message.content
                    if not content:
                        status = "EMPTY_RESPONSE"
                        error_str = "Empty response content"
                    else:
                        if content.startswith("```json"):
                            content = content[7:-3].strip()
                        elif content.startswith("```"):
                            content = content[3:-3].strip()
                            
                        try:
                            result_json = json.loads(content)
                            try:
                                parsed_output = response_model(**result_json)
                                success = True
                                status = "SUCCESS"
                            except ValidationError as e:
                                status = "VALIDATION_FAILED"
                                error_str = str(e)
                        except json.JSONDecodeError as e:
                            status = "MALFORMED_JSON"
                            error_str = str(e)
                            
            except Exception as e:
                latency = int((time.time() - start_time) * 1000)
                status = _map_exception_to_status(e)
                error_str = str(e)
                
                # B4: Check for Retry-After
                retry_after = 0
                if status == "RATE_LIMITED" and hasattr(e, 'response') and e.response is not None:
                    try:
                        r_after = e.response.headers.get("retry-after") or e.response.headers.get("x-ratelimit-reset")
                        if r_after:
                            retry_after = float(r_after)
                    except Exception:
                        pass
                
                # B3/B4: Circuit Breaker Logic (Outside Semaphore)
                if status in ["RATE_LIMITED", "TIMEOUT", "NETWORK_ERROR"]:
                    async with p_state.breaker_lock:
                        p_state.state = "OPEN"
                        cooldown = retry_after if retry_after > 0 else 10.0 + random.uniform(0.1, 2.0)
                        p_state.cooldown_until = time.time() + cooldown
                        logger.warning(f"Circuit Breaker OPEN for {p['name']}, cooldown {cooldown:.1f}s")
                elif status in ["NO_CREDITS"]:
                    run_disabled_providers.add(p["id"])
                elif status in ["AUTH_FAILED", "MODEL_UNAVAILABLE"]:
                    global_disabled_providers.add(p["id"])
                    
            # Record attempt
            attempts.append(ProviderAttempt(
                provider=p["name"], 
                model=p["model"], 
                status=status, 
                latencyMs=latency, 
                queueWaitMs=queue_wait_ms, 
                error=error_str,
                inputTokens=input_tokens,
                outputTokens=output_tokens,
                totalTokens=total_tokens,
                finishReason=finish_reason
            ))
            
            if success:
                # Close the breaker if we were half-open
                async with p_state.breaker_lock:
                    if p_state.state == "HALF_OPEN":
                        p_state.state = "CLOSED"
                return LLMExecutionResult(
                    output=parsed_output, 
                    status="COMPLETE", 
                    providerAttempts=attempts,
                    inputTokens=input_tokens,
                    outputTokens=output_tokens,
                    totalTokens=total_tokens,
                    finishReason=finish_reason
                )
                
        # If we exhausted all providers, we might retry the whole loop if there are still attempts left.
        # But we don't want to loop instantly if everyone is OPEN. We should backoff globally if we have retries.
        if attempt_num < max_retries - 1:
            # We only reach here if all healthy providers failed validation/malformed JSON,
            # or all providers are OPEN/disabled.
            # We wait 2s before the next sweep.
            await asyncio.sleep(2.0 + random.uniform(0, 0.5))

    logger.error("All LLM providers failed after multiple retries.")
    return LLMExecutionResult(output=None, status="FAILED", providerAttempts=attempts, degradationReason="all_providers_failed")

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
        
    res = await call_llm_json(system_prompt, user_prompt, LegacyEval, max_tokens=500)
    if res.output:
        return res.output.model_dump()
    return {}
