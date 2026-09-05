import { describe, it, expect, vi, beforeEach } from "vitest";
import OpenAI from "openai";
import { z } from "zod";
import {
  JarvisAgent,
  JarvisConfigError,
  JarvisAuthError,
  JarvisRateLimitError,
} from "../ai/agents/jarvis";
import { JARVIS_SYSTEM_PROMPT } from "../ai/prompts/jarvis-system";
import { ChatApiRequest, ChatApiResponse, ChatApiErrorResponse } from "../ai/types";

describe("JARVIS Phase 2 AI Brain & OpenAI Agent Integration", () => {
  describe("1. Environment & Configuration", () => {
    it("handles unconfigured OPENAI_API_KEY safely without crashing", () => {
      // Create agent instance without client or key
      const unconfiguredAgent = new JarvisAgent(undefined, "gpt-4o-mini");
      expect(unconfiguredAgent).toBeInstanceOf(JarvisAgent);
    });

    it("throws JarvisConfigError when process() is invoked without API key", async () => {
      // Create fresh agent with no client and ensure key is absent
      const unconfiguredAgent = new JarvisAgent(undefined, "gpt-4o-mini");
      // Force client to be null
      (unconfiguredAgent as unknown as { client: null }).client = null;

      await expect(
        unconfiguredAgent.process("Hello Jarvis", {
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

  describe("3. Mocked OpenAI Agent Execution", () => {
    let mockOpenAI: OpenAI;

    beforeEach(() => {
      mockOpenAI = {
        chat: {
          completions: {
            create: vi.fn(),
          },
        },
      } as unknown as OpenAI;
    });

    it("successfully calls OpenAI and returns structured AgentResponse", async () => {
      const mockCreate = vi.fn().mockResolvedValue({
        id: "chatcmpl-test123",
        model: "gpt-4o-mini",
        choices: [
          {
            message: {
              role: "assistant",
              content: "Greetings, operator. Systems are functioning within nominal parameters.",
            },
            finish_reason: "stop",
          },
        ],
        usage: {
          prompt_tokens: 28,
          completion_tokens: 15,
          total_tokens: 43,
        },
      });

      mockOpenAI.chat.completions.create = mockCreate;

      const agent = new JarvisAgent(mockOpenAI, "gpt-4o-mini");
      const result = await agent.process(
        "Status report",
        {
          sessionId: "req-test-1",
          activeRole: "orchestrator",
          systemPrompt: JARVIS_SYSTEM_PROMPT,
          memoryEnabled: false,
        },
        [{ role: "user", content: "Hello" }]
      );

      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(result.message.role).toBe("assistant");
      expect(result.message.content).toBe(
        "Greetings, operator. Systems are functioning within nominal parameters."
      );
      expect(result.state).toBe("idle");
      expect(result.usage?.totalTokens).toBe(43);
      expect(result.requestId).toBe("req-test-1");
    });

    it("translates OpenAI.AuthenticationError into JarvisAuthError", async () => {
      const authError = new OpenAI.AuthenticationError(
        401,
        { message: "Incorrect API key provided" },
        "Incorrect API key provided",
        new Headers()
      );

      mockOpenAI.chat.completions.create = vi.fn().mockRejectedValue(authError);

      const agent = new JarvisAgent(mockOpenAI);
      await expect(
        agent.process("Test prompt", {
          sessionId: "req-test-2",
          activeRole: "orchestrator",
          systemPrompt: "Test",
          memoryEnabled: false,
        })
      ).rejects.toThrow(JarvisAuthError);
    });

    it("translates OpenAI.RateLimitError into JarvisRateLimitError", async () => {
      const rateLimitError = new OpenAI.RateLimitError(
        429,
        { message: "Rate limit exceeded" },
        "Rate limit exceeded",
        new Headers()
      );

      mockOpenAI.chat.completions.create = vi.fn().mockRejectedValue(rateLimitError);

      const agent = new JarvisAgent(mockOpenAI);
      await expect(
        agent.process("Test prompt", {
          sessionId: "req-test-3",
          activeRole: "orchestrator",
          systemPrompt: "Test",
          memoryEnabled: false,
        })
      ).rejects.toThrow(JarvisRateLimitError);
    });
  });

  describe("4. API Response Contract Shapes", () => {
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

  describe("5. System Prompt & Honesty Boundaries", () => {
    it("includes explicit instructions disclaiming unperformed actions and computer control", () => {
      expect(JARVIS_SYSTEM_PROMPT).toContain("Just A Rather Very Intelligent System");
      expect(JARVIS_SYSTEM_PROMPT).toContain("Do NOT claim you opened, launched, or closed applications");
      expect(JARVIS_SYSTEM_PROMPT).toContain("Do NOT claim you modified, deleted, created, or searched files");
      expect(JARVIS_SYSTEM_PROMPT).toContain("Do NOT claim you executed shell commands");
      expect(JARVIS_SYSTEM_PROMPT).toContain("computer control, local Python automation agents, browser automation");
    });
  });
});
