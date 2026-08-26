import time
import asyncio
import logging
import uuid
from datetime import datetime, timezone
from typing import Dict, Optional, Type
from app.llm.schemas import LLMRequest, LLMResponse, LLMTask, ProviderMetadata
from app.llm.providers.base import LLMProvider
from app.llm.providers.gemini import GeminiProvider
from app.llm.providers.groq import GroqProvider
from app.llm.providers.cerebras import CerebrasProvider
from app.llm.providers.nvidia import NVIDIAProvider
from app.llm.providers.openrouter import OpenRouterProvider
from app.llm.policies.production import PRODUCTION_ROUTING_POLICY
from app.llm.policies.evaluation import EVALUATION_ROUTING_POLICY
from app.llm.config import config
from app.orchestrator.budget import BudgetController
from app.llm.telemetry.recorder import record_invocation
from app.llm.telemetry.schemas import LLMInvocationRecord
from app.llm.telemetry.pricing import estimate_cost, PRICING_VERSION
from app.llm.exceptions import (
    LLMGatewayError,
    ProviderAPIError,
    ProviderRateLimitError,
    ProviderTimeoutError,
    ProviderAuthenticationError,
    RoutingPolicyError
)

logger = logging.getLogger(__name__)

class CircuitBreakerState:
    def __init__(self):
        self.state = "CLOSED" # CLOSED, OPEN, HALF_OPEN
        self.failures = 0
        self.cooldown_until = 0.0
        self.lock = asyncio.Lock()

