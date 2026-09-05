type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

const SENSITIVE_PATTERNS = [
  /password/i,
  /secret/i,
  /token/i,
  /key/i,
  /auth/i,
  /bearer/i,
  /credential/i,
  /cookie/i,
];

function sanitizeValue(key: string, value: unknown): unknown {
  if (value === null || value === undefined) return value;

  const isSensitiveKey = SENSITIVE_PATTERNS.some((pattern) => pattern.test(key));
  if (isSensitiveKey) {
    return "[REDACTED]";
  }

  if (typeof value === "object") {
    if (Array.isArray(value)) {
      return value.map((item, idx) => sanitizeValue(String(idx), item));
    }
    const sanitizedObj: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      sanitizedObj[k] = sanitizeValue(k, v);
    }
    return sanitizedObj;
  }

  return value;
}

export function sanitizeContext(context: LogContext): LogContext {
  const clean: LogContext = {};
  for (const [k, v] of Object.entries(context)) {
    clean[k] = sanitizeValue(k, v);
  }
  return clean;
}

class Logger {
  private isProd = process.env.NODE_ENV === "production";

  private formatMessage(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    const cleanContext = context ? sanitizeContext(context) : undefined;

    if (this.isProd) {
      return JSON.stringify({
        timestamp,
        level: level.toUpperCase(),
        system: "JARVIS-CORE",
        message,
        ...(cleanContext ? { context: cleanContext } : {}),
      });
    }

    const contextStr = cleanContext ? ` | ${JSON.stringify(cleanContext)}` : "";
    return `[${timestamp}] [${level.toUpperCase()}] [JARVIS] ${message}${contextStr}`;
  }

  debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV === "development") {
      console.debug(this.formatMessage("debug", message, context));
    }
  }

  info(message: string, context?: LogContext) {
    console.info(this.formatMessage("info", message, context));
  }

  warn(message: string, context?: LogContext) {
    console.warn(this.formatMessage("warn", message, context));
  }

  error(message: string, context?: LogContext) {
    console.error(this.formatMessage("error", message, context));
  }
}

export const logger = new Logger();
