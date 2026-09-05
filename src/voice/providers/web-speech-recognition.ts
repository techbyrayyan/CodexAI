import { IVoiceRecognitionProvider } from "../types";

// Standard Web Speech API interface definitions
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: { transcript: string; confidence: number };
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: { new (): ISpeechRecognition };
    webkitSpeechRecognition?: { new (): ISpeechRecognition };
  }
}

export class WebSpeechRecognitionProvider implements IVoiceRecognitionProvider {
  public readonly name = "web-speech-recognition";
  private recognitionInstance: ISpeechRecognition | null = null;
  private isRunning = false;

  public get isSupported(): boolean {
    if (typeof window === "undefined") return false;
    return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  public start(options: {
    onResult: (transcript: string, isFinal: boolean) => void;
    onError: (error: Error) => void;
    onEnd: () => void;
  }): void {
    if (!this.isSupported) {
      options.onError(
        new Error("Speech recognition is not supported in this browser. Please use Chrome or Edge.")
      );
      return;
    }

    if (this.isRunning) {
      this.stop();
    }

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) return;

    this.recognitionInstance = new SpeechRec();
    this.recognitionInstance.continuous = true;
    this.recognitionInstance.interimResults = true;
    // Set language from browser locale or fallback to en-US
    this.recognitionInstance.lang = (typeof navigator !== "undefined" && navigator.language) || "en-US";

    let lastInterim = "";
    let silenceTimer: ReturnType<typeof setTimeout> | null = null;

    const finalizePending = () => {
      if (silenceTimer) {
        clearTimeout(silenceTimer);
        silenceTimer = null;
      }
      if (lastInterim && lastInterim.trim().length > 0) {
        const text = lastInterim.trim();
        lastInterim = "";
        options.onResult(text, true);
      }
    };

    this.recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        const text = item[0]?.transcript || "";
        if (item.isFinal) {
          final += text;
        } else {
          interim += text;
        }
      }

      if (final.trim().length > 0) {
        if (silenceTimer) {
          clearTimeout(silenceTimer);
          silenceTimer = null;
        }
        lastInterim = "";
        options.onResult(final.trim(), true);
      } else if (interim.trim().length > 0) {
        lastInterim = interim.trim();
        options.onResult(interim.trim(), false);

        // Auto-finalize on speech pause (1.2s of silence)
        if (silenceTimer) clearTimeout(silenceTimer);
        silenceTimer = setTimeout(() => {
          finalizePending();
        }, 1200);
      }
    };

    this.recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
      // "no-speech" is normal when silence occurs; ignore or notify gently
      if (event.error === "no-speech") return;
      if (event.error === "aborted") return;

      const message =
        event.error === "not-allowed"
          ? "Microphone access is required for voice interaction."
          : `Speech recognition error: ${event.error}`;
      options.onError(new Error(message));
    };

    this.recognitionInstance.onend = () => {
      finalizePending();
      this.isRunning = false;
      options.onEnd();
    };

    try {
      this.recognitionInstance.start();
      this.isRunning = true;
    } catch (err: unknown) {
      this.isRunning = false;
      const error = err as Error;
      options.onError(new Error(error.message || "Failed to start speech recognition."));
    }
  }

  public stop(): void {
    if (this.recognitionInstance && this.isRunning) {
      try {
        this.recognitionInstance.stop();
      } catch {
        // Safe ignore
      }
      this.isRunning = false;
    }
  }

  public abort(): void {
    if (this.recognitionInstance) {
      try {
        this.recognitionInstance.abort();
      } catch {
        // Safe ignore
      }
      this.isRunning = false;
    }
  }
}
