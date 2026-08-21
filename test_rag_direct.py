import asyncio
import logging
from pathlib import Path
import os
import sys

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), 'backend', '.env'))

sys.path.append(os.path.join(os.path.dirname(__file__), 'ai-service'))

from services.rag_retrieval import embed_query, retrieve_chunks, format_context
from services.llm_service import evaluate_risk_with_llm

logging.basicConfig(level=logging.INFO, force=True)
logger = logging.getLogger(__name__)

async def main():
    job_text = "We are hiring a remote data entry clerk. We will send you a check for $3000 to purchase your home office equipment. You must wire the remaining balance to our certified vendor."
    
    logger.info("Retrieving threat intelligence context...")
    embedding = embed_query(job_text)
    chunks = retrieve_chunks(embedding, limit=5)
    logger.info(f"[RAG] Retrieved {len(chunks)} evidence chunks")
    context = format_context(chunks)
    
    logger.info("Evaluating risk with RAG LLM...")
    llm_result = await evaluate_risk_with_llm(job_text, context)
    
    logger.info(f"LLM Result: {llm_result}")
    logger.info("[Risk] Final assessment generated")

if __name__ == "__main__":
    asyncio.run(main())
