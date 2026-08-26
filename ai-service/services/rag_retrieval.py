import os
import logging
from typing import List, Dict, Any
try:
    from dotenv import load_dotenv
    # Try to load env for standalone testing
    load_dotenv(dotenv_path='../.env')
except ImportError:
    pass

MONGODB_URI = os.getenv('MONGODB_URI')

# Lazy initialization for MongoDB client
_client = None
_db = None
_embed_model = None

def get_db():
    global _client, _db
    if _db is None:
        if not MONGODB_URI:
            logging.warning("MONGODB_URI is not set.")
            return None
        try:
            from pymongo import MongoClient
            from pymongo.uri_parser import parse_uri
        except ImportError:
            logging.error("pymongo not installed — MongoDB RAG retrieval disabled.")
            return None
        # B5: MongoDB Connection Pool Audit
        _client = MongoClient(
            MONGODB_URI,
            maxPoolSize=20,
            minPoolSize=5,
            waitQueueTimeoutMS=10000,
            serverSelectionTimeoutMS=5000,
            socketTimeoutMS=20000,
            connectTimeoutMS=10000
        )
        uri_info = parse_uri(MONGODB_URI)
        db_name = uri_info.get('database') or 'test'
        _db = _client[db_name]
    return _db

def embed_query(query: str) -> List[float]:
    """Generates an embedding for the user's query."""
    global _embed_model
    try:
        if _embed_model is None:
            from sentence_transformers import SentenceTransformer
            logging.info("Loading SentenceTransformer model for retrieval...")
            _embed_model = SentenceTransformer('all-MiniLM-L6-v2')
        embedding = _embed_model.encode(query).tolist()
        return embedding
    except Exception as e:
        logging.error(f"Error embedding query: {e}")
        raise

def retrieve_chunks(embedding: List[float], limit: int = 5) -> List[Dict[str, Any]]:
    """Retrieves relevant threat chunks using Atlas Vector Search."""
    db = get_db()
    if db is None:
        raise ValueError("MongoDB not initialized. Cannot retrieve chunks.")
        
    pipeline = [
        {
            "$vectorSearch": {
                "index": "vector_index", # Ensure you create this index in Atlas UI
                "path": "embedding",
                "queryVector": embedding,
                "numCandidates": limit * 10,
                "limit": limit,
                "filter": {
                    "status": "ACTIVE"
                }
            }
        },
        {
            "$project": {
                "_id": 0,
                "documentId": {"$toString": "$_id"},
                "content": 1,
                "type": 1,
                "status": 1,
                "provenance": 1,
                "score": {"$meta": "vectorSearchScore"}
            }
        }
    ]
    
    collection = db['knowledgeitems']
    try:
        return list(collection.aggregate(pipeline))
    except Exception as e:
        logging.error(f"Error executing vector search: {e}")
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
