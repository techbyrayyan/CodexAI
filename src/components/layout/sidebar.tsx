"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, Shield, Terminal } from "lucide-react";
import { navigationItems } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col h-screen border-r border-zinc-850/80 bg-black/90 backdrop-blur-xl transition-all duration-300 z-30 shrink-0 select-none",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-850">
        <Link href="/" className="flex items-center gap-3 overflow-hidden">
          <div className="relative h-8 w-8 rounded-lg bg-zinc-900 border border-emerald-500/40 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
            <div className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-mono font-bold text-sm tracking-wider text-white flex items-center gap-1.5">
                {siteConfig.name}
                <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  CORE
                </span>
              </span>
              <span className="text-[10px] font-mono text-zinc-500 tracking-tight">
                {siteConfig.releaseStage}
              </span>
            </div>
          )}
        </Link>

        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.title : undefined}
              className={cn(
                "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150",
                isActive
                  ? "bg-zinc-900 text-emerald-400 border border-emerald-500/30 shadow-[inset_0_1px_0_0_rgba(16,185,129,0.2)]"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  isActive
                    ? "text-emerald-400"
                    : "text-zinc-500 group-hover:text-zinc-300"
                )}
              />

              {!collapsed && (
                <div className="flex-1 flex items-center justify-between">
                  <span>{item.title}</span>
                  {item.badge && (
                    <Badge variant="outline" className="text-[9px] py-0 px-1.5">
                      {item.badge}
                    </Badge>
                  )}
                </div>
              )}

              {/* Active bar indicator */}
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-emerald-500" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / System Status Pin */}
      <div className="p-3 border-t border-zinc-850">
        {!collapsed ? (
          <div className="p-2.5 rounded-xl border border-zinc-850 bg-zinc-950/80">
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <span>ONLINE</span>
              </span>
              <span className="text-zinc-500">v1.0.0</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" title="Online" />
          </div>
        )}
      </div>
    </aside>
  );
}
