import re
import logging
import os
from typing import Dict, List, Tuple, Optional
from transformers import pipeline
import asyncio
from sentence_transformers import SentenceTransformer
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Suspicious phrases with their risk scores - Enhanced patterns
SUSPICIOUS_PHRASES = {
    # Payment requests
    "registration fee": 0.4,
    "training fee": 0.3,
    "processing fee": 0.3,
    "equipment fee": 0.3,
    "equipment payment": 0.3,
    "background check fee": 0.3,
    "start-up fee": 0.4,
    "administrative fee": 0.3,
    "application fee": 0.4,
    "pay to start": 0.3,
    "wire transfer": 0.4,
    "western union": 0.4,
    "gift card": 0.3,
    "bitcoin": 0.3,
    "cryptocurrency": 0.2,
    "send payment": 0.45,
    "payment to confirm slot": 0.5,
    "deposit required": 0.4,
    "booking fee": 0.35,
    "confirmation fee": 0.3,
    
    # Unrealistic salary claims
    "earn $": 0.2,
    "earn money fast": 0.3,
    "earn $3000 weekly": 0.4,
    "earn thousands weekly": 0.4,
    "high salary no experience": 0.3,
    "unrealistic salary": 0.3,
    "high salary": 0.2,
    "$3000 weekly": 0.4,
    "$2000 daily": 0.4,
    "weekly income": 0.2,
    "daily income": 0.2,
    "$200 daily": 0.45,
    "high pay part-time": 0.3,
    
    # Suspicious recruitment process
    "no interview required": 0.2,
    "urgent hiring": 0.2,
    "urgent hiring today": 0.3,
    "limited positions": 0.2,
    "limited slots available": 0.3,
    "immediate start": 0.2,
    "start immediately": 0.2,
    "no experience needed": 0.1,
    "no experience required": 0.1,
    "instant hiring": 0.2,
    "hire today": 0.2,
    
    # Work-from-home scams
    "work from home": 0.1,
    "remote work": 0.1,
    "work from anywhere": 0.1,
    
    # Pressure tactics
    "limited time": 0.2,
    "act now": 0.2,
    "don't miss out": 0.2,
    "exclusive offer": 0.2,
    "special opportunity": 0.1,
    
    # General scam indicators
    "easy money": 0.3,
    "quick money": 0.3,
    "guaranteed income": 0.3,
    "risk-free": 0.2,
    "get rich quick": 0.3,
    
    # Messaging platform recruitment
    "contact recruiter on telegram": 0.4,
    "whatsapp recruiter": 0.35,
    "contact on telegram": 0.35,
    "dm recruiter": 0.3,
    "message recruiter": 0.3,
    "telegram recruiter": 0.35,
}

