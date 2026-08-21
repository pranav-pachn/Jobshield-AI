import asyncio
import json
import logging
from pathlib import Path
import os
import sys

# Load environment variables before importing anything else
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '..', 'backend', '.env'))

# Add ai-service to path so we can import from it
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'ai-service'))

from services.rag_retrieval import embed_query, retrieve_chunks, format_context
from services.llm_service import evaluate_risk_with_llm
from services.scam_detection import analyze_job_scam

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def main():
    test_file = Path('datasets/evaluation/rag_test_cases.json')
    if not test_file.exists():
        logger.error(f"Test cases file not found at {test_file}")
        return

    with open(test_file, 'r', encoding='utf-8') as f:
        test_cases = json.load(f)

    logger.info(f"Loaded {len(test_cases)} test cases.")

    results = []

    for test in test_cases:
        logger.info(f"--- Evaluating Test: {test['id']} - {test['description']} ---")
        
        # Test full detection pipeline
        analysis_result = await analyze_job_scam(test['job_text'])
        
        # Determine success
        actual_risk = analysis_result.get('risk_level')
        success = actual_risk == test['expected_risk']
        
        logger.info(f"Expected Risk: {test['expected_risk']}")
        logger.info(f"Actual Risk: {actual_risk}")
        logger.info(f"AI Models Used: {analysis_result.get('ai_models_used')}")
        logger.info(f"Suspicious Phrases: {analysis_result.get('suspicious_phrases')}")
        logger.info(f"Reasons: {analysis_result.get('reasons')}")
        logger.info(f"Match: {'✅ PASS' if success else '❌ FAIL'}\n")
        
        results.append({
            "test_id": test['id'],
            "success": success,
            "expected_risk": test['expected_risk'],
            "actual_risk": actual_risk,
            "details": analysis_result
        })

    success_count = sum(1 for r in results if r['success'])
    logger.info(f"Evaluation Complete. {success_count}/{len(results)} tests passed.")

if __name__ == "__main__":
    asyncio.run(main())
