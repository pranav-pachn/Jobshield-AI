import os
import math
import time
import logging
from typing import List, Dict, Any, Optional
import httpx

try:
    from dotenv import load_dotenv
    # Try to load env for standalone testing
    load_dotenv(dotenv_path='../.env')
    load_dotenv()
except ImportError:
    pass

logger = logging.getLogger(__name__)

MONGODB_URI = os.getenv('MONGODB_URI')
EMBEDDING_PROVIDER = os.getenv('EMBEDDING_PROVIDER', 'huggingface').strip().lower()
HF_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
HF_DEFAULT_ENDPOINT = f"https://router.huggingface.co/hf-inference/models/{HF_MODEL_NAME}"
HF_EMBEDDING_URL = os.getenv('HF_EMBEDDING_URL', HF_DEFAULT_ENDPOINT).strip()

# Lazy initialization for MongoDB client and local model
_client = None
_db = None
_embed_model = None

def _get_hf_token() -> str:
    """Retrieve canonical HF token, falling back to legacy variable names."""
    token = os.getenv("HF_TOKEN") or os.getenv("HF_API_KEY") or os.getenv("HF_API_TOKEN")
    if not token or not token.strip():
        raise ValueError(
            "Missing Hugging Face API token. EMBEDDING_PROVIDER is 'huggingface', "
            "but neither HF_TOKEN nor HF_API_KEY is configured in the environment."
        )
    return token.strip()

def _validate_and_normalize_vector(vec: Any, expected_dim: int = 384) -> List[float]:
    """Validates vector length, checks for non-finite values, and enforces L2 unit normalization."""
    if not isinstance(vec, (list, tuple)):
        raise ValueError(f"Expected embedding to be a list or tuple, got {type(vec).__name__}")
    if len(vec) != expected_dim:
        raise ValueError(f"Embedding dimension mismatch: expected {expected_dim}, got {len(vec)}")
    
    clean_vec: List[float] = []
    for idx, val in enumerate(vec):
        if not isinstance(val, (int, float)) or not math.isfinite(val):
            raise ValueError(f"Embedding element at index {idx} is non-finite or non-numeric: {val}")
        clean_vec.append(float(val))
        
    norm_sq = sum(x * x for x in clean_vec)
    if norm_sq <= 0.0 or not math.isfinite(norm_sq):
        raise ValueError("Embedding vector has zero or non-finite L2 norm (all-zero vector rejected)")
        
    norm = math.sqrt(norm_sq)
    # Unit normalization (compatible with SentenceTransformer.encode default L2 norm)
    if abs(norm - 1.0) > 1e-4:
        clean_vec = [x / norm for x in clean_vec]
        
    return clean_vec

def _parse_hf_response(data: Any, expected_dim: int = 384) -> List[float]:
    """Parses various Hugging Face inference response shapes into a pooled, normalized 1D vector."""
    if isinstance(data, dict):
        if "error" in data:
            raise RuntimeError(f"Hugging Face Inference API error: {data['error']}")
        # OpenAI-compatible router format
        if "data" in data and isinstance(data["data"], list) and len(data["data"]) > 0:
            item = data["data"][0]
            if isinstance(item, dict) and "embedding" in item:
                return _validate_and_normalize_vector(item["embedding"], expected_dim)
        raise ValueError(f"Unexpected dictionary response from Hugging Face API: {list(data.keys())}")
        
    if not isinstance(data, list) or len(data) == 0:
        raise ValueError(f"Invalid or empty response format from Hugging Face API: {type(data).__name__}")
        
    # Shape 1: 1D list of 384 floats
    if isinstance(data[0], (int, float)):
        return _validate_and_normalize_vector(data, expected_dim)
        
    # Shape 2: 2D list
    if isinstance(data[0], list):
        if len(data[0]) == 0:
            raise ValueError("Hugging Face API returned empty nested embedding list.")
            
        # Shape 2a: [[float, ...]] (batch of 1 sentence embedding)
        if len(data) == 1 and len(data[0]) == expected_dim and isinstance(data[0][0], (int, float)):
            return _validate_and_normalize_vector(data[0], expected_dim)
            
        # Shape 2b: Token embeddings (seq_len, expected_dim). Apply mean pooling across tokens.
        if len(data[0]) == expected_dim and isinstance(data[0][0], (int, float)):
            seq_len = len(data)
            pooled = [sum(data[t][d] for t in range(seq_len)) / seq_len for d in range(expected_dim)]
            return _validate_and_normalize_vector(pooled, expected_dim)
            
    raise ValueError(f"Unrecognized embedding response structure with length {len(data)}")

