import { describe, it, expect, vi, beforeEach } from "vitest";
import { VoiceEngine } from "../voice/client/engine";
import { MicrophoneCapture } from "../voice/client/microphone";
import { IVoiceProvider } from "../voice/types";

describe("JARVIS Phase 3 Realtime Voice Engine", () => {
  let mockMic: MicrophoneCapture;
  let mockProvider: IVoiceProvider;
  let mockOnResult: (transcript: string, isFinal: boolean) => void;
  let mockOnError: (error: Error) => void;
  let mockOnEnd: () => void;

  beforeEach(() => {
    mockMic = {
      requestPermission: vi.fn().mockResolvedValue("granted"),
      start: vi.fn().mockResolvedValue({} as MediaStream),
      stop: vi.fn(),
      isCapturing: false,
    } as unknown as MicrophoneCapture;

    mockProvider = {
      name: "mock-voice-provider",
      recognition: {
        name: "mock-rec",
        isSupported: true,
        start: vi.fn().mockImplementation((opts) => {
          mockOnResult = opts.onResult;
          mockOnError = opts.onError;
          mockOnEnd = opts.onEnd;
        }),
        stop: vi.fn(),
        abort: vi.fn(),
      },
      synthesis: {
        name: "mock-synth",
        isSupported: true,
        speak: vi.fn().mockImplementation((text, opts) => {
          opts.onStart?.();
        }),
        cancel: vi.fn(),
        pause: vi.fn(),
        resume: vi.fn(),
      },
    };
  });

  describe("1. Microphone State Machine & Permissions", () => {
    it("requests mic permission and updates permissionState to granted", async () => {
      const engine = new VoiceEngine(mockProvider, mockMic);
      const perm = await engine.requestMicPermission();

      expect(perm).toBe("granted");
      expect(engine.getState().permissionState).toBe("granted");
    });

    it("handles denied microphone permission gracefully", async () => {
      (mockMic.start as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("Microphone access is required for voice interaction.")
      );

      const engine = new VoiceEngine(mockProvider, mockMic);
      await engine.startListening();

      const state = engine.getState();
      expect(state.connectionState).toBe("error");
      expect(state.error).toContain("Microphone access is required");
      expect(state.isListening).toBe(false);
    });

    it("handles microphone unavailable error gracefully", async () => {
      (mockMic.start as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("Microphone capture is not supported in this browser environment.")
      );

      const engine = new VoiceEngine(mockProvider, mockMic);
      await engine.startListening();

      const state = engine.getState();
      expect(state.connectionState).toBe("error");
      expect(state.isListening).toBe(false);
    });
  });

  describe("2. Listening & Recognition Transitions", () => {
    it("transitions state to listening and connected when started", async () => {
      const engine = new VoiceEngine(mockProvider, mockMic);
      const stateListener = vi.fn();
      engine.init({
        onStateChange: stateListener,
        onTranscript: vi.fn(),
        onError: vi.fn(),
      });

      await engine.startListening();

      const state = engine.getState();
      expect(state.isListening).toBe(true);
      expect(state.connectionState).toBe("connected");
      expect(mockProvider.recognition.start).toHaveBeenCalledTimes(1);
    });

    it("calls onTranscript callback when speech recognition produces text", async () => {
      const engine = new VoiceEngine(mockProvider, mockMic);
      const transcriptListener = vi.fn();
      engine.init({
        onStateChange: vi.fn(),
        onTranscript: transcriptListener,
        onError: vi.fn(),
      });

      await engine.startListening();

      // Trigger recognition result
      mockOnResult("Hello Jarvis", true);

      expect(transcriptListener).toHaveBeenCalledWith("Hello Jarvis", true);
    });

    it("handles speech recognition error callback properly", async () => {
      const engine = new VoiceEngine(mockProvider, mockMic);
      const errorListener = vi.fn();
      engine.init({
        onStateChange: vi.fn(),
        onTranscript: vi.fn(),
        onError: errorListener,
      });

      await engine.startListening();
      mockOnError(new Error("Network recognition failure"));
      mockOnEnd();

      expect(errorListener).toHaveBeenCalledWith("Network recognition failure");
    });

    it("stops listening cleanly and resets audio level", async () => {
      const engine = new VoiceEngine(mockProvider, mockMic);
      await engine.startListening();

      engine.stopListening();

      const state = engine.getState();
      expect(state.isListening).toBe(false);
      expect(state.audioLevel).toBe(0);
      expect(mockMic.stop).toHaveBeenCalled();
      expect(mockProvider.recognition.stop).toHaveBeenCalled();
    });
  });

  describe("3. Speech Synthesis & Interruption (Barge-in)", () => {
    it("transitions to speaking state when speak() is called", () => {
      const engine = new VoiceEngine(mockProvider, mockMic);
      engine.speak("Hello, operator.");

      expect(engine.getState().isSpeaking).toBe(true);
      expect(mockProvider.synthesis.speak).toHaveBeenCalled();
    });

    it("stops speaking immediately on stopSpeaking() or barge-in", () => {
      const engine = new VoiceEngine(mockProvider, mockMic);
      engine.speak("Long speech in progress...");
      expect(engine.getState().isSpeaking).toBe(true);

      engine.stopSpeaking();
      expect(engine.getState().isSpeaking).toBe(false);
      expect(mockProvider.synthesis.cancel).toHaveBeenCalled();
    });

    it("interrupts speaking if user starts listening (barge-in)", async () => {
      const engine = new VoiceEngine(mockProvider, mockMic);
      engine.speak("Currently speaking...");

      await engine.startListening();
      expect(mockProvider.synthesis.cancel).toHaveBeenCalled();
      expect(engine.getState().isListening).toBe(true);
    });
  });

  describe("4. Mode Switching & Cleanup", () => {
    it("stops listening and speaking when switching to text mode", () => {
      const engine = new VoiceEngine(mockProvider, mockMic);
      engine.speak("Speaking");
      engine.setMode("text");

      expect(engine.getState().mode).toBe("text");
      expect(engine.getState().isSpeaking).toBe(false);
    });

    it("cleans up resources and resets state on cleanup()", () => {
      const engine = new VoiceEngine(mockProvider, mockMic);
      engine.cleanup();

      const state = engine.getState();
      expect(state.connectionState).toBe("disconnected");
      expect(state.isListening).toBe(false);
      expect(state.isSpeaking).toBe(false);
    });
  });

  describe("5. Text Sanitization & Voice Selection for Natural Pronunciation", () => {
    it("cleans markdown and normalizes Roman Urdu tokens to prevent letter-by-letter spelling", async () => {
      const { cleanTextForSpeech } = await import("../voice/providers/web-speech-synthesis");
      const raw = "**Main** bilkul thik hoon, operator. All systems are functioning at optimal capacity. Aap bataiye, aaj main aapki kya sahayata kar sakta hoon?";
      const cleaned = cleanTextForSpeech(raw);

      expect(cleaned).not.toContain("**");
      expect(cleaned).toContain("main bilkul theek hoon");
      expect(cleaned).toContain("aap bataiye");
      expect(cleaned).toContain("sahayata");
    });

    it("prioritizes Indian / Urdu / Hindi voices for South Asian dialogue", async () => {
      const { selectBestVoice } = await import("../voice/providers/web-speech-synthesis");
      const mockVoices = [
        { name: "Microsoft David Desktop", lang: "en-US" },
        { name: "Google हिन्दी", lang: "hi-IN" },
        { name: "Microsoft Zira Desktop", lang: "en-US" },
      ] as unknown as SpeechSynthesisVoice[];

      const voice = selectBestVoice(mockVoices, "kaise ho, main theek hoon");
      expect(voice?.name).toBe("Google हिन्दी");
    });

    it("strictly avoids Microsoft David Desktop when other English voices exist", async () => {
      const { selectBestVoice } = await import("../voice/providers/web-speech-synthesis");
      const mockVoices = [
        { name: "Microsoft David Desktop", lang: "en-US" },
        { name: "Microsoft Zira Desktop", lang: "en-US" },
      ] as unknown as SpeechSynthesisVoice[];

      const voice = selectBestVoice(mockVoices, "All systems nominal.");
      expect(voice?.name).toBe("Microsoft Zira Desktop");
    });
  });
});
