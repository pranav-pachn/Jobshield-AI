from app.utils.preprocessing import preprocess_text
from app.utils.feature_extraction import extract_features


def detect_scam(text: str) -> dict:
    """Detect scam indicators in job posting or recruiter message."""
    processed = preprocess_text(text)
    features = extract_features(processed)
    
    # Placeholder scoring logic
    risk_score = 0
    if features["has_payment_request"]:
        risk_score += 30
    if features["has_urgent_language"]:
        risk_score += 20
    if features["word_count"] < 20:
        risk_score += 10
    
    return {
        "risk_score": min(risk_score, 100),
        "risk_level": "high" if risk_score > 70 else "medium" if risk_score > 40 else "low",
        "features": features,
    }
