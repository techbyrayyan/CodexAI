export class JarvisError extends Error {
  constructor(message, code = "INTERNAL_ERROR", statusCode = 500, details = undefined) {
    super(message);
    this.name = "JarvisError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class ValidationError extends JarvisError {
  constructor(message, details) {
    super(message, "VALIDATION_ERROR", 400, details);
  }
}

export class ToolExecutionError extends JarvisError {
  constructor(toolName, message, details) {
    super(`Tool execution failed for '${toolName}': ${message}`, "TOOL_EXECUTION_ERROR", 500, details);
  }
}

export class LocalAgentUnavailableError extends JarvisError {
  constructor(message = "Local automation agent is offline or unreachable") {
    super(message, "LOCAL_AGENT_DISCONNECTED", 503);
  }
}

export class FeatureNotImplementedError extends JarvisError {
  constructor(featureName) {
    super(`${featureName} is deferred to future development phases`, "NOT_IMPLEMENTED", 501);
  }
}

export function formatErrorResponse(error) {
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
