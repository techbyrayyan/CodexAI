import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { jarvisAgent, JarvisConfigError, JarvisAuthError, JarvisRateLimitError } from "@/ai";
import { ChatApiResponse, ChatApiErrorResponse } from "@/ai/types";
import { JARVIS_SYSTEM_PROMPT } from "@/ai/prompts/jarvis-system";
import { logger } from "@/lib/logger";

// Request validation schema
const chatRequestSchema = z.object({
  message: z
    .string({ message: "Message is required and must be a string" })
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
    .max(20, "Conversation history cannot exceed 20 turns")
    .optional(),
});

// Simple in-memory rate-limiting for abuse protection
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const limit = 30; // Max 30 requests per minute

  const current = rateLimitMap.get(ip);
  if (!current || now > current.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (current.count >= limit) {
    return false;
  }

  current.count += 1;
  return true;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  // Safe client IP extraction for abuse protection
  const forwardedFor = request.headers.get("x-forwarded-for");
  const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

  if (!checkRateLimit(clientIp)) {
    logger.warn("Chat API rate limit exceeded", { requestId, clientIp });
    const errorResponse: ChatApiErrorResponse = {
      success: false,
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many requests. Please wait a moment before sending another message.",
      },
      requestId,
    };
    return NextResponse.json(errorResponse, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    logger.warn("Chat API received invalid JSON body", { requestId });
    const errorResponse: ChatApiErrorResponse = {
      success: false,
      error: {
        code: "INVALID_JSON",
        message: "Malformed request payload. JSON format required.",
      },
      requestId,
    };
    return NextResponse.json(errorResponse, { status: 400 });
  }

  // Validate payload against schema
  const parseResult = chatRequestSchema.safeParse(body);
  if (!parseResult.success) {
    const firstIssue = parseResult.error.issues[0];
    const validationMessage = firstIssue?.message || "Invalid request payload";
    logger.warn("Chat API validation failed", {
      requestId,
      validationError: validationMessage,
    });

    const errorResponse: ChatApiErrorResponse = {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: validationMessage,
      },
      requestId,
    };
    return NextResponse.json(errorResponse, { status: 400 });
  }

  const { message, conversationHistory = [] } = parseResult.data;

  logger.info("Chat API request validated", {
    requestId,
    messageLength: message.length,
    historyTurns: conversationHistory.length,
  });

  try {
    const response = await jarvisAgent.process(
      message,
      {
        sessionId: requestId,
        activeRole: "orchestrator",
        systemPrompt: JARVIS_SYSTEM_PROMPT,
        memoryEnabled: false,
      },
      conversationHistory
    );

    const durationMs = Date.now() - startTime;
    logger.info("Chat API request completed successfully", {
      requestId,
      durationMs,
      agentRole: response.message.agentRole,
    });

    const successResponse: ChatApiResponse = {
      success: true,
      message: response.message.content,
      requestId,
      agentRole: response.message.agentRole || "orchestrator",
      usage: response.usage,
    };

    return NextResponse.json(successResponse, { status: 200 });
  } catch (error: unknown) {
    const durationMs = Date.now() - startTime;
    logger.error("Chat API error processing request", {
      requestId,
      durationMs,
      errorType: error instanceof Error ? error.constructor.name : typeof error,
    });

    if (error instanceof JarvisConfigError) {
      const errorResponse: ChatApiErrorResponse = {
        success: false,
        error: {
          code: "CONFIG_ERROR",
          message: error.message || "JARVIS is currently unavailable. Please check the AI configuration (GEMINI_API_KEY).",
        },
        requestId,
      };
      return NextResponse.json(errorResponse, { status: 503 });
    }

    if (error instanceof JarvisAuthError) {
      const errorResponse: ChatApiErrorResponse = {
        success: false,
        error: {
          code: "AUTH_ERROR",
          message: "JARVIS authentication failed. Please verify the AI configuration.",
        },
        requestId,
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    if (error instanceof JarvisRateLimitError) {
      const errorResponse: ChatApiErrorResponse = {
        success: false,
        error: {
          code: "UPSTREAM_RATE_LIMIT",
          message: "AI service rate limit reached. Please try again shortly.",
        },
        requestId,
      };
      return NextResponse.json(errorResponse, { status: 429 });
    }

    // Generic safe fallback without exposing internal stack trace or secrets
    const errorResponse: ChatApiErrorResponse = {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "JARVIS could not complete that request. Please try again.",
      },
      requestId,
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
