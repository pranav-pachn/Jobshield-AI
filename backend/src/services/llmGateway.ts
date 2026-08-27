const { GoogleGenAI } = require("@google/genai");
import { LLMInvocation } from "../models/LLMInvocation";
import { calculateCost } from "./pricingRegistry";
import { env } from "../config/env";
import { logger } from "../utils/logger";

export interface LLMRequestOptions {
  provider: string;
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
  telemetry: {
    providerUsed: string;
    modelUsed: string;
    attemptCount: number;
    fallbackUsed: boolean;
    fallbackReason?: string;
    totalLatencyMs: number;
  };
}

interface ModelCapability {
  toolCalling: boolean;
  structuredOutput: boolean;
  maxContextTokens: number;
}

const MODEL_CAPABILITIES: Record<string, ModelCapability> = {
  "gemini-3.7-flash": { toolCalling: true, structuredOutput: true, maxContextTokens: 1000000 },
  "gemini-3.6-flash": { toolCalling: true, structuredOutput: true, maxContextTokens: 1000000 },
  "gemini-3.5-flash": { toolCalling: true, structuredOutput: true, maxContextTokens: 1000000 },
  "gemini-3.5-flash-lite": { toolCalling: true, structuredOutput: false, maxContextTokens: 1000000 },
  "gemini-3.1-flash-lite": { toolCalling: true, structuredOutput: false, maxContextTokens: 1000000 },
  "gemini-2.5-flash": { toolCalling: true, structuredOutput: true, maxContextTokens: 1000000 },
  "gemini-2.5-flash-lite": { toolCalling: true, structuredOutput: false, maxContextTokens: 1000000 },
  "openrouter/auto": { toolCalling: true, structuredOutput: true, maxContextTokens: 128000 },
  "llama3-70b-8192": { toolCalling: true, structuredOutput: true, maxContextTokens: 8192 },
  "llama3-70b": { toolCalling: true, structuredOutput: true, maxContextTokens: 8192 },
  "meta/llama3-70b-instruct": { toolCalling: true, structuredOutput: true, maxContextTokens: 8192 }
};

