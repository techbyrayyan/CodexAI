"use client";

import * as React from "react";
import { Activity, Shield, Cpu } from "lucide-react";
import { activityLogger, ActivityCategory, ActivityEvent } from "@/services/activity-logger";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatTimestamp, formatDate, cn } from "@/lib/utils";

export default function FullActivityPage() {
  const [category, setCategory] = React.useState<ActivityCategory | "all">("all");
  const events = React.useMemo<ActivityEvent[]>(
    () => activityLogger.getEvents(50, category === "all" ? undefined : category),
    [category]
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-850">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-wide text-white flex items-center gap-2.5">
            <Activity className="h-5 w-5 text-emerald-400" />
            SYSTEM AUDIT & ACTIVITY LOG
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Cryptographic execution records, tool invocation traces, and security telemetry.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
          {(["all", "system", "security", "ai", "tool"] as (ActivityCategory | "all")[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors",
                category === cat
                  ? "bg-zinc-800 text-emerald-400 border border-emerald-500/20 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events Stream Table */}
      <Card>
        <CardContent className="p-0 divide-y divide-zinc-850/60">
          {events.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500 font-mono">
              No audit logs recorded for category: {category}
            </div>
          ) : (
            events.map((evt) => (
              <div
                key={evt.id}
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-zinc-900/30 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-emerald-400">
                    {evt.category === "security" ? (
                      <Shield className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Cpu className="h-4 w-4 text-zinc-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-zinc-200">
                        {evt.title}
                      </span>
                      <Badge variant="outline" className="text-[9px]">
                        {evt.category.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">{evt.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-center font-mono text-[11px] text-zinc-500">
                  <span suppressHydrationWarning>{formatDate(evt.timestamp)}</span>
                  <span>•</span>
                  <span suppressHydrationWarning>{formatTimestamp(evt.timestamp)}</span>
                  <Badge variant={evt.level === "success" ? "emerald" : "secondary"}>
                    {evt.level.toUpperCase()}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
