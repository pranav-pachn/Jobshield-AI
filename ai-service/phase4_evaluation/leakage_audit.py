import os
import json
import asyncio
from collections import defaultdict

from duplicate_analysis import run_duplicate_analysis
from semantic_similarity import run_semantic_similarity
from rag_leakage import run_rag_leakage
from label_leakage import run_label_leakage
from cache_audit import run_cache_audit

def extract_entities(dataset_path: str):
    with open(dataset_path, 'r', encoding='utf-8') as f:
        cases = json.load(f)

    companies = defaultdict(int)
    domains = defaultdict(int)

    for case in cases:
        # Extract metadata if available. Based on typical structure:
        # If 'company' or 'domain' exists in expectedCategories or text, we can approximate
        # For a robust audit, we'd need entity extraction. For now, we will extract simple markers.
        # Here we just parse basic metadata if present in the benchmark JSON
        if "expectedEvidence" in case:
            for ev in case["expectedEvidence"]:
                if ".com" in ev or ".org" in ev or ".net" in ev:
                    domains[ev] += 1
                elif ev.istitle():
                    companies[ev] += 1

    return {
        "company_overlap": {k: v for k, v in companies.items() if v > 1},
        "domain_overlap": {k: v for k, v in domains.items() if v > 1}
    }

async def run_audit(dataset_path: str, ai_service_path: str, report_path: str):
    print("Running Phase 4A Leakage Audit...")

    print("1. Duplicate Analysis...")
    duplicate_report = run_duplicate_analysis(dataset_path)

    print("2. Semantic Similarity...")
    semantic_report = run_semantic_similarity(dataset_path)

    print("3. Entity Overlap...")
    entity_report = extract_entities(dataset_path)

    print("4. RAG Leakage...")
    rag_report = run_rag_leakage(dataset_path)

    print("5. Label Leakage...")
    label_report = run_label_leakage(ai_service_path)

    print("6. Cache Audit...")
    cache_report = await run_cache_audit()

    final_report = {
        "baseline_note": "Dataset: rag_benchmark_cases.json, Pre-audit measured baseline: F1=1.000",
        "duplicate_analysis": duplicate_report,
        "semantic_similarity": semantic_report,
        "entity_overlap": entity_report,
        "rag_leakage": rag_report,
        "label_leakage": label_report,
        "cache_audit": cache_report
    }

    os.makedirs(os.path.dirname(report_path), exist_ok=True)
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(final_report, f, indent=2)

    print(f"Audit complete. Report saved to {report_path}")

if __name__ == "__main__":
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    dataset = os.path.join(base_dir, "..", "datasets", "evaluation", "rag_benchmark_cases.json")
    report = os.path.join(base_dir, "phase4_evaluation", "reports", "phase4a_leakage_report.json")
    asyncio.run(run_audit(dataset, base_dir, report))
