"use client";

import * as React from "react";
import { Mic, MicOff, SendHorizontal, CornerDownLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JarvisState } from "@/ai/types";
import { cn } from "@/lib/utils";

interface CommandInputProps {
  onSend: (message: string) => void;
  state: JarvisState;
  onStateChange: (state: JarvisState) => void;
  disabled?: boolean;
}

export function CommandInput({ onSend, state, onStateChange, disabled }: CommandInputProps) {
  const [input, setInput] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const isListening = state === "listening";

  const handleToggleMic = () => {
    if (isListening) {
      onStateChange("idle");
    } else {
      onStateChange("listening");
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || disabled) return;

    onSend(trimmed);
    setInput("");
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form
        onSubmit={handleSubmit}
        className={cn(
          "relative flex items-center rounded-2xl border bg-zinc-950/80 p-2 shadow-2xl backdrop-blur-xl transition-all duration-300",
          isListening
            ? "border-emerald-500/70 shadow-[0_0_25px_rgba(16,185,129,0.25)] ring-1 ring-emerald-500/50"
            : "border-zinc-800/80 hover:border-zinc-700/80 focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/30"
        )}
      >
        {/* Microphone action button (UI State Only in Phase 1) */}
        <Button
          type="button"
          size="icon"
          variant={isListening ? "emerald" : "ghost"}
          onClick={handleToggleMic}
          aria-label={isListening ? "Deactivate audio simulation" : "Activate audio listening simulation"}
          title={isListening ? "Audio listening mode active (Click to cancel)" : "Simulate voice listening state"}
          className={cn(
            "h-10 w-10 shrink-0 rounded-xl transition-all",
            isListening && "animate-pulse"
          )}
        >
          {isListening ? (
            <Mic className="h-5 w-5 text-black" />
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
                ? "Listening... (Voice state simulated in Phase 1)"
                : "Instruct JARVIS... (e.g., 'Inspect system diagnostics')"
            }
            className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
          />
        </div>

        {/* Keyboard shortcut hint */}
        <div className="hidden sm:flex items-center gap-1 mr-2 text-[10px] font-mono text-zinc-500">
          <kbd className="px-1.5 py-0.5 rounded border border-zinc-800 bg-zinc-900 text-zinc-400">
            Enter
          </kbd>
        </div>

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

      {/* Auxiliary Status Hint */}
      <div className="mt-2 flex items-center justify-between px-3 text-[11px] font-mono text-zinc-500">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>VOICE/AI BACKEND: DEFERRED (PHASE 1 ARCHITECTURE SHELL)</span>
        </span>
        <span>HUD v1.0</span>
      </div>
    </div>
  );
}