# Reason mapping for detected phrases - Enhanced explanations
PHRASE_REASONS = {
    # Payment requests
    "registration fee": "registration fee requested",
    "training fee": "training fee required",
    "processing fee": "processing fee requested",
    "equipment fee": "payment for equipment required",
    "equipment payment": "equipment payment requested",
    "background check fee": "payment for background check",
    "start-up fee": "start-up fee required",
    "administrative fee": "administrative fee requested",
    "application fee": "application fee required",
    "pay to start": "payment required for employment",
    "wire transfer": "suspicious payment method",
    "western union": "untraceable payment method",
    "gift card": "unusual payment request",
    "bitcoin": "cryptocurrency payment request",
    "cryptocurrency": "digital currency payment request",
    "send payment": "payment required before hiring",
    "payment to confirm slot": "payment required to confirm position",
    "deposit required": "deposit required for position",
    "booking fee": "booking fee required for position",
    "confirmation fee": "confirmation fee requested",
    
    # Unrealistic salary claims
    "earn $": "unrealistic salary claim",
    "earn money fast": "get rich quick scheme",
    "earn $3000 weekly": "specific unrealistic income claim",
    "earn thousands weekly": "exaggerated income promise",
    "high salary no experience": "suspicious compensation for no experience",
    "unrealistic salary": "inflated salary claims",
    "high salary": "unrealistic compensation",
    "$3000 weekly": "specific unrealistic weekly income",
    "$2000 daily": "specific unrealistic daily income",
    "weekly income": "income guarantee suspicious",
    "daily income": "daily income guarantee suspicious",
    "$200 daily": "unrealistic daily salary claim",
    "high pay part-time": "high pay claim for part-time work",
    
    # Suspicious recruitment process
    "no interview required": "suspicious hiring process",
    "urgent hiring": "high pressure tactics",
    "urgent hiring today": "extreme urgency pressure",
    "limited positions": "scarcity pressure",
    "limited slots available": "limited availability pressure",
    "immediate start": "unrealistic timeline",
    "start immediately": "immediate start pressure",
    "no experience needed": "suspiciously low requirements",
    "no experience required": "no qualifications needed",
    "instant hiring": "instant hiring suspicious",
    "hire today": "same-day hiring pressure",
    
    # Work-from-home scams
    "work from home": "remote work emphasis",
    "remote work": "remote work focus",
    "work from anywhere": "location flexibility emphasis",
    
    # Pressure tactics
    "limited time": "time pressure tactic",
    "act now": "immediate action pressure",
    "don't miss out": "fear of missing loss tactic",
    "exclusive offer": "exclusivity pressure",
    "special opportunity": "special opportunity pressure",
    
    # General scam indicators
    "easy money": "easy money promise",
    "quick money": "quick money guarantee",
    "guaranteed income": "income guarantee suspicious",
    "risk-free": "risk-free claim suspicious",
    "get rich quick": "get rich quick scheme",
    
    # Messaging platform recruitment
    "contact recruiter on telegram": "recruiter directing communication to Telegram",
    "whatsapp recruiter": "external messaging platform used for hiring",
    "contact on telegram": "recruiter communication via encrypted messaging app",
    "dm recruiter": "recruiter communication via messaging app",
    "message recruiter": "recruiter communication via messaging app",
    "telegram recruiter": "external messaging platform used for hiring",
}

# Global classifiers (pre-loaded for performance)
_zero_shot_classifier = None
_semantic_model = None
_model_loading_status = {
    "zero_shot": "not_loaded",
    "semantic": "not_loaded"
}
_template_embeddings = None  # Cache for scam template embeddings

# Known scam templates for semantic similarity
SCAM_TEMPLATES = [
    "Work from home and earn thousands weekly with no experience.",
    "Earn $3000 weekly working from home. Pay registration fee to start.",
    "Immediate start available. No interview required. High salary guaranteed.",
    "Limited positions available. Act now for this special opportunity.",
    "Get rich quick with this work-from-home job. No experience needed.",
    "Pay small fee to start earning thousands from home immediately.",
    "Urgent hiring today. High pay with no experience required.",
    "Work from anywhere and earn guaranteed income. Start immediately.",
    "Limited time offer. Easy money from home. No interview needed.",
    "Earn money fast with this remote opportunity. Pay to start today.",
]

# Zero-shot classification candidate labels
DEFAULT_CANDIDATE_LABELS = ["legitimate job", "job scam", "phishing"]

