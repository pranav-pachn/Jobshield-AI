import os
import json
import asyncio
from typing import Dict, Any, List
from collections import defaultdict
import importlib.util

def load_module(name: str, path: str):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

async def evaluate_holdout_b():
    import sys
    from dotenv import load_dotenv
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    load_dotenv(os.path.join(base_dir, '..', 'backend', '.env'))
    if base_dir not in sys.path:
        sys.path.append(base_dir)
        
    from app.orchestrator import investigation_orchestrator
    from app.schemas import agent_contracts
    
    InvestigationInput = agent_contracts.InvestigationInput
    
    holdout_file = Path(os.path.join(base_dir, '..', 'datasets', 'evaluation', 'rag_benchmark_holdout_b_adversarial.json'))
    with open(holdout_file, 'r', encoding='utf-8') as f:
        cases = json.load(f)

    print(f"Loaded {len(cases)} Holdout B cases.", flush=True)

    results = []
    
    confusion = {"TP": 0, "FP": 0, "TN": 0, "FN": 0}
    
    # Subgroup tracking
    subgroups = {
        "Hard Legitimate": {"total": 0, "FP": 0},
        "Professional Scams": {"total": 0, "TP": 0},
        "Conflicting Signals": {"total": 0, "TP": 0},
        "Novel/Subtle Scams": {"total": 0, "TP": 0}
    }
    
    for i, case in enumerate(cases):
        print(f"--- Evaluating Case {i+1}/{len(cases)}: {case['id']} ---", flush=True)
        
        # CRITICAL: Strip all ground-truth and adversarial metadata before sending to JobShield
        # The model/agents must only receive the raw text.
        input_data = InvestigationInput(
            jobText=case['text'],
            companyName=case.get("company", "Unknown"),
            recruiterName=case.get("recruiter", "Unknown")
        )
        
        # Run evaluation (production RAG enabled)
        trace = await investigation_orchestrator.orchestrate_investigation(input_data)
        
        is_scam_expected = case["expectedLabel"] == "scam"
        
        actual_verdict = trace.finalDecision.verdict.upper() if getattr(trace, "finalDecision", None) and hasattr(trace.finalDecision, "verdict") else "UNKNOWN"
        
        # Access nested BetterEvaluation scores
        evaluation_details = {}
        overall_risk = 0.0
        confidence = 0.0
        
        if hasattr(trace, "evaluation") and trace.evaluation:
            be = trace.evaluation
            overall_risk = getattr(getattr(be, "overall_risk", None), "score", 0.0)
            confidence = getattr(be, "confidence", 0.0)
            
            # Serialize for report
            evaluation_details = {
                "content_risk": {"score": getattr(getattr(be, "content_risk", None), "score", 0.0), "label": getattr(getattr(be, "content_risk", None), "label", "Unknown")},
                "recruiter_trust": {"score": getattr(getattr(be, "recruiter_trust", None), "score", 0.0), "label": getattr(getattr(be, "recruiter_trust", None), "label", "Unknown")},
                "threat_match": {"score": getattr(getattr(be, "threat_match", None), "score", 0.0), "label": getattr(getattr(be, "threat_match", None), "label", "Unknown")},
                "historical_similarity": {"score": getattr(getattr(be, "historical_similarity", None), "score", 0.0), "label": getattr(getattr(be, "historical_similarity", None), "label", "Unknown")},
                "overall_risk": {"score": overall_risk, "label": getattr(getattr(be, "overall_risk", None), "label", "Unknown")},
                "evidence_quality": {"level": getattr(getattr(be, "evidence_quality", None), "level", "Unknown"), "score": getattr(getattr(be, "evidence_quality", None), "score", 0.0)},
                "confidence": confidence,
                "sources_used": getattr(be, "sources_used", 0),
            }

        is_scam_predicted = overall_risk >= 60

        if is_scam_expected and is_scam_predicted:
            confusion["TP"] += 1
            is_correct = True
        elif not is_scam_expected and not is_scam_predicted:
            confusion["TN"] += 1
            is_correct = True
        elif not is_scam_expected and is_scam_predicted:
            confusion["FP"] += 1
            is_correct = False
        else:
            confusion["FN"] += 1
            is_correct = False
            
        print(f"Expected: {is_scam_expected} | Predicted: {is_scam_predicted} | Correct: {is_correct} | OverallRisk Score: {overall_risk:.1f}", flush=True)
        
        # Categorize by subgroup based on case id
        cid = case["id"]
        if cid.startswith("adv_legit_"):
            subgroups["Hard Legitimate"]["total"] += 1
            if not is_correct:  # False positive
                subgroups["Hard Legitimate"]["FP"] += 1
        else:
            group_num = int(cid.split("_")[2])
            if 1 <= group_num <= 6:
                subgroups["Professional Scams"]["total"] += 1
                if is_correct: subgroups["Professional Scams"]["TP"] += 1
            elif 7 <= group_num <= 12:
                subgroups["Conflicting Signals"]["total"] += 1
                if is_correct: subgroups["Conflicting Signals"]["TP"] += 1
            elif 13 <= group_num <= 16:
                subgroups["Novel/Subtle Scams"]["total"] += 1
                if is_correct: subgroups["Novel/Subtle Scams"]["TP"] += 1
        
        results.append({
            "case_id": case['id'],
            "expected_is_scam": is_scam_expected,
            "predicted_is_scam": is_scam_predicted,
            "overall_risk_score": overall_risk,
            "expected_risk_level": case.get("expectedRisk", "UNKNOWN"),
            "predicted_verdict": actual_verdict,
            "confidence": confidence,
            "adversarial_tags": case.get("adversarial_tags", []),
            "evaluation_details": evaluation_details
        })

    # Calculate metrics
    tp = confusion["TP"]
    fp = confusion["FP"]
    tn = confusion["TN"]
    fn = confusion["FN"]
    
    accuracy = (tp + tn) / (tp + tn + fp + fn) if (tp + tn + fp + fn) > 0 else 0
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0
    f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
    fpr = fp / (fp + tn) if (fp + tn) > 0 else 0
    fnr = fn / (fn + tp) if (fn + tp) > 0 else 0

    metrics = {
        "cases": len(cases),
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1": f1,
        "false_positive_rate": fpr,
        "false_negative_rate": fnr,
    }
    
    hl = subgroups["Hard Legitimate"]
    ps = subgroups["Professional Scams"]
    cs = subgroups["Conflicting Signals"]
    ns = subgroups["Novel/Subtle Scams"]
    
    subgroup_metrics = {
        "Hard Legitimate FPR": hl["FP"] / hl["total"] if hl["total"] > 0 else 0.0,
        "Professional Scam Recall": ps["TP"] / ps["total"] if ps["total"] > 0 else 0.0,
        "Conflicting Signals Recall": cs["TP"] / cs["total"] if cs["total"] > 0 else 0.0,
        "Novel/Subtle Recall": ns["TP"] / ns["total"] if ns["total"] > 0 else 0.0,
    }

    report = {
        "metrics": metrics,
        "confusion_matrix": confusion,
        "subgroup_metrics": subgroup_metrics,
        "subgroup_raw": subgroups,
        "per_case_results": results
    }

    out_path = os.path.join(base_dir, 'phase4_evaluation', 'reports', 'holdout_b_results.json')
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2)
        
    print("\n--- Holdout B Evaluation Complete ---", flush=True)
    print(f"F1 Score: {f1:.4f}", flush=True)
    print(f"Recall: {recall:.4f}", flush=True)
    print(f"FPR: {fpr:.4f}", flush=True)
    print("--- Subgroup Metrics ---", flush=True)
    for k, v in subgroup_metrics.items():
        print(f"{k}: {v:.4f}", flush=True)

if __name__ == "__main__":
    from pathlib import Path
    asyncio.run(evaluate_holdout_b())
