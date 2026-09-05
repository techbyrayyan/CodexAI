import { describe, it, expect, vi } from "vitest";
import { z } from "zod";
import {
  JarvisAgent,
  JarvisConfigError,
  JarvisAuthError,
  JarvisRateLimitError,
} from "../ai/agents/jarvis";
import {
  GeminiProvider,
  OpenAIProvider,
  AIProviderConfigError,
} from "../ai/providers";
import { JARVIS_SYSTEM_PROMPT } from "../ai/prompts/jarvis-system";
import { ChatApiRequest, ChatApiResponse, ChatApiErrorResponse } from "../ai/types";

describe("JARVIS Phase 2 AI Brain & Provider Integration (Gemini & OpenAI)", () => {
  describe("1. Environment & Configuration", () => {
    it("instantiates JarvisAgent with default providers safely", () => {
      const agent = new JarvisAgent();
      expect(agent).toBeInstanceOf(JarvisAgent);
    });

    it("throws JarvisConfigError when process() is called without configured keys", async () => {
      const mockUnconfiguredProvider = {
        name: "gemini",
        isConfigured: false,
        generate: vi.fn().mockRejectedValue(new AIProviderConfigError("Key missing")),
      };
      const agent = new JarvisAgent(mockUnconfiguredProvider);

      await expect(
        agent.process("Hello Jarvis", {
          sessionId: "test-session",
          activeRole: "orchestrator",
          systemPrompt: "Test",
          memoryEnabled: false,
        })
      ).rejects.toThrow(JarvisConfigError);
    });
  });

  describe("2. Request Validation Schema", () => {
    const chatRequestSchema = z.object({
      message: z
        .string()
        .trim()
        .min(1, "Message cannot be empty")
        .max(4000, "Message length exceeds maximum allowed limit (4000 characters)"),
      conversationHistory: z
        .array(
          z.object({
            role: z.enum(["user", "assistant", "system"]),
            content: z.string().max(4000),
          })
        )
        .max(20)
        .optional(),
    });

    it("accepts valid conversational prompt", () => {
      const validPayload: ChatApiRequest = {
        message: "Hello Jarvis",
        conversationHistory: [
          { role: "user", content: "Hi" },
          { role: "assistant", content: "Greetings, operator." },
        ],
      };
      const result = chatRequestSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it("rejects empty message", () => {
      const invalidPayload = { message: "" };
      const result = chatRequestSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Message cannot be empty");
      }
    });

    it("rejects whitespace-only message", () => {
      const invalidPayload = { message: "     " };
      const result = chatRequestSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Message cannot be empty");
      }
    });

    it("rejects messages exceeding 4000 characters", () => {
      const longMessage = "A".repeat(4001);
      const invalidPayload = { message: longMessage };
      const result = chatRequestSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("maximum allowed limit");
      }
    });
  });

  describe("3. Mocked GeminiProvider Execution", () => {
    it("successfully delegates to GeminiProvider and returns structured AgentResponse", async () => {
      const mockGeminiClient = {
        models: {
          generateContent: vi.fn().mockResolvedValue({
            text: "Greetings, operator. Systems are functioning within nominal parameters.",
            usageMetadata: {
              promptTokenCount: 20,
              candidatesTokenCount: 15,
              totalTokenCount: 35,
            },
          }),
        },
      };

      const provider = new GeminiProvider(mockGeminiClient as unknown as import("@google/genai").GoogleGenAI, "gemini-3.8-flash");
      const agent = new JarvisAgent(provider);

      const result = await agent.process(
        "Status report",
        {
          sessionId: "req-gemini-1",
          activeRole: "orchestrator",
          systemPrompt: JARVIS_SYSTEM_PROMPT,
          memoryEnabled: false,
        },
        [{ role: "user", content: "Hello" }]
      );

      expect(mockGeminiClient.models.generateContent).toHaveBeenCalledTimes(1);
      expect(result.message.role).toBe("assistant");
      expect(result.message.content).toBe(
        "Greetings, operator. Systems are functioning within nominal parameters."
      );
      expect(result.state).toBe("idle");
      expect(result.usage?.totalTokens).toBe(35);
      expect(result.requestId).toBe("req-gemini-1");
    });

    it("translates Gemini authentication errors into JarvisAuthError", async () => {
      const mockGeminiClient = {
        models: {
          generateContent: vi.fn().mockRejectedValue({
            status: 401,
            message: "API_KEY_INVALID: API key not valid.",
          }),
        },
      };

      const provider = new GeminiProvider(mockGeminiClient as unknown as import("@google/genai").GoogleGenAI);
      const agent = new JarvisAgent(provider);

      await expect(
        agent.process("Test prompt", {
          sessionId: "req-gemini-2",
          activeRole: "orchestrator",
          systemPrompt: "Test",
          memoryEnabled: false,
        })
      ).rejects.toThrow(JarvisAuthError);
    });

    it("translates Gemini rate limit / quota errors into JarvisRateLimitError", async () => {
      const mockGeminiClient = {
        models: {
          generateContent: vi.fn().mockRejectedValue({
            status: 429,
            message: "RESOURCE_EXHAUSTED: Quota exceeded",
          }),
        },
      };

      const provider = new GeminiProvider(mockGeminiClient as unknown as import("@google/genai").GoogleGenAI);
      const agent = new JarvisAgent(provider);

      await expect(
        agent.process("Test prompt", {
          sessionId: "req-gemini-3",
          activeRole: "orchestrator",
          systemPrompt: "Test",
          memoryEnabled: false,
        })
      ).rejects.toThrow(JarvisRateLimitError);
    });
  });

  describe("4. Mocked OpenAIProvider Execution (Optional Provider)", () => {
    it("successfully delegates to OpenAIProvider", async () => {
      const mockOpenAIClient = {
        chat: {
          completions: {
            create: vi.fn().mockResolvedValue({
              id: "chatcmpl-test",
              choices: [{ message: { content: "OpenAI response" } }],
              usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
            }),
          },
        },
      };

      const provider = new OpenAIProvider(mockOpenAIClient as unknown as import("openai").default);
      const agent = new JarvisAgent(provider);

      const result = await agent.process("Hello", {
        sessionId: "req-openai-1",
        activeRole: "orchestrator",
        systemPrompt: "Test",
        memoryEnabled: false,
      });

      expect(result.message.content).toBe("OpenAI response");
      expect(result.usage?.totalTokens).toBe(15);
    });
  });

  describe("5. API Response Contract Shapes", () => {
    it("conforms to typed success response contract", () => {
      const successData: ChatApiResponse = {
        success: true,
        message: "Hello, operator. JARVIS at your service.",
        requestId: "req-123",
        agentRole: "orchestrator",
        usage: {
          promptTokens: 10,
          completionTokens: 12,
          totalTokens: 22,
        },
      };

      expect(successData.success).toBe(true);
      expect(typeof successData.message).toBe("string");
      expect(typeof successData.requestId).toBe("string");
      expect(successData.agentRole).toBe("orchestrator");
    });

    it("conforms to typed error response contract", () => {
      const errorData: ChatApiErrorResponse = {
        success: false,
        error: {
          code: "CONFIG_ERROR",
          message: "JARVIS is currently unavailable. Please check the AI configuration.",
        },
        requestId: "req-456",
      };

      expect(errorData.success).toBe(false);
      expect(typeof errorData.error.code).toBe("string");
      expect(typeof errorData.error.message).toBe("string");
      expect(typeof errorData.requestId).toBe("string");
    });
  });

  describe("6. System Prompt & Honesty Boundaries", () => {
    it("includes explicit instructions disclaiming unperformed actions and computer control", () => {
      expect(JARVIS_SYSTEM_PROMPT).toContain("Just A Rather Very Intelligent System");
      expect(JARVIS_SYSTEM_PROMPT).toContain("Do NOT claim you opened, launched, or closed applications");
      expect(JARVIS_SYSTEM_PROMPT).toContain("Do NOT claim you modified, deleted, created, or searched files");
      expect(JARVIS_SYSTEM_PROMPT).toContain("Do NOT claim you executed shell commands");
      expect(JARVIS_SYSTEM_PROMPT).toContain("computer control, local Python automation agents, browser automation");
    });
  });
});
