"use client";

import * as React from "react";
import { Activity, Shield, Terminal, Cpu } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { activityLogger, ActivityCategory, ActivityEvent } from "@/services/activity-logger";
import { cn, formatTimestamp } from "@/lib/utils";

export function ActivityPanel({ className }: { className?: string }) {
  const [activeCategory, setActiveCategory] = React.useState<ActivityCategory | "all">("all");
  const [events, setEvents] = React.useState<ActivityEvent[]>([]);

  React.useEffect(() => {
    const fetchEvents = () => {
      const data = activityLogger.getEvents(
        15,
        activeCategory === "all" ? undefined : activeCategory
      );
      setEvents(data);
    };

    fetchEvents();
    const interval = setInterval(fetchEvents, 3000);
    return () => clearInterval(interval);
  }, [activeCategory]);

  const getEventIcon = (event: ActivityEvent) => {
    switch (event.category) {
      case "security":
        return <Shield className="h-3.5 w-3.5 text-emerald-400" />;
      case "tool":
        return <Terminal className="h-3.5 w-3.5 text-emerald-400" />;
      case "system":
      default:
        return <Cpu className="h-3.5 w-3.5 text-zinc-400" />;
    }
  };

  return (
    <Card className={cn("flex flex-col bg-zinc-950/60 border-zinc-800/80 backdrop-blur-md overflow-hidden", className)}>
      <CardHeader className="py-3 px-4 flex flex-row items-center justify-between border-b border-zinc-850">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-emerald-400" />
          <CardTitle className="text-xs uppercase font-mono tracking-wider text-zinc-200">
            Activity Stream
          </CardTitle>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1">
          {(["all", "system", "security", "tool"] as (ActivityCategory | "all")[]).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider transition-colors",
                activeCategory === cat
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-0 overflow-y-auto max-h-[320px] divide-y divide-zinc-850/50">
        {events.length === 0 ? (
          <div className="p-4 text-center text-xs text-zinc-500 font-mono">
            No events recorded in this scope.
          </div>
        ) : (
          events.map((evt) => (
            <div
              key={evt.id}
              className="p-3 hover:bg-zinc-900/40 transition-colors flex items-start gap-3 text-xs"
            >
              <div className="mt-0.5 p-1 rounded bg-zinc-900 border border-zinc-800 shrink-0">
                {getEventIcon(evt)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-zinc-200 truncate">
                    {evt.title}
                  </span>
                  <span suppressHydrationWarning className="text-[10px] font-mono text-zinc-500 shrink-0">
                    {formatTimestamp(evt.timestamp)}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
                  {evt.description}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
