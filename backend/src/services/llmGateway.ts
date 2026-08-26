const { GoogleGenAI } = require("@google/genai");
import { LLMInvocation } from "../models/LLMInvocation";
import { calculateCost } from "./pricingRegistry";
import { env } from "../config/env";
import { logger } from "../utils/logger";

export interface LLMRequestOptions {
  provider: string; // usually "google"
  model: string;
  messages: any[];
  tools?: any[];
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
  investigationId?: string;
  agentStep?: number;
}

export interface LLMResponse {
  content: string;
  toolCalls?: Array<{
    id: string;
    name: string;
    args: Record<string, any>;
  }>;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    estimatedCostUsd: number;
  };
}

// Convert OpenAI style messages to Google GenAI style
function convertMessagesToGemini(messages: any[], systemInstruction?: string) {
  const contents: any[] = [];
  let sysInst: any;
  if (systemInstruction) {
    sysInst = {
      parts: [{ text: systemInstruction }]
    };
  }

  for (const msg of messages) {
    if (msg.role === "system" && !sysInst) {
      sysInst = { parts: [{ text: msg.content }] };
      continue;
    }
    
    if (msg.role === "user") {
      contents.push({ role: "user", parts: [{ text: msg.content }] });
    } else if (msg.role === "assistant") {
      if (msg.tool_calls && msg.tool_calls.length > 0) {
        const parts = msg.tool_calls.map((tc: any) => ({
          functionCall: {
            name: tc.function?.name || tc.name,
            args: typeof tc.function?.arguments === 'string' ? JSON.parse(tc.function.arguments) : (tc.function?.arguments || tc.args)
          }
        }));
        if (msg.content) parts.unshift({ text: msg.content });
        contents.push({ role: "model", parts });
      } else {
        contents.push({ role: "model", parts: [{ text: msg.content }] });
      }
    } else if (msg.role === "tool") {
      contents.push({
        role: "user",
        parts: [{
          functionResponse: {
            name: msg.name,
            response: { result: msg.content }
          }
        }]
      });
    }
  }

  return { contents, systemInstruction: sysInst };
}

// Convert OpenAI tools to Google GenAI tools
function convertToolsToGemini(tools?: any[]) {
  if (!tools || tools.length === 0) return undefined;
  
  const functionDeclarations = tools.map((t: any) => {
    const fn = t.function || t;
    return {
      name: fn.name,
      description: fn.description,
      parameters: fn.parameters
    };
  });
  
  return [{ functionDeclarations }];
}

const OPENAI_COMPATIBLE_ENDPOINTS: Record<string, string> = {
  groq: "https://api.groq.com/openai/v1/chat/completions",
  openrouter: "https://openrouter.ai/api/v1/chat/completions",
  cerebras: "https://api.cerebras.ai/v1/chat/completions",
  nvidia: "https://integrate.api.nvidia.com/v1/chat/completions"
};

export class LLMGateway {
  private rotationState: Record<string, { currentIndex: number, apiKeys: string[] }> = {
    google: { currentIndex: 0, apiKeys: env.geminiApiKeys },
    gemini: { currentIndex: 0, apiKeys: env.geminiApiKeys },
    groq: { currentIndex: 0, apiKeys: env.groqApiKeys },
    openrouter: { currentIndex: 0, apiKeys: env.openrouterApiKeys },
    cerebras: { currentIndex: 0, apiKeys: env.cerebrasApiKeys },
    nvidia: { currentIndex: 0, apiKeys: env.nvidiaApiKeys }
  };

  private lastRequestTime = 0;
  private requestQueue: Array<() => void> = [];
  private isProcessingQueue = false;

  private rotateKey(provider: string): boolean {
    const state = this.rotationState[provider.toLowerCase()];
    if (!state || state.apiKeys.length <= 1) return false;
    state.currentIndex = (state.currentIndex + 1) % state.apiKeys.length;
    logger.info(`[LLMGateway] Rotating API key for ${provider} to index ${state.currentIndex}`);
    return true;
  }

  private getCurrentKey(provider: string): string {
    const state = this.rotationState[provider.toLowerCase()];
    if (!state || state.apiKeys.length === 0) return "";
    return state.apiKeys[state.currentIndex];
  }

