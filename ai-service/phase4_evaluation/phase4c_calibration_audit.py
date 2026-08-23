import os
import json
import numpy as np

def calculate_ece(y_true, y_prob, n_bins=10):
    bin_boundaries = np.linspace(0, 1, n_bins + 1)
    bin_lowers = bin_boundaries[:-1]
    bin_uppers = bin_boundaries[1:]
    
    ece = 0.0
    for bin_lower, bin_upper in zip(bin_lowers, bin_uppers):
        in_bin = np.logical_and(y_prob > bin_lower, y_prob <= bin_upper)
        # include 0 in the first bin
        if bin_lower == 0.0:
            in_bin = np.logical_and(y_prob >= bin_lower, y_prob <= bin_upper)
            
        prob_in_bin = y_prob[in_bin]
        if len(prob_in_bin) > 0:
            accuracy_in_bin = np.mean(y_true[in_bin])
            avg_confidence_in_bin = np.mean(prob_in_bin)
            ece += np.abs(accuracy_in_bin - avg_confidence_in_bin) * len(prob_in_bin) / len(y_true)
            
    return ece

def main():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    results_path = os.path.join(base_dir, 'phase4_evaluation', 'reports', 'holdout_b_results.json')
    
    with open(results_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    cases = data['per_case_results']
    
    table_lines = []
    table_lines.append("| Case ID | Group | Expected | Predicted | Risk | Conf | Evidence | Sources | Content | Recruiter | Threat | Hist | Degraded |")
    table_lines.append("|---|---|---|---|---|---|---|---|---|---|---|---|---|")
    
    tp_conf = []
    tn_conf = []
    fp_conf = []
    fn_conf = []
    
    y_true = []
    y_prob = []
    
    for case in cases:
        cid = case['case_id']
        expected = case['expected_is_scam']
        predicted = case['predicted_is_scam']
        risk = case.get('overall_risk_score', 0)
        conf = case.get('confidence', 0)
        
        # Manually mark adv_scam_012 as degraded based on logs
        degraded = "YES" if cid == "adv_scam_012_real_onboarding_id_theft" else "NO"
        
        # Subgroup
        if cid.startswith("adv_legit_"):
            group = "Hard Legit"
        else:
            group_num = int(cid.split("_")[2])
            if 1 <= group_num <= 6: group = "Pro Scam"
            elif 7 <= group_num <= 12: group = "Conflict"
            else: group = "Novel"
            
        ed = case.get('evaluation_details', {})
        ev_qual = ed.get('evidence_quality', {}).get('level', 'N/A')
        srcs = ed.get('sources_used', 0)
        cr = ed.get('content_risk', {}).get('score', 0)
        rt = ed.get('recruiter_trust', {}).get('score', 0)
        tm = ed.get('threat_match', {}).get('score', 0)
        hs = ed.get('historical_similarity', {}).get('score', 0)
        
        # Append to table
        table_lines.append(f"| {cid} | {group} | {'SCAM' if expected else 'SAFE'} | {'SCAM' if predicted else 'SAFE'} | {risk:.1f} | {conf:.1f} | {ev_qual} | {srcs} | {cr:.1f} | {rt:.1f} | {tm:.1f} | {hs:.1f} | {degraded} |")
        
        # Track confidence
        if expected and predicted:
            tp_conf.append(conf)
        elif not expected and not predicted:
            tn_conf.append(conf)
        elif not expected and predicted:
            fp_conf.append(conf)
        else:
            fn_conf.append(conf)
            
        # Calibration metrics
        y_true.append(1 if expected else 0)
        
        # Convert confidence (which is certainty in the prediction) to P(Scam)
        # If predicted SCAM, P(Scam) = conf / 100.
        # If predicted SAFE, P(Scam) = 1 - (conf / 100).
        # Actually wait, in JobShield, confidence might just be absolute confidence (0-100).
        # But if it's based on overall_risk, let's treat predicted as risk >= 60.
        # If risk is used, P(Scam) = risk / 100.0 is technically the continuous predictor.
        # Let's use the actual confidence and verdict to construct P(Scam).
        p_scam = conf / 100.0 if predicted else 1.0 - (conf / 100.0)
        y_prob.append(p_scam)
        
    y_true = np.array(y_true)
    y_prob = np.array(y_prob)
    
    brier = np.mean((y_prob - y_true)**2)
    ece = calculate_ece(y_true, y_prob, n_bins=10)
    
    out_md = [
        "# Phase 4C: Confidence Calibration Audit",
        "",
        "## 1. Case-Level Calibration Table",
        "\n".join(table_lines),
        "",
        "## 2. Confidence Distributions",
        "```text",
        f"TP Confidence (n={len(tp_conf)}): {sorted(tp_conf, reverse=True)}",
        f"TN Confidence (n={len(tn_conf)}): {sorted(tn_conf, reverse=True)}",
        f"FP Confidence (n={len(fp_conf)}): {sorted(fp_conf, reverse=True)}",
        f"FN Confidence (n={len(fn_conf)}): {sorted(fn_conf, reverse=True)}",
        "```",
        "",
        "## 3. Calibration Metrics",
        f"- **Brier Score**: {brier:.4f} (Lower is better, 0 is perfect)",
        f"- **Expected Calibration Error (ECE)**: {ece:.4f} (Lower is better, 0 is perfect)"
    ]
    
    artifact_path = r"C:\Users\prana\.gemini\antigravity-ide\brain\cbb816b6-8fa5-437e-bfe4-438443bb0f62\calibration_audit_report.md"
    with open(artifact_path, 'w', encoding='utf-8') as f:
        f.write("\n".join(out_md))
        
    print("Calibration audit complete.")

if __name__ == "__main__":
    main()
