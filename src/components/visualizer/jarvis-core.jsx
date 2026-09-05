"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function JarvisCore({ state, onStateChange, className }) {
  const stateMeta = {
    idle: {
      title: "ONLINE",
      subtext: "Ready",
      color: "#10b981",
      pulseDuration: 4,
      rotateSpeed: 25,
      glowIntensity: "rgba(16, 185, 129, 0.25)",
    },
    listening: {
      title: "LISTENING",
      subtext: "Audio Input Active",
      color: "#22c55e",
      pulseDuration: 1.5,
      rotateSpeed: 15,
      glowIntensity: "rgba(34, 197, 94, 0.45)",
    },
    thinking: {
      title: "THINKING",
      subtext: "Analyzing Parameters",
      color: "#059669",
      pulseDuration: 2,
      rotateSpeed: 8,
      glowIntensity: "rgba(5, 150, 105, 0.4)",
    },
    processing: {
      title: "PROCESSING",
      subtext: "Evaluating Logic",
      color: "#34d399",
      pulseDuration: 1.8,
      rotateSpeed: 10,
      glowIntensity: "rgba(52, 211, 153, 0.35)",
    },
    speaking: {
      title: "SPEAKING",
      subtext: "Synthesizing Output",
      color: "#10b981",
      pulseDuration: 1.2,
      rotateSpeed: 12,
      glowIntensity: "rgba(16, 185, 129, 0.5)",
    },
  };

  const current = stateMeta[state] || stateMeta.idle;
  const barHeights = [24, 38, 55, 72, 45, 68, 85, 92, 78, 60, 48, 65, 80, 52, 35, 20];

  return (
    <div className={cn("relative flex flex-col items-center justify-center p-6 select-none", className)}>
      <motion.div
        animate={{
          scale: state === "listening" || state === "speaking" ? [1, 1.15, 1] : [1, 1.05, 1],
          opacity: state === "thinking" ? [0.3, 0.7, 0.3] : [0.25, 0.45, 0.25],
        }}
        transition={{
          duration: current.pulseDuration,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          boxShadow: `0 0 90px 40px ${current.glowIntensity}`,
        }}
        className="absolute h-56 w-56 rounded-full pointer-events-none"
      />

      <div className="relative h-72 w-72 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: current.rotateSpeed * 1.6, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border border-dashed border-emerald-500/20"
        />

        <svg
          className="absolute inset-2 h-[264px] w-[264px] pointer-events-none"
          viewBox="0 0 200 200"
        >
          <circle
            cx="100"
            cy="100"
            r="94"
            fill="none"
            stroke="rgba(16, 185, 129, 0.15)"
            strokeWidth="1"
            strokeDasharray="4 8"
          />
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="1"
          />
        </svg>

        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: current.rotateSpeed, repeat: Infinity, ease: "linear" }}
          className="absolute h-56 w-56 rounded-full border border-emerald-500/30"
          style={{
            borderTopColor: "rgba(16, 185, 129, 0.8)",
            borderRightColor: "transparent",
            borderBottomColor: "rgba(16, 185, 129, 0.3)",
            borderLeftColor: "transparent",
          }}
        />

        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: current.rotateSpeed * 0.7, repeat: Infinity, ease: "linear" }}
          className="absolute h-44 w-44 rounded-full border border-emerald-400/20"
          style={{
            borderTopColor: "transparent",
            borderLeftColor: "rgba(52, 211, 153, 0.7)",
            borderBottomColor: "transparent",
            borderRightColor: "rgba(16, 185, 129, 0.4)",
          }}
        />

        <div className="absolute h-36 w-36 flex items-center justify-center">
          <div className="flex items-center gap-1">
            {barHeights.slice(0, 10).map((h, idx) => (
              <motion.div
                key={idx}
                animate={
                  state === "speaking"
                    ? { height: [8, h * 0.45, 12, h * 0.3, 8] }
                    : state === "listening"
                    ? { height: [6, 20, 6] }
                    : { height: [4, 8, 4] }
                }
                transition={{
                  duration: state === "speaking" ? 0.6 + (idx % 3) * 0.15 : 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: idx * 0.05,
                }}
                className="w-1 rounded-full bg-emerald-400/70"
                style={{
                  minHeight: "4px",
                }}
              />
            ))}
          </div>
        </div>

        <motion.div
          animate={{
            scale: state === "listening" ? [1, 1.1, 1] : state === "thinking" ? [0.95, 1.05, 0.95] : [1, 1.03, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: current.pulseDuration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative z-10 flex flex-col items-center justify-center h-28 w-28 rounded-full bg-gradient-to-b from-zinc-900 to-black border border-emerald-500/50 shadow-[inset_0_0_20px_rgba(16,185,129,0.3)]"
        >
          <div className="text-center">
            <span className="block font-mono text-[10px] tracking-widest text-emerald-400 font-bold uppercase">
              {current.title}
            </span>
            <span className="block text-xs font-medium text-zinc-300 mt-0.5">
              {current.subtext}
            </span>
          </div>

          <div className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
        </motion.div>
      </div>

      {onStateChange && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-1.5 p-1.5 rounded-xl border border-zinc-850 bg-zinc-950/80 backdrop-blur-md">
          {["idle", "listening", "thinking", "processing", "speaking"].map((s) => {
            const isActive = state === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => onStateChange(s)}
                className={cn(
                  "px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider rounded-lg transition-all duration-150",
                  isActive
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 border border-transparent"
                )}
              >
                {s}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