def embed_query_huggingface(
    query: str,
    token: Optional[str] = None,
    endpoint_url: Optional[str] = None,
    timeout_seconds: float = 15.0,
    max_retries: int = 3,
    client: Optional[httpx.Client] = None
) -> List[float]:
    """
    Generates a 384-dimensional embedding using Hugging Face Serverless Inference API
    for sentence-transformers/all-MiniLM-L6-v2.
    Implements explicit timeout and bounded exponential backoff retries.
    """
    hf_token = token or _get_hf_token()
    url = endpoint_url or HF_EMBEDDING_URL
    
    headers = {
        "Authorization": f"Bearer {hf_token}",
        "Content-Type": "application/json",
        "User-Agent": "JobShield-AI-Service/0.2.0"
    }
    payload = {
        "inputs": query,
        "options": {
            "wait_for_model": True,
            "use_cache": True
        }
    }
    
    timeout_cfg = httpx.Timeout(connect=5.0, read=timeout_seconds, write=5.0, pool=5.0)
    should_close_client = False
    if client is None:
        client = httpx.Client(timeout=timeout_cfg)
        should_close_client = True
        
    last_exception: Optional[Exception] = None
    try:
        for attempt in range(1, max_retries + 1):
            try:
                resp = client.post(url, headers=headers, json=payload)
                
                # Success
                if resp.status_code == 200:
                    try:
                        data = resp.json()
                    except Exception as parse_err:
                        raise ValueError(f"Failed to parse Hugging Face response as JSON: {parse_err}") from parse_err
                    return _parse_hf_response(data, expected_dim=384)
                    
                # Permanent auth failure: fail fast without retry
                if resp.status_code in (401, 403):
                    err_msg = f"Hugging Face authentication failed (HTTP {resp.status_code}): {resp.text.strip()[:300]}. Please verify HF_TOKEN."
                    logger.error(err_msg)
                    raise RuntimeError(err_msg)
                    
                # Bad request: fail fast
                if resp.status_code == 400:
                    err_msg = f"Hugging Face bad request (HTTP 400): {resp.text.strip()[:300]}"
                    logger.error(err_msg)
                    raise ValueError(err_msg)
                    
                # Transient rate limit (429) or model loading (503) or gateway errors (500, 502, 504)
                if resp.status_code in (429, 500, 502, 503, 504):
                    backoff = 0.5 * (2 ** (attempt - 1))
                    try:
                        resp_json = resp.json()
                        if isinstance(resp_json, dict) and "estimated_time" in resp_json:
                            est_time = float(resp_json["estimated_time"])
                            backoff = max(backoff, min(est_time, 10.0))
                    except Exception:
                        pass
                        
                    logger.warning(
                        f"Hugging Face inference attempt {attempt}/{max_retries} returned HTTP {resp.status_code}. "
                        f"Retrying in {backoff:.2f}s..."
                    )
                    if attempt < max_retries:
                        time.sleep(backoff)
                        continue
                    else:
                        raise RuntimeError(
                            f"Hugging Face inference failed after {max_retries} attempts with HTTP {resp.status_code}: {resp.text.strip()[:300]}"
                        )
                        
                # Any other unexpected HTTP status
                raise RuntimeError(
                    f"Hugging Face inference returned unexpected HTTP {resp.status_code}: {resp.text.strip()[:300]}"
                )
                
            except (httpx.TimeoutException, httpx.ConnectError) as net_err:
                last_exception = net_err
                backoff = 0.5 * (2 ** (attempt - 1))
                logger.warning(
                    f"Hugging Face inference network error on attempt {attempt}/{max_retries}: {net_err}. "
                    f"Retrying in {backoff:.2f}s..."
                )
                if attempt < max_retries:
                    time.sleep(backoff)
                    continue
                else:
                    raise RuntimeError(
                        f"Hugging Face inference network failure after {max_retries} attempts: {net_err}"
                    ) from net_err
            except (RuntimeError, ValueError):
                raise
            except Exception as unk_err:
                last_exception = unk_err
                if attempt < max_retries:
                    time.sleep(0.5 * (2 ** (attempt - 1)))
                    continue
                raise RuntimeError(f"Hugging Face embedding generation failed: {unk_err}") from unk_err
                
        if last_exception:
            raise last_exception
        raise RuntimeError("Hugging Face embedding retry loop terminated unexpectedly without result.")
    finally:
        if should_close_client:
            client.close()

def embed_query_local(query: str) -> List[float]:
    """Generates an embedding using the local SentenceTransformer model."""
    global _embed_model
    try:
        if _embed_model is None:
            from sentence_transformers import SentenceTransformer
            logger.info("Loading local SentenceTransformer model for retrieval...")
            _embed_model = SentenceTransformer('all-MiniLM-L6-v2')
        raw_emb = _embed_model.encode(query).tolist()
        return _validate_and_normalize_vector(raw_emb, expected_dim=384)
    except ImportError as e:
        logger.error(f"Cannot run local embeddings: sentence_transformers not installed: {e}")
        raise RuntimeError(
            "EMBEDDING_PROVIDER is set to 'local', but 'sentence-transformers' is not installed in the environment."
        ) from e
    except Exception as e:
        logger.error(f"Error embedding query locally: {e}")
        raise

