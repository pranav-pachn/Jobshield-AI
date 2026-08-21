import asyncio
import time
import logging
from collections import OrderedDict
from typing import Callable, Awaitable, Any, Tuple

logger = logging.getLogger(__name__)

class CacheEntry:
    def __init__(self, result: Any, expires_at: float):
        self.result = result
        self.expires_at = expires_at

class DeduplicatingLRUCache:
    """
    An LRU Cache with TTL and in-flight request deduplication.
    Prevents cache stampedes by coalescing identical concurrent requests into a single computation.
    """
    def __init__(self, capacity: int, ttl_seconds: int):
        self.capacity = capacity
        self.ttl_seconds = ttl_seconds
        self.cache = OrderedDict()
        self.in_flight = {}
        self.lock = asyncio.Lock()

    async def get_or_compute(self, key: str, compute_func: Callable[[], Awaitable[Any]]) -> Tuple[Any, bool]:
        """
        Returns (result, is_hit).
        is_hit is True if the result was served from cache or coalesced from an in-flight request.
        """
        async with self.lock:
            # 1. Check cache
            if key in self.cache:
                entry = self.cache[key]
                if time.time() < entry.expires_at:
                    self.cache.move_to_end(key)
                    return entry.result, True  # HIT
                else:
                    # Expired
                    del self.cache[key]
            
            # 2. Check in-flight (Cache Stampede Protection)
            if key in self.in_flight:
                future = self.in_flight[key]
                wait = True
            else:
                # 3. Create Future and register as in-flight
                future = asyncio.Future()
                self.in_flight[key] = future
                wait = False
                
        if wait:
            logger.warning(f"Cache stampede prevented! Awaiting in-flight computation.")
            result = await future
            return result, True  # HIT (coalesced)

        # 4. Perform the computation
        try:
            result = await compute_func()
        except Exception as e:
            # Propagate error and cleanup
            async with self.lock:
                if key in self.in_flight:
                    del self.in_flight[key]
                if not future.done():
                    future.set_exception(e)
            raise e

        # 5. Store result and notify waiting tasks
        async with self.lock:
            expires_at = time.time() + self.ttl_seconds
            self.cache[key] = CacheEntry(result, expires_at)
            self.cache.move_to_end(key)
            if len(self.cache) > self.capacity:
                self.cache.popitem(last=False)
            
            if key in self.in_flight:
                del self.in_flight[key]
            if not future.done():
                future.set_result(result)
                
        return result, False  # MISS
