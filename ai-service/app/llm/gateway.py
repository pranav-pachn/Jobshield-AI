from typing import Type, Optional
from pydantic import BaseModel
from app.llm.schemas import LLMRequest, LLMResponse, LLMTask
from app.llm.router import LLMRouter
from app.orchestrator.budget import BudgetController

class LLMGateway:
    """
    Primary interface for agents to request LLM completions.
    Agents interact with this gateway without knowing which provider handles the request.
    """
    def __init__(self, mode: str = "production"):
        self.router = LLMRouter(mode=mode)
        
    async def generate(
        self,
        task: LLMTask,
        prompt: str,
        system_prompt: Optional[str] = None,
        investigation_id: Optional[str] = None,
        budget: Optional[BudgetController] = None,
        response_model: Optional[Type[BaseModel]] = None,
        max_tokens: int = 1000,
        temperature: float = 0.1
    ) -> LLMResponse:
        """
        Generates a completion for the given task.
        
        Args:
            task: The LLMTask identifying the type of work (e.g. INVESTIGATION_REASONING)
            prompt: The user prompt.
            system_prompt: Optional system instructions.
            response_model: Optional Pydantic model for structured output parsing.
            max_tokens: Maximum tokens to generate.
            temperature: Generation temperature.
            
        Returns:
            An LLMResponse containing the content and potentially the parsed_output.
        """
        request = LLMRequest(
            task=task,
            prompt=prompt,
            system_prompt=system_prompt,
            investigation_id=investigation_id,
            response_model=response_model,
            max_tokens=max_tokens,
            temperature=temperature
        )
        
        return await self.router.execute(request, budget=budget)

# Create a default instance for easy importing
gateway = LLMGateway()
