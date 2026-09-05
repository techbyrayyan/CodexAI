export type VoiceMode = "text" | "voice";

export type MicPermissionState = "prompt" | "granted" | "denied" | "unavailable";

export type VoiceConnectionState =
  | "disconnected"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "error";

export interface VoiceState {
  mode: VoiceMode;
  connectionState: VoiceConnectionState;
  permissionState: MicPermissionState;
  isListening: boolean;
  isSpeaking: boolean;
  audioLevel: number; // 0.0 to 1.0 normalized
  error: string | null;
}

export interface IVoiceRecognitionProvider {
  readonly name: string;
  readonly isSupported: boolean;
  start(options: {
    onResult: (transcript: string, isFinal: boolean) => void;
    onError: (error: Error) => void;
    onEnd: () => void;
  }): void;
  stop(): void;
  abort(): void;
}

export interface IVoiceSynthesisProvider {
  readonly name: string;
  readonly isSupported: boolean;
  speak(text: string, options: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (error: Error) => void;
  }): void;
  cancel(): void;
  pause(): void;
  resume(): void;
}

export interface IVoiceProvider {
  readonly name: string;
  readonly recognition: IVoiceRecognitionProvider;
  readonly synthesis: IVoiceSynthesisProvider;
}
