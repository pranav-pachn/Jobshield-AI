"""
STEP 5: Token-Optimized AI Prompt Service

Minimizes token usage by:
- Using concise, structured prompts
- Requesting minimal output (JSON only)
- Conditional AI calls (only when heuristics are inconclusive)
- Token counting and monitoring
"""

import json
import logging
import os
from typing import Dict, Optional, Tuple
import re

logger = logging.getLogger(__name__)

# ============================================================================
# OPTIMIZED PROMPT TEMPLATES - Minimal & Structured
# ============================================================================

# TEMPLATE 1: Ultra-minimal prompt for binary classification
MINIMAL_BINARY_PROMPT = """Analyze job text for scam risk.

Return JSON only:
{{"risk_score": number (0-100)}}

Text: {{text}}"""


# TEMPLATE 2: Minimal prompt with reasons (slightly more tokens but very structured)
MINIMAL_WITH_REASONS_PROMPT = """Analyze job text for scam risk.

Return JSON only:
{{"risk_score": number (0-100), "reasons": [max 3 short reasons]}}

Text: {{text}}"""


# TEMPLATE 3: Optimized for ambiguous/medium-risk cases
MEDIUM_RISK_ANALYSIS_PROMPT = """Is this a job scam?

Job text:
{{text}}

Return JSON:
{{"is_scam": boolean, "score": 0-100, "reason": one short phrase}}"""


# TEMPLATE 4: Ultra-efficient - just score
ULTRA_MINIMAL_PROMPT = """Scam risk (0-100): {{text}}"""

# ============================================================================
# TOKEN COUNTING - For monitoring and optimization
# ============================================================================

def count_tokens_rough(text: str) -> int:
    """
    Rough token count using simple formula.
    LLMs typically use ~1 token per 4 characters (approximate).
    More accurate: ~0.75 tokens per word.
    """
    # Using word count as it's more reliable
    words = len(text.split())
    # Average: 4 chars per word, 1 token per 4 chars = 1 token per word
    # But JSON overhead, so add buffer
    return int(words * 1.3)


def format_prompt_with_token_count(prompt_template: str, text: str) -> Tuple[str, Dict[str, int]]:
    """
    Format the prompt and return token count estimates.
    
    Returns:
        Tuple of (formatted_prompt, token_stats)
    """
    prompt = prompt_template.replace("{{text}}", text)
    
    # Estimate tokens
    text_tokens = count_tokens_rough(text)
    prompt_tokens = count_tokens_rough(prompt_template)
    
    # Assuming:
    # - Input tokens: prompt + text
    # - Output tokens: JSON response (typically 50-100 tokens)
    estimated_output_tokens = 80  # Conservative for JSON response
    
    token_stats = {
        "prompt_tokens": prompt_tokens,
        "text_tokens": text_tokens,
        "estimated_input_tokens": prompt_tokens + text_tokens,
        "estimated_output_tokens": estimated_output_tokens,
        "estimated_total_tokens": prompt_tokens + text_tokens + estimated_output_tokens,
    }
    
    return prompt, token_stats


# ============================================================================
# TEMPLATE SELECTION STRATEGY - Choose prompt based on context
# ============================================================================

class PromptOptimizer:
    """Selects the best prompt template based on analysis context."""
    
    @staticmethod
    def select_template(
        text_length: int,
        heuristic_confidence: float,
        resource_constraints: str = "balanced"
    ) -> Tuple[str, str]:
        """
        Select optimal prompt template.
        
        Args:
            text_length: Length of text to analyze
            heuristic_confidence: How confident are heuristics (0-1)
            resource_constraints: "minimal", "balanced", or "comprehensive"
            
        Returns:
            Tuple of (template_name, template_string)
        """
        
        if resource_constraints == "minimal":
            # Minimum tokens - just score
            return "ultra_minimal", ULTRA_MINIMAL_PROMPT
        
        elif resource_constraints == "balanced":
            if heuristic_confidence < 0.5:
                # Ambiguous case - need reasons
                return "minimal_with_reasons", MINIMAL_WITH_REASONS_PROMPT
            else:
                # Clear case - just score
                return "minimal_binary", MINIMAL_BINARY_PROMPT
        
        else:  # comprehensive
            # More detailed analysis
            return "medium_risk_analysis", MEDIUM_RISK_ANALYSIS_PROMPT
    
    @staticmethod
    def estimate_cost_savings(baseline_tokens: int, optimized_tokens: int) -> Dict[str, float]:
        """
        Estimate cost savings from token optimization.
        
        OpenAI pricing (as of 2024):
        - GPT-4 Turbo: $0.01 per 1K input tokens, $0.03 per 1K output tokens
        - GPT-3.5: $0.0005 per 1K input tokens, $0.0015 per 1K output tokens
        """
        
        input_reduction = baseline_tokens - optimized_tokens
        
        # Pricing tiers
        gpt4_turbo_input_cost = (optimized_tokens / 1000) * 0.01
        gpt4_turbo_baseline_cost = (baseline_tokens / 1000) * 0.01
        
        gpt35_input_cost = (optimized_tokens / 1000) * 0.0005
        gpt35_baseline_cost = (baseline_tokens / 1000) * 0.0005
        
        return {
            "tokens_saved_per_request": input_reduction,
            "tokens_reduced_percent": round((input_reduction / baseline_tokens) * 100, 1) if baseline_tokens > 0 else 0,
            "gpt4_turbo_cost_per_request": gpt4_turbo_input_cost,
            "gpt4_turbo_cost_saved_per_request": gpt4_turbo_baseline_cost - gpt4_turbo_input_cost,
            "gpt35_cost_per_request": gpt35_input_cost,
            "gpt35_cost_saved_per_request": gpt35_baseline_cost - gpt35_input_cost,
        }


