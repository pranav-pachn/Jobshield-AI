import os
import sys
import json
import logging
from typing import Dict, List
from dotenv import load_dotenv

# Force load Atlas URI from backend/.env BEFORE importing rag_retrieval
backend_env = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'backend', '.env'))
if os.path.exists(backend_env):
    load_dotenv(backend_env, override=True)
    logging.info(f"Loaded Atlas URI from {backend_env}")

# Add parent to path so we can import production modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Import exactly the production functions
try:
    from services.rag_retrieval import embed_query, retrieve_chunks, rerank_chunks
except ImportError as e:
    logging.warning(f"Could not import production RAG: {e}")
    embed_query = None

from duplicate_analysis import char_similarity
from semantic_similarity import model

def categorize_rag_overlap(case_text: str, chunk_content: str, sim: float) -> str:
    """
    R0 - No meaningful textual/entity overlap (< 0.20)
    R1 - Generic threat-pattern overlap (0.20 - 0.70)
    R2 - Strong semantic/template similarity (0.70 - 0.85)
    R3 - Same company/domain (handled separately or as a specific check, fallback to R2 here)
    R4 - Near-identical evaluation case (0.85 - 0.95)
    R5 - Exact evaluation case (> 0.95)
    """
    if sim >= 0.95:
        return "R5"
    if sim >= 0.85:
        return "R4"
    if sim >= 0.70:
        return "R2"
    if sim >= 0.20:
        return "R1"
    return "R0"

def run_rag_leakage(dataset_path: str) -> dict:
    if not embed_query:
        return {"error": "RAG module not available"}

    with open(dataset_path, 'r', encoding='utf-8') as f:
        cases = json.load(f)

    report = {
        "summary": {
            "R0": 0, "R1": 0, "R2": 0, "R3": 0, "R4": 0, "R5": 0
        },
        "flags": [],
        "detailed_results": []
    }

    from sklearn.metrics.pairwise import cosine_similarity
    
    for case in cases:
        case_id = case['id']
        try:
            embedding = embed_query(case['text'])
            raw_chunks = retrieve_chunks(embedding, limit=5)
            chunks = rerank_chunks(raw_chunks)
            
            highest_category = "R0"
            max_sim = 0.0
            
            case_matches = []

            for c in chunks:
                chunk_text = c.get('content', '')
                chunk_id = c.get('chunkId', 'unknown')
                
                # We use embedding similarity for a strong semantic check
                if model:
                    chunk_emb = model.encode([chunk_text])
                    sim = float(cosine_similarity([embedding], chunk_emb)[0][0])
                else:
                    sim = char_similarity(case['text'], chunk_text)
                
                max_sim = max(max_sim, sim)
                cat = categorize_rag_overlap(case['text'], chunk_text, sim)
                
                case_matches.append({
                    "chunkId": chunk_id,
                    "similarity": round(sim, 3),
                    "classification": cat,
                    "content_snippet": chunk_text[:100] + "..." if len(chunk_text) > 100 else chunk_text
                })
                
                # If we hit an R4 or R5, flag it immediately
                if cat in ["R4", "R5"]:
                    report["flags"].append({
                        "case_id": case_id,
                        "chunkId": chunk_id,
                        "category": cat,
                        "similarity": round(sim, 3)
                    })
                
                # Update highest category for summary
                order = {"R0":0, "R1":1, "R2":2, "R3":3, "R4":4, "R5":5}
                if order[cat] > order[highest_category]:
                    highest_category = cat
            
            report["summary"][highest_category] += 1
            
            report["detailed_results"].append({
                "case_id": case_id,
                "retrieval": {
                    "status": "SUCCESS",
                    "documents_checked": len(chunks)
                },
                "matches": case_matches
            })
            
        except Exception as e:
            logging.error(f"Failed RAG retrieval for {case_id}: {e}")
            report["detailed_results"].append({
                "case_id": case_id,
                "retrieval": {
                    "status": f"FAILED: {str(e)}",
                    "documents_checked": 0
                },
                "matches": []
            })

    return report

if __name__ == "__main__":
    res = run_rag_leakage(sys.argv[1] if len(sys.argv) > 1 else "../datasets/evaluation/rag_benchmark_cases.json")
    print(json.dumps(res, indent=2))
