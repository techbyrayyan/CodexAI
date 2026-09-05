export interface AudioChunk {
  data: string; // Base64 PCM or Opus
  sampleRate: number;
  channels: number;
  format: "pcm16" | "opus" | "g711";
}

export type VoiceSessionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "listening"
  | "speaking"
  | "error";

export interface VoiceSessionConfig {
  voice: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";
  modalities: ("text" | "audio")[];
  inputAudioFormat: "pcm16" | "g711_ulaw";
  outputAudioFormat: "pcm16" | "g711_ulaw";
  turnDetection: {
    type: "server_vad";
    threshold?: number;
    prefixPaddingMs?: number;
    silenceDurationMs?: number;
  };
}
