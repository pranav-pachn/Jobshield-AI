import re

def normalize_indicator(indicator_type: str, value: str) -> str:
    """Normalize threat indicators before sending to the backend."""
    if not value:
        return ""
    
    normalized = value.strip()
    
    if indicator_type == "EMAIL":
        normalized = normalized.lower()
        
    elif indicator_type == "DOMAIN":
        # Remove http://, https://, and www.
        normalized = re.sub(r'^(https?://)?(www\.)?', '', normalized.lower())
        # Remove path
        normalized = normalized.split('/')[0]
        
    elif indicator_type == "PHONE":
        # Keep only digits and '+'
        normalized = re.sub(r'[^\d+]', '', normalized)
        if not normalized.startswith('+') and len(normalized) > 10:
            normalized = '+' + normalized
            
    elif indicator_type == "TELEGRAM":
        normalized = normalized.lower()
        if normalized.startswith('@'):
            normalized = normalized[1:]
            
    elif indicator_type == "WHATSAPP":
        normalized = re.sub(r'[^\d+]', '', normalized)
        if not normalized.startswith('+') and len(normalized) > 10:
            normalized = '+' + normalized
            
    elif indicator_type == "SCAM_PHRASE":
        normalized = re.sub(r'\s+', ' ', normalized.lower())
        
    elif indicator_type == "COMPANY":
        normalized = re.sub(r'\s+', ' ', normalized.lower())
        normalized = re.sub(r'\b(inc|llc|ltd|corp|corporation)\b\.?', '', normalized).strip()
        
    else:
        normalized = normalized.lower()
        
    return normalized
