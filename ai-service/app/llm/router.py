import time
import asyncio
import logging
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

    async def execute(self, request: LLMRequest) -> LLMResponse:
        chain = self._get_routing_chain(request.task)
        
        last_error = None
        attempts = 0
        
        for provider_name in chain:
            if provider_name not in self.providers:
                logger.error(f"Provider {provider_name} not registered in router")
                continue
                
            provider = self.providers[provider_name]
            
            # Check circuit breaker
            if not await self._check_circuit_breaker(provider_name):
                logger.warning(f"Skipping {provider_name} due to OPEN circuit breaker")
                continue
            
            is_fallback = attempts > 0
            
            # Simple retry loop for the SAME provider
            for retry in range(config.MAX_RETRIES):
                attempts += 1
                try:
                    logger.info(f"Routing task {request.task.value} to {provider_name} (retry {retry})")
                    response = await provider.generate(request)
                    
                    await self._record_success(provider_name)
                    
                    # Update metadata
                    response.fallback_used = is_fallback
                    response.metadata.fallback_used = is_fallback
                    response.metadata.attempts = attempts
                    response.metadata.routing_policy = self.mode
                    
                    return response
                    
                except ProviderAuthenticationError as e:
                    # Non-retryable
                    last_error = e
                    logger.error(f"Auth error on {provider_name}: {e}")
                    break
                    
                except Exception as e:
                    last_error = e
                    logger.warning(f"Attempt failed on {provider_name}: {e}")
                    await self._record_failure(provider_name, e)
                    
                    # If this is a rate limit or timeout, we might retry or immediately fallback 
                    # depending on specific logic. For now, we continue the retry loop unless 
                    # we hit MAX_RETRIES.
                    if retry < config.MAX_RETRIES - 1:
                        await asyncio.sleep(1.0) # Small backoff
                    
        # If we exhausted the chain
        raise LLMGatewayError(f"All providers failed for task {request.task.value}. Last error: {str(last_error)}")
