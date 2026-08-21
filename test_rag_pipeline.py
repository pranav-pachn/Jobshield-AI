import asyncio
import logging
from pathlib import Path
import os
import sys

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), 'backend', '.env'))

sys.path.append(os.path.join(os.path.dirname(__file__), 'ai-service'))

import services.scam_detection as sd
from services.scam_detection import analyze_job_scam

# Force AI to always run for this test
sd.should_call_ai_for_verification = lambda *args, **kwargs: {"should_call_ai": True, "reason": "Forced for test", "ai_confidence_threshold": 0.5}

logging.basicConfig(level=logging.INFO, force=True)

async def main():
    job_text = "We are looking for a Senior React Developer to join our fully remote team. Candidates should have 5+ years of experience with React, TypeScript, and Node.js. The interview process includes a coding challenge and two technical rounds. Compensation ranges from $120k to $150k annually with standard benefits. Please apply through our career portal."
    
    # This text has 0 heuristic score, so it MUST trigger the AI pipeline
    print("Testing pipeline with legitimate job text (Forces AI RAG pipeline)...")
    result = await analyze_job_scam(job_text)
    print("\nResult:")
    print(result)

if __name__ == "__main__":
    asyncio.run(main())
