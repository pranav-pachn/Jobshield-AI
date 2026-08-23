class LLMGatewayError(Exception):
    """Base exception for all LLM Gateway errors."""
    pass

class ProviderRateLimitError(LLMGatewayError):
    """Raised when a provider rate limits the request."""
    pass

class ProviderAuthenticationError(LLMGatewayError):
    """Raised when provider authentication fails."""
    pass

class ProviderTimeoutError(LLMGatewayError):
    """Raised when a provider request times out."""
    pass

class ProviderModelUnavailableError(LLMGatewayError):
    """Raised when a requested model is unavailable."""
    pass

class ProviderAPIError(LLMGatewayError):
    """Raised for generic provider API errors."""
    pass

class RoutingPolicyError(LLMGatewayError):
    """Raised when a routing policy is invalid or no provider can be routed."""
    pass

class ProviderOutputParsingError(LLMGatewayError):
    """Raised when the LLM output cannot be parsed into the requested schema."""
    pass
