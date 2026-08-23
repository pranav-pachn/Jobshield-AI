import json
import logging
from typing import List, Dict, Tuple
from sentence_transformers import SentenceTransformer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# Load the exact model used in production
try:
    model = SentenceTransformer('all-MiniLM-L6-v2')
except Exception as e:
    logging.warning("Could not load SentenceTransformer, continuing without it...")
    model = None

def run_semantic_similarity(dataset_path: str) -> dict:
    with open(dataset_path, 'r', encoding='utf-8') as f:
        cases = json.load(f)

    texts = [c['text'] for c in cases]
    ids = [c['id'] for c in cases]
    n = len(cases)

    report = {
        "embedding_similarity_pairs": [],
        "tfidf_similarity_pairs": []
    }

    # 1. TF-IDF Cosine Similarity
    try:
        vectorizer = TfidfVectorizer(stop_words='english')
        tfidf_matrix = vectorizer.fit_transform(texts)
        tfidf_sim = cosine_similarity(tfidf_matrix)

        for i in range(n):
            for j in range(i + 1, n):
                sim = float(tfidf_sim[i][j])
                if sim >= 0.70:
                    report["tfidf_similarity_pairs"].append({
                        "case_a": ids[i],
                        "case_b": ids[j],
                        "similarity": round(sim, 3)
                    })
    except Exception as e:
        logging.error(f"TF-IDF failed: {e}")

    # 2. Production Embedding Similarity
    if model:
        try:
            embeddings = model.encode(texts)
            embed_sim = cosine_similarity(embeddings)

            for i in range(n):
                for j in range(i + 1, n):
                    sim = float(embed_sim[i][j])
                    if sim >= 0.70:
                        report["embedding_similarity_pairs"].append({
                            "case_a": ids[i],
                            "case_b": ids[j],
                            "similarity": round(sim, 3)
                        })
        except Exception as e:
            logging.error(f"Embedding sim failed: {e}")

    # Sort descending
    report["tfidf_similarity_pairs"].sort(key=lambda x: x["similarity"], reverse=True)
    report["embedding_similarity_pairs"].sort(key=lambda x: x["similarity"], reverse=True)
    
    return report

if __name__ == "__main__":
    import sys
    res = run_semantic_similarity(sys.argv[1] if len(sys.argv) > 1 else "../datasets/evaluation/rag_benchmark_cases.json")
    print(json.dumps(res, indent=2))
