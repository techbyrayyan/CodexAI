"use client";

import * as React from "react";

export function useJarvisState(initialState = "idle") {
  const [state, setState] = React.useState(initialState);

  const statusMap = {
    idle: "Ready",
    listening: "Listening...",
    thinking: "Thinking...",
    processing: "Processing...",
    speaking: "Speaking...",
  };

  const setJarvisState = React.useCallback((newState) => {
    setState(newState);
  }, []);

  return {
    state,
    statusText: statusMap[state] || "Ready",
    setState: setJarvisState,
    isIdle: state === "idle",
    isListening: state === "listening",
    isThinking: state === "thinking",
    isProcessing: state === "processing",
    isSpeaking: state === "speaking",
  };
}
