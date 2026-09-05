import { BaseAgent } from "./base";
import { AgentContext, AgentResponse, ChatApiMessage } from "../types";
import { JARVIS_SYSTEM_PROMPT } from "../prompts/jarvis-system";
import {
  IAIProvider,
  GeminiProvider,
  OpenAIProvider,
  AIProviderConfigError,
  AIProviderAuthError,
  AIProviderRateLimitError,
} from "../providers";
import { env } from "@/config/env";
import { logger } from "@/lib/logger";

// Re-export error classes for backwards compatibility
export class JarvisConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "JarvisConfigError";
  }
}

export class JarvisAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "JarvisAuthError";
  }
}

export class JarvisRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "JarvisRateLimitError";
  }
}

export class JarvisAgent extends BaseAgent {
  private provider: IAIProvider;

  constructor(customProvider?: IAIProvider) {
    super(
      "orchestrator",
      "JARVIS AI Brain",
      "Core cognitive reasoning and conversational agent powered by AI Providers"
    );

    if (customProvider) {
      this.provider = customProvider;
    } else {
      // Primary: Google Gemini
      // Optional/Fallback: OpenAI
      if (env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim().length > 0) {
        this.provider = new GeminiProvider();
      } else if (env.OPENAI_API_KEY && env.OPENAI_API_KEY.trim().length > 0) {
        this.provider = new OpenAIProvider();
      } else {
        // Default to GeminiProvider so config error points to primary provider
        this.provider = new GeminiProvider();
      }
    }
  }

  public get providerName(): string {
    return this.provider.name;
  }

  public isConfigured(): boolean {
    return this.provider.isConfigured;
  }

  async process(
    input: string,
    context: AgentContext,
    history: ChatApiMessage[] = []
  ): Promise<AgentResponse> {
    logger.info("JarvisAgent delegating conversational turn to provider", {
      provider: this.provider.name,
      inputLength: input.length,
      historyTurns: history.length,
      sessionId: context.sessionId,
    });

    try {
      return await this.provider.generate({
        prompt: input,
        systemPrompt: context.systemPrompt || JARVIS_SYSTEM_PROMPT,
        history,
        sessionId: context.sessionId,
      });
    } catch (error: unknown) {
      if (error instanceof AIProviderConfigError) {
        throw new JarvisConfigError(error.message);
      }
      if (error instanceof AIProviderAuthError) {
        throw new JarvisAuthError(error.message);
      }
      if (error instanceof AIProviderRateLimitError) {
        throw new JarvisRateLimitError(error.message);
      }
      if (error instanceof JarvisConfigError || error instanceof JarvisAuthError || error instanceof JarvisRateLimitError) {
        throw error;
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("An unexpected error occurred during AI processing.");
    }
  }
}

// Export singleton instance for server-side route usage
export const jarvisAgent = new JarvisAgent();