function convertMessagesToGemini(messages: any[], systemInstruction?: string) {
  const contents: any[] = [];
  let sysInst: any;
  if (systemInstruction) {
    sysInst = { parts: [{ text: systemInstruction }] };
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

function convertToolsToGemini(tools?: any[]) {
  if (!tools || tools.length === 0) return undefined;
  const functionDeclarations = tools.map((t: any) => {
    const fn = t.function || t;
    return { name: fn.name, description: fn.description, parameters: fn.parameters };
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
  private unavailableModels = new Map<string, number>(); 
  private unavailableCredentials = new Map<string, number>(); 
  private credentialModelComboCooldown = new Map<string, number>(); 
  
  private lastRequestTime = 0;
  private requestQueue: Array<() => void> = [];
  private isProcessingQueue = false;

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

  private getApiKeysForProvider(provider: string): any[] {
    const p = provider.toLowerCase();
    if (p === "google" || p === "gemini") return env.geminiApiKeys;
    if (p === "groq") return env.groqApiKeys.map((k, i) => ({ projectId: `groq-${i}`, credentialId: `groq-key-${i}`, key: k }));
    if (p === "openrouter") return env.openrouterApiKeys.map((k, i) => ({ projectId: `or-${i}`, credentialId: `or-key-${i}`, key: k }));
    if (p === "cerebras") return env.cerebrasApiKeys.map((k, i) => ({ projectId: `cer-${i}`, credentialId: `cer-key-${i}`, key: k }));
    if (p === "nvidia") return env.nvidiaApiKeys.map((k, i) => ({ projectId: `nv-${i}`, credentialId: `nv-key-${i}`, key: k }));
    return [];
  }

  private isModelEligible(model: string, needsToolCalling: boolean): boolean {
    const now = Date.now();
    if (this.unavailableModels.has(model) && this.unavailableModels.get(model)! > now) {
      return false;
    }
    const cap = MODEL_CAPABILITIES[model];
    if (needsToolCalling && cap && !cap.toolCalling) {
      return false;
    }
    return true;
  }

  private isCredentialEligible(projectId: string, credentialId: string): boolean {
    const now = Date.now();
    const key = `${projectId}:${credentialId}`;
    if (this.unavailableCredentials.has(key) && this.unavailableCredentials.get(key)! > now) {
      return false;
    }
    return true;
  }

  private isCredentialModelEligible(projectId: string, credentialId: string, model: string): boolean {
    const now = Date.now();
    const key = `${projectId}:${credentialId}:${model}`;
    if (this.credentialModelComboCooldown.has(key) && this.credentialModelComboCooldown.get(key)! > now) {
      return false;
    }
    return true;
  }

  async generateContent(options: LLMRequestOptions): Promise<LLMResponse> {
    const providerChain = [options.provider, ...env.llmFallbackProviders];
    const totalStartedAt = new Date();
    let overallAttempts = 0;
    
    let fallbackUsed = false;
    let fallbackReason: string | undefined;

    for (let pIdx = 0; pIdx < providerChain.length; pIdx++) {
      const provider = providerChain[pIdx];
      const needsToolCalling = !!(options.tools && options.tools.length > 0);
      const isGemini = provider.toLowerCase() === "google" || provider.toLowerCase() === "gemini";
      
      const baseModel = this.getModelForProvider(provider, options.model);
      const modelChain = isGemini ? [baseModel, ...env.geminiFallbackModels] : [baseModel];
      
      const apiKeys = this.getApiKeysForProvider(provider);
      if (apiKeys.length === 0) continue;

      for (const model of modelChain) {
        if (!model) continue;

        if (!this.isModelEligible(model, needsToolCalling)) {
          continue;
        }

        if (model !== options.model) {
          fallbackUsed = true;
          if (!fallbackReason) fallbackReason = `Model switched to ${model}`;
        }

        for (const cred of apiKeys) {
          const { projectId, credentialId, key } = cred;
          
          if (!this.isCredentialEligible(projectId, credentialId)) continue;
          if (!this.isCredentialModelEligible(projectId, credentialId, model)) continue;

          let attempt = 0;
          const MAX_429_RETRIES = 3;

          while (attempt < MAX_429_RETRIES) {
            attempt++;
            overallAttempts++;
            const startedAt = new Date();
            let inputTokens = 0, outputTokens = 0, totalTokens = 0;
            let totalEstimatedCostUsd = 0;

            try {
              let resultContent = "";
              let toolCalls: LLMResponse["toolCalls"] = undefined;

              if (isGemini) {
                await this.enforceRateLimit();
                const ai = new GoogleGenAI({ apiKey: key });
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
                const timeoutId = setTimeout(() => controller.abort(), 30000);

                const res = await fetch(endpoint, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${key}`
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
              }

              const completedAt = new Date();
              const latencyMs = completedAt.getTime() - startedAt.getTime();
              const totalLatencyMs = completedAt.getTime() - totalStartedAt.getTime();
              const { estimatedCostUsd, pricingVersion } = calculateCost(provider, model, inputTokens, outputTokens);
              totalEstimatedCostUsd = estimatedCostUsd;

              LLMInvocation.create({
                investigationId: options.investigationId || "unknown",
                requestId: `req_${Date.now()}`,
                agentStep: options.agentStep || 0,
                provider,
                projectId,
                credentialId,
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
                attempt: overallAttempts,
                fallbackUsed,
                fallbackReason,
                toolCallsRequested: toolCalls?.length || 0,
                toolCallsExecuted: toolCalls?.length || 0,
                routingPolicy: "WATERFALL"
              }).catch(err => logger.error("Telemetry failed:", err));

              return {
                content: resultContent,
                toolCalls,
                usage: { inputTokens, outputTokens, totalTokens, estimatedCostUsd: totalEstimatedCostUsd },
                telemetry: {
                  providerUsed: provider,
                  modelUsed: model,
                  attemptCount: overallAttempts,
                  fallbackUsed,
                  fallbackReason,
                  totalLatencyMs
                }
              };

            } catch (error: any) {
              const status = error.status || error.code || 500;
              let errorType = status.toString();
              if (error.name === "AbortError" || error.message?.includes("timeout")) errorType = "provider_timeout";
              if (status === 401 || status === 403 || error.status === "UNAUTHENTICATED" || error.status === "PERMISSION_DENIED") errorType = "authentication_failure";
              if (status === 429 || error.status === "RESOURCE_EXHAUSTED") errorType = "rate_limit";
              if (status === 404 || error.status === "NOT_FOUND") errorType = "not_found";

              const completedAt = new Date();
              const latencyMs = completedAt.getTime() - startedAt.getTime();

              LLMInvocation.create({
                investigationId: options.investigationId || "unknown",
                requestId: `req_${Date.now()}`,
                agentStep: options.agentStep || 0,
                provider,
                projectId,
                credentialId,
                model,
                startedAt,
                completedAt,
                latencyMs,
                inputTokens: 0, outputTokens: 0, totalTokens: 0, estimatedCostUsd: 0,
                pricingVersion: "unknown",
                success: false,
                statusCode: typeof status === 'number' ? status : undefined,
                errorType,
                attempt: overallAttempts,
                fallbackUsed,
                fallbackReason: fallbackReason || error.message,
                routingPolicy: "WATERFALL"
              }).catch(e => logger.error("Telemetry failed:", e));

              const now = Date.now();
              if (errorType === "rate_limit") {
                if (attempt < MAX_429_RETRIES) {
                  const backoff = Math.pow(2, attempt) * 1000;
                  this.unavailableModels.set(model, now + backoff + 500); 
                  logger.warn(`[${provider}/${model}] 429 Rate Limit. Backing off for ${backoff}ms (attempt ${attempt}/${MAX_429_RETRIES})`);
                  await new Promise(r => setTimeout(r, backoff));
                  continue; 
                } else {
                  this.unavailableModels.set(model, now + 60000); 
                  fallbackReason = "PRIMARY_RATE_LIMITED";
                  break; 
                }
              } else if (errorType === "provider_timeout" || (typeof status === 'number' && status >= 500)) {
                if (attempt < 2) {
                  const backoff = Math.pow(2, attempt) * 1000;
                  logger.warn(`[${provider}/${model}] ${status} Error. Backing off for ${backoff}ms`);
                  await new Promise(r => setTimeout(r, backoff));
                  continue;
                } else {
                  this.unavailableModels.set(model, now + 30000);
                  fallbackReason = "PROVIDER_UNAVAILABLE";
                  break;
                }
              } else if (errorType === "not_found") {
                this.unavailableModels.set(model, now + 3600000); 
                fallbackReason = "MODEL_NOT_FOUND";
                break; 
              } else if (errorType === "authentication_failure") {
                if (status === 403) {
                  this.credentialModelComboCooldown.set(`${projectId}:${credentialId}:${model}`, now + 3600000);
                  fallbackReason = "CREDENTIAL_MODEL_FORBIDDEN";
                } else {
                  this.unavailableCredentials.set(`${projectId}:${credentialId}`, now + 3600000);
                  fallbackReason = "CREDENTIAL_UNAVAILABLE";
                }
                break; 
              } else {
                break;
              }
            }
          }
        }
      }
    }
    throw new Error(`All providers and models in chain (${providerChain.join(", ")}) failed.`);
  }
}

export const llmGateway = new LLMGateway();
