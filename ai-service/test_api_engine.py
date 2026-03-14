#!/usr/bin/env python3
"""
Comprehensive API testing for the AI Detection Engine.
Tests the /api/analyze-job endpoint for functionality, format, and accuracy.
"""

import asyncio
import json
import time
import requests
import concurrent.futures
from typing import Dict, List, Any

# API Configuration
BASE_URL = "http://localhost:8000"
API_ENDPOINT = f"{BASE_URL}/api/analyze-job"

def test_api_health():
    """Test API health endpoint."""
    print("=" * 60)
    print("API HEALTH TEST")
    print("=" * 60)
    
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        print(f"Health Check Status: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            print("✅ API is healthy and running")
            return True
        else:
            print("❌ API health check failed")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ API connection failed: {e}")
        return False

def test_response_format():
    """Test API response format validation."""
    print("\n" + "=" * 60)
    print("RESPONSE FORMAT VALIDATION")
    print("=" * 60)
    
    test_cases = [
        {
            "name": "Basic scam test",
            "text": "Earn $3000 weekly working from home. Pay a registration fee to start immediately."
        },
        {
            "name": "Legitimate job test", 
            "text": "Software developer position at tech company. Requires 5 years experience."
        },
        {
            "name": "Empty text test",
            "text": ""
        }
    ]
    
    required_fields = ["scam_probability", "risk_level", "suspicious_phrases", "reasons"]
    passed = 0
    
    for case in test_cases:
        print(f"\nTest: {case['name']}")
        
        try:
            response = requests.post(API_ENDPOINT, json={"text": case['text']}, timeout=10)
            
            if case['name'] == "Empty text test":
                # Should return 400 for empty text
                if response.status_code == 400:
                    print("✅ Empty text correctly rejected")
                    passed += 1
                else:
                    print(f"❌ Empty text should return 400, got {response.status_code}")
                continue
            
            if response.status_code != 200:
                print(f"❌ Request failed with status {response.status_code}")
                continue
                
            data = response.json()
            
            # Check required fields
            missing_fields = [field for field in required_fields if field not in data]
            if missing_fields:
                print(f"❌ Missing fields: {missing_fields}")
                continue
            
            # Validate field types
            if not isinstance(data['scam_probability'], (int, float)):
                print("❌ scam_probability should be a number")
                continue
                
            if not isinstance(data['risk_level'], str):
                print("❌ risk_level should be a string")
                continue
                
            if not isinstance(data['suspicious_phrases'], list):
                print("❌ suspicious_phrases should be a list")
                continue
                
            if not isinstance(data['reasons'], list):
                print("❌ reasons should be a list")
                continue
            
            # Validate probability range
            prob = data['scam_probability']
            if not (0 <= prob <= 1):
                print(f"❌ scam_probability {prob} should be between 0 and 1")
                continue
            
            # Validate risk level
            if data['risk_level'] not in ['Low', 'Medium', 'High']:
                print(f"❌ risk_level '{data['risk_level']}' should be Low/Medium/High")
                continue
            
            print(f"✅ Response format valid: prob={prob}, risk={data['risk_level']}")
            print(f"   Suspicious phrases: {len(data['suspicious_phrases'])}")
            print(f"   Reasons: {len(data['reasons'])}")
            passed += 1
            
        except requests.exceptions.RequestException as e:
            print(f"❌ Request failed: {e}")
        except json.JSONDecodeError as e:
            print(f"❌ JSON decode error: {e}")
        except Exception as e:
            print(f"❌ Unexpected error: {e}")
    
    print(f"\nFormat Validation: {passed}/{len(test_cases)} passed")
    return passed == len(test_cases)

def test_hybrid_detection():
    """Test hybrid detection logic with various scam patterns."""
    print("\n" + "=" * 60)
    print("HYBRID DETECTION LOGIC TEST")
    print("=" * 60)
    
    test_cases = [
        {
            "name": "Canonical scam",
            "text": "Earn $3000 weekly working from home. Pay a registration fee to start immediately.",
            "expected_risk": "High",
            "expected_phrases": ["earn $3000 weekly", "registration fee"]
        },
        {
            "name": "Messaging platform scam",
            "text": "Contact recruiter on Telegram for urgent hiring. No interview required.",
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
            "name": "Legitimate job",
            "text": "Software developer position at established tech company. Requires 5 years experience and technical interview.",
            "expected_risk": "Low",
            "expected_phrases": []
        },
        {
            "name": "Mixed content",
            "text": "Remote work opportunity in marketing. $25 hourly. Requires bachelor's degree and portfolio review.",
            "expected_risk": "Low",
            "expected_phrases": []
        }
    ]
    
    passed = 0
    
    for case in test_cases:
        print(f"\nTest: {case['name']}")
        print(f"Text: {case['text'][:80]}...")
        
        try:
            start_time = time.time()
            response = requests.post(API_ENDPOINT, json={"text": case['text']}, timeout=10)
            response_time = time.time() - start_time
            
            if response.status_code != 200:
                print(f"❌ Request failed with status {response.status_code}")
                continue
                
            data = response.json()
            
            # Check risk level
            actual_risk = data['risk_level']
            if actual_risk == case['expected_risk']:
                print(f"✅ Risk level correct: {actual_risk}")
            else:
                print(f"❌ Risk level mismatch: expected {case['expected_risk']}, got {actual_risk}")
            
            # Check expected phrases
            actual_phrases = data['suspicious_phrases']
            phrase_matches = 0
            for expected_phrase in case.get('expected_phrases', []):
                if any(expected_phrase.lower() in phrase.lower() for phrase in actual_phrases):
                    phrase_matches += 1
                    print(f"✅ Found expected phrase: {expected_phrase}")
                else:
                    print(f"❌ Missing expected phrase: {expected_phrase}")
            
            # Print results
            print(f"   Probability: {data['scam_probability']}")
            print(f"   Phrases found: {len(actual_phrases)}")
            print(f"   Reasons: {len(data['reasons'])}")
            print(f"   Response time: {response_time:.2f}s")
            
            # Consider test passed if risk level is correct
            if actual_risk == case['expected_risk']:
                passed += 1
                
        except Exception as e:
            print(f"❌ Test failed: {e}")
    
    print(f"\nHybrid Detection: {passed}/{len(test_cases)} passed")
    return passed >= len(test_cases) * 0.8  # 80% pass rate

def test_performance():
    """Test API performance with concurrent requests."""
    print("\n" + "=" * 60)
    print("PERFORMANCE TEST")
    print("=" * 60)
    
    test_text = "Earn $3000 weekly working from home. Pay a registration fee to start immediately."
    
    def single_request():
        """Make a single API request."""
        start_time = time.time()
        try:
            response = requests.post(API_ENDPOINT, json={"text": test_text}, timeout=10)
            response_time = time.time() - start_time
            return response.status_code == 200, response_time
        except:
            return False, 0
    
    # Test single request performance
    print("Testing single request performance...")
    success, response_time = single_request()
    if success:
        print(f"✅ Single request: {response_time:.2f}s")
    else:
        print("❌ Single request failed")
        return False
    
    # Test concurrent requests
    print("\nTesting concurrent requests (10 parallel)...")
    concurrent_requests = 10
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=concurrent_requests) as executor:
        futures = [executor.submit(single_request) for _ in range(concurrent_requests)]
        results = [future.result() for future in concurrent.futures.as_completed(futures)]
    
    successful_requests = sum(1 for success, _ in results if success)
    response_times = [rt for _, rt in results if rt > 0]
    
    print(f"Successful requests: {successful_requests}/{concurrent_requests}")
    if response_times:
        avg_time = sum(response_times) / len(response_times)
        max_time = max(response_times)
        min_time = min(response_times)
        print(f"Average response time: {avg_time:.2f}s")
        print(f"Max response time: {max_time:.2f}s")
        print(f"Min response time: {min_time:.2f}s")
    
    # Performance criteria
    success_rate = successful_requests / concurrent_requests
    avg_acceptable = avg_time < 3.0  # Under 3 seconds
    success_acceptable = success_rate >= 0.9  # 90% success rate
    
    if success_acceptable and avg_acceptable:
        print("✅ Performance test passed")
        return True
    else:
        print("❌ Performance test failed")
        return False

