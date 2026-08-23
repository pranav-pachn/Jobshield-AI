import os
import sys
import json
import asyncio
from pathlib import Path
from dotenv import load_dotenv

async def evaluate_development():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    load_dotenv(os.path.join(base_dir, '..', 'backend', '.env'))
    if base_dir not in sys.path:
        sys.path.append(base_dir)
        
    from app.orchestrator import investigation_orchestrator
    from app.schemas import agent_contracts
    
    InvestigationInput = agent_contracts.InvestigationInput
    
    dev_file = Path(os.path.join(base_dir, '..', 'datasets', 'evaluation', 'rag_benchmark_dev.json'))
    with open(dev_file, 'r', encoding='utf-8') as f:
        cases = json.load(f)

    print(f"Loaded {len(cases)} Development cases.", flush=True)

    results = []
    
    for i, case in enumerate(cases):
        print(f"--- Evaluating Case {i+1}/{len(cases)}: {case['id']} ---", flush=True)
        
        input_data = InvestigationInput(
            jobText=case['text'],
            companyName=case.get("company", "Unknown"),
            recruiterName=case.get("recruiter", "Unknown")
        )
        
        trace = await investigation_orchestrator.orchestrate_investigation(input_data)
        
        is_scam_expected = case.get("expectedRisk", "UNKNOWN").upper() in ["HIGH", "CRITICAL"]
        
        actual_verdict = trace.finalDecision.verdict.upper() if getattr(trace, "finalDecision", None) and hasattr(trace.finalDecision, "verdict") else "UNKNOWN"
        degraded = getattr(trace, "state", None) == "DEGRADED"
        
        evaluation_details = {}
        overall_risk = 0.0
        confidence = 0.0
        
        if hasattr(trace, "evaluation") and trace.evaluation:
            be = trace.evaluation
            overall_risk = getattr(getattr(be, "overall_risk", None), "score", 0.0)
            confidence = getattr(be, "confidence", 0.0)
            
            evaluation_details = {
                "content_risk": getattr(getattr(be, "content_risk", None), "score", 0.0),
                "recruiter_trust": getattr(getattr(be, "recruiter_trust", None), "score", 0.0),
                "threat_match": getattr(getattr(be, "threat_match", None), "score", 0.0),
                "historical_similarity": getattr(getattr(be, "historical_similarity", None), "score", 0.0),
                "overall_risk": overall_risk,
                "evidence_quality": getattr(getattr(be, "evidence_quality", None), "level", "UNKNOWN"),
                "sources_used": getattr(be, "sources_used", 0),
            }

        is_scam_predicted = overall_risk >= 60

        print(f"Expected: {is_scam_expected} | Predicted: {is_scam_predicted} | OverallRisk Score: {overall_risk:.1f} | Conf: {confidence:.1f} | Degraded: {degraded}", flush=True)
        
        results.append({
            "case_id": case['id'],
            "expected_is_scam": is_scam_expected,
            "overall_risk_score": overall_risk,
            "confidence": confidence,
            "degraded": degraded,
            "evaluation_details": evaluation_details
        })

    out_path = os.path.join(base_dir, 'phase4_evaluation', 'reports', 'development_results.json')
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump({"per_case_results": results}, f, indent=2)
        
    print("\n--- Development Evaluation Complete ---", flush=True)

if __name__ == "__main__":
    asyncio.run(evaluate_development())
