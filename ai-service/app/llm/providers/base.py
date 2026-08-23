from abc import ABC, abstractmethod
from app.llm.schemas import LLMRequest, LLMResponse

class LLMProvider(ABC):
    
    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Name of the provider (e.g., 'gemini', 'groq')."""
        pass
        
    @property
    @abstractmethod
    def default_model(self) -> str:
        """The default model identifier used by this provider."""
        pass
        
    @abstractmethod
    async def generate(self, request: LLMRequest) -> LLMResponse:
        """
        Executes an LLM request against the provider.
        
        Args:
            request: The standardized LLMRequest.
            
        Returns:
            An LLMResponse containing either text or parsed output.
            
        Raises:
            LLMGatewayError: Various exceptions depending on failure mode.
        """
        pass
