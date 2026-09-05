"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { navigationItems } from "@/config/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);


  return (
    <header className="h-16 border-b border-zinc-850/80 bg-black/80 backdrop-blur-xl px-4 md:px-6 flex items-center justify-between z-20 shrink-0">
      <div className="flex items-center gap-3 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          className="text-zinc-400 hover:text-white"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono font-bold text-sm tracking-wider text-white">
            JARVIS
          </span>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-4 text-xs font-mono text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-zinc-300 font-semibold">SECURITY:</span>
          <span className="text-emerald-400">SANDBOX ACTIVE</span>
        </div>
        <span className="text-zinc-700">•</span>
        <div className="flex items-center gap-2">
          <span className="text-zinc-500">ENGINE:</span>
          <span className="text-zinc-300">JAVASCRIPT KERNEL</span>
        </div>
        <span className="text-zinc-700">•</span>
        <div className="flex items-center gap-2">
          <span className="text-zinc-500">STAGE:</span>
          <span className="text-zinc-400">PHASE 1 FOUNDATION</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="emerald" className="hidden sm:inline-flex">
          CORE READY
        </Badge>
        <Badge variant="outline" className="text-zinc-400 font-mono">
          DESKTOP HUD
        </Badge>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 top-16 z-50 bg-black/95 backdrop-blur-2xl md:hidden flex flex-col p-4">
          <nav className="flex-1 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                    isActive
                      ? "bg-zinc-900 text-emerald-400 border border-emerald-500/30"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="flex-1">{item.title}</span>
                  {item.badge && (
                    <Badge variant="outline" className="text-[10px]">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-zinc-850 text-xs font-mono text-zinc-500 flex items-center justify-between">
            <span>JARVIS SYSTEM v1.0.0</span>
            <span className="text-emerald-400">OPERATIONAL</span>
          </div>
        </div>
      )}
    </header>
  );
}
