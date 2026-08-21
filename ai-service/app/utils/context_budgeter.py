import re

def extract_critical_sections(job_text: str, max_chars: int = 3000) -> str:
    """
    Extracts critical sections from a job posting using a minimal deterministic heuristic,
    preventing naive character truncation from cutting off important signals at the end.
    
    Priority: Title, Compensation, Responsibilities, Requirements, Payment/Application, Contact/Company.
    """
    if len(job_text) <= max_chars:
        return job_text
        
    # Define regex patterns for sections (case insensitive)
    patterns = {
        "title": r"(?i)^(?:job title|title|position):\s*(.*)",
        "compensation": r"(?i)(?:compensation|salary|pay|benefits)(?:.*?)(?:\n\n|\n[A-Z]|$)",
        "responsibilities": r"(?i)(?:responsibilities|duties|what you.*ll do)(?:.*?)(?:\n\n|\n[A-Z]|$)",
        "requirements": r"(?i)(?:requirements|qualifications|what you need)(?:.*?)(?:\n\n|\n[A-Z]|$)",
        "payment": r"(?i)(?:payment|fee|wire transfer|crypto|bitcoin|equipment|purchase)(?:.*?)(?:\n\n|\n[A-Z]|$)",
        "application": r"(?i)(?:how to apply|application|apply)(?:.*?)(?:\n\n|\n[A-Z]|$)",
        "contact": r"(?i)(?:contact|email|phone|recruiter)(?:.*?)(?:\n\n|\n[A-Z]|$)",
        "company": r"(?i)(?:about us|company|who we are)(?:.*?)(?:\n\n|\n[A-Z]|$)"
    }
    
    extracted = []
    current_length = 0
    
    # 1. Fallback if patterns don't match much (e.g. unformatted block of text)
    # We will grab up to 500 chars from the very top and very bottom just in case
    top_block = job_text[:500]
    bottom_block = job_text[-500:]
    
    extracted.append(f"--- START ---\n{top_block}\n...\n")
    current_length += len(extracted[-1])
    
    # 2. Extract sections
    found_sections = {}
    for section_name, pattern in patterns.items():
        matches = re.finditer(pattern, job_text, re.DOTALL | re.MULTILINE)
        for match in matches:
            content = match.group(0).strip()
            if content and len(content) > 10:
                found_sections[section_name] = content
                break # Just take the first match per section type
                
    # 3. Build string within budget
    for section_name in ["compensation", "payment", "contact", "company", "responsibilities", "requirements", "application"]:
        if section_name in found_sections:
            header = f"\n--- {section_name.upper()} ---\n"
            content = found_sections[section_name]
            
            # Truncate individual section if it's huge
            if len(content) > 500:
                content = content[:500] + "..."
                
            addition = header + content
            if current_length + len(addition) > max_chars - len(bottom_block) - 50:
                break
            extracted.append(addition)
            current_length += len(addition)
            
    extracted.append(f"\n--- END ---\n{bottom_block}")
    
    return "".join(extracted)
