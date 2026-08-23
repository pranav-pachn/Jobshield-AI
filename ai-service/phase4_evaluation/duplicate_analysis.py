import json
import hashlib
import re
from collections import defaultdict
from difflib import SequenceMatcher

def normalize_text(text: str) -> str:
    """Normalize whitespace and casing for exact hash match."""
    # Convert to lowercase
    t = text.lower()
    # Remove all punctuation and extra whitespace
    t = re.sub(r'[^\w\s]', '', t)
    t = re.sub(r'\s+', ' ', t)
    return t.strip()

def hash_text(text: str) -> str:
    """SHA-256 hash of normalized text."""
    return hashlib.sha256(normalize_text(text).encode('utf-8')).hexdigest()

def char_similarity(text1: str, text2: str) -> float:
    """Returns a float between 0.0 and 1.0."""
    return SequenceMatcher(None, text1, text2).ratio()

def run_duplicate_analysis(dataset_path: str) -> dict:
    with open(dataset_path, 'r', encoding='utf-8') as f:
        cases = json.load(f)

    exact_groups = defaultdict(list)
    for case in cases:
        h = hash_text(case['text'])
        exact_groups[h].append(case['id'])

    duplicate_groups = {k: v for k, v in exact_groups.items() if len(v) > 1}
    
    unique_cases = len(exact_groups)
    total_cases = len(cases)

    # We also do a quick near-duplicate check (O(N^2) but N=100 is tiny)
    near_duplicates = []
    for i in range(len(cases)):
        for j in range(i + 1, len(cases)):
            sim = char_similarity(cases[i]['text'], cases[j]['text'])
            if sim >= 0.85: # Candidate threshold
                near_duplicates.append({
                    "case_a": cases[i]['id'],
                    "case_b": cases[j]['id'],
                    "similarity": round(sim, 3)
                })

    return {
        "total_cases": total_cases,
        "unique_cases": unique_cases,
        "exact_duplicate_cases_count": total_cases - unique_cases,
        "exact_duplicate_groups": duplicate_groups,
        "near_duplicate_pairs": near_duplicates
    }

if __name__ == "__main__":
    import sys
    res = run_duplicate_analysis(sys.argv[1] if len(sys.argv) > 1 else "../datasets/evaluation/rag_benchmark_cases.json")
    print(json.dumps(res, indent=2))
