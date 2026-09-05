"use client";

import * as React from "react";
import { activityLogger } from "@/services/activity-logger";

const initialMessages = [
  {
    id: "msg-001",
    role: "assistant",
    content: "JARVIS Core initialized in Phase 1 architecture mode. Command HUD and visualizer online. All systems nominal.",
    timestamp: 1725528000000,
    status: "completed",
  },
];

export function useChat(onStateChange) {
  const [messages, setMessages] = React.useState(initialMessages);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const sendMessage = React.useCallback(
    async (content) => {
      if (!content || !content.trim() || isProcessing) return;

      const userMsg = {
        id: `user-${Date.now()}`,
        role: "user",
        content,
        timestamp: Date.now(),
        status: "delivered",
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsProcessing(true);
      onStateChange("thinking");

      activityLogger.logEvent({
        category: "system",
        title: "Operator Command Received",
        description: `Dispatched instruction: "${content.slice(0, 32)}${content.length > 32 ? "..." : ""}"`,
        level: "info",
      });

      setTimeout(() => {
        onStateChange("speaking");

        const assistantMsg = {
          id: `jarvis-${Date.now()}`,
          role: "assistant",
          content: `[PHASE 1 SIMULATION] Received instruction: "${content}". Cognitive parsing and state engine functional. Real OpenAI/Agents SDK connectivity is deferred to Phase 2.`,
          timestamp: Date.now(),
          status: "completed",
        };

        setMessages((prev) => [...prev, assistantMsg]);

        activityLogger.logEvent({
          category: "ai",
          title: "Simulation Response Generated",
          description: "Visualizer & conversation stream successfully cycled through state transitions.",
          level: "success",
        });

        setTimeout(() => {
          onStateChange("idle");
          setIsProcessing(false);
        }, 1800);
      }, 1000);
    },
    [isProcessing, onStateChange]
  );

  return {
    messages,
    sendMessage,
    isProcessing,
  };
}
