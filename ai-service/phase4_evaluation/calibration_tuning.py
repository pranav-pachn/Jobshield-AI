import os
import json
from collections import defaultdict

def evaluate_policy(cases, policy_func):
    metrics = {
        "total": len(cases),
        "safe": 0,
        "scam": 0,
        "review": 0,
        "auto_tp": 0,
        "auto_fp": 0,
        "auto_tn": 0,
        "auto_fn": 0,
        "total_positives": 0,
        "total_negatives": 0,
    }
    
    for case in cases:
        expected = case["expected_is_scam"]
        if expected:
            metrics["total_positives"] += 1
        else:
            metrics["total_negatives"] += 1
            
        decision = policy_func(case)
        
        if decision == "SAFE":
            metrics["safe"] += 1
            if expected:
                metrics["auto_fn"] += 1
            else:
                metrics["auto_tn"] += 1
        elif decision == "SCAM":
            metrics["scam"] += 1
            if expected:
                metrics["auto_tp"] += 1
            else:
                metrics["auto_fp"] += 1
        else:
            metrics["review"] += 1
            
    # Calculate derived metrics
    auto_decisions = metrics["safe"] + metrics["scam"]
    metrics["coverage"] = auto_decisions / metrics["total"] if metrics["total"] > 0 else 0
    metrics["abstention"] = metrics["review"] / metrics["total"] if metrics["total"] > 0 else 0
    
    auto_actual_pos = metrics["auto_tp"] + metrics["auto_fn"]
    auto_actual_neg = metrics["auto_fp"] + metrics["auto_tn"]
    
    metrics["auto_recall"] = metrics["auto_tp"] / auto_actual_pos if auto_actual_pos > 0 else 0
    metrics["auto_fpr"] = metrics["auto_fp"] / auto_actual_neg if auto_actual_neg > 0 else 0
    metrics["overall_recall"] = metrics["auto_tp"] / metrics["total_positives"] if metrics["total_positives"] > 0 else 0
    
    return metrics

def policy_A(case):
    # Baseline: Risk only (Binary)
    risk = case.get("overall_risk_score", 0)
    return "SCAM" if risk >= 60 else "SAFE"

def policy_B(case):
    # Risk + Confidence
    risk = case.get("overall_risk_score", 0)
    conf = case.get("confidence", 0)
    
    if risk >= 75 and conf >= 80:
        return "SCAM"
    if risk < 50 and conf >= 70:
        return "SAFE"
    return "REVIEW"

def policy_C(case):
    # Risk + Confidence + Evidence Quality
    risk = case.get("overall_risk_score", 0)
    conf = case.get("confidence", 0)
    ed = case.get("evaluation_details", {})
    ev_qual = ed.get("evidence_quality", "UNKNOWN")
    srcs = ed.get("sources_used", 0)
    
    if ev_qual == "LOW" or srcs == 0:
        return "REVIEW"
        
    if risk >= 75 and conf >= 80:
        return "SCAM"
    if risk < 50 and conf >= 70:
        return "SAFE"
    return "REVIEW"

def policy_D(case, r_scam=75, c_scam=80, r_safe=50, c_safe=70):
    # Risk + Conf + Evidence Disagreement + Degraded
    if case.get("degraded", False):
        return "REVIEW"
        
    ed = case.get("evaluation_details", {})
    ev_qual = ed.get("evidence_quality", "UNKNOWN")
    srcs = ed.get("sources_used", 0)
    cr = ed.get("content_risk", 0)
    tm = ed.get("threat_match", 0)
    
    if ev_qual == "LOW" or srcs == 0:
        return "REVIEW"
        
    if cr >= 70 and tm < 50:
        return "REVIEW"
        
    risk = case.get("overall_risk_score", 0)
    conf = case.get("confidence", 0)
    
    if risk >= r_scam and conf >= c_scam:
        return "SCAM"
    if risk < r_safe and conf >= c_safe:
        return "SAFE"
        
    return "REVIEW"