REGEX_RULES = [
    {
        "pattern": r"\b(?:registration|training|processing|application|administrative|background check|start[-\s]?up)\s+fee\b",
        "score": 0.35,
        "reason": "registration fee requested",
    },
    {
        "pattern": r"\b(?:earn\s*\$?\s*\d{3,6}\s*(?:per\s*)?(?:week|weekly)|\$\s*\d{3,6}\s*(?:per\s*)?(?:week|weekly))\b",
        "score": 0.35,
        "reason": "unrealistic salary claim",
    },
    {
        "pattern": r"\b(?:earn\s*\$?\s*\d{3,6}\s*(?:per\s*)?(?:day|daily)|\$\s*\d{3,6}\s*(?:per\s*)?(?:day|daily))\b",
        "score": 0.4,
        "reason": "unrealistic salary claim",
    },
    {
        "pattern": r"\b(?:no\s+interview\s+required|without\s+interview)\b",
        "score": 0.25,
        "reason": "suspicious hiring process",
    },
    {
        "pattern": r"\b(?:urgent\s+hiring(?:\s+today)?|hire\s+today|start\s+immediately|immediate\s+start)\b",
        "score": 0.25,
        "reason": "high pressure tactics",
    },
    # Messaging platform recruitment patterns
    {
        "pattern": r"\b(?:contact\s+(?:recruiter|me|us)\s+(?:on|via|through)\s+(?:telegram|whatsapp|signal|discord|skype))\b",
        "score": 0.4,
        "reason": "recruiter directing communication to external messaging platform",
    },
    {
        "pattern": r"\b(?:telegram|whatsapp|signal|discord|skype)\s+(?:recruiter|manager|hr|contact)\b",
        "score": 0.35,
        "reason": "external messaging platform used for hiring",
    },
    {
        "pattern": r"\b(?:dm\s+recruiter|message\s+recruiter|chat\s+recruiter)\b",
        "score": 0.3,
        "reason": "recruiter communication via messaging app",
    },
    {
        "pattern": r"\b(?:contact\s+(?:on|via)\s+(?:telegram|whatsapp|signal|discord|skype))\b",
        "score": 0.35,
        "reason": "recruiter communication via encrypted messaging app",
    },
    # Payment confirmation and deposit patterns
    {
        "pattern": r"\b(?:send\s+payment|make\s+payment|payment\s+to\s+confirm|payment\s+for\s+confirmation)\b",
        "score": 0.45,
        "reason": "payment required before hiring",
    },
    {
        "pattern": r"\b(?:payment\s+to\s+confirm\s+(?:slot|position|job|spot))\b",
        "score": 0.5,
        "reason": "payment required to confirm position",
    },
    {
        "pattern": r"\b(?:deposit\s+required|security\s+deposit|refundable\s+deposit)\b",
        "score": 0.4,
        "reason": "deposit required for position",
    },
    {
        "pattern": r"\b(?:booking\s+fee|reservation\s+fee|slot\s+fee)\b",
        "score": 0.35,
        "reason": "booking fee required for position",
    },
    {
        "pattern": r"\b(?:confirmation\s+fee|verification\s+fee|processing\s+fee)\b",
        "score": 0.3,
        "reason": "confirmation fee requested",
    },
    # Enhanced salary patterns with thresholds
    {
        "pattern": r"\b\$\s*([2-9]\d{2}|\d{4,})\s*(?:per\s*)?(?:day|daily)\b",
        "score": 0.45,
        "reason": "unrealistic daily salary claim",
    },
    {
        "pattern": r"\b\$\s*([1-9]\d{3,})\s*(?:per\s*)?(?:week|weekly)\b",
        "score": 0.45,
        "reason": "unrealistic weekly salary claim",
    },
    {
        "pattern": r"\b(?:high\s+pay|high\s+salary|excellent\s+pay)\s+(?:part\s+time|part-time)\b",
        "score": 0.3,
        "reason": "high pay claim for part-time work",
    },
    {
        "pattern": r"\b(?:high\s+pay|high\s+salary|excellent\s+pay)\s+(?:no\s+experience|without\s+experience)\b",
        "score": 0.35,
        "reason": "high pay claim with no experience required",
    },
]


def _parse_float_env(name: str, default: float) -> float:
    raw = os.getenv(name)
    if raw is None:
        return default
    try:
        value = float(raw)
        return min(max(value, 0.0), 1.0)
    except ValueError:
        logger.warning("Invalid float value for %s=%s, using default %s", name, raw, default)
        return default


def _parse_labels_env() -> List[str]:
    raw = os.getenv("SCAM_CANDIDATE_LABELS", "")
    if not raw.strip():
        return DEFAULT_CANDIDATE_LABELS
    labels = [item.strip() for item in raw.split(",") if item.strip()]
    if not labels:
        return DEFAULT_CANDIDATE_LABELS
    if "job scam" not in [label.lower() for label in labels]:
        labels.append("job scam")
    return labels


COMPONENT_WEIGHTS = {
    "rule": _parse_float_env("SCAM_RULE_WEIGHT", 0.7),  # Increased from 0.5 to 0.7
    "zero_shot": _parse_float_env("SCAM_ZERO_SHOT_WEIGHT", 0.15),  # Decreased from 0.15 to 0.15
    "similarity": _parse_float_env("SCAM_SIMILARITY_WEIGHT", 0.15),  # Decreased from 0.35 to 0.15
}

