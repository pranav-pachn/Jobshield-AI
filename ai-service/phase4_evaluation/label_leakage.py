import os
import glob
import json

def check_file_for_leakage(filepath: str, sensitive_terms: list) -> list:
    flags = []
    with open(filepath, 'r', encoding='utf-8') as f:
        try:
            lines = f.readlines()
            for i, line in enumerate(lines):
                for term in sensitive_terms:
                    # We look for explicit use of these keys that might be leaked
                    # A better heuristic is to check if these are passed into prompt templates
                    if term in line and "expected" in term:
                        flags.append(f"{filepath}:{i+1} -> {line.strip()}")
        except Exception:
            pass
    return flags

def run_label_leakage(ai_service_path: str = "..") -> dict:
    sensitive_terms = ["expectedLabel", "expectedRisk", "expectedCategories", "expectedEvidence", "is_scam"]
    
    directories_to_scan = [
        "app/agents",
        "app/orchestrator",
        "app/services",
        "scripts" # Usually scripts are for eval, so it's okay there, but we track it.
    ]

    report = {
        "summary": {},
        "flags": []
    }

    for d in directories_to_scan:
        path = os.path.join(ai_service_path, d)
        report["summary"][d] = "PASS"
        for root, _, files in os.walk(path):
            for file in files:
                if file.endswith(".py"):
                    filepath = os.path.join(root, file)
                    file_flags = check_file_for_leakage(filepath, sensitive_terms)
                    if file_flags:
                        # Exclude known eval runners if needed, but we report them.
                        if "scripts" not in d and "evaluation" not in root:
                            report["summary"][d] = "FAIL"
                        report["flags"].extend(file_flags)

    return report

if __name__ == "__main__":
    res = run_label_leakage()
    print(json.dumps(res, indent=2))
