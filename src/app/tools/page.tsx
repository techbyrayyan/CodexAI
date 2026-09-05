"use client";

import * as React from "react";
import { Wrench, Shield, Check, AlertTriangle, Eye } from "lucide-react";
import { toolRegistry } from "@/tools/registry";
import { ToolDefinition } from "@/tools/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export default function ToolsPage() {
  const [selectedTool, setSelectedTool] = React.useState<ToolDefinition | null>(null);
  const tools = Object.values(toolRegistry);

  const getPermissionBadge = (level: ToolDefinition["permissionLevel"]) => {
    switch (level) {
      case "read":
        return <Badge variant="secondary">READ-ONLY</Badge>;
      case "write":
        return <Badge variant="amber">WRITE</Badge>;
      case "sensitive":
      case "admin":
        return <Badge variant="destructive">SENSITIVE</Badge>;
      default:
        return <Badge variant="outline">{level}</Badge>;
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-850">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-wide text-white flex items-center gap-2.5">
            <Wrench className="h-5 w-5 text-emerald-400" />
            TOOL REGISTRY & CAPABILITY CATALOG
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Registered tool interfaces, strict security parameters, and permission gates.
          </p>
        </div>

        <Badge variant="emerald">{tools.length} TOOLS DEFINED</Badge>
      </div>

      {/* Security sandbox announcement */}
      <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/60 flex items-start gap-3">
        <Shield className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs text-zinc-400 space-y-1">
          <span className="font-semibold text-zinc-200 block">
            Security Sandbox Architecture:
          </span>
          <p>
            Every future tool adheres to typed input schemas, execution timeouts, and permission
            tiers. Tools classified as <strong className="text-red-400">SENSITIVE</strong> (such as
            terminal execution or browser control) mandate explicit human authorization before
            dispatch.
          </p>
        </div>
      </div>

      {/* Tools Table / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tools.map((tool) => (
          <Card key={tool.name} className="hover:border-zinc-700 transition-colors">
            <CardHeader className="p-4 flex flex-row items-center justify-between border-b border-zinc-850">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-zinc-100 font-mono">
                  {tool.displayName}
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  ({tool.name})
                </span>
              </div>
              <div className="flex items-center gap-2">
                {getPermissionBadge(tool.permissionLevel)}
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-3">
              <p className="text-xs text-zinc-400 leading-relaxed">
                {tool.description}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-850/60 text-xs">
                <div className="flex items-center gap-2">
                  <Badge variant={tool.isImplemented ? "emerald" : "outline"} className="text-[10px]">
                    {tool.isImplemented ? "ACTIVE" : tool.phaseTarget}
                  </Badge>
                  {tool.requiresHumanApproval && (
                    <Badge variant="destructive" className="text-[10px]">
                      HUMAN APPROVAL REQUIRED
                    </Badge>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTool(tool)}
                  className="text-xs gap-1.5 text-zinc-400 hover:text-emerald-400"
                >
                  <Eye className="h-3.5 w-3.5" />
                  View Schema
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Schema Inspection Modal */}
      <Modal
        isOpen={Boolean(selectedTool)}
        onClose={() => setSelectedTool(null)}
        title={`${selectedTool?.displayName} (${selectedTool?.name})`}
        description={selectedTool?.description}
        footer={
          <Button variant="outline" size="sm" onClick={() => setSelectedTool(null)}>
            Close
          </Button>
        }
      >
        {selectedTool && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
              <span>CATEGORY: {selectedTool.category.toUpperCase()}</span>
              <span>PERMISSION: {selectedTool.permissionLevel.toUpperCase()}</span>
            </div>
            <pre className="p-4 rounded-xl bg-black border border-zinc-800 text-xs font-mono text-emerald-400 overflow-x-auto">
              {JSON.stringify(selectedTool.parameters, null, 2)}
            </pre>
          </div>
        )}
      </Modal>
    </div>
  );
}