RISK_THRESHOLDS = {
    "low": _parse_float_env("SCAM_RISK_LOW_MAX", 0.05),
    "medium": _parse_float_env("SCAM_RISK_MEDIUM_MAX", 0.1),
}

# Pre-compiled regex patterns for performance
COMPILED_REGEX_RULES = []
for rule in REGEX_RULES:
    COMPILED_REGEX_RULES.append({
        "pattern": re.compile(rule["pattern"]),
        "score": rule["score"],
        "reason": rule["reason"]
    })

def initialize_models():
    """Initialize and pre-load all models for optimal performance."""
    global _zero_shot_classifier, _semantic_model, _model_loading_status, _template_embeddings
    
    logger.info("Initializing AI models for performance optimization...")
    
    # Initialize zero-shot classifier
    try:
        logger.info("Loading zero-shot classifier...")
        _zero_shot_classifier = pipeline(
            "zero-shot-classification",
            model="facebook/bart-large-mnli",
            device=-1  # Use CPU
        )
        _model_loading_status["zero_shot"] = "loaded"
        logger.info("Zero-shot classifier loaded successfully")
    except Exception as e:
        logger.error(f"Failed to load zero-shot classifier: {e}")
        _model_loading_status["zero_shot"] = "failed"
        _zero_shot_classifier = None
    
    # Initialize semantic model
    try:
        logger.info("Loading semantic similarity model...")
        _semantic_model = SentenceTransformer('all-MiniLM-L6-v2')
        _model_loading_status["semantic"] = "loaded"
        logger.info("Semantic similarity model loaded successfully")
        
        # Pre-cache template embeddings for performance
        logger.info("Pre-caching scam template embeddings...")
        _template_embeddings = _semantic_model.encode(SCAM_TEMPLATES)
        logger.info(f"Cached {len(_template_embeddings)} template embeddings")
        
    except Exception as e:
        logger.error(f"Failed to load semantic model: {e}")
        _model_loading_status["semantic"] = "failed"
        _semantic_model = None
        _template_embeddings = None
    
    logger.info("Model initialization completed")
    return _model_loading_status

def get_model_status():
    """Get current model loading status for health checks."""
    return {
        "models_loaded": {
            "zero_shot": _model_loading_status["zero_shot"] == "loaded",
            "semantic": _model_loading_status["semantic"] == "loaded"
        },
        "status": _model_loading_status,
        "template_embeddings_cached": _template_embeddings is not None
    }

def preprocess_text(text: str) -> str:
    if not text:
        return ""
    
    # Convert to lowercase
    text = text.lower()
    
    # Remove extra whitespace and normalize spaces
    text = re.sub(r'\s+', ' ', text.strip())
    
    return text

def _normalize_phrase_hits(raw_hits: List[Tuple[int, str]]) -> List[str]:
    """Order hits by source position and remove generic duplicates."""
    if not raw_hits:
        return []

    ordered = sorted(raw_hits, key=lambda item: item[0])
    deduped: List[str] = []
    seen = set()

    for _, phrase in ordered:
        if phrase in seen:
            continue
        seen.add(phrase)
        deduped.append(phrase)

    if "earn $" in deduped and any(
        phrase.startswith("earn $") and phrase != "earn $" for phrase in deduped
    ):
        deduped = [phrase for phrase in deduped if phrase != "earn $"]

    if "high salary" in deduped and "high salary no experience" in deduped:
        deduped = [phrase for phrase in deduped if phrase != "high salary"]

    if "$3000 weekly" in deduped and "earn $3000 weekly" in deduped:
        deduped = [phrase for phrase in deduped if phrase != "$3000 weekly"]

    return deduped


def detect_suspicious_phrases(text: str) -> Tuple[List[str], float, Dict[str, str]]:
    """Detect suspicious phrases in text and calculate rule-based score."""
    detected_hits: List[Tuple[int, str]] = []
    total_score = 0.0
    reason_overrides: Dict[str, str] = {}
    
    # Use simple phrase matching
    for phrase, score in SUSPICIOUS_PHRASES.items():
        position = text.find(phrase)
        if position != -1:
            detected_hits.append((position, phrase))
            total_score += score

    # Use pre-compiled regex patterns for better performance
    for rule in COMPILED_REGEX_RULES:
        for match in rule["pattern"].finditer(text):
            matched_phrase = re.sub(r"\s+", " ", match.group(0).strip().lower())
            detected_hits.append((match.start(), matched_phrase))
            reason_overrides[matched_phrase] = rule["reason"]
            total_score += rule["score"]

    detected_phrases = _normalize_phrase_hits(detected_hits)
    
    # Clamp score between 0 and 1
    rule_score = min(total_score, 1.0)
    
    return detected_phrases, rule_score, reason_overrides

