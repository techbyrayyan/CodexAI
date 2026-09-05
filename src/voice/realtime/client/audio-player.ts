export class AudioPlayer {
  private audioContext: AudioContext | null = null;
  private isPlaying = false;
  private activeSources: AudioBufferSourceNode[] = [];
  private onEndedCallback?: () => void;

  constructor() {
    // Lazy initialized on user action
  }

  private getAudioContext(): AudioContext {
    if (!this.audioContext || this.audioContext.state === "closed") {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioContext = new AudioCtx({ sampleRate: 24000 });
    }
    if (this.audioContext.state === "suspended") {
      this.audioContext.resume().catch(() => {});
    }
    return this.audioContext;
  }

  /**
   * Safely decodes 16-bit linear PCM (little-endian) from Base64 into Float32Array (-1.0 to 1.0).
   * Robust against odd byte lengths and endianness.
   */
  private decodePcmBase64ToFloat32(base64Data: string): Float32Array | null {
    try {
      const binaryString = atob(base64Data);
      const len = binaryString.length;
      if (len < 2) return null;

      // Ensure even number of bytes for 16-bit PCM
      const sampleCount = Math.floor(len / 2);
      const bytes = new Uint8Array(sampleCount * 2);
      for (let i = 0; i < sampleCount * 2; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Little-endian 16-bit signed integer decoding
      const dataView = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
      const float32Array = new Float32Array(sampleCount);

      for (let i = 0; i < sampleCount; i++) {
        const int16 = dataView.getInt16(i * 2, true);
        float32Array[i] = int16 / 32768.0;
      }

      return float32Array;
    } catch {
      return null;
    }
  }

  /**
   * Decodes 16-bit PCM (little-endian, 24kHz) from Base64 into an AudioBuffer.
   */
  public playPcmBase64(base64Data: string, sampleRate = 24000): Promise<void> {
    return new Promise((resolve) => {
      try {
        const samples = this.decodePcmBase64ToFloat32(base64Data);
        if (!samples || samples.length === 0) {
          resolve();
          return;
        }

        const ctx = this.getAudioContext();
        const buffer = ctx.createBuffer(1, samples.length, sampleRate);
        buffer.copyToChannel(samples, 0);

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);

        this.activeSources.push(source);
        this.isPlaying = true;

        source.onended = () => {
          this.activeSources = this.activeSources.filter((s) => s !== source);
          if (this.activeSources.length === 0) {
            this.isPlaying = false;
            this.onEndedCallback?.();
          }
          resolve();
        };

        source.start();
      } catch {
        resolve();
      }
    });
  }

  /**
   * Plays an array of raw PCM Base64 chunks seamlessly without silence gaps.
   * Concatenates all chunks into a single continuous buffer to eliminate stuttering.
   */
  public async playChunks(
    chunks: Array<{ data: string; mimeType?: string }>,
    sampleRate = 24000,
    onEnded?: () => void
  ): Promise<void> {
    this.stop();
    this.onEndedCallback = onEnded;

    // 1. Decode and collect all PCM float samples
    const decodedArrays: Float32Array[] = [];
    let totalSamples = 0;

    for (const chunk of chunks) {
      if (!chunk.data) continue;
      const samples = this.decodePcmBase64ToFloat32(chunk.data);
      if (samples && samples.length > 0) {
        decodedArrays.push(samples);
        totalSamples += samples.length;
      }
    }

    if (totalSamples === 0) {
      this.isPlaying = false;
      onEnded?.();
      return;
    }

    // 2. Concatenate into a single continuous buffer (zero gaps, eliminates stuttering)
    const combinedSamples = new Float32Array(totalSamples);
    let offset = 0;
    for (const arr of decodedArrays) {
      combinedSamples.set(arr, offset);
      offset += arr.length;
    }

    // 3. Create single Web Audio buffer and play seamlessly
    const ctx = this.getAudioContext();
    const buffer = ctx.createBuffer(1, totalSamples, sampleRate);
    buffer.copyToChannel(combinedSamples, 0);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    this.activeSources.push(source);
    this.isPlaying = true;

    return new Promise((resolve) => {
      source.onended = () => {
        this.activeSources = this.activeSources.filter((s) => s !== source);
        if (this.activeSources.length === 0) {
          this.isPlaying = false;
          this.onEndedCallback?.();
        }
        resolve();
      };

      source.start();
    });
  }

  /**
   * Immediate Barge-in / Interruption: cancel all active audio sources instantly.
   */
  public stop(): void {
    for (const source of this.activeSources) {
      try {
        source.stop();
        source.disconnect();
      } catch {
        // Ignore
      }
    }
    this.activeSources = [];
    this.isPlaying = false;
    this.onEndedCallback?.();
  }

  public get playing(): boolean {
    return this.isPlaying;
  }
}
