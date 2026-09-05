import OpenAI from "openai";
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

export class OpenAIProvider implements IAIProvider {
  public readonly name = "openai";
  private client: OpenAI | null = null;
  private readonly model: string;

  constructor(customClient?: OpenAI, model?: string) {
    this.model = model || env.OPENAI_MODEL || "gpt-4o-mini";
    if (customClient) {
      this.client = customClient;
    } else if (env.OPENAI_API_KEY && env.OPENAI_API_KEY.trim().length > 0) {
      this.client = new OpenAI({ apiKey: env.OPENAI_API_KEY.trim() });
    }
  }

  public get isConfigured(): boolean {
    return Boolean(this.client || (env.OPENAI_API_KEY && env.OPENAI_API_KEY.trim().length > 0));
  }

  private getClient(): OpenAI {
    if (this.client) return this.client;
    if (!env.OPENAI_API_KEY || env.OPENAI_API_KEY.trim().length === 0) {
      throw new AIProviderConfigError(
        "OpenAI API key is not configured. Please set OPENAI_API_KEY in your server environment."
      );
    }
    this.client = new OpenAI({ apiKey: env.OPENAI_API_KEY.trim() });
    return this.client;
  }

  async generate(options: AIProviderGenerateOptions): Promise<AgentResponse> {
    const startTime = Date.now();
    const client = this.getClient();

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: options.systemPrompt || JARVIS_SYSTEM_PROMPT,
      },
    ];

    const recentHistory = (options.history || []).slice(-10);
    for (const msg of recentHistory) {
      if (msg.role === "user" || msg.role === "assistant" || msg.role === "system") {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }

    messages.push({
      role: "user",
      content: options.prompt,
    });

    try {
      const completion = await client.chat.completions.create({
        model: this.model,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 1500,
      });

      const choice = completion.choices[0];
      const replyText = choice?.message?.content?.trim() || "Operational status confirmed. Standing by.";

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
          promptTokens: completion.usage?.prompt_tokens,
          completionTokens: completion.usage?.completion_tokens,
          totalTokens: completion.usage?.total_tokens,
        },
      };
    } catch (error: unknown) {
      const durationMs = Date.now() - startTime;
      logger.error("OpenAIProvider completion failed", {
        durationMs,
        errorType: error instanceof Error ? error.constructor.name : typeof error,
      });

      if (error instanceof OpenAI.AuthenticationError) {
        throw new AIProviderAuthError(
          "OpenAI authentication failed. Please check that your OPENAI_API_KEY is valid."
        );
      }

      if (error instanceof OpenAI.RateLimitError) {
        throw new AIProviderRateLimitError(
          "OpenAI rate limit or quota exceeded. Please try again shortly."
        );
      }

      throw error;
    }
  }
}
