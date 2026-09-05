"use client";

import * as React from "react";
import { Mic, MicOff, SendHorizontal, Volume2, VolumeX, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JarvisState } from "@/ai/types";
import { VoiceState } from "@/voice/types";
import { cn } from "@/lib/utils";

interface CommandInputProps {
  onSend: (message: string) => void;
  state: JarvisState;
  onStateChange: (state: JarvisState) => void;
  voiceState?: VoiceState;
  liveTranscript?: string;
  onToggleVoiceMode?: () => void;
  onStartListening?: () => void;
  onStopListening?: () => void;
  onStopSpeaking?: () => void;
  disabled?: boolean;
}

export function CommandInput({
  onSend,
  state,
  voiceState,
  liveTranscript,
  onToggleVoiceMode,
  onStartListening,
  onStopListening,
  onStopSpeaking,
  disabled,
}: CommandInputProps) {
  const [input, setInput] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Synchronize live voice transcription into the input field as user speaks
  React.useEffect(() => {
    if (liveTranscript) {
      setInput(liveTranscript);
    }
  }, [liveTranscript]);

  const isListening = state === "listening" || Boolean(voiceState?.isListening);
  const isSpeaking = state === "speaking" || Boolean(voiceState?.isSpeaking);
  const isVoiceMode = voiceState?.mode === "voice";

  const handleToggleMic = () => {
    if (isListening) {
      onStopListening?.();
      const trimmed = input.trim();
      if (trimmed && !disabled) {
        onSend(trimmed);
        setInput("");
      }
    } else {
      if (isSpeaking) {
        onStopSpeaking?.();
      }
      setInput("");
      onStartListening?.();
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || disabled) return;

    if (isListening) {
      onStopListening?.();
    }
    if (isSpeaking) {
      onStopSpeaking?.();
    }

    onSend(trimmed);
    setInput("");
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-2">
      <form
        onSubmit={handleSubmit}
        className={cn(
          "relative flex items-center rounded-2xl border bg-zinc-950/80 p-2 shadow-2xl backdrop-blur-xl transition-all duration-300",
          isListening
            ? "border-emerald-500/80 shadow-[0_0_25px_rgba(16,185,129,0.3)] ring-1 ring-emerald-500/60"
            : isSpeaking
            ? "border-emerald-400/60 shadow-[0_0_20px_rgba(52,211,153,0.25)] ring-1 ring-emerald-400/40"
            : "border-zinc-800/80 hover:border-zinc-700/80 focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/30"
        )}
      >
        {/* Real Microphone action button */}
        <Button
          type="button"
          size="icon"
          variant={isListening ? "emerald" : "ghost"}
          onClick={handleToggleMic}
          aria-label={isListening ? "Stop listening to microphone" : "Activate voice interaction"}
          title={isListening ? "Listening active (Click to stop)" : "Click to speak with JARVIS"}
          className={cn(
            "h-10 w-10 shrink-0 rounded-xl transition-all relative",
            isListening && "animate-pulse"
          )}
        >
          {isListening ? (
            <Mic className="h-5 w-5 text-black" />
          ) : voiceState?.permissionState === "denied" ? (
            <MicOff className="h-5 w-5 text-rose-400 hover:text-rose-300" />
          ) : (
            <Mic className="h-5 w-5 text-zinc-400 hover:text-emerald-400" />
          )}
        </Button>

        {/* Text Input */}
        <div className="relative flex-1 px-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={disabled}
            placeholder={
              isListening
                ? "Listening to voice input... (speak your command)"
                : isSpeaking
                ? "JARVIS is speaking... (click mute or type to interrupt)"
                : "Instruct JARVIS or click mic to speak..."
            }
            className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
          />
        </div>

        {/* Stop Speaking / Mute Button (Interruption barge-in) */}
        {isSpeaking && (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={onStopSpeaking}
            aria-label="Stop JARVIS speech"
            title="Interrupt JARVIS speech"
            className="h-10 w-10 shrink-0 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 mr-1"
          >
            <VolumeX className="h-4 w-4" />
          </Button>
        )}

        {/* Mode Toggle Button (Text vs Voice Mode) */}
        {onToggleVoiceMode && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onToggleVoiceMode}
            aria-label={`Switch to ${isVoiceMode ? "Text Mode" : "Voice Mode"}`}
            title={`Active: ${isVoiceMode ? "Voice Mode" : "Text Mode"}`}
            className="hidden sm:flex items-center gap-1.5 px-2.5 h-8 text-[11px] font-mono text-zinc-400 hover:text-emerald-300 rounded-lg mr-1.5"
          >
            {isVoiceMode ? (
              <>
                <Volume2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>VOICE</span>
              </>
            ) : (
              <span>TEXT</span>
            )}
          </Button>
        )}

        {/* Send Button */}
        <Button
          type="submit"
          size="icon"
          disabled={!input.trim() || disabled}
          aria-label="Send command to JARVIS"
          className={cn(
            "h-10 w-10 shrink-0 rounded-xl transition-all duration-200",
            input.trim()
              ? "bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              : "bg-zinc-900 text-zinc-600 border border-zinc-800"
          )}
        >
          <SendHorizontal className="h-4 w-4" />
        </Button>
      </form>

      {/* Auxiliary Voice Status & Feedback */}
      <div className="flex items-center justify-between px-3 text-[11px] font-mono text-zinc-500">
        <div className="flex items-center gap-2">
          {voiceState?.error ? (
            <span className="flex items-center gap-1 text-rose-400">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>{voiceState.error}</span>
            </span>
          ) : isListening ? (
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>VOICE STREAM ACTIVE — LISTENING</span>
            </span>
          ) : isSpeaking ? (
            <span className="flex items-center gap-1.5 text-emerald-300">
              <Volume2 className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
              <span>JARVIS SYNTHESIZING SPEECH OUTPUT</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>GEMINI LIVE BIDIRECTIONAL AUDIO READY</span>
            </span>
          )}
        </div>
        <span className="text-[10px] text-zinc-600">LIVE v3.1</span>
      </div>
    </div>
  );
}
