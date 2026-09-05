import { ChatApiMessage, AgentResponse } from "../types";

export interface AIProviderGenerateOptions {
  prompt: string;
  systemPrompt?: string;
  history?: ChatApiMessage[];
  sessionId?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface IAIProvider {
  readonly name: string;
  readonly isConfigured: boolean;
  generate(options: AIProviderGenerateOptions): Promise<AgentResponse>;
}

export class AIProviderConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AIProviderConfigError";
  }
}

export class AIProviderAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AIProviderAuthError";
  }
}

export class AIProviderRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AIProviderRateLimitError";
  }
}
