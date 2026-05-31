import os
import json
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_recall_fscore_support

USE_REAL_AI = os.getenv("USE_REAL_AI", "false").lower() == "true"

if USE_REAL_AI:
    import torch
    from transformers import (
        DistilBertTokenizer,
        DistilBertForSequenceClassification,
        Trainer,
        TrainingArguments
    )


class JobScamDataset(torch.utils.data.Dataset):
    """Custom PyTorch dataset for job scam data."""
    def __init__(self, encodings, labels):
        self.encodings = encodings
        self.labels = labels

    def __getitem__(self, idx):
        item = {key: torch.tensor(val[idx]) for key, val in self.encodings.items()}
        item['labels'] = torch.tensor(self.labels[idx])
        return item

    def __len__(self):
        return len(self.labels)

def compute_metrics(eval_pred):
    """Compute standard classification evaluation metrics."""
    logits, labels = eval_pred
    predictions = np.argmax(logits, axis=-1)
    precision, recall, f1, _ = precision_recall_fscore_support(
        labels, predictions, average='binary', zero_division=0
    )
    acc = accuracy_score(labels, predictions)
    return {
        'accuracy': acc,
        'f1': f1,
        'precision': precision,
        'recall': recall
    }

def train_scam_classifier():
    """Train the scam detection ML model using DistilBERT."""
    print("=" * 60)
    print("STARTING JOB SHIELD AI FINE-TUNING PIPELINE")
    print("=" * 60)

    # 1. Locate dataset
    possible_paths = [
        os.path.join(os.path.dirname(__file__), "..", "..", "datasets", "job_scams.json"),
        os.path.join(os.path.dirname(__file__), "datasets", "job_scams.json"),
        "datasets/job_scams.json",
        "../datasets/job_scams.json"
    ]
    dataset_path = None
    for path in possible_paths:
        if os.path.exists(path):
            dataset_path = os.path.abspath(path)
            break

    if not dataset_path:
        raise FileNotFoundError("Could not locate job_scams.json dataset in workspace.")

    print(f"Found dataset at: {dataset_path}")

    # 2. Load dataset
    with open(dataset_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    print(f"Loaded {len(data)} total samples from dataset.")

    # 3. Extract text and labels
    texts = []
    labels = []
    for item in data:
        text = item.get("text", "")
        raw_label = item.get("label", 0)
        
        # Normalize labels
        if isinstance(raw_label, str):
            normalized_label = raw_label.strip().lower()
        else:
            normalized_label = raw_label

        if normalized_label in [1, "1", True, "true", "yes", "scam"]:
            label = 1
        else:
            label = 0
            
        texts.append(text)
        labels.append(label)

    # Split into train/validation sets (80/20 split)
    train_texts, val_texts, train_labels, val_labels = train_test_split(
        texts, labels, test_size=0.2, random_state=42, stratify=labels
    )

    print(f"Training samples: {len(train_texts)}")
    print(f"Validation samples: {len(val_texts)}")

    # 4. Initialize tokenizer and tokenize data
    print("Loading DistilBERT tokenizer...")
    tokenizer = DistilBertTokenizer.from_pretrained("distilbert-base-uncased")
    
    train_encodings = tokenizer(train_texts, truncation=True, padding=True, max_length=512)
    val_encodings = tokenizer(val_texts, truncation=True, padding=True, max_length=512)

    # Create PyTorch datasets
    train_dataset = JobScamDataset(train_encodings, train_labels)
    val_dataset = JobScamDataset(val_encodings, val_labels)

    # 5. Load model
    print("Loading DistilBERT pre-trained model...")
    model = DistilBertForSequenceClassification.from_pretrained(
        "distilbert-base-uncased",
        num_labels=2,
        id2label={0: "legitimate", 1: "scam"},
        label2id={"legitimate": 0, "scam": 1}
    )

    # Force model to run on CPU if CUDA is not available or preferred
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Using device: {device.upper()}")
    model.to(device)

    # 6. Define training arguments
    output_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "models", "scam-classifier"))
    print(f"Model will be saved to: {output_dir}")

    training_args = TrainingArguments(
        output_dir=os.path.join(os.path.dirname(__file__), "results"),
        num_train_epochs=15,                 # Increased to 15 epochs to help model learn complex bounds
        per_device_train_batch_size=8,
        per_device_eval_batch_size=8,
        learning_rate=3e-5,                  # More stable learning rate for small-dataset fine-tuning
        warmup_steps=10,                     # Warmup steps to stabilize early training
        weight_decay=0.01,
        logging_dir=os.path.join(os.path.dirname(__file__), "logs"),
        logging_steps=5,
        eval_strategy="epoch",
        save_strategy="epoch",
        load_best_model_at_end=True,
        metric_for_best_model="f1",
        greater_is_better=True,
        report_to="none"                     # Disable reporting to wandb/tensorboard
    )

    # 7. Initialize Trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=val_dataset,
        compute_metrics=compute_metrics,
    )

    # 8. Train the model
    print("Training model...")
    trainer.train()

    # 9. Evaluate the model
    print("Evaluating model on validation set...")
    eval_results = trainer.evaluate()
    print("\n" + "=" * 40)
    print("VALIDATION METRICS:")
    print("-" * 40)
    print(f"Accuracy:  {eval_results.get('eval_accuracy', 0):.4f}")
    print(f"F1 Score:  {eval_results.get('eval_f1', 0):.4f}")
    print(f"Precision: {eval_results.get('eval_precision', 0):.4f}")
    print(f"Recall:    {eval_results.get('eval_recall', 0):.4f}")
    print("=" * 40 + "\n")

    # 10. Save the best model
    print("Saving best model and tokenizer...")
    os.makedirs(output_dir, exist_ok=True)
    trainer.save_model(output_dir)
    tokenizer.save_pretrained(output_dir)
    print("MODEL FINE-TUNING COMPLETE & SAVED SUCCESSFULLY!")

if __name__ == "__main__":
    train_scam_classifier()
