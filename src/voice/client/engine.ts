import { MicrophoneCapture } from "./microphone";
import {
  IVoiceProvider,
  VoiceState,
  VoiceMode,
  MicPermissionState,
} from "../types";
import { BrowserVoiceProvider } from "../providers";

export interface VoiceEngineCallbacks {
  onStateChange: (state: VoiceState) => void;
  onTranscript: (transcript: string, isFinal: boolean) => void;
  onError: (error: string) => void;
}

export class VoiceEngine {
  private mic: MicrophoneCapture;
  private provider: IVoiceProvider;
  private callbacks?: VoiceEngineCallbacks;

  private state: VoiceState = {
    mode: "text",
    connectionState: "disconnected",
    permissionState: "prompt",
    isListening: false,
    isSpeaking: false,
    audioLevel: 0,
    error: null,
  };

  constructor(customProvider?: IVoiceProvider, customMic?: MicrophoneCapture) {
    this.provider = customProvider || new BrowserVoiceProvider();
    this.mic = customMic || new MicrophoneCapture();
  }

  public init(callbacks: VoiceEngineCallbacks): void {
    this.callbacks = callbacks;
    this.emitState();
  }

  public setMode(mode: VoiceMode): void {
    this.updateState({ mode });
    if (mode === "text") {
      this.stopListening();
      this.stopSpeaking();
    }
  }

  public async requestMicPermission(): Promise<MicPermissionState> {
    const permission = await this.mic.requestPermission();
    this.updateState({ permissionState: permission });
    return permission;
  }

  public async startListening(): Promise<void> {
    this.updateState({ connectionState: "connecting", error: null });

    // 1. If currently speaking, stop immediately (Barge-in / Interruption)
    this.stopSpeaking();

    // 2. Start microphone capture with live audio level analysis
    try {
      await this.mic.start({
        onAudioLevel: (level: number) => {
          this.updateState({ audioLevel: level });
        },
        onError: (err: Error) => {
          this.updateState({
            error: err.message,
            permissionState: err.message.includes("required") ? "denied" : "unavailable",
            connectionState: "error",
            isListening: false,
          });
        },
      });

      this.updateState({
        permissionState: "granted",
        connectionState: "connected",
        isListening: true,
      });
    } catch (err: unknown) {
      const error = err as Error;
      this.updateState({
        connectionState: "error",
        error: error.message,
        isListening: false,
      });
      return;
    }

    // 3. Start speech recognition
    this.provider.recognition.start({
      onResult: (transcript: string, isFinal: boolean) => {
        this.callbacks?.onTranscript(transcript, isFinal);
      },
      onError: (err: Error) => {
        this.updateState({
          error: err.message,
          connectionState: "error",
        });
        this.callbacks?.onError(err.message);
      },
      onEnd: () => {
        // Recognition loop finished; ensure clean reset
        if (this.state.isListening) {
          this.stopListening();
        }
      },
    });
  }

  public stopListening(): void {
    this.mic.stop();
    this.provider.recognition.stop();
    this.updateState({
      isListening: false,
      audioLevel: 0,
      connectionState: this.state.connectionState === "connected" ? "connected" : "disconnected",
    });
  }

  public speak(
    text: string,
    options: {
      onStart?: () => void;
      onEnd?: () => void;
    } = {}
  ): void {
    this.updateState({ isSpeaking: true });

    this.provider.synthesis.speak(text, {
      onStart: () => {
        this.updateState({ isSpeaking: true });
        options.onStart?.();
      },
      onEnd: () => {
        this.updateState({ isSpeaking: false });
        options.onEnd?.();
      },
      onError: (err: Error) => {
        this.updateState({ isSpeaking: false, error: err.message });
        options.onEnd?.();
      },
    });
  }

  public stopSpeaking(): void {
    this.provider.synthesis.cancel();
    this.updateState({ isSpeaking: false });
  }

  public cleanup(): void {
    this.callbacks = undefined;
    this.stopListening();
    this.stopSpeaking();
    this.state = {
      ...this.state,
      connectionState: "disconnected",
      isListening: false,
      isSpeaking: false,
      audioLevel: 0,
    };
  }

  public getState(): VoiceState {
    return { ...this.state };
  }

  private updateState(partial: Partial<VoiceState>): void {
    this.state = { ...this.state, ...partial };
    this.emitState();
  }

  private emitState(): void {
    this.callbacks?.onStateChange({ ...this.state });
  }
}
