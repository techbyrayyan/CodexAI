import { logger } from "@/lib/logger";

export class PermissionManager {
  static evaluate(tool, input) {
    if (!tool.isImplemented) {
      return {
        allowed: false,
        requiresConfirmation: false,
        reason: `Tool '${tool.name}' is scheduled for ${tool.phaseTarget} and not implemented in Phase 1.`,
      };
    }

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

  static getBadgeVariant(level) {
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
