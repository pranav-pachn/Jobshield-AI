import asyncio
import json
import logging
import os
import sys
from pathlib import Path
from collections import defaultdict
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', 'backend', '.env'))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.schemas.agent_contracts import InvestigationInput
from app.orchestrator.investigation_orchestrator import orchestrate_investigation

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def evaluate_holdout():
    holdout_file = Path(os.path.join(os.path.dirname(__file__), '..', '..', 'datasets', 'evaluation', 'rag_benchmark_holdout_a.json'))
    with open(holdout_file, 'r', encoding='utf-8') as f:
        cases = json.load(f)

    print(f"Loaded {len(cases)} Holdout A cases.", flush=True)

    results = []
    
    # Tracking for metrics
    confusion = {"TP": 0, "FP": 0, "TN": 0, "FN": 0}
    category_metrics = defaultdict(lambda: {"total": 0, "correct": 0})
    
    for i, case in enumerate(cases):
        print(f"--- Evaluating Case {i+1}/{len(cases)}: {case['id']} ---", flush=True)
        
        input_data = InvestigationInput(
            jobText=case['text'],
            recruiterEmail="",
            companyDomain="",
            companyName=""
        )
        
        trace = await orchestrate_investigation(input_data)
        
        expected_risk = case.get('expectedRisk', 'LOW').upper()
        is_scam_expected = expected_risk in ['HIGH', 'CRITICAL']
        
        # Check actual prediction
        actual_verdict = trace.finalDecision.verdict.upper() if getattr(trace, "finalDecision", None) and hasattr(trace.finalDecision, "verdict") else "UNKNOWN"
        
        # Calculate evaluation score from Phase 4E layer
        overall_risk = trace.evaluation.overall_risk.score if getattr(trace, "evaluation", None) else 0
        is_scam_predicted = overall_risk >= 60
        
        # Confusion matrix update
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
            
        # Category metrics update
        primary_category = "legitimate" if not is_scam_expected else (case.get('expectedCategories', ['unknown'])[0] if case.get('expectedCategories') else 'unknown')
        category_metrics[primary_category]["total"] += 1
        if is_correct:
            category_metrics[primary_category]["correct"] += 1
            
        print(f"Expected: {is_scam_expected} | Predicted: {is_scam_predicted} | Correct: {is_correct} | OverallRisk Score: {overall_risk:.1f}", flush=True)
        
        results.append({
            "case_id": case['id'],
            "expected_is_scam": is_scam_expected,
            "predicted_is_scam": is_scam_predicted,
            "overall_risk_score": overall_risk,
            "expected_risk_level": expected_risk,
            "predicted_verdict": actual_verdict,
            "category": primary_category,
            "confidence": trace.evaluation.confidence if trace.evaluation else 0,
            "evaluation_details": trace.evaluation.model_dump() if trace.evaluation else None
        })

    # Compute Aggregate Metrics
    TP, FP, TN, FN = confusion["TP"], confusion["FP"], confusion["TN"], confusion["FN"]
    
    precision = TP / (TP + FP) if (TP + FP) > 0 else 0
    recall = TP / (TP + FN) if (TP + FN) > 0 else 0
    f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
    accuracy = (TP + TN) / len(cases)
    fpr = FP / (FP + TN) if (FP + TN) > 0 else 0
    fnr = FN / (FN + TP) if (FN + TP) > 0 else 0
    
    scam_recall = recall
    legit_recall = TN / (TN + FP) if (TN + FP) > 0 else 0
    
    report = {
        "metrics": {
            "cases": len(cases),
            "accuracy": round(accuracy, 4),
            "precision": round(precision, 4),
            "recall": round(recall, 4),
            "f1": round(f1, 4),
            "false_positive_rate": round(fpr, 4),
            "false_negative_rate": round(fnr, 4),
            "scam_recall": round(scam_recall, 4),
            "legitimate_recall": round(legit_recall, 4)
        },
        "confusion_matrix": confusion,
        "category_metrics": {k: {"recall": round(v["correct"]/v["total"], 4) if v["total"] > 0 else 0, "total": v["total"]} for k,v in category_metrics.items()},
        "per_case_results": results
    }
    
    out_path = Path(os.path.join(os.path.dirname(__file__), 'reports', 'holdout_a_results.json'))
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2)
        
    print("Evaluation Complete. See reports/holdout_a_results.json for details.", flush=True)
    print(f"F1 Score: {f1:.4f}", flush=True)

if __name__ == "__main__":
    asyncio.run(evaluate_holdout())