# ============================================================================
# OPTIMIZED JSON RESPONSE PARSER
# ============================================================================

def parse_ai_response(response_text: str) -> Optional[Dict]:
    """
    Parse AI response, expecting JSON format.
    
    Handles:
    - Responses with markdown code blocks
    - Malformed JSON (attempts recovery)
    - Missing fields
    """
    
    if not response_text:
        return None
    
    # Remove markdown code blocks if present
    json_text = response_text.strip()
    if json_text.startswith("```json"):
        json_text = json_text[7:]
    if json_text.startswith("```"):
        json_text = json_text[3:]
    if json_text.endswith("```"):
        json_text = json_text[:-3]
    
    json_text = json_text.strip()
    
    try:
        parsed = json.loads(json_text)
        return parsed
    except json.JSONDecodeError as e:
        logger.warning(f"Failed to parse JSON response: {e}")
        logger.debug(f"Response text: {json_text}")
        
        # Attempt basic recovery - extract first JSON object
        match = re.search(r'\{[^{}]*\}', json_text)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass
        
        return None


# ============================================================================
# EXAMPLE USAGE AND COMPARISONS
# ============================================================================

def demonstrate_optimization():
    """Show the difference between wasteful and optimized prompts."""
    
    sample_text = "Earn $3000 weekly! No interview needed. Registration fee $50. Contact recruiter on WhatsApp immediately!"
    
    # ❌ BAD: Wasteful prompt
    bad_prompt = f"""
Please analyze this job description in great detail and explain everything about it. 
Describe the company, the role, the requirements, what makes it attractive or concerning. 
Provide a comprehensive analysis including all aspects of the job posting.
Look for any indicators of fraud, scams, or questionable practices.
Evaluate the salary, benefits, working conditions, and more.
Provide your assessment in multiple paragraphs with thorough explanations.

Job Description:
{sample_text}

Analysis:
"""
    
    # ✅ GOOD: Optimized prompt
    good_prompt = f"""Analyze job text for scam risk.

Return JSON only:
{{"risk_score": number (0-100), "reasons": [max 3 short reasons]}}

Text: {sample_text}"""
    
    bad_tokens = count_tokens_rough(bad_prompt)
    good_tokens = count_tokens_rough(good_prompt)
    
    return {
        "bad_prompt": bad_prompt,
        "good_prompt": good_prompt,
        "bad_tokens": bad_tokens,
        "good_tokens": good_tokens,
        "token_reduction": bad_tokens - good_tokens,
        "reduction_percent": round(((bad_tokens - good_tokens) / bad_tokens) * 100, 1),
        "cost_savings": PromptOptimizer.estimate_cost_savings(bad_tokens, good_tokens)
    }


def calculate_batch_savings(texts: list, avg_response_length: int = 80) -> Dict:
    """Calculate potential savings from optimizing all prompts in a batch."""
    
    # Baseline: Comprehensive analysis (long prompt + long output)
    baseline_prompt_tokens_per_request = 300  # Average comprehensive prompt
    baseline_output_tokens_per_request = 300  # Average long response
    
    # Optimized: Minimal prompt + JSON output
    optimized_prompt_tokens_per_request = 120  # Average minimal prompt
    optimized_output_tokens_per_request = 80   # JSON response
    
    num_requests = len(texts)
    
    baseline_total = (baseline_prompt_tokens_per_request + baseline_output_tokens_per_request) * num_requests
    optimized_total = (optimized_prompt_tokens_per_request + optimized_output_tokens_per_request) * num_requests
    
    tokens_saved = baseline_total - optimized_total
    
    # Cost calculations
    gpt4_turbo_cost_saved = (tokens_saved / 1000) * 0.01  # $0.01 per 1K input
    gpt35_cost_saved = (tokens_saved / 1000) * 0.0005    # $0.0005 per 1K input
    
    return {
        "num_requests": num_requests,
        "baseline_tokens_total": baseline_total,
        "optimized_tokens_total": optimized_total,
        "tokens_saved": tokens_saved,
        "reduction_percent": round(((tokens_saved / baseline_total) * 100), 1),
        "gpt4_turbo_cost_saved": round(gpt4_turbo_cost_saved, 4),
        "gpt35_cost_saved": round(gpt35_cost_saved, 4),
        "estimated_requests_per_month": num_requests * 30,  # If this is daily
        "estimated_monthly_gpt4_savings": round(gpt4_turbo_cost_saved * 30, 2),
        "estimated_monthly_gpt35_savings": round(gpt35_cost_saved * 30, 2),
    }
