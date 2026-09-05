"use client";

import * as React from "react";
import { JarvisState } from "@/ai/types";

export function useJarvisState(initialState: JarvisState = "idle") {
  const [state, setState] = React.useState<JarvisState>(initialState);

  const statusMap: Record<JarvisState, string> = {
    idle: "Ready",
    listening: "Listening...",
    thinking: "Thinking...",
    processing: "Processing...",
    speaking: "Speaking...",
  };

  const setJarvisState = React.useCallback((newState: JarvisState) => {
    setState(newState);
  }, []);

  return {
    state,
    statusText: statusMap[state],
    setState: setJarvisState,
    isIdle: state === "idle",
    isListening: state === "listening",
    isThinking: state === "thinking",
    isProcessing: state === "processing",
    isSpeaking: state === "speaking",
  };
}
