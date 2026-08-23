import os
import json
import asyncio
from rag_leakage import run_rag_leakage
from label_leakage import run_label_leakage
from cache_audit import run_cache_audit

async def run_holdout_b_audit():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    dataset_path = os.path.join(base_dir, "..", "datasets", "evaluation", "rag_benchmark_holdout_b_adversarial.json")
    
    print("Running Holdout B Contamination Audit...")

    print("1. RAG Leakage (Case match)...")
    rag_report = run_rag_leakage(dataset_path)
    
    has_leakage = False
    
    # Check if there are any R2, R3, R4, or R5 classifications in the summary
    summary = rag_report.get("summary", {})
    for level in ["R2", "R3", "R4", "R5"]:
        if summary.get(level, 0) > 0:
            print(f"FAILED: RAG Leakage detected. {level} count: {summary[level]}")
            has_leakage = True
            
    print("2. Label Leakage...")
    label_report = run_label_leakage(base_dir)
    if "FAIL" in label_report["summary"].values():
         print("FAILED: Label leakage detected in application code!")
         for flag in label_report.get("flags", []):
             print(f"  {flag}")
         has_leakage = True
         
    print("3. Cache Contamination...")
    cache_report = await run_cache_audit()
    
    if has_leakage:
        print("\n[!] HOLDOUT B CONTAMINATION AUDIT FAILED.")
        return False
    else:
        print("\n[+] HOLDOUT B CONTAMINATION AUDIT PASSED. 0 Leakage.")
        return True

if __name__ == "__main__":
    asyncio.run(run_holdout_b_audit())
