"use client";

import * as React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }) {
  React.useEffect(() => {
    console.error("JARVIS caught application error:", error);
  }, [error]);

  return (
    <div className="h-full flex items-center justify-center p-6 bg-black">
      <div className="max-w-md w-full p-6 rounded-2xl border border-red-500/20 bg-zinc-950/80 backdrop-blur-xl text-center shadow-2xl">
        <div className="mx-auto h-12 w-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
          <AlertTriangle className="h-6 w-6 text-red-400" />
        </div>
        <h2 className="text-base font-semibold text-zinc-100 font-mono uppercase tracking-wider">
          System Anomaly Detected
        </h2>
        <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
          An unexpected interruption occurred during cognitive processing.
          Subsystem safety boundaries preserved system integrity.
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            Reboot Interface
          </Button>
          <Button
            variant="emerald"
            size="sm"
            onClick={() => reset()}
            className="gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry Kernel
          </Button>
        </div>
      </div>
    </div>
  );
}