class LLMRouter:
    def __init__(self, mode: str = "production"):
        self.mode = mode
        self.providers: Dict[str, LLMProvider] = {
            "gemini_flash_lite": GeminiProvider(model=config.GEMINI_FLASH_LITE_MODEL, provider_name="gemini_flash_lite"),
            "gemini_flash": GeminiProvider(model=config.GEMINI_FLASH_MODEL, provider_name="gemini_flash"),
            "groq": GroqProvider(),
            "cerebras": CerebrasProvider(),
            "nvidia": NVIDIAProvider(),
            "openrouter": OpenRouterProvider()
        }
        
        self.circuit_breakers: Dict[str, CircuitBreakerState] = {
            name: CircuitBreakerState() for name in self.providers.keys()
        }
        
        self.policies = {
            "production": PRODUCTION_ROUTING_POLICY,
            "evaluation": EVALUATION_ROUTING_POLICY
        }

    async def _check_circuit_breaker(self, provider_name: str) -> bool:
        """Returns True if provider is healthy (CLOSED or HALF_OPEN)."""
        cb = self.circuit_breakers[provider_name]
        async with cb.lock:
            if cb.state == "OPEN":
                if time.time() > cb.cooldown_until:
                    cb.state = "HALF_OPEN"
                    return True
                return False
            return True

    async def _record_success(self, provider_name: str):
        cb = self.circuit_breakers[provider_name]
        async with cb.lock:
            if cb.state == "HALF_OPEN":
                cb.state = "CLOSED"
            cb.failures = 0

    async def _record_failure(self, provider_name: str, error: Exception):
        # We only trip circuit breakers for certain types of errors
        if isinstance(error, (ProviderRateLimitError, ProviderTimeoutError, ProviderAPIError)):
            cb = self.circuit_breakers[provider_name]
            async with cb.lock:
                cb.failures += 1
                if cb.failures >= config.CIRCUIT_BREAKER_FAILURE_THRESHOLD:
                    cb.state = "OPEN"
                    cb.cooldown_until = time.time() + config.CIRCUIT_BREAKER_COOLDOWN
                    logger.warning(f"Circuit Breaker OPEN for {provider_name}")

    def _get_routing_chain(self, task: LLMTask) -> list[str]:
        policy = self.policies.get(self.mode)
        if not policy:
            raise RoutingPolicyError(f"Unknown routing mode: {self.mode}")
            
        task_policy = policy.get(task)
        if not task_policy:
            raise RoutingPolicyError(f"No policy defined for task: {task.value}")
            
        chain = [task_policy["primary"]] + task_policy["fallbacks"]
        return chain

    def _map_error_type(self, error: Exception) -> str:
        if isinstance(error, ProviderTimeoutError): return "TIMEOUT"
        if isinstance(error, ProviderRateLimitError): return "RATE_LIMIT"
        if isinstance(error, ProviderAuthenticationError): return "AUTHENTICATION"
        if isinstance(error, ProviderAPIError): return "PROVIDER_UNAVAILABLE"
        return "UNKNOWN"

    async def execute(self, request: LLMRequest, budget: Optional[BudgetController] = None) -> LLMResponse:
        chain = self._get_routing_chain(request.task)
        
        last_error = None
        attempts = 0
        investigation_id = request.investigation_id or "unknown"
        
        # Naive token estimation
        est_input_tokens = len(request.prompt) // 4
        if request.system_prompt:
            est_input_tokens += len(request.system_prompt) // 4
        est_output_tokens = request.max_tokens
        est_total_tokens = est_input_tokens + est_output_tokens
        
        for provider_name in chain:
            if provider_name not in self.providers:
                logger.error(f"Provider {provider_name} not registered in router")
                continue
                
            provider = self.providers[provider_name]
            model_name = getattr(provider, "default_model", "unknown")
            
            # Check circuit breaker
            if not await self._check_circuit_breaker(provider_name):
                logger.warning(f"Skipping {provider_name} due to OPEN circuit breaker")
                continue
            
            # Simple retry loop for the SAME provider
            for retry in range(config.MAX_RETRIES):
                attempts += 1
                is_fallback = (provider_name != chain[0]) or (retry > 0)
                fallback_reason = "circuit_breaker_or_retry" if is_fallback else None
                if last_error:
                    fallback_reason = self._map_error_type(last_error)

                est_cost = estimate_cost(provider_name, model_name, est_input_tokens, est_output_tokens) or 0.0

                if budget:
                    await budget.reserve_budget(est_total_tokens, est_cost)

                start_ts = datetime.now(timezone.utc).isoformat()
                request_id = str(uuid.uuid4())
                start_time = time.time()
                
                try:
                    logger.info(f"Routing task {request.task.value} to {provider_name} (retry {retry})")
                    response = await provider.generate(request)
                    
                    latency_ms = int((time.time() - start_time) * 1000)
                    await self._record_success(provider_name)
                    
                    # Update metadata
                    response.fallback_used = is_fallback
                    response.metadata.fallback_used = is_fallback
                    response.metadata.attempts = attempts
                    response.metadata.routing_policy = self.mode
                    
                    actual_input = response.usage.input_tokens if response.usage else est_input_tokens
                    actual_output = response.usage.output_tokens if response.usage else est_output_tokens
                    actual_total = actual_input + actual_output
                    actual_cost = estimate_cost(provider_name, model_name, actual_input, actual_output) or 0.0

                    if budget:
                        await budget.reconcile_budget(actual_total, est_total_tokens, actual_cost, est_cost, latency_ms)

                    # Telemetry Success
                    record = LLMInvocationRecord(
                        investigationId=investigation_id,
                        requestId=request_id,
                        task=request.task.value,
                        provider=provider_name,
                        model=model_name,
                        startedAt=start_ts,
                        completedAt=datetime.now(timezone.utc).isoformat(),
                        latencyMs=latency_ms,
                        inputTokens=actual_input,
                        outputTokens=actual_output,
                        totalTokens=actual_total,
                        success=True,
                        attempt=attempts,
                        fallbackUsed=is_fallback,
                        fallbackReason=fallback_reason,
                        routingPolicy=self.mode,
                        estimatedCost=actual_cost if actual_cost > 0 else None,
                        pricingVersion=PRICING_VERSION
                    )
                    record_invocation(record)
                    
                    return response
                    
                except Exception as e:
                    latency_ms = int((time.time() - start_time) * 1000)
                    last_error = e
                    logger.warning(f"Attempt failed on {provider_name}: {e}")
                    await self._record_failure(provider_name, e)
                    
                    if budget:
                        await budget.reconcile_budget(0, est_total_tokens, 0.0, est_cost, latency_ms)

                    err_type = self._map_error_type(e)
                    
                    # Telemetry Failure
                    record = LLMInvocationRecord(
                        investigationId=investigation_id,
                        requestId=request_id,
                        task=request.task.value,
                        provider=provider_name,
                        model=model_name,
                        startedAt=start_ts,
                        completedAt=datetime.now(timezone.utc).isoformat(),
                        latencyMs=latency_ms,
                        inputTokens=None,
                        outputTokens=None,
                        totalTokens=None,
                        success=False,
                        attempt=attempts,
                        fallbackUsed=is_fallback,
                        fallbackReason=fallback_reason,
                        errorType=err_type,
                        routingPolicy=self.mode,
                        estimatedCost=None,
                        pricingVersion=PRICING_VERSION
                    )
                    record_invocation(record)
                    
                    if isinstance(e, ProviderAuthenticationError):
                        break # Non-retryable
                    
                    # Backoff before retry
                    if retry < config.MAX_RETRIES - 1:
                        await asyncio.sleep(1.0)
                    
        # If we exhausted the chain
        raise LLMGatewayError(f"All providers failed for task {request.task.value}. Last error: {str(last_error)}")
