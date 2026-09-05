"use client";

import * as React from "react";
import { MessageSquare, Database } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ConversationsPage() {
  const mockSessions = [
    {
      id: "sess-01",
      title: "Initial System Setup & Diagnostics",
      lastMessage: "Foundation parameters verified. Kernel online.",
      date: "Today, 12:40 PM",
      messageCount: 8,
      status: "archived",
    },
    {
      id: "sess-02",
      title: "Architecture Review & Tool Registry",
      lastMessage: "Tool permissions locked to read-only sandbox.",
      date: "Today, 11:15 AM",
      messageCount: 4,
      status: "active",
    },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-850">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-wide text-white flex items-center gap-2.5">
            <MessageSquare className="h-5 w-5 text-emerald-400" />
            CONVERSATION ARCHIVE
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Historical cognitive threads and multi-turn context retention.
          </p>
        </div>

        <Badge variant="emerald">PRISMA SCHEMA PREPARED</Badge>
      </div>

      {/* Architecture Notice */}
      <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/60 flex items-start gap-3">
        <Database className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs text-zinc-400 space-y-1">
          <span className="font-semibold text-zinc-200 block">
            Persistence Foundation (Phase 1):
          </span>
          <p>
            The database schema for `Conversation` and `Message` tables is ready in{" "}
            <code className="font-mono text-emerald-400">prisma/schema.prisma</code>. Live
            PostgreSQL persistence will be activated in Phase 2 alongside session indexing.
          </p>
        </div>
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockSessions.map((s) => (
          <Card key={s.id} className="hover:border-zinc-700 transition-colors">
            <CardHeader className="p-4 flex flex-row items-center justify-between">
              <span className="text-xs font-mono text-zinc-500">{s.id}</span>
              <Badge variant="outline" className="text-[10px]">
                {s.status.toUpperCase()}
              </Badge>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2">
              <h3 className="font-semibold text-sm text-zinc-200">{s.title}</h3>
              <p className="text-xs text-zinc-400 line-clamp-1">{s.lastMessage}</p>
              <div className="flex items-center justify-between pt-2 text-[11px] font-mono text-zinc-500">
                <span>{s.date}</span>
                <span>{s.messageCount} turns</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
