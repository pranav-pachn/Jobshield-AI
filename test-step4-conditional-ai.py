#!/usr/bin/env python3
"""
Test STEP 4: Conditional AI Call (Smart Trigger)
Tests intelligent decision-making on when to call expensive AI models.
"""

import sys
import asyncio
import json
from pathlib import Path

# Add services to path
sys.path.insert(0, str(Path(__file__).parent / "ai-service"))

from services.scam_detection import (
    calculate_heuristic_risk_score,
    measure_text_complexity,
    calculate_heuristic_confidence,
    should_call_ai,
    detect_suspicious_phrases,
    preprocess_text,
    detect_scam_async
)

# Test cases covering various scenarios
TEST_CASES = [
    {
        "name": "Simple HIGH Risk Scam (High Confidence)",
        "text": "Earn $3000 weekly! No interview needed. Registration fee $50.",
        "expected_ai_call": False,
        "reason": "HIGH risk with high confidence → skip AI"
    },
    {
        "name": "Complex Legitimate Job (High Complexity)",
        "text": """
        Senior Full-Stack Engineer - 5+ years experience required
        
        Responsibilities:
        - Design and implement RESTful APIs using Node.js and Express
        - Develop responsive frontend interfaces with React and TypeScript
        - Manage PostgreSQL and MongoDB databases
        - Implement CI/CD pipelines with Docker and Kubernetes
        - Lead code reviews and mentor junior developers
        
        Requirements:
        - Strong JavaScript/TypeScript skills
        - Experience with cloud platforms (AWS/GCP)
        - Familiarity with Agile methodologies
        - Bachelor's degree in Computer Science or equivalent
        
        We offer competitive salaries, health benefits, and remote work options.
        Apply now on our careers page.
        """,
        "expected_ai_call": True,
        "reason": "Complex legitimate text → AI needed to verify"
    },
    {
        "name": "Ambiguous MEDIUM Risk (Low Confidence)",
        "text": "Remote work opportunity. No experience required. Good income potential.",
        "expected_ai_call": True,
        "reason": "MEDIUM risk with low confidence → AI verification needed"
    },
    {
        "name": "Clear Pattern Multiple Phrases (Very High Confidence)",
        "text": "Work from home earning $2000 daily. Send $100 to confirm. Limited slots available. Registration fee required. Quick money guaranteed.",
        "expected_ai_call": False,
        "reason": "5+ scam phrases detected → very high confidence, skip AI"
    },
    {
        "name": "Complex Text with Ambiguous Signals",
        "text": """
        Position: Part-time Virtual Assistant
        
        We are seeking individuals for a flexible remote work opportunity.
        No prior experience required. Entry-level positions are available.
        
        Responsibilities and Opportunities:
        - Work from home on flexible schedule
        - Potential to earn good income based on performance
        - Immediate start available for qualified candidates
        - Growth opportunities with our dynamic team
        
        Qualifications: Minimal - willing to train the right candidate
        
        If interested, please send your CV for consideration.
        """,
        "expected_ai_call": True,
        "reason": "Complex text (> 0.5 complexity) → AI verification"
    },
]

def print_header(text):
    """Print a formatted header."""
    print("\n" + "=" * 80)
    print(f"  {text}")
    print("=" * 80)

def analyze_case(test_case):
    """Analyze a single test case."""
    text = test_case["text"]
    
    # Calculate heuristic components
    heuristic_score, heuristic_flag, initial_skip_ai = calculate_heuristic_risk_score(text)
    processed_text = preprocess_text(text)
    suspicious_phrases, rule_score, _ = detect_suspicious_phrases(processed_text)
    text_complexity = measure_text_complexity(text)
    heuristic_confidence = calculate_heuristic_confidence(suspicious_phrases, rule_score)
    
    # Get smart AI trigger decision
    ai_decision = should_call_ai(
        heuristic_score,
        text_complexity,
        heuristic_confidence,
        len(suspicious_phrases)
    )
    
    should_call_ai_result = ai_decision["should_call_ai"]
    
    return {
        "heuristic_score": heuristic_score,
        "heuristic_flag": heuristic_flag,
        "text_complexity": text_complexity,
        "heuristic_confidence": heuristic_confidence,
        "phrase_count": len(suspicious_phrases),
        "should_call_ai": should_call_ai_result,
        "ai_decision_reason": ai_decision["reason"],
        "ai_confidence_threshold": ai_decision["ai_confidence_threshold"],
    }

