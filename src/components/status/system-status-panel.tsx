"use client";

import * as React from "react";
import { Activity, WifiOff, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SubsystemStatus, SystemStatusService } from "@/services/system-status";
import { cn } from "@/lib/utils";

// Stable initial health state for SSR and initial client hydration matching
const INITIAL_HEALTH: FullSystemHealth = {
  overall: "OPERATIONAL",
  timestamp: 0,
  subsystems: [
    {
      id: "jarvis_core",
      name: "JARVIS Core",
      code: "READY",
      label: "Foundation Ready",
      description: "Primary orchestrator, state machine, and command HUD initialized.",
      lastChecked: 0,
    },
    {
      id: "ai_engine",
      name: "AI Engine",
      code: "READY",
      label: "Live AI Reasoning",
      description: "Primary conversational reasoning engine active.",
      lastChecked: 0,
    },
    {
      id: "voice_engine",
      name: "Voice Engine",
      code: "READY",
      label: "Gemini Live Voice Active",
      description: "Realtime bidirectional audio engine active.",
      lastChecked: 0,
    },
    {
      id: "memory_subsystem",
      name: "Memory",
      code: "NOT_CONNECTED",
      label: "Not Connected",
      description: "PostgreSQL & vector memory persistence (Phase 2).",
      lastChecked: 0,
    },
    {
      id: "local_agent",
      name: "Local Agent",
      code: "NOT_CONNECTED",
      label: "Not Connected",
      description: "Python-based Windows automation service (Phase 4).",
      lastChecked: 0,
    },
    {
      id: "browser_agent",
      name: "Browser Agent",
      code: "COMING_SOON",
      label: "Coming Soon",
      description: "Autonomous browser session controller (Phase 3).",
      lastChecked: 0,
    },
  ],
};

export function SystemStatusPanel({ className }: { className?: string }) {
  const [health, setHealth] = React.useState<FullSystemHealth>(INITIAL_HEALTH);

  React.useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.subsystems) {
          setHealth({
            overall: data.status || "OPERATIONAL",
            timestamp: data.timestamp || Date.now(),
            subsystems: data.subsystems,
          });
        }
      })
      .catch(() => {});
  }, []);

  const getStatusBadge = (status: SubsystemStatus) => {
    switch (status.code) {
      case "READY":
        return (
          <Badge variant="emerald" className="gap-1" suppressHydrationWarning>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {status.label}
          </Badge>
        );
      case "NOT_CONNECTED":
        return (
          <Badge variant="secondary" className="gap-1 text-zinc-400" suppressHydrationWarning>
            <WifiOff className="h-3 w-3 text-zinc-500" />
            {status.label}
          </Badge>
        );
      case "COMING_SOON":
        return (
          <Badge variant="outline" className="gap-1 text-zinc-500" suppressHydrationWarning>
            <Clock className="h-3 w-3" />
            {status.label}
          </Badge>
        );
      default:
        return <Badge variant="outline" suppressHydrationWarning>{status.label}</Badge>;
    }
  };

  return (
    <Card className={cn("bg-zinc-950/60 border-zinc-800/80 backdrop-blur-md", className)} suppressHydrationWarning>
      <CardHeader className="py-3 px-4 flex flex-row items-center justify-between border-b border-zinc-850">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-emerald-400" />
          <CardTitle className="text-xs uppercase font-mono tracking-wider text-zinc-200">
            System Diagnostics
          </CardTitle>
        </div>
        <Badge variant="emerald" className="text-[10px]" suppressHydrationWarning>
          {health.overall}
        </Badge>
      </CardHeader>

      <CardContent className="p-3 divide-y divide-zinc-850/60">
        {health.subsystems.map((sub) => (
          <div
            key={sub.id}
            className="py-2.5 first:pt-1 last:pb-1 flex items-start justify-between gap-3 text-xs"
          >
            <div className="space-y-0.5">
              <div className="font-medium text-zinc-200 flex items-center gap-2">
                <span>{sub.name}</span>
              </div>
              <p className="text-[11px] text-zinc-500 leading-tight" suppressHydrationWarning>
                {sub.description}
              </p>
            </div>
            <div className="shrink-0">{getStatusBadge(sub)}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
