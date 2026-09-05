"use client";

import * as React from "react";
import { ChatMessage } from "@/components/chat/conversation-panel";
import { JarvisState } from "@/ai/types";
import { activityLogger } from "@/services/activity-logger";

const initialMessages: ChatMessage[] = [
  {
    id: "msg-001",
    role: "assistant",
    content: "JARVIS Core online. Cognitive reasoning engine and OpenAI agent architecture operational. How may I assist you, operator?",
    timestamp: 1725528000000,
    status: "completed",
  },
];

export function useChat(
  onStateChange: (state: JarvisState) => void,
  onResponseSuccess?: (text: string) => void
) {
  const [messages, setMessages] = React.useState<ChatMessage[]>(initialMessages);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const sendMessage = React.useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || isProcessing) return;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: trimmed,
        timestamp: Date.now(),
        status: "delivered",
      };

      // Add user message to UI immediately
      setMessages((prev) => [...prev, userMsg]);
      setIsProcessing(true);
      onStateChange("thinking");

      activityLogger.logEvent({
        category: "system",
        title: "Operator Command Dispatched",
        description: `Dispatched instruction: "${trimmed.slice(0, 32)}${trimmed.length > 32 ? "..." : ""}"`,
        level: "info",
      });

      // Prepare conversation history (last 10 turns)
      const conversationHistory = messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      try {
        // Transition to processing while request is in flight
        onStateChange("processing");

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: trimmed,
            conversationHistory,
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          const assistantMsg: ChatMessage = {
            id: data.requestId || `jarvis-${Date.now()}`,
            role: "assistant",
            content: data.message,
            timestamp: Date.now(),
            status: "completed",
          };

          setMessages((prev) => [...prev, assistantMsg]);
          onResponseSuccess?.(data.message);

          activityLogger.logEvent({
            category: "ai",
            title: "AI Response Synthesized",
            description: `Cognitive engine responded successfully (${data.usage?.totalTokens ? `${data.usage.totalTokens} tokens` : "OK"}).`,
            level: "success",
          });
        } else {
          const errorMessage =
            data?.error?.message || "JARVIS is currently unavailable. Please check the AI configuration.";

          const errorMsg: ChatMessage = {
            id: `err-${Date.now()}`,
            role: "assistant",
            content: errorMessage,
            timestamp: Date.now(),
            status: "error",
          };

          setMessages((prev) => [...prev, errorMsg]);

          activityLogger.logEvent({
            category: "system",
            title: "Chat Request Failed",
            description: errorMessage,
            level: "error",
          });
        }
      } catch (err) {
        const errorMsg: ChatMessage = {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: "JARVIS could not complete that request. Please check your network connection and try again.",
          timestamp: Date.now(),
          status: "error",
        };

        setMessages((prev) => [...prev, errorMsg]);

        activityLogger.logEvent({
          category: "system",
          title: "Network Connection Failure",
          description: err instanceof Error ? err.message : "Unable to reach server endpoint",
          level: "error",
        });
      } finally {
        onStateChange("idle");
        setIsProcessing(false);
      }
    },
    [isProcessing, messages, onStateChange, onResponseSuccess]
  );

  return {
    messages,
    sendMessage,
    isProcessing,
  };
}
