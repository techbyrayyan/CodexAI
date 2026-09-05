import { NextRequest, NextResponse } from "next/server";
import { JarvisCoreAgent } from "@/ai/agents/base";
import { formatErrorResponse } from "@/lib/errors";
import { logger } from "@/lib/logger";

const agent = new JarvisCoreAgent();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { success: false, error: "Prompt message is required" },
        { status: 400 }
      );
    }

    logger.info("API Chat request received", { messagePreview: message.slice(0, 30) });

    const response = await agent.process(message, {
      sessionId: `sess-${Date.now()}`,
      activeRole: "orchestrator",
      systemPrompt: "JARVIS Core Orchestrator",
      memoryEnabled: false,
    });

    return NextResponse.json({
      success: true,
      data: response,
      note: "Phase 1: Real OpenAI API connection is deferred to Phase 2.",
    });
  } catch (error) {
    logger.error("API Chat request error", { error: String(error) });
    return NextResponse.json(formatErrorResponse(error), { status: 500 });
  }
}
