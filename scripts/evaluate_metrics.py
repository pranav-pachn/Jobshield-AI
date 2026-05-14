import json
import requests
import time
import argparse
from typing import List, Dict, Any

# Configuration
API_URL = "http://localhost:4000/api/jobs/analyze"
DATASET_PATH = "../datasets/job_scams.json"

def calculate_metrics(y_true: List[int], y_pred: List[int]) -> Dict[str, float]:
    """Calculate Precision, Recall, and F1 Score."""
    true_positives = sum(1 for yt, yp in zip(y_true, y_pred) if yt == 1 and yp == 1)
    false_positives = sum(1 for yt, yp in zip(y_true, y_pred) if yt == 0 and yp == 1)
    false_negatives = sum(1 for yt, yp in zip(y_true, y_pred) if yt == 1 and yp == 0)
    true_negatives = sum(1 for yt, yp in zip(y_true, y_pred) if yt == 0 and yp == 0)

    precision = true_positives / (true_positives + false_positives) if (true_positives + false_positives) > 0 else 0
    recall = true_positives / (true_positives + false_negatives) if (true_positives + false_negatives) > 0 else 0
    f1_score = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
    accuracy = (true_positives + true_negatives) / len(y_true) if len(y_true) > 0 else 0

    return {
        "precision": precision,
        "recall": recall,
        "f1_score": f1_score,
        "accuracy": accuracy,
        "tp": true_positives,
        "fp": false_positives,
        "fn": false_negatives,
        "tn": true_negatives
    }

def evaluate(threshold: int = 40):
    print(f"Loading dataset from {DATASET_PATH}...")
    try:
        with open(DATASET_PATH, 'r') as f:
            data = json.load(f)
    except Exception as e:
        print(f"Failed to load dataset: {e}")
        return

    print(f"Loaded {len(data)} samples.")
    print(f"Evaluating against API {API_URL} with threshold {threshold}...\n")

    y_true = []
    y_pred = []
    
    total = len(data)
    for i, sample in enumerate(data):
        text = sample.get("text", "")
        # Accept both numeric and string labels during dataset migration.
        raw_label = sample.get("label", "")
        if isinstance(raw_label, str):
            normalized_label = raw_label.strip().lower()
        else:
            normalized_label = raw_label

        if normalized_label in [1, "1", True, "true", "yes", "scam"]:
            true_label = 1
        else:
            true_label = 0
            
        y_true.append(true_label)
        
        # Call API
        try:
            start_time = time.time()
            response = requests.post(API_URL, json={"text": text}, timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                # Use unified risk finalScore
                score = result.get("finalScore", 0)
                pred_label = 1 if score > threshold else 0
                y_pred.append(pred_label)
                
                latency = int((time.time() - start_time) * 1000)
                status = "✅" if pred_label == true_label else "❌"
                
                print(f"[{i+1}/{total}] {status} True: {true_label} | Pred: {pred_label} (Score: {score}) | {latency}ms")
            else:
                print(f"[{i+1}/{total}] ⚠️ API Error: {response.status_code}")
                y_pred.append(0)  # Default to 0 on error
        except Exception as e:
            print(f"[{i+1}/{total}] ❌ Request failed: {e}")
            y_pred.append(0)
            
        # Small delay to not overwhelm the API
        time.sleep(0.1)

    print("\n" + "="*40)
    print("🏆 EVALUATION RESULTS")
    print("="*40)
    
    metrics = calculate_metrics(y_true, y_pred)
    
    print(f"Total Samples: {len(y_true)}")
    print(f"Threshold:     > {threshold}")
    print("-" * 40)
    print(f"Accuracy:      {metrics['accuracy']:.4f} ({metrics['accuracy']*100:.1f}%)")
    print(f"Precision:     {metrics['precision']:.4f} ({metrics['precision']*100:.1f}%)")
    print(f"Recall:        {metrics['recall']:.4f} ({metrics['recall']*100:.1f}%)")
    print(f"F1 Score:      {metrics['f1_score']:.4f} ({metrics['f1_score']*100:.1f}%)")
    print("-" * 40)
    print(f"True Positives:  {metrics['tp']}")
    print(f"False Positives: {metrics['fp']} (Legit marked as scam)")
    print(f"True Negatives:  {metrics['tn']}")
    print(f"False Negatives: {metrics['fn']} (Scam marked as legit)")
    print("="*40)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Evaluate JobShield AI Scam Detection")
    parser.add_argument("--threshold", type=int, default=40, help="Risk score threshold to classify as scam (default: 40)")
    args = parser.parse_args()
    
    evaluate(threshold=args.threshold)
