#!/usr/bin/env python3
"""
Enhanced test script for the improved scam detection system.
Tests the system with new patterns and edge cases to validate improvements.
"""

import asyncio
import sys
import os

# Add the app directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from services.scam_detection import detect_scam_async

async def test_enhanced_patterns():
    """Test the enhanced detection system with new scam patterns."""
    
    print("=" * 80)
    print("ENHANCED SCAM PATTERN DETECTION TEST")
    print("=" * 80)
    
    test_cases = [
        {
            "name": "Messaging platform recruitment",
            "text": "Contact recruiter on Telegram for immediate hiring. No interview required.",
            "expected_risk": "High",
            "expected_phrases": ["contact recruiter on telegram", "no interview required"]
        },
        {
            "name": "Payment confirmation scam",
            "text": "Send payment to confirm slot. $200 daily part-time social media job available.",
            "expected_risk": "High", 
            "expected_phrases": ["send payment", "$200 daily"]
        },
        {
            "name": "WhatsApp recruitment",
            "text": "WhatsApp recruiter for urgent hiring today. High pay no experience needed.",
            "expected_risk": "High",
            "expected_phrases": ["whatsapp recruiter", "urgent hiring today"]
        },
        {
            "name": "Deposit required",
            "text": "Deposit required for position. Work from home earning $3000 weekly.",
            "expected_risk": "High",
            "expected_phrases": ["deposit required", "$3000 weekly"]
        },
        {
            "name": "High daily pay part-time",
            "text": "$250 daily part-time data entry. No experience required. Start immediately.",
            "expected_risk": "High",
            "expected_phrases": ["$250 daily", "no experience required"]
        },
        {
            "name": "Legitimate job control",
            "text": "Software developer position at tech company. Requires 5 years experience and technical interview.",
            "expected_risk": "Low",
            "expected_phrases": []
        }
    ]
    
    passed = 0
    total = len(test_cases)
    
    for i, case in enumerate(test_cases, 1):
        print(f"\nTest Case {i}: {case['name']}")
        print(f"Text: {case['text']}")
        print(f"Expected Risk: {case['expected_risk']}")
        
        try:
            result = await detect_scam_async(case['text'])
            actual_risk = result['risk_level']
            actual_phrases = result['suspicious_phrases']
            actual_probability = result['scam_probability']
            
            print(f"Actual Risk: {actual_risk}")
            print(f"Probability: {actual_probability}")
            print(f"Suspicious Phrases: {actual_phrases}")
            print(f"Reasons: {result['reasons']}")
            
            # Check risk level
            risk_match = actual_risk == case['expected_risk']
            if risk_match:
                print("✅ Risk level matches expectation")
                passed += 1
            else:
                print(f"❌ Risk level mismatch (expected: {case['expected_risk']})")
            
            # Check expected phrases
            for expected_phrase in case.get('expected_phrases', []):
                phrase_found = any(expected_phrase.lower() in phrase.lower() for phrase in actual_phrases)
                if phrase_found:
                    print(f"✅ Found expected phrase: {expected_phrase}")
                else:
                    print(f"❌ Missing expected phrase: {expected_phrase}")
            
            # Check for empty reasons (should not happen)
            if not result['reasons']:
                print("❌ Empty reasons detected")
            else:
                print("✅ Reasons provided")
                
        except Exception as e:
            print(f"❌ Error: {e}")
            import traceback
            traceback.print_exc()
    
    print(f"\n" + "=" * 80)
    print(f"TEST RESULTS: {passed}/{total} passed")
    print("=" * 80)
    
    if passed == total:
        print("🎉 All tests passed! Enhanced patterns working correctly.")
    else:
        print(f"⚠️  {total - passed} tests failed. Review patterns and scoring.")
    
    return passed == total

async def test_original_example():
    """Test the original example to see if scoring improved."""
    
    print("\n" + "=" * 80)
    print("ORIGINAL EXAMPLE TEST")
    print("=" * 80)
    
    test_text = "Earn $3000 weekly working from home. Pay a registration fee to start immediately."
    
    print(f"Input: {test_text}")
    
    try:
        result = await detect_scam_async(test_text)
        
        print(f"\nResults:")
        print(f"Scam Probability: {result['scam_probability']}")
        print(f"Risk Level: {result['risk_level']}")
        print(f"Suspicious Phrases: {result['suspicious_phrases']}")
        print(f"Reasons: {result['reasons']}")
        print(f"Rule Score: {result.get('rule_score', 'N/A')}")
        print(f"Zero-Shot Score: {result.get('zero_shot_score', 'N/A')}")
        print(f"Similarity Score: {result.get('similarity_score', 'N/A')}")
        
        # Check if closer to expected 0.89
        expected = 0.89
        actual = result['scam_probability']
        tolerance = 0.15
        
        if abs(actual - expected) <= tolerance:
            print(f"✅ Probability {actual} within tolerance of expected {expected}")
        else:
            print(f"❌ Probability {actual} outside tolerance of expected {expected}")
            
        return result
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

if __name__ == "__main__":
    print("Starting enhanced scam detection tests...")
    
    # Test enhanced patterns
    patterns_passed = asyncio.run(test_enhanced_patterns())
    
    # Test original example
    asyncio.run(test_original_example())
    
    print("\n" + "=" * 80)
    print("TESTING COMPLETED")
    print("=" * 80)
