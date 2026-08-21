import logging
import json
import asyncio
import json
from app.schemas.agent_contracts import InvestigationInput, ThreatIntelligenceOutput, ProviderAttempt
from services.rag_retrieval import embed_query, retrieve_chunks, rerank_chunks
from services.llm_service import call_llm_json, AGENT_THREAT

logger = logging.getLogger(__name__)

from app.utils.cache import DeduplicatingLRUCache
import hashlib
import re
from copy import deepcopy

# B6: Threat-Intelligence Semaphore (Application-level backpressure)
_mongo_semaphore = asyncio.Semaphore(10)

# Caching: LRU + TTL with in-flight deduplication
_threat_cache = DeduplicatingLRUCache(capacity=500, ttl_seconds=86400) # 24h TTL

import time

def _normalize_text(text: str) -> str:
    # Trim whitespace, normalize line endings, collapse repeated whitespace
    text = text.replace('\r\n', '\n').replace('\r', '\n')
    return re.sub(r'\s+', ' ', text).strip()

async def _async_retrieve_chunks(embedding, limit):
    queue_start = time.time()
    async with _mongo_semaphore:
        queue_wait_ms = int((time.time() - queue_start) * 1000)
        start_net = time.time()
        chunks = await asyncio.to_thread(retrieve_chunks, embedding, limit=limit)
        net_latency_ms = int((time.time() - start_net) * 1000)
        return chunks, queue_wait_ms, net_latency_ms

async def run_threat_intelligence_agent(input_data: InvestigationInput, rag_limit: int = 3, max_tokens: int = 1500) -> ThreatIntelligenceOutput:
    """
    Agent 3 — Threat Intelligence Agent
    Reuses Phase 1 RAG infrastructure to find and synthesize known scam patterns.
    Implements LRU+TTL caching and in-flight deduplication for duplicated workloads.
    """
    logger.info("Running Threat Intelligence Agent...")
    start_time = time.time()
    
    # 1. Generate cache key using normalized full text + versioning
    normalized_job_text = _normalize_text(input_data.jobText)
    prompt_version = "v1"
    model_version = "auto"
    cache_string = f"threat-intel:{prompt_version}:{model_version}:{rag_limit}:{max_tokens}:{normalized_job_text}"
    cache_key = hashlib.sha256(cache_string.encode('utf-8')).hexdigest()
    
    async def _compute_threat_intelligence():
        # Generate query (using first 1000 characters of the raw text for embedding)
        query = input_data.jobText[:1000]
        
        # 2. RAG Retrieval (Wrapped in to_thread and semaphore to avoid blocking event loop)
        embedding = await asyncio.to_thread(embed_query, query)
        chunks, mongo_q_wait, mongo_net = await _async_retrieve_chunks(embedding, limit=10)
        chunks = await asyncio.to_thread(rerank_chunks, chunks)
        top_chunks = chunks[:rag_limit]
        
        mongo_attempt = ProviderAttempt(
            provider="MongoDB", 
            model="Atlas Vector Search", 
            status="SUCCESS", 
            latencyMs=mongo_net, 
            queueWaitMs=mongo_q_wait
        )
        
        from app.schemas.agent_contracts import LLMExecutionResult
        if not top_chunks:
            out = ThreatIntelligenceOutput(
                matches=[],
                confidence=1.0,
                status="success"
            )
            return LLMExecutionResult(output=out, status="COMPLETE", providerAttempts=[mongo_attempt], degradationReason=None)
            
        # 3. LLM Synthesis
        system_prompt = """You are the Threat Intelligence Agent for JobShield.
Your job is to synthesize retrieved threat intelligence chunks against a provided job posting.

Identify if the job posting matches any of the known scam mechanisms, reported domains, or government warnings from the retrieved chunks.
You MUST return source-backed evidence. Do NOT invent sources.

Output your analysis strictly in the following JSON format:
{
  "matches": [
    {
      "sourceId": "string (the documentId or chunkId from the source)",
      "similarity": float (0.0 to 1.0, copy from the chunk data),
      "evidenceQuality": "string (primary/secondary/unknown, copy from the chunk data)",
      "relevance": "low|medium|high",
      "agentConfidence": float (0.0 to 1.0, how confident you are in this match),
      "evidence": "string (explanation of why it matches, citing the source)"
    }
  ],
  "confidence": float (0.0 to 1.0, overall confidence in your findings)
}
"""
        
        context_parts = []
        for i, chunk in enumerate(top_chunks):
            context_parts.append({
                "sourceId": chunk.get("documentId", chunk.get("chunkId", f"source_{i}")),
                "similarity": chunk.get("score", 0.0),
                "evidenceQuality": chunk.get("evidenceQuality", "unknown"),
                "content": chunk.get("content", "")
            })
            
        user_prompt = f"=== JOB TEXT ===\n{input_data.jobText}\n\n=== THREAT INTELLIGENCE CHUNKS ===\n{json.dumps(context_parts, indent=2)}"
        
        response = await call_llm_json(system_prompt, user_prompt, ThreatIntelligenceOutput, max_tokens=max_tokens, agent_name=AGENT_THREAT)
        response.providerAttempts.insert(0, mongo_attempt)
        return response

    try:
        # Check cache / deduplicate in-flight requests
        result, is_hit = await _threat_cache.get_or_compute(cache_key, _compute_threat_intelligence)
        
        if is_hit:
            latency_ms = int((time.time() - start_time) * 1000)
            hit_attempt = ProviderAttempt(
                provider="Local Cache",
                model="LRU",
                status="HIT",
                latencyMs=latency_ms,
                queueWaitMs=0
            )
            # Create a deepcopy to avoid polluting the cached object with cache-hit trace attempts for other callers
            cached_result = deepcopy(result)
            cached_result.providerAttempts = [hit_attempt]
            return cached_result
        else:
            return result
    except Exception as e:
        logger.error(f"Threat intelligence agent failed: {e}")
        raise e
