import json
import os

def generate_holdouts(dataset_path: str, families_path: str, out_dir: str):
    with open(dataset_path, 'r', encoding='utf-8') as f:
        cases = json.load(f)
        
    with open(families_path, 'r', encoding='utf-8') as f:
        families = json.load(f)
        
    # We want roughly 75 Dev / 25 Holdout A
    # Legit families: 010(14), 011(12), 009(10), 012(9), 013(5) (Total 50)
    # Scam families: 001(10), 002(10), 003(8), 004(6), 005(5), 006(4), 007(4), 008(3) (Total 50)
    
    # Let's manually assign families to achieve this balance
    dev_families = [
        "family_010", "family_009", "family_012", # Legit: 14 + 10 + 9 = 33
        "family_001", "family_002", "family_003", "family_005", "family_006" # Scam: 10 + 10 + 8 + 5 + 4 = 37
    ] # Total Dev = 70 cases
    
    holdout_a_families = [
        "family_011", "family_013", # Legit: 12 + 5 = 17
        "family_004", "family_007", "family_008" # Scam: 6 + 4 + 3 = 13
    ] # Total Holdout A = 30 cases
    
    dev_cases = []
    holdout_a_cases = []
    
    for case in cases:
        # Find which family this case belongs to
        fam_id = next(fam['template_family_id'] for fam in families if case['id'] in fam['case_ids'])
        
        if fam_id in dev_families:
            dev_cases.append(case)
        elif fam_id in holdout_a_families:
            holdout_a_cases.append(case)
        else:
            print(f"Warning: Case {case['id']} not in dev or holdout families.")

    print(f"Dev Cases: {len(dev_cases)}")
    print(f"Holdout A Cases: {len(holdout_a_cases)}")
    
    os.makedirs(out_dir, exist_ok=True)
    
    with open(os.path.join(out_dir, 'rag_benchmark_dev.json'), 'w', encoding='utf-8') as f:
        json.dump(dev_cases, f, indent=2)
        
    with open(os.path.join(out_dir, 'rag_benchmark_holdout_a.json'), 'w', encoding='utf-8') as f:
        json.dump(holdout_a_cases, f, indent=2)
        
    print("Holdout splits generated successfully.")

if __name__ == "__main__":
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
    dataset = os.path.join(base_dir, "datasets", "evaluation", "rag_benchmark_cases.json")
    families = os.path.join(base_dir, "ai-service", "phase4_evaluation", "reports", "template_families_v1.json")
    out_dir = os.path.join(base_dir, "datasets", "evaluation")
    
    generate_holdouts(dataset, families, out_dir)
