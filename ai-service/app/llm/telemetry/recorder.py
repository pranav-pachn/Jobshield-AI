import asyncio
import os
import aiohttp
import logging
from typing import List, Optional
from .schemas import LLMInvocationRecord

logger = logging.getLogger(__name__)

# Backend runs on port 4000 (Express API). On Render, configure BACKEND_URL via environment variable.
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:4000").rstrip("/")
TELEMETRY_ENDPOINT = f"{BACKEND_URL}/api/telemetry/llm-invocation"

# Non-blocking async queue for fire-and-forget telemetry
_telemetry_queue: asyncio.Queue = asyncio.Queue(maxsize=1000)
_worker_task: Optional[asyncio.Task] = None
_session: Optional[aiohttp.ClientSession] = None
_is_running = False


async def _telemetry_worker():
    """Background worker that flushes the telemetry queue in batches."""
    global _session
    timeout = aiohttp.ClientTimeout(total=5)
    _session = aiohttp.ClientSession(timeout=timeout)
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
                async with _session.post(TELEMETRY_ENDPOINT, json=payload) as response:
                    if response.status not in (200, 201, 202):
                        logger.warning(f"Telemetry API returned status {response.status}")
            except Exception as e:
                # Fire and forget. Telemetry must NEVER prevent an investigation from completing.
                logger.warning(f"Telemetry push skipped (backend unavailable or non-responsive): {e}")
                
            for _ in range(len(batch)):
                _telemetry_queue.task_done()
                
    except asyncio.CancelledError:
        pass
    finally:
        if _session and not _session.closed:
            await _session.close()


def start_telemetry_worker():
    """Starts the background telemetry worker using the running event loop."""
    global _worker_task, _is_running
    if _worker_task is None or _worker_task.done():
        try:
            loop = asyncio.get_running_loop()
        except RuntimeError:
            loop = asyncio.get_event_loop()
        _is_running = True
        _worker_task = loop.create_task(_telemetry_worker())
        logger.info(f"Telemetry worker started (endpoint: {TELEMETRY_ENDPOINT})")


def stop_telemetry_worker():
    """Stops the telemetry worker synchronously (best-effort)."""
    global _worker_task, _is_running
    _is_running = False
    if _worker_task and not _worker_task.done():
        _worker_task.cancel()
        _worker_task = None
        logger.info("Telemetry worker cancelled")


async def shutdown_telemetry_worker(timeout_seconds: float = 1.0):
    """Clean async shutdown for application lifespan handlers."""
    global _worker_task, _session, _is_running
    _is_running = False
    if _worker_task and not _worker_task.done():
        _worker_task.cancel()
        try:
            await asyncio.wait_for(_worker_task, timeout=timeout_seconds)
        except (asyncio.CancelledError, asyncio.TimeoutError):
            pass
        _worker_task = None
    if _session and not _session.closed:
        await _session.close()
    logger.info("Telemetry worker cleanly shut down")


def record_invocation(record: LLMInvocationRecord):
    """Enqueues an invocation record. Completely non-blocking and safe."""
    try:
        _telemetry_queue.put_nowait(record)
    except asyncio.QueueFull:
        logger.warning("Telemetry queue full (1000 records). Dropping record to preserve latency.")
    except Exception as exc:
        logger.warning(f"Telemetry enqueue skipped: {exc}")
