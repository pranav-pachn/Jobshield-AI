"""
INTEGRATION EXAMPLE: Using Token-Optimized Prompts in FastAPI

This file shows how to integrate Step 5 optimizations into the existing API.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import logging
from typing import Optional, Dict

# Import the token optimization module
from services.token_optimized_prompt import (
    PromptOptimizer,
    format_prompt_with_token_count,
    count_tokens_rough,
    MINIMAL_WITH_REASONS_PROMPT,
)

# Assume we have an LLM client configured
# This could be OpenAI, Azure OpenAI, etc.
# from openai import AsyncOpenAI
# llm_client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

logger = logging.getLogger(__name__)

# ============================================================================
# REQUEST/RESPONSE MODELS
# ============================================================================

class JobAnalysisRequest(BaseModel):
    """Request for job scam analysis."""
    text: str
    include_token_stats: bool = False  # Optional: return token usage


class OptimizedAIAnalysis(BaseModel):
    """AI response with token optimization metadata."""
    risk_score: int  # 0-100
    reasons: list[str]  # Max 3 reasons
    is_scam: bool  # Derived: score > 70 = scam
    method: str  # "heuristic" or "ai"
    token_usage: Optional[Dict] = None  # Only if requested


# ============================================================================
# API ENDPOINT: Optimized Scam Detection
# ============================================================================

async def analyze_job_with_token_optimization(
    request: JobAnalysisRequest
) -> OptimizedAIAnalysis:
    """
    Analyze job for scam risk using token-optimized prompts.
    
    Example usage:
        POST /api/analyze
        {
            "text": "Earn $3000 weekly! No interview needed. Registration fee $50.",
            "include_token_stats": true
        }
    """
    
    text = request.text
    
    # Step 1: Run heuristic analysis (FAST, NO TOKENS)
    from services.scam_detection import calculate_heuristic_risk_score
    heuristic_score, heuristic_flag, should_skip_ai = calculate_heuristic_risk_score(text)
    
    logger.info(f"Heuristic analysis: {heuristic_score}/100 ({heuristic_flag})")
    
    # Step 2: Decide if we need AI
    if should_skip_ai:
        # ⭐ COST OPTIMIZATION: Skip expensive LLM call
        logger.info("Skipping AI - heuristics confident")
        return OptimizedAIAnalysis(
            risk_score=heuristic_score,
            reasons=["high confidence decision from rules"],
            is_scam=heuristic_score > 70,
            method="heuristic",
            token_usage={"method": "heuristic", "tokens": 0} if request.include_token_stats else None
        )
    
    # Step 3: Select optimized prompt template
    heuristic_confidence = calculate_heuristic_confidence(text)  # 0-1
    template_name, template = PromptOptimizer.select_template(
        text_length=len(text),
        heuristic_confidence=heuristic_confidence,
        resource_constraints="balanced"
    )
    
    logger.info(f"Selected template: {template_name}")
    
    # Step 4: Format prompt with token counting
    prompt, token_stats = format_prompt_with_token_count(template, text)
    
    logger.info(f"Token estimate: {token_stats['estimated_total_tokens']}")
    
    # Step 5: Call LLM with optimized prompt
    try:
        # This is a placeholder - implement with your LLM client
        ai_response = await call_llm_with_optimization(prompt)
        
        # Parse JSON response
        from services.token_optimized_prompt import parse_ai_response
        result = parse_ai_response(ai_response)
        
        if not result:
            # Fallback to heuristic if parsing fails
            logger.warning("Failed to parse AI response, falling back to heuristic")
            return OptimizedAIAnalysis(
                risk_score=heuristic_score,
                reasons=["AI response parsing failed"],
                is_scam=heuristic_score > 70,
                method="heuristic_fallback"
            )
        
        # Step 6: Return optimized response
        return OptimizedAIAnalysis(
            risk_score=result.get("risk_score", heuristic_score),
            reasons=result.get("reasons", []),
            is_scam=result.get("risk_score", heuristic_score) > 70,
            method="ai_optimized",
            token_usage=token_stats if request.include_token_stats else None
        )
        
    except Exception as e:
        logger.error(f"AI analysis failed: {e}")
        # Graceful fallback to heuristic
        return OptimizedAIAnalysis(
            risk_score=heuristic_score,
            reasons=["AI unavailable, using rules-based detection"],
            is_scam=heuristic_score > 70,
            method="heuristic_fallback"
        )


# ============================================================================
# BATCH ANALYSIS WITH TOKEN MONITORING
# ============================================================================

class BatchAnalysisRequest(BaseModel):
    """Request for batch analysis with token monitoring."""
    texts: list[str]
    report_token_stats: bool = True


class BatchAnalysisResponse(BaseModel):
    """Batch analysis response with cost metrics."""
    results: list[OptimizedAIAnalysis]
    total_tokens_estimated: int
    total_cost_estimate: Dict[str, float]  # By model
    optimization_benefit: Dict[str, float]


async def analyze_batch_with_monitoring(
    request: BatchAnalysisRequest
) -> BatchAnalysisResponse:
    """
    Analyze multiple jobs in batch with token/cost monitoring.
    
    This is useful for:
    - Daily bulk analysis
    - Cost forecasting
    - Performance reporting
    """
    
    results = []
    total_tokens = 0
    ai_calls = 0
    heuristic_calls = 0
    
    logger.info(f"Processing batch of {len(request.texts)} texts")
    
    for text in request.texts:
        req = JobAnalysisRequest(
            text=text,
            include_token_stats=True
        )
        
        result = await analyze_job_with_token_optimization(req)
        results.append(result)
        
        if result.token_usage:
            total_tokens += result.token_usage.get("estimated_total_tokens", 0)
        
        if result.method == "ai_optimized":
            ai_calls += 1
        else:
            heuristic_calls += 1
    
    # Calculate cost estimates
    cost_estimates = {
        "gpt4_turbo": (total_tokens / 1000) * 0.01,
        "gpt35": (total_tokens / 1000) * 0.0005,
        "claude_haiku": (total_tokens / 1000) * 0.00025,
    }
    
    # Calculate optimization benefit vs baseline
    baseline_tokens = len(request.texts) * 500  # Assume 500 tokens per wasteful request
    baseline_cost_gpt4 = (baseline_tokens / 1000) * 0.01
    optimized_cost_gpt4 = cost_estimates["gpt4_turbo"]
    
    optimization_benefit = {
        "tokens_saved": baseline_tokens - total_tokens,
        "percent_reduction": round(((baseline_tokens - total_tokens) / baseline_tokens) * 100, 1),
        "cost_saved_gpt4_turbo": round(baseline_cost_gpt4 - optimized_cost_gpt4, 4),
        "heuristic_calls": heuristic_calls,
        "ai_calls": ai_calls,
        "heuristic_percent": round((heuristic_calls / len(request.texts)) * 100, 1),
    }
    
    return BatchAnalysisResponse(
        results=results,
        total_tokens_estimated=total_tokens,
        total_cost_estimate=cost_estimates,
        optimization_benefit=optimization_benefit
    )


# ============================================================================
# HELPERS (implement these with your LLM client)
# ============================================================================

async def call_llm_with_optimization(prompt: str) -> str:
    """
    Call LLM with the optimized prompt.
    
    This is a placeholder - implement with:
    - OpenAI: llm_client.chat.completions.create(...)
    - Azure OpenAI: Similar API
    - Anthropic: messages API
    - Google: generativeai.generate_content(...)
    """
    
    # EXAMPLE with OpenAI:
    # response = await llm_client.chat.completions.create(
    #     model="gpt-4-turbo",
    #     messages=[
    #         {
    #             "role": "user",
    #             "content": prompt
    #         }
    #     ],
    #     response_format={"type": "json_object"},  # Force JSON
    #     temperature=0.1,  # Low randomness for consistent results
    #     max_tokens=150,  # Limit output tokens (JSON response)
    # )
    # return response.choices[0].message.content
    
    raise NotImplementedError("Implement with your LLM client")


def calculate_heuristic_confidence(text: str) -> float:
    """
    Calculate heuristic confidence (0-1).
    
    Placeholder - implement by analyzing:
    - Number of suspicious phrases detected
    - Clarity of decision (HIGH/LOW vs MEDIUM)
    """
    from services.scam_detection import detect_suspicious_phrases
    
    processed_text = text.lower()
    suspicious, rule_score, _ = detect_suspicious_phrases(processed_text)
    
    # More phrases + higher score = higher confidence
    confidence = min(len(suspicious) * 0.1 + rule_score, 1.0)
    return confidence


# ============================================================================
# EXAMPLE USAGE
# ============================================================================

def example_usage():
    """
    Example of how to use the optimized API.
    """
    
    import asyncio
    
    async def demo():
        # Single analysis
        request = JobAnalysisRequest(
            text="Earn $5000 weekly! Register now for $99!",
            include_token_stats=True
        )
        
        result = await analyze_job_with_token_optimization(request)
        print(f"Risk Score: {result.risk_score}")
        print(f"Is Scam: {result.is_scam}")
        print(f"Method: {result.method}")
        if result.token_usage:
            print(f"Tokens: {result.token_usage['estimated_total_tokens']}")
        
        # Batch analysis with monitoring
        batch_request = BatchAnalysisRequest(
            texts=[
                "Earn $5000 weekly! Register for $99!",
                "Senior Dev - Python, AWS, 5+ years experience",
                "Work from home! No experience needed!",
            ],
            report_token_stats=True
        )
        
        batch_result = await analyze_batch_with_monitoring(batch_request)
        print(f"\nBatch Results:")
        print(f"Total tokens: {batch_result.total_tokens_estimated}")
        print(f"Cost (GPT-4): ${batch_result.total_cost_estimate['gpt4_turbo']:.4f}")
        print(f"Savings: {batch_result.optimization_benefit['percent_reduction']}%")
    
    asyncio.run(demo())


# ============================================================================
# FASTAPI ROUTER CONFIGURATION
# ============================================================================

# To use in your FastAPI app:
#
# from fastapi import FastAPI
# from .api_integration_example import (
#     analyze_job_with_token_optimization,
#     analyze_batch_with_monitoring,
#     JobAnalysisRequest,
#     BatchAnalysisRequest,
# )
#
# app = FastAPI()
#
# @app.post("/api/analyze")
# async def analyze_job(request: JobAnalysisRequest):
#     """Analyze a single job for scam risk (token-optimized)."""
#     return await analyze_job_with_token_optimization(request)
#
# @app.post("/api/analyze/batch")
# async def analyze_batch(request: BatchAnalysisRequest):
#     """Analyze multiple jobs with cost monitoring."""
#     return await analyze_batch_with_monitoring(request)

if __name__ == "__main__":
    # For testing
    print("✅ API integration module loaded")
    print("📚 See docstrings for usage examples")
    print("\n💡 TIP: Implement call_llm_with_optimization() with your LLM client")