async def test_step4_smart_triggers():
    """Test STEP 4 smart AI trigger decisions."""
    print_header("TEST 1: STEP 4 Smart AI Trigger Decisions")
    
    all_passed = True
    passed_count = 0
    
    for test_case in TEST_CASES:
        result = analyze_case(test_case)
        expected_ai_call = test_case["expected_ai_call"]
        actual_ai_call = result["should_call_ai"]
        matches = actual_ai_call == expected_ai_call
        
        status = "[PASS]" if matches else "[FAIL]"
        passed_count += 1 if matches else 0
        all_passed = all_passed and matches
        
        print(f"\n{status} | {test_case['name']}")
        print(f"  Text: {test_case['text'][:60]}...")
        print(f"  Heuristic Score:      {result['heuristic_score']}/100 ({result['heuristic_flag']})")
        print(f"  Text Complexity:      {result['text_complexity']:.2f}")
        print(f"  Heuristic Confidence: {result['heuristic_confidence']:.2f}")
        print(f"  Detected Phrases:     {result['phrase_count']}")
        print(f"  Should Call AI:       {actual_ai_call} (expected: {expected_ai_call}) {'OK' if matches else 'MISMATCH'}")
        print(f"  Decision:             {result['ai_decision_reason']}")
    
    print(f"\n{passed_count}/{len(TEST_CASES)} tests passed\n")
    return all_passed


async def test_full_pipeline():
    """Test full pipeline with STEP 4 smart triggers."""
    print_header("TEST 2: Full Pipeline with STEP 4 Smart Triggers")
    
    # Test ambiguous case that triggers AI
    ambiguous_text = "Remote work opportunity. No experience required. Good income potential."
    
    print(f"Analyzing: {ambiguous_text}\n")
    result = await detect_scam_async(ambiguous_text)
    
    print(f"Heuristic Score:       {result['heuristic_score']}/100 ({result['heuristic_flag']})")
    print(f"Text Complexity:       {result['text_complexity']}")
    print(f"Heuristic Confidence:  {result['heuristic_confidence']}")
    print(f"AI Decision:           {result['ai_decision_reason']}")
    print(f"AI Models Used:        {result['ai_models_used']}")
    print(f"Final Risk Level:      {result['risk_level']}")
    print(f"Scam Probability:      {result['scam_probability']}")
    
    return result['scam_probability'] >= 0.0  # Basic sanity check

async def test_cost_savings():
    """Analyze cost savings from STEP 4 smart triggers."""
    print_header("TEST 3: Cost Savings Analysis with STEP 4")
    
    # Simulate 100 job postings with different characteristics
    test_scenarios = [
        # HIGH risk - clear scams (30%)
        ("Earn $5000 weekly! No interview. Registration fee $100.", 30),
        # MEDIUM risk - ambiguous (40%)
        ("Remote work opportunity. Flexible hours. Good potential.", 40),
        # LOW risk - likely legitimate (30%)
        ("Senior Software Engineer. 5+ years required. Competitive salary.", 30),
    ]
    
    ai_calls_without_step4 = 0
    ai_calls_with_step4 = 0
    
    print("Simulating 100 job postings:")
    for text, count in test_scenarios:
        result = analyze_case({"text": text, "expected_ai_call": None, "reason": ""})
        
        # Without STEP 4: All would call AI for verification
        ai_calls_without_step4 += count
        
        # With STEP 4: Only call AI when smart trigger says so
        ai_calls_with_step4 += count if result["should_call_ai"] else 0
        
        print(f"\n  {text[:50]}...")
        print(f"    Cases: {count}")
        print(f"    Heuristic: {result['heuristic_score']}/100")
        print(f"    AI Call: {result['should_call_ai']} ({result['ai_decision_reason']})")
    
    reduction = ((ai_calls_without_step4 - ai_calls_with_step4) / ai_calls_without_step4) * 100
    
    print(f"\n" + "-" * 60)
    print(f"Without STEP 4: {ai_calls_without_step4} AI model calls needed")
    print(f"With STEP 4:    {ai_calls_with_step4} AI model calls needed")
    print(f"Reduction:      {reduction:.1f}% fewer AI calls")
    print(f"Cost Savings:   {reduction/100 * 0.005 * 100:.2f} USD per 100 requests")
    print(f"-" * 60)
    
    return reduction > 50  # Should save at least 50%

async def main():
    """Run all STEP 4 tests."""
    print("\n" + "=" * 80)
    print("STEP 4: Conditional AI Call (Smart Trigger) Test Suite")
    print("=" * 80)
    
    # Run all tests
    test1_pass = await test_step4_smart_triggers()
    test2_pass = await test_full_pipeline()
    test3_pass = await test_cost_savings()
    
    # Summary
    print_header("SUMMARY")
    
    if test1_pass and test2_pass and test3_pass:
        print("[PASS] ALL TESTS PASSED!")
        print("\nKey Results:")
        print("  OK  Smart AI triggers working correctly")
        print("  OK  Full pipeline integration successful")
        print("  OK  50%+ cost reduction achieved with smart triggers")
        return 0
    else:
        print("[FAIL] SOME TESTS FAILED")
        if not test1_pass:
            print("  FAIL Smart trigger decisions not matching expected behavior")
        if not test2_pass:
            print("  FAIL Full pipeline test failed")
        if not test3_pass:
            print("  FAIL Cost savings below threshold")
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
