import {
  ILiveSession,
  ILiveSessionCallbacks,
  LiveVoiceState,
} from "../types";
import { AudioPlayer } from "./audio-player";

export class GeminiLiveClientSession implements ILiveSession {
  private _state: LiveVoiceState = "idle";
  private callbacks?: ILiveSessionCallbacks;
  private player: AudioPlayer;

  constructor() {
    this.player = new AudioPlayer();
  }

  public get state(): LiveVoiceState {
    return this._state;
  }

  public get audioPlayer(): AudioPlayer {
    return this.player;
  }

  public init(callbacks: ILiveSessionCallbacks): void {
    this.callbacks = callbacks;
    this.setState("idle");
  }

  public async connect(): Promise<void> {
    this.setState("connecting");

    try {
      const res = await fetch("/api/voice/live");
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to initialize Gemini Live session.");
      }

      this.setState("connected");
    } catch (err: unknown) {
      const error = err as Error;
      this.setState("error");
      this.callbacks?.onError(error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    this.interrupt();
    this.setState("disconnected");
  }

  public async sendAudio(base64Pcm: string, mimeType = "audio/pcm;rate=16000"): Promise<void> {
    this.setState("thinking");

    try {
      const res = await fetch("/api/voice/live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audioChunk: base64Pcm,
          mimeType,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Live turn failed.");
      }

      await this.handleTurnResponse(data);
    } catch (err: unknown) {
      const error = err as Error;
      this.setState("error");
      this.callbacks?.onError(error);
    }
  }

  public async sendText(
    text: string,
    history: Array<{ role: string; content: string }> = []
  ): Promise<void> {
    this.setState("thinking");

    // Emit user transcript
    this.callbacks?.onTranscript({
      speaker: "user",
      text,
      isFinal: true,
      timestamp: Date.now(),
    });

    try {
      const res = await fetch("/api/voice/live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          history,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Live turn failed.");
      }

      await this.handleTurnResponse(data);
    } catch (err: unknown) {
      const error = err as Error;
      this.setState("error");
      this.callbacks?.onError(error);
    }
  }

  private async handleTurnResponse(data: {
    transcript: string;
    audioChunks: Array<{ mimeType: string; data: string }>;
  }): Promise<void> {
    // 1. Emit JARVIS transcript
    if (data.transcript) {
      this.callbacks?.onTranscript({
        speaker: "jarvis",
        text: data.transcript,
        isFinal: true,
        timestamp: Date.now(),
      });
    }

    // 2. Play native audio if returned
    if (data.audioChunks && data.audioChunks.length > 0) {
      this.setState("jarvis_speaking");
      await this.player.playChunks(data.audioChunks, 24000, () => {
        this.setState("connected");
      });
    } else {
      this.setState("connected");
    }
  }

  public interrupt(): void {
    if (this.player.playing) {
      this.player.stop();
      this.callbacks?.onInterrupted();
      this.setState("interrupted");
      setTimeout(() => {
        if (this._state === "interrupted") {
          this.setState("connected");
        }
      }, 300);
    }
  }

  public cleanup(): void {
    this.callbacks = undefined;
    this.interrupt();
    this._state = "disconnected";
  }

  private setState(state: LiveVoiceState): void {
    this._state = state;
    this.callbacks?.onStateChange(state);
  }
}
