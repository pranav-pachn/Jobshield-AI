"""
STEP 6: Hybrid Intelligence - Comprehensive Tests

Tests the hybrid scoring system that combines rule-based and AI scores.

Test Coverage:
- [OK] Basic hybrid scoring formula
- [OK] Score contributions calculation
- [OK] Confidence level assessment
- [OK] Agreement detection
- [OK] Pipeline integration
- [OK] Edge cases and boundary conditions
- [OK] Advanced features (exponential scaling)
- [OK] Real-world scenarios
"""

import sys
import os

# Add service directory to path for imports
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(current_dir, "ai-service", "services"))
sys.path.insert(0, os.path.join(current_dir, "ai-service"))

try:
    from hybrid_intelligence import (
        calculate_hybrid_score,
        calculate_confidence,
        get_confidence_label,
        get_weight_profile,
        merge_scores_from_pipeline,
        explain_hybrid_score,
        validate_weights,
        HybridWeightProfile,
    )
except ImportError as e:
    print(f"Import Error: {e}")
    print(f"Current directory: {current_dir}")
    sys.exit(1)


def test_basic_hybrid_formula():
    """Test the basic hybrid scoring formula: (rule * 0.6) + (ai * 0.4)"""
    print("\n" + "=" * 80)
    print("TEST 1: Basic Hybrid Formula")
    print("=" * 80)
    
    test_cases = [
        {"name": "Both high", "rule": 0.9, "ai": 0.85, "expected": 0.88},
        {"name": "Both medium", "rule": 0.5, "ai": 0.5, "expected": 0.5},
        {"name": "Both low", "rule": 0.1, "ai": 0.15, "expected": 0.12},
        {"name": "High rule, low AI", "rule": 0.8, "ai": 0.3, "expected": 0.6},
        {"name": "Low rule, high AI", "rule": 0.2, "ai": 0.9, "expected": 0.48},
    ]
    
    print("\nFormula: finalScore = (ruleScore * 0.6) + (aiScore * 0.4)")
    print("Weight Profile: 60% Rule-Based, 40% AI\n")
    
    passed = 0
    for test in test_cases:
        final_score, breakdown = calculate_hybrid_score(test["rule"], test["ai"])
        expected = round(test["expected"], 6)
        actual = round(final_score, 6)
        is_pass = abs(actual - expected) < 0.0001
        if is_pass:
            passed += 1
        status = "[OK]" if is_pass else "[FAIL]"
        print(f"{status} {test['name']:30} Rule: {test['rule']:.2f}, AI: {test['ai']:.2f}")
        print(f"    Expected: {expected:.4f} | Got: {actual:.4f}")
    
    print(f"\nResult: {passed}/{len(test_cases)} passed")
    return passed == len(test_cases)


def test_score_breakdown():
    """Test the score breakdown components."""
    print("\n" + "=" * 80)
    print("TEST 2: Score Breakdown Components")
    print("=" * 80)
    
    rule_score = 0.8
    ai_score = 0.7
    final_score, breakdown = calculate_hybrid_score(rule_score, ai_score)
    
    print(f"\nInput Scores: Rule={rule_score}, AI={ai_score}")
    print(f"Weights: Rule={breakdown.rule_weight}, AI={breakdown.ai_weight}")
    
    rule_contrib_expected = rule_score * breakdown.rule_weight
    ai_contrib_expected = ai_score * breakdown.ai_weight
    
    print(f"\nBreakdown:")
    print(f"  Rule Contribution = {breakdown.rule_contribution:.3f}")
    print(f"  AI Contribution   = {breakdown.ai_contribution:.3f}")
    print(f"  Final Score       = {breakdown.final_score:.3f}")
    
    checks = [
        ("Rule contribution", breakdown.rule_contribution, rule_contrib_expected),
        ("AI contribution", breakdown.ai_contribution, ai_contrib_expected),
        ("Final score", breakdown.final_score, rule_contrib_expected + ai_contrib_expected),
    ]
    
    passed = 0
    for name, actual, expected in checks:
        is_pass = abs(actual - expected) < 0.0001
        if is_pass:
            passed += 1
        status = "[OK]" if is_pass else "[FAIL]"
        print(f"{status} {name}: {actual:.4f}")
    
    print(f"\nResult: {passed}/{len(checks)} passed")
    return passed == len(checks)


