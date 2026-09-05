import { ToolDefinition, ToolExecutionInput, ToolExecutionResult } from "./types";
import { PermissionManager } from "./permissions";
import { logger } from "@/lib/logger";

export const toolRegistry: Record<string, ToolDefinition> = {
  ask_jarvis: {
    name: "ask_jarvis",
    displayName: "Ask JARVIS",
    description: "Submit a natural language question or cognitive query to JARVIS Core.",
    category: "system",
    permissionLevel: "read",
    requiresHumanApproval: false,
    isImplemented: false,
    phaseTarget: "Phase 2",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "The query text to process" },
        contextScope: { type: "string", description: "Optional context domain filter" },
      },
      required: ["query"],
    },
  },
  search_web: {
    name: "search_web",
    displayName: "Search Web",
    description: "Perform web searches and extract real-time knowledge and references.",
    category: "research",
    permissionLevel: "read",
    requiresHumanApproval: false,
    isImplemented: false,
    phaseTarget: "Phase 3",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query" },
        maxResults: { type: "number", description: "Maximum search results to return" },
      },
      required: ["query"],
    },
  },
  analyze_code: {
    name: "analyze_code",
    displayName: "Analyze Code",
    description: "Inspect, lint, and explain codebases or specific source files.",
    category: "coding",
    permissionLevel: "read",
    requiresHumanApproval: false,
    isImplemented: false,
    phaseTarget: "Phase 3",
    parameters: {
      type: "object",
      properties: {
        filePath: { type: "string", description: "Relative or absolute path to target file" },
        instruction: { type: "string", description: "Analysis focus (e.g. security, performance)" },
      },
      required: ["filePath"],
    },
  },
  open_project: {
    name: "open_project",
    displayName: "Open Project",
    description: "Open and switch workspace context to a specified project directory.",
    category: "workspace",
    permissionLevel: "write",
    requiresHumanApproval: false,
    isImplemented: false,
    phaseTarget: "Phase 4",
    parameters: {
      type: "object",
      properties: {
        projectPath: { type: "string", description: "Target workspace path" },
      },
      required: ["projectPath"],
    },
  },
  system_status: {
    name: "system_status",
    displayName: "System Status",
    description: "Query operational telemetry, service health, and resource metrics.",
    category: "system",
    permissionLevel: "read",
    requiresHumanApproval: false,
    isImplemented: true, // Handled in Phase 1 via local service status
    phaseTarget: "Phase 1",
    parameters: {
      type: "object",
      properties: {
        subsystem: {
          type: "string",
          description: "Target subsystem to inspect",
          enum: ["all", "core", "ai", "voice", "local_agent"],
        },
      },
    },
  },
  create_task: {
    name: "create_task",
    displayName: "Create Task",
    description: "Enqueue an autonomous multi-step execution item into the task scheduler.",
    category: "system",
    permissionLevel: "write",
    requiresHumanApproval: false,
    isImplemented: false,
    phaseTarget: "Phase 3",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string", description: "Task summary title" },
        priority: { type: "string", enum: ["low", "normal", "high"], description: "Urgency level" },
      },
      required: ["title"],
    },
  },
  terminal_execute: {
    name: "terminal_execute",
    displayName: "Terminal Execution",
    description: "Execute a shell command via the local Windows automation agent.",
    category: "automation",
    permissionLevel: "sensitive",
    requiresHumanApproval: true,
    isImplemented: false,
    phaseTarget: "Phase 4",
    parameters: {
      type: "object",
      properties: {
        command: { type: "string", description: "Shell command string to execute" },
        workingDirectory: { type: "string", description: "Execution folder path" },
      },
      required: ["command"],
    },
  },
  browser_control: {
    name: "browser_control",
    displayName: "Browser Control",
    description: "Drive headless or visible browser instances to perform web tasks.",
    category: "automation",
    permissionLevel: "sensitive",
    requiresHumanApproval: true,
    isImplemented: false,
    phaseTarget: "Phase 4",
    parameters: {
      type: "object",
      properties: {
        action: { type: "string", enum: ["navigate", "click", "extract", "screenshot"], description: "Browser action" },
        url: { type: "string", description: "Target URL" },
      },
      required: ["action"],
    },
  },
};

export class ToolDispatcher {
  static getRegisteredTools(): ToolDefinition[] {
    return Object.values(toolRegistry);
  }

  static getTool(name: string): ToolDefinition | undefined {
    return toolRegistry[name];
  }

  static async dispatch(input: ToolExecutionInput): Promise<ToolExecutionResult> {
    const startTime = performance.now();
    const tool = this.getTool(input.toolName);

    if (!tool) {
      return {
        executionId: `exec-${Date.now()}`,
        toolName: input.toolName,
        isSuccess: false,
        error: `Tool '${input.toolName}' is not registered in JARVIS capability catalog.`,
        durationMs: 0,
        permissionLevel: "read",
        timestamp: Date.now(),
      };
    }

    const check = PermissionManager.evaluate(tool, input);
    if (!check.allowed) {
      return {
        executionId: `exec-${Date.now()}`,
        toolName: tool.name,
        isSuccess: false,
        error: check.reason || "Execution denied by security policy.",
        durationMs: Math.round(performance.now() - startTime),
        permissionLevel: tool.permissionLevel,
        timestamp: Date.now(),
      };
    }

    logger.info("Executing tool", { toolName: tool.name, callerId: input.callerId });

    // In Phase 1, only system_status is active
    if (tool.name === "system_status") {
      return {
        executionId: `exec-${Date.now()}`,
        toolName: tool.name,
        isSuccess: true,
        output: {
          core: "Foundation Ready",
          aiEngine: "Not Connected",
          voiceEngine: "Not Connected",
          localAgent: "Not Connected",
        },
        durationMs: Math.round(performance.now() - startTime),
        permissionLevel: tool.permissionLevel,
        timestamp: Date.now(),
      };
    }

    return {
      executionId: `exec-${Date.now()}`,
      toolName: tool.name,
      isSuccess: false,
      error: `Tool '${tool.name}' is scheduled for ${tool.phaseTarget}.`,
      durationMs: Math.round(performance.now() - startTime),
      permissionLevel: tool.permissionLevel,
      timestamp: Date.now(),
    };
  }
}
