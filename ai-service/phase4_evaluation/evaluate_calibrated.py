import os
import sys
import json
from pathlib import Path
from dotenv import load_dotenv

def evaluate_calibrated_from_cache(dataset_path: str, report_name: str):
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    load_dotenv(os.path.join(base_dir, '..', 'backend', '.env'))
    if base_dir not in sys.path:
        sys.path.append(base_dir)
        
    from app.schemas.investigation_trace import InvestigationTrace
    from app.schemas.agent_contracts import InvestigationInput, InvestigationState
    from app.evaluation.models import BetterEvaluation, EvaluationDimension, EvidenceQuality
    from app.evaluation.decision_policy import evaluate
    
    with open(dataset_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    cases = data.get("per_case_results", [])
    print(f"Loaded {len(cases)} cases for {report_name}.", flush=True)

    results = []
    
    for case in cases:
        case_id = case['case_id']
        is_scam_expected = case['expected_is_scam']
        degraded = case.get('degraded', False)
        eval_details = case.get('evaluation_details', {})
        
        def _get_score(val):
            if isinstance(val, dict): return val.get("score", 0.0)
            if isinstance(val, (int, float)): return float(val)
            return 0.0
            
        def _get_level(val):
            if isinstance(val, dict): return val.get("level", "Low")
            if isinstance(val, str): return val
            return "Low"

        evidence_level = _get_level(eval_details.get("evidence_quality"))
        if evidence_level not in ["Low", "Medium", "High"]: evidence_level = "Low"
        
        # Build mock trace
        trace = InvestigationTrace(
            investigationId=case_id,
            state=InvestigationState.DEGRADED if degraded else InvestigationState.COMPLETED,
            input=InvestigationInput(jobText="mock"),
            agentTraces=[],
            createdAt="2026-01-01T00:00:00Z",
            evaluation=BetterEvaluation(
                overall_risk=EvaluationDimension(score=_get_score(eval_details.get("overall_risk")), label=""),
                confidence=case.get("confidence", 0.0),
                evidence_quality=EvidenceQuality(level=evidence_level, score=0),
                sources_used=eval_details.get("sources_used", 0),
                content_risk=EvaluationDimension(score=_get_score(eval_details.get("content_risk")), label=""),
                recruiter_trust=EvaluationDimension(score=_get_score(eval_details.get("recruiter_trust")), label=""),
                threat_match=EvaluationDimension(score=_get_score(eval_details.get("threat_match")), label=""),
                historical_similarity=EvaluationDimension(score=_get_score(eval_details.get("historical_similarity")), label=""),
                contradictions=0,
                missing_evidence=0
            )
        )
        
        decision_result = evaluate(trace)
        decision = decision_result.decision
        reason = decision_result.reason
            
        results.append({
            "case_id": case_id,
            "expected_is_scam": is_scam_expected,
            "policy_decision": decision,
            "policy_reason": reason
        })

    # Calculate metrics
    total = len(results)
    abstentions = sum(1 for r in results if r["policy_decision"] == "HUMAN_REVIEW")
    coverage = (total - abstentions) / total if total > 0 else 0
    
    tp_auto = sum(1 for r in results if r["expected_is_scam"] and r["policy_decision"] == "SCAM")
    fn_auto = sum(1 for r in results if r["expected_is_scam"] and r["policy_decision"] == "SAFE")
    fp_auto = sum(1 for r in results if not r["expected_is_scam"] and r["policy_decision"] == "SCAM")
    tn_auto = sum(1 for r in results if not r["expected_is_scam"] and r["policy_decision"] == "SAFE")
    
    auto_recall = tp_auto / (tp_auto + fn_auto) if (tp_auto + fn_auto) > 0 else 0
    auto_fpr = fp_auto / (fp_auto + tn_auto) if (fp_auto + tn_auto) > 0 else 0
    
    summary = f"""
# Calibrated Evaluation: {report_name}

| Metric | Result |
|---|---|
| Total Cases | {total} |
| Coverage | {coverage:.1%} |
| Abstention | {abstentions / total:.1%} |
| Automatic FPR | {auto_fpr:.1%} |
| Automatic Recall | {auto_recall:.1%} |

### Automatic Decision Matrix (excluding abstentions)
- TP: {tp_auto}
- TN: {tn_auto}
- FP: {fp_auto}
- FN: {fn_auto}
"""
    print(summary, flush=True)
    
    out_path = os.path.join(base_dir, '..', 'brain', 'cbb816b6-8fa5-437e-bfe4-438443bb0f62', f'{report_name}.md')
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(summary)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python evaluate_calibrated.py <dataset_path> <report_name>")
        sys.exit(1)
    dataset = sys.argv[1]
    name = sys.argv[2]
    evaluate_calibrated_from_cache(dataset, name)
