import { ToolDefinition, ToolExecutionInput, ToolPermissionLevel } from "./types";
import { logger } from "@/lib/logger";

export interface PermissionCheckResult {
  allowed: boolean;
  requiresConfirmation: boolean;
  reason?: string;
}

export class PermissionManager {
  /**
   * Evaluates if a tool invocation can proceed based on permission level and human approval.
   */
  static evaluate(tool: ToolDefinition, input: ToolExecutionInput): PermissionCheckResult {
    // Phase 1 check: If tool is not implemented, fail with explicit architecture message
    if (!tool.isImplemented) {
      return {
        allowed: false,
        requiresConfirmation: false,
        reason: `Tool '${tool.name}' is scheduled for ${tool.phaseTarget} and not implemented in Phase 1.`,
      };
    }

    // Sensitive or Admin tools ALWAYS require explicit human approval
    if (tool.permissionLevel === "sensitive" || tool.permissionLevel === "admin" || tool.requiresHumanApproval) {
      if (!input.approvedByHuman) {
        logger.warn("Tool execution blocked pending human approval", {
          toolName: tool.name,
          permissionLevel: tool.permissionLevel,
        });

        return {
          allowed: false,
          requiresConfirmation: true,
          reason: `Execution of sensitive tool '${tool.name}' requires explicit operator authorization.`,
        };
      }
    }

    return {
      allowed: true,
      requiresConfirmation: false,
    };
  }

  static getBadgeVariant(level: ToolPermissionLevel): "default" | "secondary" | "destructive" | "outline" {
    switch (level) {
      case "read":
        return "secondary";
      case "write":
        return "default";
      case "sensitive":
      case "admin":
        return "destructive";
      default:
        return "outline";
    }
  }
}
