"use client";

import * as React from "react";
import { Bot, User, CheckCheck, Terminal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn, formatTimestamp } from "@/lib/utils";

export function ConversationPanel({
  messages,
  jarvisState,
  className,
}) {
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, jarvisState]);

  return (
    <Card className={cn("flex flex-col h-full bg-zinc-950/60 border-zinc-800/80 backdrop-blur-md overflow-hidden", className)}>
      <CardHeader className="py-3 px-4 flex flex-row items-center justify-between border-b border-zinc-850">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-emerald-400" />
          <CardTitle className="text-xs uppercase font-mono tracking-wider text-zinc-200">
            Cognitive Stream
          </CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="emerald" className="text-[10px] py-0 px-2">
            SIMULATION MODE
          </Badge>
        </div>
      </CardHeader>

      <CardContent
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 text-sm font-sans"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="h-12 w-12 rounded-full border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-center">
              <Terminal className="h-5 w-5 text-emerald-400/80" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-300">
                Command Stream Standing By
              </p>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm">
                Enter an instruction or prompt below. In Phase 1, the response pipeline
                demonstrates state transitions and event telemetry.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id}
                className={cn(
                  "flex items-start gap-3 text-xs leading-relaxed transition-all duration-200",
                  isUser ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div
                  className={cn(
                    "h-7 w-7 rounded-lg flex items-center justify-center shrink-0 border",
                    isUser
                      ? "bg-zinc-800 border-zinc-700 text-zinc-300"
                      : "bg-emerald-950/60 border-emerald-500/40 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                  )}
                >
                  {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                </div>

                <div
                  className={cn(
                    "max-w-[80%] rounded-xl p-3 border",
                    isUser
                      ? "bg-zinc-900 border-zinc-800 text-zinc-200"
                      : "bg-zinc-950/90 border-zinc-800/90 text-zinc-300 shadow-sm"
                  )}
                >
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <span className="font-mono font-semibold text-[10px] tracking-wider uppercase text-zinc-400">
                      {isUser ? "Operator" : "JARVIS Core"}
                    </span>
                    <span suppressHydrationWarning className="text-[10px] font-mono text-zinc-500">
                      {formatTimestamp(msg.timestamp)}
                    </span>
                  </div>

                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  <div className="mt-2 flex items-center justify-end gap-1.5 text-[10px] font-mono text-zinc-500">
                    <CheckCheck className="h-3 w-3 text-emerald-500" />
                    <span>{msg.status}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {(jarvisState === "thinking" || jarvisState === "processing") && (
          <div className="flex items-start gap-3 text-xs">
            <div className="h-7 w-7 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 animate-pulse">
              <Bot className="h-3.5 w-3.5" />
            </div>
            <div className="rounded-xl p-3 bg-zinc-950/90 border border-zinc-800 text-zinc-400 flex items-center gap-2">
              <span className="flex gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce" />
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
              </span>
              <span className="font-mono text-[11px] uppercase tracking-wider text-emerald-400">
                {jarvisState === "thinking" ? "Analyzing instruction..." : "Evaluating logic..."}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