def generate_reasons(detected_phrases: List[str], reason_overrides: Optional[Dict[str, str]] = None) -> List[str]:
    """Generate human-readable reasons from detected phrases."""
    reason_overrides = reason_overrides or {}
    reasons = []
    for phrase in detected_phrases:
        reason = reason_overrides.get(phrase) or PHRASE_REASONS.get(phrase, f"suspicious phrase: {phrase}")
        if reason not in reasons:
            reasons.append(reason)
    return reasons

def get_zero_shot_classifier():
    """Get pre-loaded zero-shot classifier (synchronous for performance)."""
    return _zero_shot_classifier

def get_semantic_model():
    """Get pre-loaded semantic model (synchronous for performance)."""
    return _semantic_model

def fallback_heuristic_score(text: str) -> float:
    """Fallback scoring when NLP model is unavailable."""
    score = 0.0
    
    # Check for common scam indicators
    scam_indicators = [
        "urgent", "immediate", "asap", "now", "today",
        "money", "cash", "payment", "fee", "cost",
        "easy", "simple", "quick", "fast", "guaranteed",
        "limited", "exclusive", "special", "unique"
    ]
    
    text_lower = text.lower()
    word_count = len(text_lower.split())
    
    # Base score on scam indicator density
    indicator_count = sum(1 for indicator in scam_indicators if indicator in text_lower)
    indicator_density = indicator_count / max(word_count, 1)
    
    # Additional factors
    if word_count < 20:  # Very short texts are suspicious
        score += 0.2
    if any(char.isdigit() for char in text):  # Contains numbers (often amounts)
        score += 0.1
    if text.count('!') > 1:  # Excessive exclamation marks
        score += 0.1
    
    score += min(indicator_density * 0.3, 0.4)
    
    return min(score, 1.0)

def get_zero_shot_score(text: str) -> float:
    """Get zero-shot classification score for scam detection."""
    classifier = get_zero_shot_classifier()
    
    if classifier is None:
        return fallback_heuristic_score(text)
    
    try:
        # Use zero-shot classification
        result = classifier(text, CANDIDATE_LABELS)
        
        # Extract scam probability from the classification result
        if hasattr(result, 'labels') and hasattr(result, 'scores'):
            # Find the score for 'job scam' label
            if 'job scam' in result.labels:
                scam_index = result.labels.index('job scam')
                scam_score = result.scores[scam_index]
                # Also add some weight to 'phishing' if it's high
                if 'phishing' in result.labels:
                    phishing_index = result.labels.index('phishing')
                    phishing_score = result.scores[phishing_index]
                    scam_score = max(scam_score, phishing_score * 0.8)
                return min(scam_score, 1.0)
            else:
                # Fallback to highest score if 'job scam' not found
                return min(max(result.scores), 1.0)
        else:
            return fallback_heuristic_score(text)
            
    except Exception as e:
        logger.warning(f"Zero-shot classification failed: {e}")
        return fallback_heuristic_score(text)

def get_semantic_similarity_score(text: str) -> Tuple[float, List[str]]:
    """Get semantic similarity score with known scam templates."""
    model = get_semantic_model()
    
    if model is None or _template_embeddings is None:
        return 0.0, []
    
    try:
        # Encode the input text
        text_embedding = model.encode([text])
        
        # Use pre-cached template embeddings
        similarities = cosine_similarity(text_embedding, _template_embeddings)[0]
        
        # Find maximum similarity and matching templates
        max_similarity = np.max(similarities)
        matching_indices = np.where(similarities > 0.7)[0]  # Threshold for similarity
        
        matching_templates = [SCAM_TEMPLATES[i] for i in matching_indices]
        
        return float(max_similarity), matching_templates
        
    except Exception as e:
        logger.warning(f"Semantic similarity analysis failed: {e}")
        return 0.0, []

