"use client";

import * as React from "react";
import { Activity, ShieldCheck, WifiOff, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SubsystemStatus, SystemStatusService } from "@/services/system-status";
import { cn } from "@/lib/utils";

export function SystemStatusPanel({ className }: { className?: string }) {
  const [health] = React.useState(() => SystemStatusService.getSystemHealth());

  const getStatusBadge = (status: SubsystemStatus) => {
    switch (status.code) {
      case "READY":
        return (
          <Badge variant="emerald" className="gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {status.label}
          </Badge>
        );
      case "NOT_CONNECTED":
        return (
          <Badge variant="secondary" className="gap-1 text-zinc-400">
            <WifiOff className="h-3 w-3 text-zinc-500" />
            {status.label}
          </Badge>
        );
      case "COMING_SOON":
        return (
          <Badge variant="outline" className="gap-1 text-zinc-500">
            <Clock className="h-3 w-3" />
            {status.label}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status.label}</Badge>;
    }
  };

  return (
    <Card className={cn("bg-zinc-950/60 border-zinc-800/80 backdrop-blur-md", className)}>
      <CardHeader className="py-3 px-4 flex flex-row items-center justify-between border-b border-zinc-850">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-emerald-400" />
          <CardTitle className="text-xs uppercase font-mono tracking-wider text-zinc-200">
            System Diagnostics
          </CardTitle>
        </div>
        <Badge variant="emerald" className="text-[10px]">
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
              <p className="text-[11px] text-zinc-500 leading-tight">
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