def embed_query(query: str) -> List[float]:
    """
    Generates a 384-dimensional embedding for the input query string using
    the configured EMBEDDING_PROVIDER ('huggingface' or 'local').
    """
    provider = os.getenv("EMBEDDING_PROVIDER", EMBEDDING_PROVIDER).strip().lower()
    allow_local_fallback = os.getenv("EMBEDDING_ALLOW_LOCAL_FALLBACK", "false").strip().lower() == "true"
    
    if provider == "huggingface":
        try:
            return embed_query_huggingface(query)
        except Exception as hf_err:
            if allow_local_fallback:
                logger.warning(
                    f"Hugging Face remote embedding failed ({hf_err}), attempting explicitly enabled local fallback..."
                )
                try:
                    return embed_query_local(query)
                except Exception as local_err:
                    logger.error(f"Local fallback also failed: {local_err}")
            raise hf_err
            
    elif provider == "local":
        return embed_query_local(query)
        
    else:
        raise ValueError(
            f"Unsupported EMBEDDING_PROVIDER '{provider}'. Supported providers are: 'huggingface', 'local'."
        )

def retrieve_chunks(embedding: List[float], limit: int = 5) -> List[Dict[str, Any]]:
    """Retrieves relevant threat chunks using Atlas Vector Search on threatchunks collection."""
    db = get_db()
    if db is None:
        raise ValueError("MongoDB not initialized. Cannot retrieve chunks.")

    # threatchunks has 384-dim embeddings from all-MiniLM-L6-v2 and a vector_index
    # It uses evidenceQuality instead of status; no status filter needed.
    pipeline = [
        {
            "$vectorSearch": {
                "index": "vector_index",
                "path": "embedding",
                "queryVector": embedding,
                "numCandidates": limit * 10,
                "limit": limit,
            }
        },
        {
            "$project": {
                "_id": 0,
                "documentId": {"$toString": "$documentId"},
                "content": 1,
                "type": {"$ifNull": ["$category", "threat_chunk"]},
                # Map threatchunks evidenceQuality (primary/secondary) to the source enum
                # used by the reranker and LLM agent
                "provenance": {
                    "source": {
                        "$switch": {
                            "branches": [
                                {"case": {"$eq": ["$evidenceQuality", "primary"]}, "then": "OFFICIAL_THREAT_INTEL"},
                                {"case": {"$eq": ["$evidenceQuality", "secondary"]}, "then": "SYSTEM_GENERATED"}
                            ],
                            "default": "USER_FEEDBACK"
                        }
                    },
                    "confidenceScore": {"$cond": [{"$eq": ["$evidenceQuality", "primary"]}, 0.95, 0.80]}
                },
                "score": {"$meta": "vectorSearchScore"}
            }
        }
    ]

    collection = db['threatchunks']
    try:
        return list(collection.aggregate(pipeline))
    except Exception as e:
        logging.error(f"Error executing vector search on threatchunks: {e}")
        return []

def rerank_chunks(chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Reranks retrieved chunks by blending vector similarity with provenance quality heuristics.
    """
    quality_weights = {
        "OFFICIAL_THREAT_INTEL": 0.15,
        "SYSTEM_GENERATED": 0.10,
        "USER_FEEDBACK": 0.05
    }
    
    for chunk in chunks:
        # Base vector score
        base_score = chunk.get('score', 0)
        
        # Boost based on evidence quality
        prov = chunk.get('provenance', {})
        source_type = prov.get('source', 'USER_FEEDBACK')
        quality_boost = quality_weights.get(source_type, 0.0)
        
        chunk['rerank_score'] = base_score + quality_boost

    # Sort descending by rerank_score
    chunks.sort(key=lambda x: x['rerank_score'], reverse=True)
    return chunks

def format_context(chunks: List[Dict[str, Any]]) -> str:
    """Formats retrieved chunks into a context string for the LLM."""
    if not chunks:
        return "No relevant threat intelligence found."
        
    context_parts = ["=== RELEVANT THREAT INTELLIGENCE ==="]
    
    for i, chunk in enumerate(chunks, 1):
        score = chunk.get('score', 0)
        prov = chunk.get('provenance', {})
        source_type = prov.get('source', 'USER_FEEDBACK')
        conf = prov.get('confidenceScore', 0.9)
        content = chunk.get('content', '')
        
        context_parts.append(f"\n[Evidence {i}] (Relevance: {score:.2f}, Source: {source_type}, Confidence: {conf})")
        context_parts.append(content)
        
    return "\n".join(context_parts)