def calculate_risk_level(score: float) -> str:
    """Calculate risk level based on scam probability score."""
    low_threshold = min(RISK_THRESHOLDS["low"], RISK_THRESHOLDS["medium"])
    medium_threshold = max(RISK_THRESHOLDS["low"], RISK_THRESHOLDS["medium"])

    if score < low_threshold:
        return "Low"
    elif score <= medium_threshold:
        return "Medium"
    else:
        return "High"

async def analyze_job_scam(text: str) -> Dict:
    """
    Enhanced detection pipeline for job scam analysis.
    Combines rule-based detection, zero-shot classification, and semantic similarity.
    
    Args:
        text: Job description text to analyze
        
    Returns:
        Dictionary containing scam analysis results
    """
    logger.info(f"Analyzing job text: {text[:100]}...")
    
    # Step 1: Preprocessing
    processed_text = preprocess_text(text)
    logger.info(f"Processed text: {processed_text[:100]}...")
    
    # Step 2: Rule-based detection
    suspicious_phrases, rule_score, reason_overrides = detect_suspicious_phrases(processed_text)
    logger.info(f"Rule-based score: {rule_score:.3f}, phrases: {suspicious_phrases}")
    
    # Step 3: Zero-shot classification (synchronous for performance)
    zero_shot_score = get_zero_shot_score(processed_text)
    logger.info(f"Zero-shot classification score: {zero_shot_score:.3f}")
    
    # Step 4: Semantic similarity analysis (synchronous for performance)
    similarity_score, matching_templates = get_semantic_similarity_score(processed_text)
    logger.info(f"Semantic similarity score: {similarity_score:.3f}, templates: {len(matching_templates)}")
    
    # Step 5: Combined risk scoring with configurable component weights.
    total_weight = sum(COMPONENT_WEIGHTS.values()) or 1.0
    normalized_weights = {
        key: weight / total_weight
        for key, weight in COMPONENT_WEIGHTS.items()
    }

    final_score = (
        normalized_weights["rule"] * rule_score
        + normalized_weights["zero_shot"] * zero_shot_score
        + normalized_weights["similarity"] * similarity_score
    )
    final_score = min(final_score, 1.0)
    logger.info(f"Final combined score: {final_score:.3f}")
    
    # Step 6: Risk level determination
    risk_level = calculate_risk_level(final_score)
    
    # Step 7: Generate explanations
    reasons = generate_reasons(suspicious_phrases, reason_overrides)
    
    # Step 8: Add semantic similarity reasons if templates matched
    if matching_templates and similarity_score > 0.7:
        reasons.append("typical work-from-home scam pattern")
        if len(matching_templates) > 1:
            reasons.append("matches multiple known scam templates")
    
    # Step 9: Add zero-shot classification insights
    if zero_shot_score > 0.7:
        reasons.append("AI model identifies as likely job scam")
    
    return {
        "scam_probability": round(final_score, 2),
        "risk_level": risk_level,
        "suspicious_phrases": suspicious_phrases,
        "reasons": reasons,
        "rule_score": round(rule_score, 2),
        "zero_shot_score": round(zero_shot_score, 2),
        "similarity_score": round(similarity_score, 2),
        "matching_templates": matching_templates[:2]  # Include top 2 matching templates
    }

# Synchronous wrapper for compatibility with existing code
def detect_scam(text: str) -> Dict:
    """Synchronous wrapper for the scam detection function."""
    # For synchronous calls, run the async function in a new event loop
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            # If we're in an async context already, we need to use a different approach
            # This is a fallback for when called from sync code in an async environment
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as executor:
                future = executor.submit(lambda: asyncio.run(analyze_job_scam(text)))
                return future.result()
        else:
            return loop.run_until_complete(analyze_job_scam(text))
    except RuntimeError:
        # Final fallback - run in a thread
        import concurrent.futures
        with concurrent.futures.ThreadPoolExecutor() as executor:
            future = executor.submit(lambda: asyncio.run(analyze_job_scam(text)))
            return future.result()

# Async version for direct use in FastAPI
async def detect_scam_async(text: str) -> Dict:
    """Async version of the scam detection function."""
    return await analyze_job_scam(text)
