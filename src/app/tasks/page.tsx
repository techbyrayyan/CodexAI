"use client";

import * as React from "react";
import { CheckSquare, Clock, Layers } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function TasksPage() {
  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-850">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-wide text-white flex items-center gap-2.5">
            <CheckSquare className="h-5 w-5 text-emerald-400" />
            AUTONOMOUS TASK SCHEDULER
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Multi-step execution queue for scheduled and background workflows.
          </p>
        </div>

        <Badge variant="outline" className="text-zinc-400">
          SCHEDULED FOR PHASE 3
        </Badge>
      </div>

      {/* Overview Card */}
      <Card>
        <CardContent className="p-8 text-center space-y-4">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <Layers className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-zinc-100 font-mono uppercase">
              Task Queue Engine Offline
            </h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto mt-1 leading-relaxed">
              Autonomous execution and task dispatch requires the AI reasoning pipeline and
              permission gates. The `Task` entity model is prepared in the database layer.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-400">
            <Clock className="h-3.5 w-3.5 text-emerald-400" />
            <span>Planned Capabilities: Cron triggers, multi-agent dispatch, human review gates</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
