def extract_features(text: str) -> dict:
    """Extract relevant features from text for classification."""
    return {
        "length": len(text),
        "word_count": len(text.split()),
        "has_payment_request": "payment" in text.lower(),
        "has_urgent_language": "urgent" in text.lower(),
    }
