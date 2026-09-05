import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  variant = "default",
  ...props
}) {
  const variantStyles = {
    default: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    emerald: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]",
    secondary: "bg-zinc-800/80 text-zinc-300 border-zinc-700/50",
    destructive: "bg-red-500/10 text-red-400 border-red-500/20",
    outline: "text-zinc-400 border-zinc-800 bg-transparent",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium font-mono uppercase tracking-wider transition-colors",
        variantStyles[variant] || variantStyles.default,
        className
      )}
      {...props}
    />
  );
}
