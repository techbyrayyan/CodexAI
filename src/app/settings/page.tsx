"use client";

import * as React from "react";
import {
  Settings,
  Sliders,
  Palette,
  Bot,
  Mic,
  Database,
  Shield,
  Layers,
  Terminal,
  Info,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function SettingsPage() {
  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-850">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-wide text-white flex items-center gap-2.5">
            <Settings className="h-5 w-5 text-emerald-400" />
            JARVIS CONFIGURATION & SYSTEM PARAMETERS
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Global environment, AI orchestration rules, security boundaries, and telemetry controls.
          </p>
        </div>

        <Badge variant="emerald">PHASE 1 FOUNDATION</Badge>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="flex flex-wrap max-w-full">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="ai">AI Engine</TabsTrigger>
          <TabsTrigger value="voice">Voice</TabsTrigger>
          <TabsTrigger value="memory">Memory</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="local_agent">Local Agent</TabsTrigger>
        </TabsList>

        {/* 1. General */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Core System Information</CardTitle>
              <CardDescription>Primary operating parameters and system metadata.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-500 block mb-1">INSTANCE IDENTITY</span>
                  <span className="text-zinc-200 font-bold">JARVIS Mark I (Phase 1)</span>
                </div>
                <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-500 block mb-1">KERNEL ARCHITECTURE</span>
                  <span className="text-emerald-400 font-bold">TypeScript / Next.js 16</span>
                </div>
                <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-500 block mb-1">SECURITY TIER</span>
                  <span className="text-zinc-200 font-bold">Strict Sandbox Enforced</span>
                </div>
                <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-500 block mb-1">LOCAL RUNTIME</span>
                  <span className="text-zinc-200 font-bold">Windows x64 (Localhost)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. Appearance */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Interface Aesthetics</CardTitle>
              <CardDescription>Color system, HUD visuals, and density preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-200">Color Direction</span>
                  <Badge variant="emerald">DARK + EMERALD (LOCKED)</Badge>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  The visual scheme is anchored to pure black (#000000), deep charcoal, and
                  emerald green (#10B981) to preserve professional HUD aesthetics without gaming neon noise.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. AI Engine */}
        <TabsContent value="ai">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>OpenAI Agents SDK Integration</CardTitle>
                <CardDescription>Multi-agent cognitive orchestration and tool reasoning pipeline.</CardDescription>
              </div>
              <Badge variant="outline">PHASE 2 DEFERRED</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 opacity-50 pointer-events-none">
                <label className="text-xs font-mono text-zinc-400 block">OPENAI_API_KEY</label>
                <Input type="password" value="sk-placeholder-deferred-to-phase-2" readOnly />
              </div>
              <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-400">
                AI Agent definitions and prompt templates are architecturally arranged in{" "}
                <code className="text-emerald-400 font-mono">src/ai/agents/base.ts</code>.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. Voice */}
        <TabsContent value="voice">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Voice & Realtime Audio Synthesis</CardTitle>
                <CardDescription>Bi-directional low-latency speech synthesis and transcription.</CardDescription>
              </div>
              <Badge variant="outline">PHASE 2 DEFERRED</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-zinc-400 leading-relaxed">
                Realtime WebRTC/Opus streaming specifications are defined in{" "}
                <code className="text-emerald-400 font-mono">src/ai/realtime/types.ts</code>. The
                current microphone button simulates audio listening state without streaming raw audio.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 5. Memory */}
        <TabsContent value="memory">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Long-Term Context Memory</CardTitle>
                <CardDescription>PostgreSQL relational storage & vector similarity index.</CardDescription>
              </div>
              <Badge variant="outline">PHASE 2 DEFERRED</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-zinc-400 leading-relaxed">
                Prisma schema models (<code className="text-emerald-400 font-mono">prisma/schema.prisma</code>)
                and memory contracts (<code className="text-emerald-400 font-mono">src/ai/memory/types.ts</code>)
                are established for future vector embeddings.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 6. Security */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security & Tool Execution Boundaries</CardTitle>
              <CardDescription>Strict permission management and human verification policy.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-zinc-200 block">Human Operator Confirmation</span>
                  <span className="text-zinc-400 text-[11px]">Require manual confirmation for sensitive tools</span>
                </div>
                <Badge variant="emerald">ALWAYS REQUIRED</Badge>
              </div>

              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-zinc-200 block">Local Command Access</span>
                  <span className="text-zinc-400 text-[11px]">Unrestricted shell execution status</span>
                </div>
                <Badge variant="destructive">BLOCKED IN PHASE 1</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 7. Integrations */}
        <TabsContent value="integrations">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>External Service Connectors</CardTitle>
                <CardDescription>GitHub, WhatsApp, Email, and Calendar integrations.</CardDescription>
              </div>
              <Badge variant="outline">PHASE 3/4 DEFERRED</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-zinc-400 leading-relaxed">
                No external API tokens or credentials are live in Phase 1. Connectors will be
                added in subsequent phases behind user authorization.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 8. Local Agent */}
        <TabsContent value="local_agent">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Python Local Windows Agent</CardTitle>
                <CardDescription>Local automation bridge for Windows OS operations.</CardDescription>
              </div>
              <Badge variant="secondary">DISCONNECTED (PHASE 4)</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 opacity-60">
                <label className="text-xs font-mono text-zinc-400 block">LOCAL_AGENT_URL</label>
                <Input value="http://127.0.0.1:8765" readOnly />
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                The client communication contract (<code className="text-emerald-400 font-mono">src/services/local-agent.ts</code>)
                is structured to connect with a future Python service over HTTP/WebSocket with HMAC authentication.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
