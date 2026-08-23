import time
import json
from openai import AsyncOpenAI
from pydantic import ValidationError
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

class GroqProvider(LLMProvider):
    def __init__(self):
        # Taking the first API key for simplicity. 
        # A more complex router could round-robin these.
        self.api_key = config.GROQ_API_KEYS[0] if config.GROQ_API_KEYS else None
        if self.api_key:
            self.client = AsyncOpenAI(
                base_url="https://api.groq.com/openai/v1",
                api_key=self.api_key,
                timeout=config.DEFAULT_TIMEOUT
            )
        else:
            self.client = None

    @property
    def provider_name(self) -> str:
        return "groq"
        
    @property
    def default_model(self) -> str:
        return config.GROQ_MODEL
        
    def _map_exception(self, e: Exception) -> Exception:
        err_str = str(e).lower()
        if "429" in err_str or "rate limit" in err_str:
            return ProviderRateLimitError(f"Groq Rate Limit: {str(e)}")
        if "timeout" in err_str or "deadline" in err_str:
            return ProviderTimeoutError(f"Groq Timeout: {str(e)}")
        if "401" in err_str or "403" in err_str or "api key" in err_str:
            return ProviderAuthenticationError(f"Groq Auth Error: {str(e)}")
        return ProviderAPIError(f"Groq API Error: {str(e)}")

    async def generate(self, request: LLMRequest) -> LLMResponse:
        if not self.client:
            raise ProviderAuthenticationError("Groq API key not configured")
            
        start_time = time.time()
        
        messages = []
        if request.system_prompt:
            messages.append({"role": "system", "content": request.system_prompt})
        messages.append({"role": "user", "content": request.prompt})
        
        kwargs = {
            "model": self.default_model,
            "messages": messages,
            "temperature": request.temperature,
            "max_tokens": request.max_tokens,
        }
        
        if request.response_model:
            kwargs["response_format"] = {"type": "json_object"}
            
        try:
            response = await self.client.chat.completions.create(**kwargs)
            latency = int((time.time() - start_time) * 1000)
            
            text_content = response.choices[0].message.content
            parsed_output = None
            
            if request.response_model and text_content:
                # Handle possible markdown wrapping from some providers
                clean_content = text_content
                if clean_content.startswith("```json"):
                    clean_content = clean_content[7:-3].strip()
                elif clean_content.startswith("```"):
                    clean_content = clean_content[3:-3].strip()
                    
                try:
                    data = json.loads(clean_content)
                    parsed_output = request.response_model.model_validate(data)
                except (json.JSONDecodeError, ValidationError) as e:
                    raise ProviderOutputParsingError(f"Failed to parse Groq output: {str(e)}")
                    
            usage = None
            if hasattr(response, "usage") and response.usage:
                usage = TokenUsage(
                    input_tokens=response.usage.prompt_tokens,
                    output_tokens=response.usage.completion_tokens,
                    total_tokens=response.usage.total_tokens
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
