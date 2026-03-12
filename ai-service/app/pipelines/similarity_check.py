def calculate_similarity(text1: str, text2: str) -> float:
    """Calculate semantic similarity between two texts."""
    # Placeholder: simple word overlap
    words1 = set(text1.lower().split())
    words2 = set(text2.lower().split())
    
    if not words1 or not words2:
        return 0.0
    
    overlap = len(words1 & words2)
    union = len(words1 | words2)
    
    return overlap / union if union > 0 else 0.0
