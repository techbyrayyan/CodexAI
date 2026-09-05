import { NextRequest, NextResponse } from "next/server";
import { GeminiLiveServerManager } from "@/voice/realtime/server/manager";
import { logger } from "@/lib/logger";

export async function GET() {
  const requestId = `live-init-${Date.now()}`;
  logger.info("Voice Live session verification requested", { requestId });

  if (!GeminiLiveServerManager.isConfigured()) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "CONFIG_ERROR",
          message: "Google Gemini Live voice is not configured. Please set GEMINI_API_KEY.",
        },
      },
      { status: 503 }
    );
  }

  return NextResponse.json(
    {
      success: true,
      provider: "gemini-live",
      model: GeminiLiveServerManager.getModel(),
      audioFormat: {
        input: "audio/pcm;rate=16000",
        output: "audio/pcm;rate=24000",
        encoding: "16-bit little-endian linear PCM",
      },
    },
    { status: 200 }
  );
}

export async function POST(request: NextRequest) {
  if (!GeminiLiveServerManager.isConfigured()) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "CONFIG_ERROR",
          message: "Google Gemini Live voice is not configured.",
        },
      },
      { status: 503 }
    );
  }

  let body: { audioChunk?: string; text?: string; history?: Array<{ role: string; content: string }> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "INVALID_JSON", message: "Malformed JSON" } },
      { status: 400 }
    );
  }

  const { audioChunk, text, history = [] } = body;

  try {
    const audioChunks: Array<{ mimeType: string; data: string }> = [];
    let transcriptText = "";
    let turnCompleteResolve: (() => void) | null = null;
    const turnCompletePromise = new Promise<void>((resolve) => {
      turnCompleteResolve = resolve;
    });

    const session = await GeminiLiveServerManager.createLiveSession({
      onMessage: (msg: {
        serverContent?: {
          modelTurn?: {
            parts?: Array<{
              text?: string;
              inlineData?: { mimeType: string; data: string };
            }>;
          };
          turnComplete?: boolean;
        };
      }) => {
        if (msg.serverContent) {
          const parts = msg.serverContent.modelTurn?.parts || [];
          for (const p of parts) {
            if (p.text) {
              transcriptText += p.text + " ";
            }
            if (p.inlineData) {
              audioChunks.push({
                mimeType: p.inlineData.mimeType,
                data: p.inlineData.data,
              });
            }
          }
          if (msg.serverContent.turnComplete) {
            turnCompleteResolve?.();
          }
        }
      },
      onClose: () => {
        turnCompleteResolve?.();
      },
      onError: (err) => {
        const error = err as { message?: string };
        logger.error("Live session turn error", { error: error?.message || String(err) });
        turnCompleteResolve?.();
      },
    });

    // If audio is provided, send real-time audio chunk
    if (audioChunk) {
      await (session as unknown as { sendRealtimeInput: (p: unknown) => Promise<void> }).sendRealtimeInput({
        media: [
          {
            mimeType: "audio/pcm;rate=16000",
            data: audioChunk,
          },
        ],
      });
    }

    // If user text is provided or finishing turn
    if (text) {
      await session.sendClientContent({
        turns: [
          ...history.map((h) => ({
            role: h.role,
            parts: [{ text: h.content }],
          })),
          {
            role: "user",
            parts: [{ text }],
          },
        ],
        turnComplete: true,
      });
    }

    // Await turn completion from Gemini Live or fallback timeout (8s)
    await Promise.race([
      turnCompletePromise,
      new Promise((r) => setTimeout(r, 8000)),
    ]);

    try {
      await session.close();
    } catch {
      // Safe close
    }

    return NextResponse.json({
      success: true,
      provider: "gemini-live",
      model: GeminiLiveServerManager.getModel(),
      transcript: transcriptText.trim() || "Operational status confirmed. Standing by.",
      audioChunks,
      mimeType: "audio/pcm;rate=24000",
    });
  } catch (err: unknown) {
    const error = err as Error;
    logger.error("Live voice turn failed", { error: error.message });
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "LIVE_TURN_FAILED",
          message: error.message || "Failed to process Live audio turn.",
        },
      },
      { status: 500 }
    );
  }
}