def test_edge_cases():
    """Test edge cases and error handling."""
    print("\n" + "=" * 60)
    print("EDGE CASES TEST")
    print("=" * 60)
    
    edge_cases = [
        {
            "name": "Very short text",
            "text": "Scam"
        },
        {
            "name": "Very long text",
            "text": "Legitimate software engineering position at a well-established technology company. " * 20
        },
        {
            "name": "Special characters",
            "text": "Earn $3000 weekly! 🎉💰 Pay registration fee & start immediately!!!"
        },
        {
            "name": "Mixed language",
            "text": "Earn $3000 weekly trabajo desde casa. Pay registration fee to start."
        },
        {
            "name": "Numbers only",
            "text": "3000 2000 5000 1000"
        }
    ]
    
    passed = 0
    
    for case in edge_cases:
        print(f"\nTest: {case['name']}")
        
        try:
            response = requests.post(API_ENDPOINT, json={"text": case['text']}, timeout=10)
            
            if response.status_code != 200:
                print(f"❌ Request failed: {response.status_code}")
                continue
                
            data = response.json()
            
            # Basic validation
            if all(field in data for field in ["scam_probability", "risk_level", "suspicious_phrases", "reasons"]):
                print(f"✅ Edge case handled: prob={data['scam_probability']}, risk={data['risk_level']}")
                passed += 1
            else:
                print("❌ Invalid response format")
                
        except Exception as e:
            print(f"❌ Edge case failed: {e}")
    
    print(f"\nEdge Cases: {passed}/{len(edge_cases)} passed")
    return passed >= len(edge_cases) * 0.8

def main():
    """Run all API tests."""
    print("AI DETECTION ENGINE COMPREHENSIVE TESTING")
    print("=" * 80)
    
    test_results = {}
    
    # Run all tests
    test_results['health'] = test_api_health()
    test_results['format'] = test_response_format()
    test_results['detection'] = test_hybrid_detection()
    test_results['performance'] = test_performance()
    test_results['edge_cases'] = test_edge_cases()
    
    # Summary
    print("\n" + "=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    
    passed_tests = sum(test_results.values())
    total_tests = len(test_results)
    
    for test_name, result in test_results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name.upper():15}: {status}")
    
    print(f"\nOverall: {passed_tests}/{total_tests} tests passed")
    
    if passed_tests == total_tests:
        print("🎉 ALL TESTS PASSED - AI Detection Engine is ready!")
    elif passed_tests >= total_tests * 0.8:
        print("⚠️  MOST TESTS PASSED - AI Detection Engine mostly ready")
    else:
        print("❌ MANY TESTS FAILED - AI Detection Engine needs improvements")
    
    return passed_tests == total_tests

if __name__ == "__main__":
    main()