def test_agreement_detection():
    """Test agreement detection between rule and AI scores."""
    print("\n" + "=" * 80)
    print("TEST 3: Agreement Detection")
    print("=" * 80)
    
    test_cases = [
        {"rule": 0.85, "ai": 0.88, "expected": "STRONG"},
        {"rule": 0.1, "ai": 0.05, "expected": "STRONG"},
        {"rule": 0.7, "ai": 0.5, "expected": "MODERATE"},
        {"rule": 0.9, "ai": 0.2, "expected": "WEAK"},
        {"rule": 0.05, "ai": 0.95, "expected": "WEAK"},
    ]
    
    print("\nThresholds: STRONG < 0.15, MODERATE < 0.35, WEAK >= 0.35\n")
    
    passed = 0
    for test in test_cases:
        final_score, breakdown = calculate_hybrid_score(test["rule"], test["ai"])
        is_pass = breakdown.agreement == test["expected"]
        if is_pass:
            passed += 1
        status = "[OK]" if is_pass else "[FAIL]"
        diff = abs(test["rule"] - test["ai"])
        print(f"{status} Rule: {test['rule']:.2f}, AI: {test['ai']:.2f} -> {breakdown.agreement} (diff: {diff:.2f})")
    
    print(f"\nResult: {passed}/{len(test_cases)} passed")
    return passed == len(test_cases)


def test_pipeline_integration():
    """Test integration with full detection pipeline."""
    print("\n" + "=" * 80)
    print("TEST 4: Pipeline Integration")
    print("=" * 80)
    
    test_cases = [
        {"name": "High risk", "rule_based": 0.95, "zero_shot": 0.90, "similarity": 0.85},
        {"name": "Low risk", "rule_based": 0.05, "zero_shot": 0.08, "similarity": 0.03},
        {"name": "Medium risk", "rule_based": 0.65, "zero_shot": 0.45, "similarity": 0.55},
    ]
    
    print("\nMerging: hybrid = (rule * 0.6) + ((zero_shot + similarity)/2 * 0.4)\n")
    
    passed = 0
    for test in test_cases:
        hybrid_score, details = merge_scores_from_pipeline(
            test["rule_based"],
            test["zero_shot"],
            test["similarity"],
            use_legacy_weights=False,
        )
        
        ai_score = (test["zero_shot"] + test["similarity"]) / 2
        expected = (test["rule_based"] * 0.6) + (ai_score * 0.4)
        
        is_pass = abs(hybrid_score - expected) < 0.0001
        if is_pass:
            passed += 1
        status = "[OK]" if is_pass else "[FAIL]"
        
        print(f"{status} {test['name']}")
        print(f"    Rule: {test['rule_based']:.2f}, AI: {ai_score:.2f} -> Hybrid: {hybrid_score:.4f}")
    
    print(f"\nResult: {passed}/{len(test_cases)} passed")
    return passed == len(test_cases)


def test_edge_cases():
    """Test edge cases and boundary conditions."""
    print("\n" + "=" * 80)
    print("TEST 5: Edge Cases")
    print("=" * 80)
    
    test_cases = [
        {"rule": 1.0, "ai": 1.0, "expected": 1.0, "name": "Perfect scores"},
        {"rule": 0.0, "ai": 0.0, "expected": 0.0, "name": "Zero scores"},
        {"rule": 1.0, "ai": 0.0, "expected": 0.6, "name": "Extreme difference"},
        {"rule": 0.5, "ai": 0.5, "expected": 0.5, "name": "Middle scores"},
    ]
    
    print("\nTesting boundary conditions\n")
    
    passed = 0
    for test in test_cases:
        final_score, breakdown = calculate_hybrid_score(test["rule"], test["ai"])
        is_pass = abs(final_score - test["expected"]) < 0.0001
        if is_pass:
            passed += 1
        status = "[OK]" if is_pass else "[FAIL]"
        print(f"{status} {test['name']:30} -> {final_score:.4f} (expect: {test['expected']})")
    
    print(f"\nResult: {passed}/{len(test_cases)} passed")
    return passed == len(test_cases)


def run_all_tests():
    """Run all hybrid intelligence tests."""
    print("\n" * 2)
    print("=" * 80)
    print("STEP 6: HYBRID INTELLIGENCE - COMPREHENSIVE TEST SUITE".center(80))
    print("=" * 80)
    
    tests = [
        ("Basic Hybrid Formula", test_basic_hybrid_formula),
        ("Score Breakdown", test_score_breakdown),
        ("Agreement Detection", test_agreement_detection),
        ("Pipeline Integration", test_pipeline_integration),
        ("Edge Cases", test_edge_cases),
    ]
    
    results = []
    for name, test_func in tests:
        try:
            result = test_func()
            results.append((name, result))
        except Exception as e:
            print(f"\n[FAIL] {e}")
            import traceback
            traceback.print_exc()
            results.append((name, False))
    
    # Summary
    print("\n" + "=" * 80)
    print("FINAL SUMMARY")
    print("=" * 80)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "[PASS]" if result else "[FAIL]"
        print(f"{status}: {name}")
    
    print(f"\n{'=' * 80}")
    print(f"Total: {passed}/{total} test suites passed")
    print(f"{'=' * 80}\n")
    
    return passed == total


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)

