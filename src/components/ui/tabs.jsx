"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const TabsContext = React.createContext(null);

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  children,
  className,
}) {
  const [selected, setSelected] = React.useState(value || defaultValue || "");

  const onSelectTab = (tab) => {
    if (!value) setSelected(tab);
    onValueChange?.(tab);
  };

  const currentTab = value !== undefined ? value : selected;

  return (
    <TabsContext.Provider value={{ selectedTab: currentTab, onSelectTab }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, children }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-lg bg-zinc-900/90 p-1 border border-zinc-800 text-zinc-400",
        className
      )}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, className }) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used within Tabs");

  const isSelected = context.selectedTab === value;

  return (
    <button
      type="button"
      onClick={() => context.onSelectTab(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200 focus:outline-none",
        isSelected
          ? "bg-zinc-800 text-emerald-400 shadow-sm border border-emerald-500/20"
          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850",
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className }) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be used within Tabs");

  if (context.selectedTab !== value) return null;

  return <div className={cn("mt-4 focus:outline-none", className)}>{children}</div>;
}
