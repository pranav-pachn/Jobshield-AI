#!/usr/bin/env python3
"""
Test script for the enhanced scam detection system.
Tests the system with the provided example and validates the output.
"""

import asyncio
import sys
import os

# Add the app directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from services.scam_detection import detect_scam_async


def assert_required_fields(result):
    required_fields = {"scam_probability", "risk_level", "suspicious_phrases", "reasons"}
    missing = required_fields - set(result.keys())
    assert not missing, f"Missing required fields: {missing}"

async def test_example():
    """Test the enhanced detection system with the provided example."""
    
    # Test case from the user's requirements
    test_text = "Earn $3000 weekly working from home. Pay a registration fee to start immediately."
    
    print("=" * 80)
    print("ENHANCED SCAM DETECTION TEST")
    print("=" * 80)
    print(f"Input: {test_text}")
    print()
    
    try:
        # Run the analysis
        result = await detect_scam_async(test_text)
        assert_required_fields(result)
        
        print("ANALYSIS RESULTS:")
        print("-" * 40)
        print(f"Scam Probability: {result['scam_probability']}")
        print(f"Risk Level: {result['risk_level']}")
        print(f"Suspicious Phrases: {result['suspicious_phrases']}")
        print(f"Reasons: {result['reasons']}")
        print()
        
        print("DETAILED SCORES:")
        print("-" * 40)
        print(f"Rule Score: {result.get('rule_score', 'N/A')}")
        print(f"Zero-Shot Score: {result.get('zero_shot_score', 'N/A')}")
        print(f"Similarity Score: {result.get('similarity_score', 'N/A')}")
        print(f"Matching Templates: {result.get('matching_templates', [])}")
        print()
        
        # Expected output validation
        print("VALIDATION:")
        print("-" * 40)
        
        expected_probability = 0.89
        actual_probability = result['scam_probability']
        
        print(f"Expected scam probability: ~{expected_probability}")
        print(f"Actual scam probability: {actual_probability}")
        
        # Check if close to expected (within 0.12 tolerance)
        if abs(actual_probability - expected_probability) <= 0.12:
            print("✅ Probability score within acceptable range")
        else:
            print("❌ Probability score outside expected range")
            raise AssertionError("Probability score outside expected range")
        
        # Check risk level
        if result['risk_level'] == 'High':
            print("✅ Risk level correctly identified as High")
        else:
            print(f"❌ Expected High risk level, got {result['risk_level']}")
            raise AssertionError("Risk level mismatch for canonical scam sample")
        
        # Check for expected suspicious phrases
        expected_phrases = ["earn $3000 weekly", "registration fee"]
        found_phrases = result['suspicious_phrases']
        
        for phrase in expected_phrases:
            if any(phrase.lower() in found.lower() for found in found_phrases):
                print(f"✅ Found expected phrase: {phrase}")
            else:
                print(f"❌ Missing expected phrase: {phrase}")
                raise AssertionError(f"Missing suspicious phrase: {phrase}")
        
        # Check for expected reasons
        expected_reasons = ["registration fee requested", "unrealistic salary claim", "typical work-from-home scam pattern"]
        found_reasons = result['reasons']
        
        for reason in expected_reasons:
            if reason in found_reasons:
                print(f"✅ Found expected reason: {reason}")
            else:
                print(f"❌ Missing expected reason: {reason}")
                raise AssertionError(f"Missing reason: {reason}")
        
        print()
        print("=" * 80)
        print("TEST COMPLETED")
        print("=" * 80)
        
        return result
        
    except Exception as e:
        print(f"❌ Error during analysis: {e}")
        import traceback
        traceback.print_exc()
        return None

async def test_additional_cases():
    """Test with additional cases to validate the enhanced system."""
    
    print("\n" + "=" * 80)
    print("ADDITIONAL TEST CASES")
    print("=" * 80)
    
    test_cases = [
        {
            "text": "Legitimate software developer position at tech company. Requires 5 years experience and technical interview.",
            "expected_risk": "Low"
        },
        {
            "text": "Urgent hiring today! No interview required. Earn $5000 daily from home. Limited slots available.",
            "expected_risk": "High"
        },
        {
            "text": "Part-time data entry clerk. $15/hour. Must have high school diploma and pass background check.",
            "expected_risk": "Low"
        }
    ]
    
    for i, case in enumerate(test_cases, 1):
        print(f"\nTest Case {i}:")
        print(f"Text: {case['text']}")
        print(f"Expected Risk: {case['expected_risk']}")
        
        try:
            result = await detect_scam_async(case['text'])
            assert_required_fields(result)
            actual_risk = result['risk_level']
            
            print(f"Actual Risk: {actual_risk}")
            print(f"Probability: {result['scam_probability']}")
            
            if actual_risk == case['expected_risk']:
                print("✅ Risk level matches expectation")
            else:
                print(f"❌ Risk level mismatch (expected: {case['expected_risk']})")
                raise AssertionError(f"Risk level mismatch for case {i}")
                
        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("Starting enhanced scam detection tests...")
    
    # Run the main test
    asyncio.run(test_example())
    
    # Run additional tests
    asyncio.run(test_additional_cases())
