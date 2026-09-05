import { describe, it, expect } from "vitest";
import { SystemStatusService } from "../services/system-status.js";
import { ToolDispatcher, toolRegistry } from "../tools/registry.js";
import { PermissionManager } from "../tools/permissions.js";
import { sanitizeContext } from "../lib/logger.js";
import { JarvisCoreAgent } from "../ai/agents/base.js";

describe("JARVIS Phase 1 Architecture & Foundation (JavaScript)", () => {
  describe("SystemStatusService", () => {
    it("reports accurate truthful status for all Phase 1 subsystems", () => {
      const health = SystemStatusService.getSystemHealth();
      expect(health.overall).toBe("OPERATIONAL");

      const core = health.subsystems.find((s) => s.id === "jarvis_core");
      expect(core).toBeDefined();
      expect(core?.code).toBe("READY");
      expect(core?.label).toBe("Foundation Ready");

      const ai = health.subsystems.find((s) => s.id === "ai_engine");
      expect(ai?.code).toBe("NOT_CONNECTED");

      const voice = health.subsystems.find((s) => s.id === "voice_engine");
      expect(voice?.code).toBe("NOT_CONNECTED");

      const localAgent = health.subsystems.find((s) => s.id === "local_agent");
      expect(localAgent?.code).toBe("NOT_CONNECTED");

      const browserAgent = health.subsystems.find((s) => s.id === "browser_agent");
      expect(browserAgent?.code).toBe("COMING_SOON");
    });
  });

  describe("Security & Tool Permission Registry", () => {
    it("registers planned tools with explicit phase targets", () => {
      const tools = ToolDispatcher.getRegisteredTools();
      expect(tools.length).toBeGreaterThanOrEqual(6);

      const searchTool = toolRegistry["search_web"];
      expect(searchTool.permissionLevel).toBe("read");
      expect(searchTool.isImplemented).toBe(false);
      expect(searchTool.phaseTarget).toBe("Phase 3");

      const terminalTool = toolRegistry["terminal_execute"];
      expect(terminalTool.permissionLevel).toBe("sensitive");
      expect(terminalTool.requiresHumanApproval).toBe(true);
    });

    it("blocks unapproved execution of sensitive tools", () => {
      const terminalTool = toolRegistry["terminal_execute"];
      const evaluation = PermissionManager.evaluate(terminalTool, {
        toolName: "terminal_execute",
        parameters: { command: "dir" },
        callerId: "test-user",
        approvedByHuman: false,
      });

      expect(evaluation.allowed).toBe(false);
    });
  });

  describe("Logger Sanitization", () => {
    it("redacts sensitive fields like passwords, secrets, tokens, and api keys", () => {
      const rawContext = {
        userId: "usr-123",
        apiKey: "sk-proj-super-secret-key",
        password: "mySecretPassword123!",
        authToken: "bearer eyJhbGciOi...",
        sessionData: {
          clientSecret: "shhh",
          publicInfo: "visible",
        },
      };

      const sanitized = sanitizeContext(rawContext);
      expect(sanitized.userId).toBe("usr-123");
      expect(sanitized.apiKey).toBe("[REDACTED]");
      expect(sanitized.password).toBe("[REDACTED]");
      expect(sanitized.authToken).toBe("[REDACTED]");

      const nested = sanitized.sessionData;
      expect(nested.clientSecret).toBe("[REDACTED]");
      expect(nested.publicInfo).toBe("visible");
    });
  });

  describe("JarvisCoreAgent Scaffold", () => {
    it("handles input and returns structured Phase 1 response", async () => {
      const agent = new JarvisCoreAgent();
      const response = await agent.process("System diagnostic check", {
        sessionId: "test-sess",
        activeRole: "orchestrator",
        systemPrompt: "Test Prompt",
        memoryEnabled: false,
      });

      expect(response.message.role).toBe("assistant");
      expect(response.message.content).toContain("[PHASE 1 FOUNDATION]");
      expect(response.suggestedActions).toContain("System Status");
    });
  });
});
