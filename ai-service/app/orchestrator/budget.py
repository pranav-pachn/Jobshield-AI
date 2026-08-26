import asyncio
import os
import logging
from typing import Optional

logger = logging.getLogger(__name__)

class BudgetExceededException(Exception):
    pass

class BudgetController:
    def __init__(self, max_calls: int, max_tokens: int, max_cost: float, max_latency_ms: int):
        self.max_calls = max_calls
        self.max_tokens = max_tokens
        self.max_cost = max_cost
        self.max_latency_ms = max_latency_ms
        
        self.current_calls = 0
        self.current_tokens = 0
        self.current_cost = 0.0
        self.current_latency_ms = 0
        
        self._lock = asyncio.Lock()

    async def reserve_budget(self, estimated_tokens: int, estimated_cost: float):
        """Reserves budget atomically before an LLM call."""
        async with self._lock:
            if self.current_calls >= self.max_calls:
                raise BudgetExceededException("Investigation LLM calls budget exceeded.")
            if self.current_tokens + estimated_tokens > self.max_tokens:
                raise BudgetExceededException("Investigation tokens budget exceeded.")
            if self.current_cost + estimated_cost > self.max_cost:
                raise BudgetExceededException("Investigation cost budget exceeded.")
                
            # Optimistically increment
            self.current_calls += 1
            self.current_tokens += estimated_tokens
            self.current_cost += estimated_cost

    async def reconcile_budget(self, actual_tokens: int, estimated_tokens: int, actual_cost: float, estimated_cost: float, latency_ms: int):
        """Reconciles the optimistic reservation with actual usage after the call."""
        async with self._lock:
            # Adjust the estimates back out, add the actuals
            self.current_tokens = self.current_tokens - estimated_tokens + actual_tokens
            self.current_cost = self.current_cost - estimated_cost + actual_cost
            self.current_latency_ms += latency_ms

def get_default_budget() -> BudgetController:
    """Creates a budget controller using environment variables."""
    max_calls = int(os.getenv("LLM_MAX_CALLS", "12"))
    max_tokens = int(os.getenv("LLM_MAX_TOKENS", "30000"))
    max_cost = float(os.getenv("LLM_MAX_COST_USD", "0.10"))
    max_latency_ms = int(os.getenv("LLM_MAX_LATENCY_MS", "60000"))
    return BudgetController(max_calls, max_tokens, max_cost, max_latency_ms)
