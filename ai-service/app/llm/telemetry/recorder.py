import asyncio
import os
import aiohttp
import logging
from typing import List
from .schemas import LLMInvocationRecord

logger = logging.getLogger(__name__)

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:3000")
TELEMETRY_ENDPOINT = f"{BACKEND_URL}/api/telemetry/llm-invocation"

# Simple async queue for fire-and-forget telemetry
_telemetry_queue = asyncio.Queue(maxsize=1000)
_worker_task = None

async def _telemetry_worker():
    """Background worker that flushes the telemetry queue."""
    session = aiohttp.ClientSession()
    try:
        while True:
            batch: List[LLMInvocationRecord] = []
            
            # Wait for at least one item
            item = await _telemetry_queue.get()
            batch.append(item)
            
            # Drain up to 50 items if available
            while len(batch) < 50:
                try:
                    batch.append(_telemetry_queue.get_nowait())
                except asyncio.QueueEmpty:
                    break
                    
            try:
                payload = [record.model_dump() for record in batch]
                async with session.post(TELEMETRY_ENDPOINT, json=payload, timeout=5) as response:
                    if response.status not in (200, 202):
                        logger.warning(f"Telemetry API returned {response.status}")
            except Exception as e:
                # Fire and forget. Drop the telemetry if the backend is down.
                logger.error(f"Failed to push telemetry: {e}")
                
            for _ in range(len(batch)):
                _telemetry_queue.task_done()
                
    except asyncio.CancelledError:
        pass
    finally:
        await session.close()

def start_telemetry_worker():
    """Starts the background telemetry worker. Call this at app startup."""
    global _worker_task
    if _worker_task is None:
        loop = asyncio.get_event_loop()
        _worker_task = loop.create_task(_telemetry_worker())

def stop_telemetry_worker():
    """Stops the telemetry worker cleanly."""
    global _worker_task
    if _worker_task:
        _worker_task.cancel()
        _worker_task = None

def record_invocation(record: LLMInvocationRecord):
    """Enqueues an invocation record. Non-blocking."""
    try:
        _telemetry_queue.put_nowait(record)
    except asyncio.QueueFull:
        logger.error("Telemetry queue full, dropping record.")
