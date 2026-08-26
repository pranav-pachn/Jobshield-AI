export interface PricingConfig {
  inputPerMillion: number;
  outputPerMillion: number;
  version: string;
}

const REGISTRY: Record<string, Record<string, PricingConfig>> = {
  google: {
    // Current introductory pricing for Gemini 3.7 Flash until Dec 31, 2026
    "gemini-3.7-flash": {
      inputPerMillion: 0.75,
      outputPerMillion: 3.75,
      version: "2026-08"
    },
    // Current pricing for Gemini 3.5 Flash
    "gemini-3.5-flash": {
      inputPerMillion: 1.50,
      outputPerMillion: 9.00,
      version: "2026-08"
    }
  }
};

export function getPricing(provider: string, model: string): PricingConfig {
  const providerPricing = REGISTRY[provider.toLowerCase()];
  if (providerPricing && providerPricing[model.toLowerCase()]) {
    return providerPricing[model.toLowerCase()];
  }
  
  // Default to Gemini 3.5 Flash if not found
  return {
    inputPerMillion: 1.50,
    outputPerMillion: 9.00,
    version: "unknown-default"
  };
}

export function calculateCost(provider: string, model: string, inputTokens: number, outputTokens: number): { estimatedCostUsd: number, pricingVersion: string } {
  const pricing = getPricing(provider, model);
  
  const inputCost = (inputTokens / 1_000_000) * pricing.inputPerMillion;
  const outputCost = (outputTokens / 1_000_000) * pricing.outputPerMillion;
  
  return {
    estimatedCostUsd: inputCost + outputCost,
    pricingVersion: pricing.version
  };
}
