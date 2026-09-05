import { describe, it, expect, vi, beforeEach } from "vitest";
import { GeminiLiveClientSession } from "../voice/realtime/client/session";

describe("JARVIS Phase 3 Gemini Live Voice Integration", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("1. Realtime Session Lifecycle & Connection States", () => {
    it("initializes in idle state", () => {
      const session = new GeminiLiveClientSession();
      expect(session.state).toBe("idle");
    });

    it("connects successfully when /api/voice/live returns 200", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          provider: "gemini-live",
          model: "gemini-2.5-flash-native-audio-latest",
        }),
      });

      const session = new GeminiLiveClientSession();
      const stateListener = vi.fn();
      session.init({
        onStateChange: stateListener,
        onTranscript: vi.fn(),
        onAudioChunk: vi.fn(),
        onInterrupted: vi.fn(),
        onError: vi.fn(),
      });

      await session.connect();

      expect(session.state).toBe("connected");
      expect(stateListener).toHaveBeenCalledWith("connecting");
      expect(stateListener).toHaveBeenCalledWith("connected");
    });

    it("transitions to error state when /api/voice/live fails", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({
          success: false,
          error: { code: "CONFIG_ERROR", message: "API key missing" },
        }),
      });

      const session = new GeminiLiveClientSession();
      const errorListener = vi.fn();
      session.init({
        onStateChange: vi.fn(),
        onTranscript: vi.fn(),
        onAudioChunk: vi.fn(),
        onInterrupted: vi.fn(),
        onError: errorListener,
      });

      await expect(session.connect()).rejects.toThrow("API key missing");
      expect(session.state).toBe("error");
      expect(errorListener).toHaveBeenCalled();
    });
  });

  describe("2. Audio & Transcript Streaming Contracts", () => {
    it("sends text to live session and emits transcripts & native audio", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          transcript: "JARVIS Live audio ready.",
          audioChunks: [{ mimeType: "audio/pcm;rate=24000", data: "AAEC" }],
        }),
      });

      const session = new GeminiLiveClientSession();
      const transcriptListener = vi.fn();
      session.init({
        onStateChange: vi.fn(),
        onTranscript: transcriptListener,
        onAudioChunk: vi.fn(),
        onInterrupted: vi.fn(),
        onError: vi.fn(),
      });

      // Mock audio player playChunks
      vi.spyOn(session.audioPlayer, "playChunks").mockImplementation(
        async (_chunks, _rate, onEnd) => {
          onEnd?.();
        }
      );

      await session.sendText("Hello Jarvis");

      // User transcript emitted
      expect(transcriptListener).toHaveBeenCalledWith(
        expect.objectContaining({ speaker: "user", text: "Hello Jarvis" })
      );

      // Jarvis transcript emitted
      expect(transcriptListener).toHaveBeenCalledWith(
        expect.objectContaining({ speaker: "jarvis", text: "JARVIS Live audio ready." })
      );
    });

    it("handles native PCM audio input chunk dispatch", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          transcript: "Audio received.",
          audioChunks: [],
        }),
      });

      const session = new GeminiLiveClientSession();
      session.init({
        onStateChange: vi.fn(),
        onTranscript: vi.fn(),
        onAudioChunk: vi.fn(),
        onInterrupted: vi.fn(),
        onError: vi.fn(),
      });

      await session.sendAudio("base64PcmChunkData==");
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/voice/live",
        expect.objectContaining({ method: "POST" })
      );
    });
  });

  describe("3. Realtime Interruption & Barge-in", () => {
    it("stops audio player instantly and triggers onInterrupted", () => {
      const session = new GeminiLiveClientSession();
      const interruptedListener = vi.fn();
      session.init({
        onStateChange: vi.fn(),
        onTranscript: vi.fn(),
        onAudioChunk: vi.fn(),
        onInterrupted: interruptedListener,
        onError: vi.fn(),
      });

      // Mock player as currently playing
      vi.spyOn(session.audioPlayer, "playing", "get").mockReturnValue(true);
      const stopSpy = vi.spyOn(session.audioPlayer, "stop").mockImplementation(() => {});

      session.interrupt();

      expect(interruptedListener).toHaveBeenCalledTimes(1);
      expect(stopSpy).toHaveBeenCalledTimes(1);
    });

    it("cleans up session and stops playback on disconnect()", async () => {
      const session = new GeminiLiveClientSession();
      vi.spyOn(session.audioPlayer, "playing", "get").mockReturnValue(true);
      const stopSpy = vi.spyOn(session.audioPlayer, "stop").mockImplementation(() => {});

      await session.disconnect();
      expect(stopSpy).toHaveBeenCalledTimes(1);
      expect(session.state).toBe("disconnected");
    });
  });
});
