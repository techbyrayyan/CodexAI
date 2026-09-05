import { GoogleGenAI, Modality } from "@google/genai";
import { JARVIS_SYSTEM_PROMPT } from "@/ai/prompts/jarvis-system";
import { env } from "@/config/env";
import { logger } from "@/lib/logger";

export interface LiveTokenSessionResponse {
  success: boolean;
  model: string;
  systemPrompt: string;
  error?: string;
}

export class GeminiLiveServerManager {
  public static getModel(): string {
    return env.GEMINI_LIVE_MODEL || "gemini-2.5-flash-native-audio-latest";
  }

  public static isConfigured(): boolean {
    return Boolean(env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim().length > 0);
  }

  public static getClient(): GoogleGenAI {
    if (!this.isConfigured()) {
      throw new Error("GEMINI_API_KEY is not configured in local environment.");
    }
    return new GoogleGenAI({
      apiKey: env.GEMINI_API_KEY!,
      httpOptions: { apiVersion: "v1alpha" },
    });
  }

  /**
   * Connects a stateful server-side Gemini Live session using the official Live API.
   */
  public static async createLiveSession(options: {
    onMessage: (msg: {
      serverContent?: {
        modelTurn?: {
          parts?: Array<{
            text?: string;
            inlineData?: { mimeType: string; data: string };
          }>;
        };
      };
    }) => void;
    onClose: (e: { code?: number; reason?: string }) => void;
    onError: (e: unknown) => void;
  }) {
    const ai = this.getClient();
    const model = this.getModel();

    const session = await ai.live.connect({
      model,
      callbacks: {
        onopen: () => {
          logger.info("Gemini Live server connection opened successfully", { model });
        },
        onmessage: (msg: unknown) => {
          options.onMessage(
            msg as {
              serverContent?: {
                modelTurn?: {
                  parts?: Array<{
                    text?: string;
                    inlineData?: { mimeType: string; data: string };
                  }>;
                };
              };
            }
          );
        },
        onclose: (e: unknown) => {
          const closeEvt = e as { code?: number; reason?: string };
          logger.info("Gemini Live server connection closed", {
            code: closeEvt?.code,
            reason: closeEvt?.reason,
          });
          options.onClose(closeEvt);
        },
        onerror: (e: unknown) => {
          const err = e as { message?: string };
          logger.error("Gemini Live server connection error", {
            error: err?.message || String(e),
          });
          options.onError(e);
        },
      },
      config: {
        responseModalities: [Modality.AUDIO],
        systemInstruction: {
          parts: [{ text: JARVIS_SYSTEM_PROMPT }],
        },
      },
    });

    return session;
  }
}

