export type ErrorCode =
  | "INTERNAL_ERROR"
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "TOOL_EXECUTION_ERROR"
  | "LOCAL_AGENT_DISCONNECTED"
  | "NOT_IMPLEMENTED";

export class JarvisError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(message: string, code: ErrorCode = "INTERNAL_ERROR", statusCode = 500, details?: unknown) {
    super(message);
    this.name = "JarvisError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends JarvisError {
  constructor(message: string, details?: unknown) {
    super(message, "VALIDATION_ERROR", 400, details);
  }
}

export class ToolExecutionError extends JarvisError {
  constructor(toolName: string, message: string, details?: unknown) {
    super(`Tool execution failed for '${toolName}': ${message}`, "TOOL_EXECUTION_ERROR", 500, details);
  }
}

export class LocalAgentUnavailableError extends JarvisError {
  constructor(message = "Local automation agent is offline or unreachable") {
    super(message, "LOCAL_AGENT_DISCONNECTED", 503);
  }
}

export class FeatureNotImplementedError extends JarvisError {
  constructor(featureName: string) {
    super(`${featureName} is deferred to future development phases`, "NOT_IMPLEMENTED", 501);
  }
}

export function formatErrorResponse(error: unknown) {
  if (error instanceof JarvisError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    };
  }

  const message = error instanceof Error ? error.message : "An unexpected internal error occurred";
  return {
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message,
    },
  };
}
