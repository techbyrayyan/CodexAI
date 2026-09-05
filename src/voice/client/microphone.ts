import { MicPermissionState } from "../types";

export interface MicCaptureOptions {
  onAudioLevel?: (level: number) => void;
  onError?: (error: Error) => void;
}

export class MicrophoneCapture {
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animationFrameId: number | null = null;
  private onAudioLevel?: (level: number) => void;

  public async requestPermission(): Promise<MicPermissionState> {
    if (typeof window === "undefined" || !navigator?.mediaDevices?.getUserMedia) {
      return "unavailable";
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Clean up track immediately after test probe
      stream.getTracks().forEach((track) => track.stop());
      return "granted";
    } catch (err: unknown) {
      const error = err as { name?: string };
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        return "denied";
      }
      return "unavailable";
    }
  }

  public async start(options: MicCaptureOptions = {}): Promise<MediaStream> {
    if (typeof window === "undefined" || !navigator?.mediaDevices?.getUserMedia) {
      throw new Error("Microphone capture is not supported in this browser environment.");
    }

    this.onAudioLevel = options.onAudioLevel;

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.setupAudioAnalyser(this.stream);
      return this.stream;
    } catch (err: unknown) {
      const error = err as { name?: string; message?: string };
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        const customErr = new Error("Microphone access is required for voice interaction.");
        options.onError?.(customErr);
        throw customErr;
      }
      const genericErr = new Error(error.message || "Unable to access microphone device.");
      options.onError?.(genericErr);
      throw genericErr;
    }
  }

  private setupAudioAnalyser(stream: MediaStream): void {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      this.audioContext = new AudioCtx();
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 64;
      source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkLevel = () => {
        if (!this.analyser) return;
        this.analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const normalized = Math.min(1, avg / 128); // 0.0 to 1.0

        this.onAudioLevel?.(normalized);
        this.animationFrameId = requestAnimationFrame(checkLevel);
      };

      this.animationFrameId = requestAnimationFrame(checkLevel);
    } catch {
      // Audio analysis is optional enhancement; graceful degradation
    }
  }

  public stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    if (this.audioContext && this.audioContext.state !== "closed") {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }

    this.analyser = null;
    this.onAudioLevel?.(0);
  }

  public get isCapturing(): boolean {
    return this.stream !== null && this.stream.active;
  }
}
