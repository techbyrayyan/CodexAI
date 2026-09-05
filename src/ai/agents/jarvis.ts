import OpenAI from "openai";
import { BaseAgent } from "./base";
import { AgentContext, AgentResponse, ChatApiMessage, JarvisState } from "../types";
import { JARVIS_SYSTEM_PROMPT } from "../prompts/jarvis-system";
import { env } from "@/config/env";
import { logger } from "@/lib/logger";

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
  private client: OpenAI | null = null;
  private readonly model: string;

  constructor(customClient?: OpenAI, model?: string) {
    super(
      "orchestrator",
      "JARVIS AI Brain",
      "Core cognitive reasoning and conversational agent powered by OpenAI"
    );

    this.model = model || env.OPENAI_MODEL || "gpt-4o-mini";

    if (customClient) {
      this.client = customClient;
    } else if (env.OPENAI_API_KEY && env.OPENAI_API_KEY.trim().length > 0) {
      this.client = new OpenAI({
        apiKey: env.OPENAI_API_KEY,
      });
    }
  }

  /**
   * Indicates whether a valid OpenAI API key is configured.
   */
  public isConfigured(): boolean {
    return Boolean(this.client || (env.OPENAI_API_KEY && env.OPENAI_API_KEY.trim().length > 0));
  }

  /**
   * Returns or lazily initializes the OpenAI client.
   */
  private getClient(): OpenAI {
    if (this.client) {
      return this.client;
    }

    if (!env.OPENAI_API_KEY || env.OPENAI_API_KEY.trim().length === 0) {
      throw new JarvisConfigError(
        "OpenAI API key is not configured. Please set OPENAI_API_KEY in your server environment."
      );
    }

    this.client = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });

    return this.client;
  }

  /**
   * Process a conversational turn with the real OpenAI Brain.
   */
  async process(
    input: string,
    context: AgentContext,
    history: ChatApiMessage[] = []
  ): Promise<AgentResponse> {
    const startTime = Date.now();
    logger.info("JarvisAgent processing conversational turn", {
      role: this.role,
      model: this.model,
      inputLength: input.length,
      historyTurns: history.length,
      sessionId: context.sessionId,
    });

    const client = this.getClient();

    // Prepare message sequence
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: context.systemPrompt || JARVIS_SYSTEM_PROMPT,
      },
    ];

    // Append prior conversational context (limited to recent turns for safety)
    const recentHistory = history.slice(-10);
    for (const msg of recentHistory) {
      if (msg.role === "user" || msg.role === "assistant" || msg.role === "system") {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }

    // Append the current user prompt
    messages.push({
      role: "user",
      content: input,
    });

    try {
      const completion = await client.chat.completions.create({
        model: this.model,
        messages,
        temperature: 0.7,
        max_tokens: 1500,
      });

      const choice = completion.choices[0];
      const assistantText = choice?.message?.content?.trim() || "Operational status confirmed. Standing by.";

      const durationMs = Date.now() - startTime;
      logger.info("JarvisAgent successfully generated response", {
        model: completion.model,
        durationMs,
        totalTokens: completion.usage?.total_tokens,
      });

      return {
        message: {
          id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          role: "assistant",
          content: assistantText,
          timestamp: Date.now(),
          agentRole: this.role,
        },
        state: "idle" as JarvisState,
        suggestedActions: ["System Status", "Tools Registry", "View Activity"],
        requestId: context.sessionId,
        usage: {
          promptTokens: completion.usage?.prompt_tokens,
          completionTokens: completion.usage?.completion_tokens,
          totalTokens: completion.usage?.total_tokens,
        },
      };
    } catch (error: unknown) {
      const durationMs = Date.now() - startTime;
      logger.error("JarvisAgent OpenAI completion failed", {
        durationMs,
        errorType: error instanceof Error ? error.constructor.name : typeof error,
      });

      if (error instanceof OpenAI.AuthenticationError) {
        throw new JarvisAuthError(
          "OpenAI authentication failed. Please check that your OPENAI_API_KEY is valid and active."
        );
      }

      if (error instanceof OpenAI.RateLimitError) {
        throw new JarvisRateLimitError(
          "OpenAI rate limit or quota exceeded. Please try again shortly."
        );
      }

      if (error instanceof OpenAI.APIConnectionError) {
        throw new Error(
          "Network connectivity error while reaching OpenAI. Please check your connection."
        );
      }

      if (error instanceof OpenAI.APIError) {
        throw new Error(
          `OpenAI service responded with an error (${error.status || "API_ERROR"}): ${error.message}`
        );
      }

      if (error instanceof Error) {
        throw error;
      }

      throw new Error("An unexpected error occurred while communicating with the AI service.");
    }
  }
}

// Export singleton instance for server-side route usage
export const jarvisAgent = new JarvisAgent();
