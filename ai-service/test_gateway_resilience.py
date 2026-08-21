import asyncio
import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from pydantic import BaseModel, Field
from app.schemas.agent_contracts import LLMExecutionResult
from services.llm_service import call_llm_json

class DummyOutput(BaseModel):
    verdict: str
    confidence: float
    evidence: list[str] = Field(default_factory=list)

# Mock AsyncOpenAI to intercept calls
class MockChoiceMessage:
    def __init__(self, content):
        self.content = content

class MockChoice:
    def __init__(self, content):
        self.message = MockChoiceMessage(content)

class MockResponse:
    def __init__(self, content):
        self.choices = [MockChoice(content)]

class MockCompletions:
    def __init__(self, state):
        self.state = state
        
    async def create(self, **kwargs):
        self.state["count"] += 1
        return self.state["func"](self.state["count"], kwargs)

class MockChat:
    def __init__(self, state):
        self.completions = MockCompletions(state)

class MockClient:
    def __init__(self, state, base_url, api_key):
        self.chat = MockChat(state)
        self.base_url = base_url
        self.api_key = api_key

async def run_scenario(name, mock_scenario_func):
    print(f"\n{'='*50}\nRunning {name}\n{'='*50}")
    
    state = {"count": 0, "func": mock_scenario_func}
    
    # Patch AsyncOpenAI in llm_service
    import services.llm_service as llm_service
    original_client = llm_service.AsyncOpenAI
    llm_service.AsyncOpenAI = lambda base_url, api_key: MockClient(state, base_url, api_key)
    
    # Temporarily set keys so we try Groq, OpenRouter, NVIDIA in order
    llm_service.NVIDIA_API_KEYS = ["nv-1"]
    llm_service.GROQ_API_KEY = "groq-1"
    llm_service.OPENROUTER_API_KEYS = ["or-1"]
    llm_service.CEREBRAS_API_KEY = ""
    llm_service.logger.setLevel("ERROR") # quiet down
    
    # Note: providers list in llm_service is built per call
    try:
        res = await call_llm_json("system", "user", DummyOutput)
        print(f"Final Status: {res.status}")
        if res.degradationReason:
            print(f"Degradation Reason: {res.degradationReason}")
        if res.output:
            print(f"Output: {res.output}")
        print("\nProvider Execution Trace:")
        for idx, p in enumerate(res.providerAttempts):
            err_str = f" - Error: {p.error}" if p.error else ""
            print(f"  {idx+1}. {p.provider} ({p.model}) -> {p.status}{err_str}")
    except Exception as e:
        print(f"Uncaught Exception: {e}")
        
    llm_service.AsyncOpenAI = original_client

# Test 1: First provider succeeds
def scenario_1(count, kwargs):
    return MockResponse('{"verdict": "SAFE", "confidence": 0.9}')

# Test 2: Groq -> forced failure (RATE LIMIT), OpenRouter -> success
def scenario_2(count, kwargs):
    if count == 1:
        raise Exception("429 Too Many Requests")
    return MockResponse('{"verdict": "SAFE", "confidence": 0.9}')

# Test 3: NVIDIA -> fail, Groq -> fail, OpenRouter -> success
def scenario_3(count, kwargs):
    if count == 1:
        raise Exception("429 Too Many Requests")
    if count == 2:
        raise Exception("402 Insufficient Credits")
    return MockResponse('{"verdict": "SAFE", "confidence": 0.9}')

# Test 4: All fail
def scenario_4(count, kwargs):
    raise Exception("500 Internal Server Error")

# Test 5: Malformed JSON
def scenario_5(count, kwargs):
    if count == 1:
        return MockResponse('{"verdict": "SAFE", "confidence": 0.9, missing_brace')
    return MockResponse('{"verdict": "SAFE", "confidence": 0.9}')

# Test 6: Truncated JSON (ValidationError)
def scenario_6(count, kwargs):
    if count == 1:
        # Missing required field 'confidence'
        return MockResponse('{"verdict": "SAFE"}')
    return MockResponse('{"verdict": "SAFE", "confidence": 0.9}')

async def main():
    await run_scenario("Test 1: First provider succeeds", scenario_1)
    await run_scenario("Test 2: Provider 1 fails (Rate Limit), Provider 2 succeeds", scenario_2)
    await run_scenario("Test 3: Prov 1 & 2 fail, Provider 3 succeeds", scenario_3)
    await run_scenario("Test 4: All providers fail", scenario_4)
    await run_scenario("Test 5: Malformed JSON -> fallback", scenario_5)
    await run_scenario("Test 6: Truncated JSON / Validation Error -> fallback", scenario_6)

if __name__ == "__main__":
    asyncio.run(main())
