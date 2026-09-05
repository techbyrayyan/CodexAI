export type LiveVoiceState =
  | "idle"
  | "connecting"
  | "connected"
  | "listening"
  | "user_speaking"
  | "thinking"
  | "jarvis_speaking"
  | "interrupted"
  | "reconnecting"
  | "disconnected"
  | "error";

export interface LiveTranscriptEvent {
  speaker: "user" | "jarvis";
  text: string;
  isFinal: boolean;
  timestamp: number;
}

export interface LiveAudioChunkEvent {
  data: string; // Base64 PCM audio
  mimeType: string;
  rate: number;
}

export interface ILiveSessionCallbacks {
  onStateChange: (state: LiveVoiceState) => void;
  onTranscript: (event: LiveTranscriptEvent) => void;
  onAudioChunk: (event: LiveAudioChunkEvent) => void;
  onInterrupted: () => void;
  onError: (error: Error) => void;
}

export interface ILiveSession {
  readonly state: LiveVoiceState;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  sendAudio(base64Pcm: string, mimeType?: string): Promise<void>;
  sendText(text: string): Promise<void>;
  interrupt(): void;
  cleanup(): void;
}