  private async enforceRateLimit(): Promise<void> {
    return new Promise((resolve) => {
      this.requestQueue.push(resolve);
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.isProcessingQueue || this.requestQueue.length === 0) return;
    this.isProcessingQueue = true;

    while (this.requestQueue.length > 0) {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      const intervalMs = env.geminiMinRequestIntervalMs || 0;

      if (timeSinceLastRequest < intervalMs) {
        await new Promise(r => setTimeout(r, intervalMs - timeSinceLastRequest));
      }

      this.lastRequestTime = Date.now();
      const nextRequest = this.requestQueue.shift();
      if (nextRequest) nextRequest();
    }

    this.isProcessingQueue = false;
  }

  private getModelForProvider(provider: string, requestedModel: string): string {
    const p = provider.toLowerCase();
    if (p === "google" || p === "gemini") return requestedModel;
    if (p === "groq") return env.groqModel;
    if (p === "openrouter") return env.openrouterModel;
    if (p === "cerebras") return env.cerebrasModel;
    if (p === "nvidia") return env.nvidiaModel;
    return requestedModel;
  }

  async generateContent(options: LLMRequestOptions): Promise<LLMResponse> {
    const providerChain = [options.provider, ...env.llmFallbackProviders];
    
    for (const provider of providerChain) {
      try {
        return await this.generateContentForProvider(provider, options);
      } catch (error: any) {
        // Is this error retryable on another provider?
        // Project-level 403, 404, or complete exhaustion of keys for this provider escalates here.
        logger.warn(`Provider ${provider} failed completely: ${error.message}. Escalating to next provider if available...`);
        continue;
      }
    }
    
    throw new Error(`All providers in chain (${providerChain.join(", ")}) failed.`);
  }

  private async generateContentForProvider(provider: string, options: LLMRequestOptions): Promise<LLMResponse> {
    const baseModel = this.getModelForProvider(provider, options.model);
    
    // Internal model cascade (specific to Gemini for now based on env)
    const modelChain = provider.toLowerCase() === "google" || provider.toLowerCase() === "gemini" 
      ? [baseModel, env.geminiSecondaryModel, env.geminiFallbackModel] 
      : [baseModel];

    let attempt = 0;
    const state = this.rotationState[provider.toLowerCase()];
    const maxAttempts = state ? Math.max(1, state.apiKeys.length) : 1;
    
    let lastError: any = null;

    for (const model of modelChain) {
      if (!model) continue;
      
      attempt = 0; // Reset key rotation attempts for each model in the cascade
      
      while (attempt < maxAttempts) {
        attempt++;
        const startedAt = new Date();
        let success = false;
        let inputTokens = 0;
        let outputTokens = 0;
        let totalTokens = 0;
        let errorType: string | undefined;
        let resultContent = "";
        let toolCalls: LLMResponse["toolCalls"] = undefined;
        let totalEstimatedCostUsd = 0;

        try {
          const apiKey = this.getCurrentKey(provider);
          if (!apiKey) {
            throw new Error(`No API key configured for provider ${provider}`);
          }

          if (provider.toLowerCase() === "google" || provider.toLowerCase() === "gemini") {
            await this.enforceRateLimit();
            const ai = new GoogleGenAI({ apiKey });
            const { contents, systemInstruction } = convertMessagesToGemini(options.messages, options.systemInstruction);
            const tools = convertToolsToGemini(options.tools);

            const response = await ai.models.generateContent({
              model,
              contents,
              config: {
                systemInstruction,
                tools: tools as any,
                temperature: options.temperature ?? 0.1,
                maxOutputTokens: options.maxOutputTokens
              }
            });

            if (response.usageMetadata) {
              inputTokens = response.usageMetadata.promptTokenCount || 0;
              outputTokens = response.usageMetadata.candidatesTokenCount || 0;
              totalTokens = response.usageMetadata.totalTokenCount || (inputTokens + outputTokens);
            }

            success = true;
            
            if (response.candidates && response.candidates.length > 0) {
              const candidate = response.candidates[0];
              const parts = candidate.content?.parts || [];
              
              const textParts = parts.filter((p: any) => p.text).map((p: any) => p.text);
              resultContent = textParts.join("\n");
              
              const fnCalls = parts.filter((p: any) => p.functionCall).map((p: any) => p.functionCall);
              if (fnCalls.length > 0) {
                toolCalls = fnCalls.map((fc: any, index: number) => ({
                  id: `call_${Date.now()}_${index}`, 
                  name: fc.name,
                  args: fc.args
                }));
              }
            }
          } else {
            // Standard OpenAI-Compatible Request
            const endpoint = OPENAI_COMPATIBLE_ENDPOINTS[provider.toLowerCase()];
            if (!endpoint) throw new Error(`Provider endpoint not found for ${provider}`);

            const payload = {
              model,
              messages: options.systemInstruction 
                ? [{ role: "system", content: options.systemInstruction }, ...options.messages]
                : options.messages,
              tools: options.tools,
              temperature: options.temperature ?? 0.1,
              max_tokens: options.maxOutputTokens
            };

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

            try {
              const res = await fetch(endpoint, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify(payload),
                signal: controller.signal
              });

              clearTimeout(timeoutId);

              const data = await res.json();
              if (!res.ok) {
                const err = new Error(data.error?.message || `HTTP ${res.status} ${res.statusText}`);
                (err as any).status = res.status;
                throw err;
              }

              success = true;
              resultContent = data.choices?.[0]?.message?.content || "";
              
              const calls = data.choices?.[0]?.message?.tool_calls;
              if (calls && calls.length > 0) {
                toolCalls = calls.map((tc: any) => ({
                  id: tc.id,
                  name: tc.function.name,
                  args: typeof tc.function.arguments === "string" ? JSON.parse(tc.function.arguments) : tc.function.arguments
                }));
              }

              if (data.usage) {
                inputTokens = data.usage.prompt_tokens || 0;
                outputTokens = data.usage.completion_tokens || 0;
                totalTokens = data.usage.total_tokens || (inputTokens + outputTokens);
              }
            } catch (fetchErr: any) {
              clearTimeout(timeoutId);
              throw fetchErr;
            }
          }

          // Common Telemetry Save for success
          const completedAt = new Date();
          const latencyMs = completedAt.getTime() - startedAt.getTime();
          const { estimatedCostUsd, pricingVersion } = calculateCost(provider, model, inputTokens, outputTokens);
          totalEstimatedCostUsd = estimatedCostUsd;

          LLMInvocation.create({
            investigationId: options.investigationId || "unknown",
            requestId: `req_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            agentStep: options.agentStep || 0,
            provider,
            model,
            startedAt,
            completedAt,
            latencyMs,
            inputTokens,
            outputTokens,
            totalTokens,
            estimatedCostUsd,
            pricingVersion,
            success: true,
            toolCallsRequested: toolCalls?.length || 0,
            toolCallsExecuted: toolCalls?.length || 0
          }).catch(err => {
            logger.error("Failed to save LLMInvocation telemetry:", err);
          });

          return {
            content: resultContent,
            toolCalls,
            usage: {
              inputTokens,
              outputTokens,
              totalTokens,
              estimatedCostUsd: totalEstimatedCostUsd
            }
          };

        } catch (error: any) {
          lastError = error;
          const status = error.status || error.code;
          let errorType = status || error.name || "Error";
          
          if (error.name === "AbortError" || error.message?.includes("timeout") || errorType === "TimeoutError") {
            errorType = "provider_timeout";
          } else if (status === 401 || status === 403 || error.status === "UNAUTHENTICATED" || error.status === "PERMISSION_DENIED") {
            errorType = "authentication_failure";
          } else if (status === 429 || error.status === "RESOURCE_EXHAUSTED") {
            errorType = "rate_limit";
          } else if (String(status).startsWith("5")) {
            errorType = "provider_error";
          }
          
          const completedAt = new Date();
          const latencyMs = completedAt.getTime() - startedAt.getTime();
          
          LLMInvocation.create({
            investigationId: options.investigationId || "unknown",
            requestId: `req_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            agentStep: options.agentStep || 0,
            provider,
            model,
            startedAt,
            completedAt,
            latencyMs,
            inputTokens: 0, outputTokens: 0, totalTokens: 0, estimatedCostUsd: 0,
            pricingVersion: "unknown",
            success: false,
            errorType
          }).catch(e => logger.error("Telemetry failed:", e));

          // JobShield rotation rules:
          if (["authentication_failure", "rate_limit", "provider_error", "provider_timeout"].includes(errorType)) {
            if (attempt < maxAttempts) {
              logger.warn(`LLMGateway Error [${provider}/${model}]: ${errorType} - ${error.message}. Rotating key...`);
              this.rotateKey(provider);
              
              if (errorType === "rate_limit") {
                 await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 500));
              }
              continue;
            }
          }
          
          // Break key retry loop to escalate to next internal MODEL
          break; 
        }
      } // end key while loop
    } // end internal model cascade

    
    // If we exhausted all keys for this provider or hit a 403/404, throw to trigger fallback chain
    throw lastError;
  }
}

export const llmGateway = new LLMGateway();
