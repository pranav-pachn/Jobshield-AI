import os
import sys
import json
import asyncio
import hashlib

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.utils.cache import DeduplicatingLRUCache

def generate_cache_key(normalized_text: str, model_version: str, prompt_version: str) -> str:
    key_str = f"{normalized_text}_{model_version}_{prompt_version}"
    return hashlib.sha256(key_str.encode()).hexdigest()

async def simulate_computation():
    await asyncio.sleep(0.1)
    return {"result": "success"}

async def run_cache_audit() -> dict:
    # 1. Clear process-local cache by instantiating a fresh one
    cache = DeduplicatingLRUCache(capacity=100, ttl_seconds=3600)

    report = {
        "tests": [],
        "overall": "PASS"
    }

    def add_test(name, is_hit_expected, actual_hit):
        status = "PASS" if is_hit_expected == actual_hit else "FAIL"
        if status == "FAIL":
            report["overall"] = "FAIL"
        report["tests"].append({
            "test": name,
            "expected_hit": is_hit_expected,
            "actual_hit": actual_hit,
            "status": status
        })

    # Baseline Case A
    key_a = generate_cache_key("test job scam text", "gpt-4", "v1")
    _, is_hit_a1 = await cache.get_or_compute(key_a, simulate_computation)
    add_test("Initial Case A", False, is_hit_a1)

    # 1. Same text + same versions -> HIT
    _, is_hit_a2 = await cache.get_or_compute(key_a, simulate_computation)
    add_test("Same text + same versions", True, is_hit_a2)

    # 2. Same text + different prompt version -> MISS
    key_b = generate_cache_key("test job scam text", "gpt-4", "v2")
    _, is_hit_b = await cache.get_or_compute(key_b, simulate_computation)
    add_test("Same text + different prompt version", False, is_hit_b)

    # 3. Same text + different model version -> MISS
    key_c = generate_cache_key("test job scam text", "gpt-3.5", "v1")
    _, is_hit_c = await cache.get_or_compute(key_c, simulate_computation)
    add_test("Same text + different model version", False, is_hit_c)

    # 4. Different text -> MISS
    key_d = generate_cache_key("completely different job text", "gpt-4", "v1")
    _, is_hit_d = await cache.get_or_compute(key_d, simulate_computation)
    add_test("Different text", False, is_hit_d)

    return report

def main():
    res = asyncio.run(run_cache_audit())
    print(json.dumps(res, indent=2))

if __name__ == "__main__":
    main()
