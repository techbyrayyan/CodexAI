import { GoogleGenAI } from "@google/genai";
import {
  IAIProvider,
  AIProviderGenerateOptions,
  AIProviderConfigError,
  AIProviderAuthError,
  AIProviderRateLimitError,
} from "./types";
import { AgentResponse, JarvisState } from "../types";
import { JARVIS_SYSTEM_PROMPT } from "../prompts/jarvis-system";
import { env } from "@/config/env";
import { logger } from "@/lib/logger";

export class GeminiProvider implements IAIProvider {
  public readonly name = "gemini";
  private client: GoogleGenAI | null = null;
  private readonly model: string;

  constructor(customClient?: GoogleGenAI, model?: string) {
    this.model = model || env.GEMINI_MODEL || "gemini-3.8-flash";
    if (customClient) {
      this.client = customClient;
    } else if (env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim().length > 0) {
      this.client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY.trim() });
    }
  }

  public get isConfigured(): boolean {
    return Boolean(this.client || (env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim().length > 0));
  }

  private getClient(): GoogleGenAI {
    if (this.client) return this.client;
    if (!env.GEMINI_API_KEY || env.GEMINI_API_KEY.trim().length === 0) {
      throw new AIProviderConfigError(
        "Google Gemini API key is not configured. Please set GEMINI_API_KEY in your server environment."
      );
    }
    this.client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY.trim() });
    return this.client;
  }

  async generate(options: AIProviderGenerateOptions): Promise<AgentResponse> {
    const startTime = Date.now();
    const client = this.getClient();
    const systemInstruction = options.systemPrompt || JARVIS_SYSTEM_PROMPT;

    // Convert multi-turn conversation history into Google GenAI format
    const contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

    const recentHistory = (options.history || []).slice(-10);
    for (const msg of recentHistory) {
      if (msg.role === "user") {
        contents.push({
          role: "user",
          parts: [{ text: msg.content }],
        });
      } else if (msg.role === "assistant" || msg.role === "system") {
        contents.push({
          role: "model",
          parts: [{ text: msg.content }],
        });
      }
    }

    // Append current user prompt
    contents.push({
      role: "user",
      parts: [{ text: options.prompt }],
    });

    const candidateModels = [this.model, "gemini-3.6-flash", "gemini-3.5-flash-lite"];
    let lastError: unknown = null;

    for (const currentModel of candidateModels) {
      try {
        logger.info("GeminiProvider generating content", {
          model: currentModel,
          contentsCount: contents.length,
          sessionId: options.sessionId,
        });

        const response = await client.models.generateContent({
          model: currentModel,
          config: {
            systemInstruction,
            temperature: options.temperature ?? 0.7,
          },
          contents,
        });

        const replyText =
          response.text?.trim() || "Operational status confirmed. Standing by.";

        const durationMs = Date.now() - startTime;
        logger.info("GeminiProvider successfully received response", {
          model: currentModel,
          durationMs,
          responseLength: replyText.length,
        });

        const usageMetadata = (response as { usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number; totalTokenCount?: number } }).usageMetadata;

        return {
          message: {
            id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            role: "assistant",
            content: replyText,
            timestamp: Date.now(),
            agentRole: "orchestrator",
          },
          state: "idle" as JarvisState,
          suggestedActions: ["System Status", "Tools Registry", "View Activity"],
          requestId: options.sessionId,
          usage: {
            promptTokens: usageMetadata?.promptTokenCount,
            completionTokens: usageMetadata?.candidatesTokenCount,
            totalTokens: usageMetadata?.totalTokenCount,
          },
        };
      } catch (err: unknown) {
        lastError = err;
        const errObj = err as { status?: number; error?: { code?: number } };
        const status = errObj.status || errObj.error?.code;
        if (status === 503 || status === 429) {
          logger.warn(`Gemini model ${currentModel} returned status ${status}, falling back...`);
          continue;
        }
        break;
      }
    }

    const error = lastError;
    const durationMs = Date.now() - startTime;
    const err = error as { status?: number; message?: string; error?: { code?: number; message?: string } };
    const statusCode = err.status || err.error?.code;
    const message = err.message || err.error?.message || String(error);

    logger.error("GeminiProvider execution failed", {
      durationMs,
      statusCode,
      errorMessage: message,
    });

    if (statusCode === 401 || statusCode === 403 || /API_KEY_INVALID|invalid api key|PERMISSION_DENIED/i.test(message)) {
      throw new AIProviderAuthError(
        "Google Gemini authentication failed. Please verify that GEMINI_API_KEY is active and valid."
      );
    }

    if (statusCode === 429 || /RESOURCE_EXHAUSTED|rate limit|quota/i.test(message)) {
      throw new AIProviderRateLimitError(
        "Google Gemini rate limit or quota reached. Please try again shortly."
      );
    }

    if (statusCode === 503 || /UNAVAILABLE|high demand/i.test(message)) {
      throw new AIProviderRateLimitError(
        "Google Gemini service is temporarily experiencing high demand. Please try again shortly."
      );
    }

    throw new Error(`Google Gemini request failed: ${message}`);
  }
}
