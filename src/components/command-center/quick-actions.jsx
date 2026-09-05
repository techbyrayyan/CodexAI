"use client";

import * as React from "react";
import {
  MessageSquare,
  Globe,
  Code2,
  FolderKanban,
  Activity,
  CheckSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { toolRegistry } from "@/tools/registry";

export function QuickActions() {
  const [selectedTool, setSelectedTool] = React.useState(null);

  const actions = [
    {
      id: "ask_jarvis",
      label: "Ask JARVIS",
      icon: MessageSquare,
      toolKey: "ask_jarvis",
    },
    {
      id: "search_web",
      label: "Search Web",
      icon: Globe,
      toolKey: "search_web",
    },
    {
      id: "analyze_code",
      label: "Analyze Code",
      icon: Code2,
      toolKey: "analyze_code",
    },
    {
      id: "open_project",
      label: "Open Project",
      icon: FolderKanban,
      toolKey: "open_project",
    },
    {
      id: "system_status",
      label: "System Status",
      icon: Activity,
      toolKey: "system_status",
    },
    {
      id: "create_task",
      label: "Create Task",
      icon: CheckSquare,
      toolKey: "create_task",
    },
  ];

  const handleActionClick = (toolKey) => {
    const def = toolRegistry[toolKey];
    if (def) {
      setSelectedTool(def);
    }
  };

  return (
    <>
      <div className="w-full max-w-3xl mx-auto mt-4">
        <div className="flex items-center gap-2 mb-2 px-1">
          <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 font-semibold">
            Quick Actions
          </span>
          <div className="h-[1px] flex-1 bg-zinc-850" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {actions.map((act) => {
            const Icon = act.icon;
            const def = toolRegistry[act.toolKey];
            const isImplemented = def?.isImplemented ?? false;

            return (
              <button
                key={act.id}
                type="button"
                onClick={() => handleActionClick(act.toolKey)}
                className="group relative flex flex-col items-center justify-center p-3 rounded-xl border border-zinc-850/80 bg-zinc-950/40 hover:bg-zinc-900/60 hover:border-emerald-500/40 transition-all duration-200 text-center"
              >
                <div className="p-2 rounded-lg bg-zinc-900 group-hover:bg-emerald-500/10 transition-colors">
                  <Icon className="h-4 w-4 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
                </div>
                <span className="mt-2 text-xs font-medium text-zinc-300 group-hover:text-white transition-colors">
                  {act.label}
                </span>

                {!isImplemented && (
                  <span className="absolute top-1.5 right-1.5 flex h-1.5 w-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-600 group-hover:bg-emerald-400/60" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <Modal
        isOpen={Boolean(selectedTool)}
        onClose={() => setSelectedTool(null)}
        title={selectedTool?.displayName || "Tool Specification"}
        description={selectedTool?.description}
        footer={
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedTool(null)}
          >
            Acknowledge
          </Button>
        }
      >
        {selectedTool && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-800 bg-zinc-900/60">
              <span className="text-xs text-zinc-400">Implementation Scope</span>
              <div className="flex items-center gap-2">
                <Badge variant={selectedTool.isImplemented ? "emerald" : "secondary"}>
                  {selectedTool.isImplemented ? "Active" : selectedTool.phaseTarget}
                </Badge>
                <Badge variant="outline">
                  {selectedTool.permissionLevel.toUpperCase()}
                </Badge>
              </div>
            </div>

            <div>
              <span className="text-xs font-mono uppercase text-zinc-400 block mb-2">
                Expected Parameter Schema:
              </span>
              <pre className="p-3 rounded-lg bg-black border border-zinc-800 text-[11px] font-mono text-emerald-400 overflow-x-auto">
                {JSON.stringify(selectedTool.parameters, null, 2)}
              </pre>
            </div>

            <div className="text-xs text-zinc-400 leading-relaxed bg-zinc-900/40 p-3 rounded-lg border border-zinc-850">
              <p>
                <strong>Phase 1 Architecture Policy:</strong> External tool execution,
                file operations, and browser automation are deferred to safeguard system
                stability until permission gates and local agents are certified.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
