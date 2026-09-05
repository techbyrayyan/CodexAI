import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "secondary" | "danger" | "emerald";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98] select-none";

    const variantStyles = {
      default:
        "bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border border-zinc-800 hover:border-zinc-700 shadow-sm",
      emerald:
        "bg-emerald-600 hover:bg-emerald-500 text-black font-semibold border border-emerald-400/40 shadow-[0_0_15px_rgba(16,185,129,0.25)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]",
      outline:
        "border border-zinc-800 hover:border-zinc-700 bg-transparent hover:bg-zinc-900/60 text-zinc-300 hover:text-white",
      ghost:
        "hover:bg-zinc-850 text-zinc-400 hover:text-zinc-100 bg-transparent",
      secondary:
        "bg-zinc-800/80 hover:bg-zinc-750 text-zinc-200 border border-zinc-700/40",
      danger:
        "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/30",
    };

    const sizeStyles = {
      sm: "text-xs px-2.5 py-1.5 gap-1.5",
      md: "text-sm px-3.5 py-2 gap-2",
      lg: "text-base px-5 py-2.5 gap-2.5",
      icon: "h-9 w-9 p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
