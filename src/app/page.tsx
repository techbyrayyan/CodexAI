"use client";

import * as React from "react";
import { JarvisCore } from "@/components/visualizer/jarvis-core";
import { CommandInput } from "@/components/command-center/command-input";
import { QuickActions } from "@/components/command-center/quick-actions";
import { ConversationPanel } from "@/components/chat/conversation-panel";
import { SystemStatusPanel } from "@/components/status/system-status-panel";
import { ActivityPanel } from "@/components/activity/activity-panel";
import { useJarvisState } from "@/hooks/useJarvisState";
import { useChat } from "@/hooks/useChat";

export default function CommandCenterPage() {
  const { state, setState } = useJarvisState("idle");
  const { messages, sendMessage, isProcessing } = useChat(setState);

  return (
    <div className="h-full flex flex-col p-4 md:p-6 lg:p-8 space-y-6 overflow-y-auto">
      {/* Top Section: Central AI Core & Command Bar */}
      <div className="flex flex-col items-center justify-center pt-2 pb-4">
        {/* Animated Visualizer Core */}
        <JarvisCore state={state} onStateChange={setState} />

        {/* Central Command Bar */}
        <div className="w-full mt-4">
          <CommandInput
            onSend={sendMessage}
            state={state}
            onStateChange={setState}
            disabled={isProcessing}
          />
        </div>

        {/* Quick Actions Strip */}
        <QuickActions />
      </div>

      {/* Bottom Grid: 3-column / 2-column responsive HUD panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
        {/* Left / Center: Conversation Stream (7 columns on wide desktop) */}
        <div className="lg:col-span-7 h-[420px]">
          <ConversationPanel
            messages={messages}
            jarvisState={state}
            className="h-full shadow-lg"
          />
        </div>

        {/* Right Column: System Status & Activity (5 columns on wide desktop) */}
        <div className="lg:col-span-5 flex flex-col space-y-5">
          {/* Subsystem Health Cards */}
          <SystemStatusPanel />

          {/* Activity Log Stream */}
          <ActivityPanel />
        </div>
      </div>
    </div>
  );
}
