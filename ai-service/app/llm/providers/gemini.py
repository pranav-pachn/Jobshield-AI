import time
import json
import logging
from pydantic import BaseModel, ValidationError
from app.llm.providers.base import LLMProvider
from app.llm.schemas import LLMRequest, LLMResponse, ProviderMetadata, TokenUsage
from app.llm.config import config
from app.llm.exceptions import (
    ProviderAPIError,
    ProviderRateLimitError,
    ProviderTimeoutError,
    ProviderAuthenticationError,
    ProviderOutputParsingError
)

logger = logging.getLogger(__name__)

class GeminiProvider(LLMProvider):
    def __init__(self, model: str = None, provider_name: str = "gemini"):
        self.api_key = config.GEMINI_API_KEYS[0] if config.GEMINI_API_KEYS else None
        self._provider_name = provider_name
        self._model = model
        
        if self.api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
            except ImportError as e:
                logger.error(f"Failed to import google.genai: {e}")
                self.client = None
        else:
            self.client = None

    @property
    def provider_name(self) -> str:
        return self._provider_name
        
    @property
    def default_model(self) -> str:
        return self._model
        
    def _map_exception(self, e: Exception) -> Exception:
        err_str = str(e).lower()
        if "429" in err_str or "quota" in err_str or "rate limit" in err_str:
            return ProviderRateLimitError(f"Gemini Rate Limit: {str(e)}")
        if "timeout" in err_str or "deadline" in err_str:
            return ProviderTimeoutError(f"Gemini Timeout: {str(e)}")
        if "401" in err_str or "403" in err_str or "api key" in err_str:
            return ProviderAuthenticationError(f"Gemini Auth Error: {str(e)}")
        return ProviderAPIError(f"Gemini API Error: {str(e)}")

    async def generate(self, request: LLMRequest) -> LLMResponse:
        if not self.client:
            raise ProviderAuthenticationError("Gemini API key not configured")
            
        start_time = time.time()
        
        try:
            from google.genai import types
        except ImportError as e:
            raise ProviderAPIError(f"google-genai not installed: {e}")
        
        # Prepare content
        contents = []
        if request.system_prompt:
            contents.append(
                types.Content(role="system", parts=[types.Part.from_text(text=request.system_prompt)])
            )
        contents.append(
            types.Content(role="user", parts=[types.Part.from_text(text=request.prompt)])
        )
        
        # Determine schema config
        response_schema = None
        response_mime_type = "text/plain"
        if request.response_model:
            response_schema = request.response_model.model_json_schema()
            response_mime_type = "application/json"
            
        generation_config = types.GenerateContentConfig(
            temperature=request.temperature,
            max_output_tokens=request.max_tokens,
            response_mime_type=response_mime_type,
            response_schema=response_schema
        )
        
        try:
            # Using async generation (requires genai.Client's aio module if available, 
            # otherwise wrapping synchronous call)
            response = await self.client.aio.models.generate_content(
                model=self.default_model,
                contents=contents,
                config=generation_config
            )
            
            latency = int((time.time() - start_time) * 1000)
            
            text_content = response.text
            parsed_output = None
            
            if request.response_model and text_content:
                try:
                    data = json.loads(text_content)
                    parsed_output = request.response_model.model_validate(data)
                except (json.JSONDecodeError, ValidationError) as e:
                    raise ProviderOutputParsingError(f"Failed to parse Gemini output: {str(e)}")
                    
            usage = None
            if response.usage_metadata:
                usage = TokenUsage(
                    input_tokens=response.usage_metadata.prompt_token_count,
                    output_tokens=response.usage_metadata.candidates_token_count,
                    total_tokens=response.usage_metadata.total_token_count
                )
                
            metadata = ProviderMetadata(
                provider=self.provider_name,
                model=self.default_model,
                latency_ms=latency,
                attempts=1,
                fallback_used=False,
                routing_policy="pending"
            )
            
            return LLMResponse(
                content=text_content,
                parsed_output=parsed_output,
                provider=self.provider_name,
                model=self.default_model,
                latency_ms=latency,
                usage=usage,
                metadata=metadata
            )
            
        except ProviderOutputParsingError:
            raise
        except Exception as e:
            raise self._map_exception(e)
