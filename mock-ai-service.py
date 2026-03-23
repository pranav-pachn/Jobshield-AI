#!/usr/bin/env python3
"""
Mock AI Service for testing JobShield AI without full ML dependencies
Provides mock responses for job analysis to enable end-to-end testing
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import re
import random
from datetime import datetime

app = FastAPI(title="Mock AI Service", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeJobRequest(BaseModel):
    text: str

class AnalyzeJobResponse(BaseModel):
    scam_probability: float
    risk_level: str
    confidence: float
    suspicious_phrases: List[str]
    reasons: List[str]
    component_scores: Dict[str, float]
    phrase_details: List[Dict[str, Any]]
    matching_templates: List[str]

def analyze_text_indicators(text: str) -> Dict[str, Any]:
    """Analyze text for scam indicators"""
    text_lower = text.lower()
    
    # Scam indicators
    fee_keywords = ["fee", "payment", "deposit", "investment", "buy", "purchase", "pay"]
    urgency_keywords = ["urgent", "immediately", "asap", "now", "quick", "hurry", "limited"]
    unrealistic_keywords = ["$5000", "$1000", "$500", "earn $", "weekly", "daily", "easy money"]
    suspicious_keywords = ["telegram", "whatsapp", "crypto", "bitcoin", "western union"]
    
    # Count matches
    fee_count = sum(1 for keyword in fee_keywords if keyword in text_lower)
    urgency_count = sum(1 for keyword in urgency_keywords if keyword in text_lower)
    unrealistic_count = sum(1 for keyword in unrealistic_keywords if keyword in text_lower)
    suspicious_count = sum(1 for keyword in suspicious_keywords if keyword in text_lower)
    
    # Extract suspicious phrases
    suspicious_phrases = []
    if "registration fee" in text_lower:
        suspicious_phrases.append("registration fee")
    if "urgent hiring" in text_lower:
        suspicious_phrases.append("urgent hiring")
    if "no experience" in text_lower and "high pay" in text_lower:
        suspicious_phrases.append("no experience required for high pay")
    if "telegram" in text_lower:
        suspicious_phrases.append("telegram contact")
    if "western union" in text_lower:
        suspicious_phrases.append("western union payment")
    
    # Calculate scam probability
    base_score = 0.1
    score_increase = (fee_count * 0.25) + (urgency_count * 0.15) + (unrealistic_count * 0.2) + (suspicious_count * 0.1)
    scam_probability = min(0.95, base_score + score_increase + random.uniform(-0.05, 0.1))
    
    # Determine risk level
    if scam_probability >= 0.7:
        risk_level = "High"
    elif scam_probability >= 0.4:
        risk_level = "Medium"
    else:
        risk_level = "Low"
    
    # Generate reasons
    reasons = []
    if fee_count > 0:
        reasons.append("Payment required for job opportunity")
    if urgency_count > 0:
        reasons.append("High pressure tactics detected")
    if unrealistic_count > 0:
        reasons.append("Unrealistic salary claims")
    if suspicious_count > 0:
        reasons.append("Suspicious contact methods")
    if len(reasons) == 0:
        reasons.append("No obvious scam indicators detected")
    
    return {
        "scam_probability": scam_probability,
        "risk_level": risk_level,
        "confidence": 0.85 + random.uniform(-0.1, 0.1),
        "suspicious_phrases": suspicious_phrases,
        "reasons": reasons,
        "component_scores": {
            "rule_score": scam_probability + random.uniform(-0.1, 0.1),
            "zero_shot_score": scam_probability + random.uniform(-0.1, 0.1),
            "similarity_score": scam_probability + random.uniform(-0.1, 0.1)
        },
        "phrase_details": [
            {
                "phrase": phrase,
                "confidence": 0.8 + random.uniform(-0.2, 0.2),
                "reason": f"Suspicious pattern detected: {phrase}"
            }
            for phrase in suspicious_phrases[:3]
        ],
        "matching_templates": ["fee_request_template", "urgency_template"] if fee_count > 0 else []
    }

@app.get("/")
async def root():
    return {"message": "Mock AI Service for JobShield AI", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "mock-ai-service", "timestamp": datetime.now().isoformat()}

@app.post("/api/analyze-job")
async def analyze_job(request: AnalyzeJobRequest) -> AnalyzeJobResponse:
    """Analyze job text for scam indicators"""
    if not request.text or len(request.text.strip()) < 10:
        return AnalyzeJobResponse(
            scam_probability=0.0,
            risk_level="Low",
            confidence=0.5,
            suspicious_phrases=[],
            reasons=["Insufficient text for analysis"],
            component_scores={"rule_score": 0.0, "zero_shot_score": 0.0, "similarity_score": 0.0},
            phrase_details=[],
            matching_templates=[]
        )
    
    result = analyze_text_indicators(request.text)
    return AnalyzeJobResponse(**result)

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Mock AI Service on port 8000...")
    print("📝 This service provides mock responses for testing JobShield AI")
    uvicorn.run(app, host="0.0.0.0", port=8000)
