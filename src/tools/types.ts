export type ToolPermissionLevel = "read" | "write" | "sensitive" | "admin";

export type ToolCategory =
  | "system"
  | "research"
  | "coding"
  | "automation"
  | "communication"
  | "workspace";

export interface ToolParameter {
  type: "string" | "number" | "boolean" | "object" | "array";
  description: string;
  required?: boolean;
  enum?: string[];
  default?: unknown;
}

export interface ToolSchema {
  type: "object";
  properties: Record<string, ToolParameter>;
  required?: string[];
}

export interface ToolDefinition {
  name: string;
  displayName: string;
  description: string;
  category: ToolCategory;
  permissionLevel: ToolPermissionLevel;
  requiresHumanApproval: boolean;
  parameters: ToolSchema;
  isImplemented: boolean; // Explicit indicator for Phase 1
  phaseTarget: "Phase 1" | "Phase 2" | "Phase 3" | "Phase 4";
}

export interface ToolExecutionInput {
  toolName: string;
  parameters: Record<string, unknown>;
  callerId: string;
  approvedByHuman?: boolean;
}

export interface ToolExecutionResult {
  executionId: string;
  toolName: string;
  isSuccess: boolean;
  output?: unknown;
  error?: string;
  durationMs: number;
  permissionLevel: ToolPermissionLevel;
  timestamp: number;
}