def main():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    results_path = os.path.join(base_dir, 'phase4_evaluation', 'reports', 'development_results.json')
    
    if not os.path.exists(results_path):
        print(f"Error: {results_path} not found. Run evaluate_development.py first.")
        return
        
    with open(results_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    cases = data['per_case_results']
    print(f"Loaded {len(cases)} cases for calibration tuning.")
    
    # 1. Evaluate predefined policies
    metrics_A = evaluate_policy(cases, policy_A)
    metrics_B = evaluate_policy(cases, policy_B)
    metrics_C = evaluate_policy(cases, policy_C)
    metrics_D = evaluate_policy(cases, policy_D)
    
    # 2. Grid search for Policy D thresholds to find the best V1
    grid_results = []
    r_scam_options = [70, 75, 80]
    c_scam_options = [75, 80, 85]
    r_safe_options = [50, 55, 60]
    c_safe_options = [65, 70, 75]
    
    for r_sc in r_scam_options:
        for c_sc in c_scam_options:
            for r_sf in r_safe_options:
                for c_sf in c_safe_options:
                    p_func = lambda c: policy_D(c, r_scam=r_sc, c_scam=c_sc, r_safe=r_sf, c_safe=c_sf)
                    res = evaluate_policy(cases, p_func)
                    # Constraint: Auto FPR <= 0.10, Auto Recall >= 0.85
                    res["r_sc"] = r_sc
                    res["c_sc"] = c_sc
                    res["r_sf"] = r_sf
                    res["c_sf"] = c_sf
                    grid_results.append(res)
                    
    # Select best policy
    # 1. Auto FPR <= 0.10, Auto Recall >= 0.85, maximize coverage
    valid_policies = [p for p in grid_results if p["auto_fpr"] <= 0.10 and p["auto_recall"] >= 0.85]
    if valid_policies:
        best_policy = max(valid_policies, key=lambda x: x["coverage"])
    else:
        # Fallback: Minimize FPR subject to Auto Recall >= 0.80, maximize coverage
        valid_policies_2 = [p for p in grid_results if p["auto_recall"] >= 0.80]
        if valid_policies_2:
            best_policy = min(valid_policies_2, key=lambda x: (x["auto_fpr"], -x["coverage"]))
        else:
            best_policy = max(grid_results, key=lambda x: x["coverage"])

    # Write report
    report_lines = [
        "# Phase 4C-1: Calibration Tuning Report",
        "",
        "## 1. Policy Comparison",
        "| Policy | Coverage | Abstention | Auto FPR | Auto Recall | Overall Recall |",
        "|---|---|---|---|---|---|",
        f"| A (Risk only) | {metrics_A['coverage']:.1%} | {metrics_A['abstention']:.1%} | {metrics_A['auto_fpr']:.3f} | {metrics_A['auto_recall']:.3f} | {metrics_A['overall_recall']:.3f} |",
        f"| B (+Conf) | {metrics_B['coverage']:.1%} | {metrics_B['abstention']:.1%} | {metrics_B['auto_fpr']:.3f} | {metrics_B['auto_recall']:.3f} | {metrics_B['overall_recall']:.3f} |",
        f"| C (+EvQual) | {metrics_C['coverage']:.1%} | {metrics_C['abstention']:.1%} | {metrics_C['auto_fpr']:.3f} | {metrics_C['auto_recall']:.3f} | {metrics_C['overall_recall']:.3f} |",
        f"| D (+Disagreement)| {metrics_D['coverage']:.1%} | {metrics_D['abstention']:.1%} | {metrics_D['auto_fpr']:.3f} | {metrics_D['auto_recall']:.3f} | {metrics_D['overall_recall']:.3f} |",
        "",
        "## 2. Selected Policy V1",
        "Based on Development set grid search for Policy D:",
        f"- Risk SCAM >= {best_policy['r_sc']}",
        f"- Conf SCAM >= {best_policy['c_sc']}",
        f"- Risk SAFE < {best_policy['r_sf']}",
        f"- Conf SAFE >= {best_policy['c_sf']}",
        "",
        "**V1 Performance (Development):**",
        f"- **Coverage**: {best_policy['coverage']:.1%}",
        f"- **Abstention Rate**: {best_policy['abstention']:.1%}",
        f"- **Automatic FPR**: {best_policy['auto_fpr']:.3f}",
        f"- **Automatic Recall**: {best_policy['auto_recall']:.3f}",
        f"- **Overall Recall**: {best_policy['overall_recall']:.3f}",
        "",
        "## 3. Exact Deterministic Rules (V1)",
        "```text",
        "1. Is investigation DEGRADED?",
        "       YES -> HUMAN_REVIEW",
        "2. Is evidence quality LOW or sources = 0?",
        "       YES -> HUMAN_REVIEW",
        "3. Is there strong evidence disagreement (Content Risk >= 70 AND Threat Match < 50)?",
        "       YES -> HUMAN_REVIEW",
        f"4. Is Overall Risk >= {best_policy['r_sc']} AND Confidence >= {best_policy['c_sc']}?",
        "       YES -> SCAM",
        f"5. Is Overall Risk < {best_policy['r_sf']} AND Confidence >= {best_policy['c_sf']}?",
        "       YES -> SAFE",
        "6. Otherwise",
        "       -> HUMAN_REVIEW",
        "```",
        "",
        "## 4. Development Set Limitations",
        "The thresholds were optimized strictly on the 70-case development set. These limits may drift over time. Frozen Holdout A and B evaluations will serve as the true measure of generalization."
    ]
    
    out_path = r"C:\Users\prana\.gemini\antigravity-ide\brain\cbb816b6-8fa5-437e-bfe4-438443bb0f62\calibration_tuning_report.md"
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write("\n".join(report_lines))
        
    print(f"Report generated at {out_path}")

if __name__ == "__main__":
    main()
