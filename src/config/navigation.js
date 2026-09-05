import {
  Cpu,
  MessageSquare,
  CheckSquare,
  Wrench,
  Activity,
  Settings,
} from "lucide-react";

export const navigationItems = [
  {
    title: "Command Center",
    href: "/",
    icon: Cpu,
    status: "ready",
    description: "Central AI HUD and primary operational interface",
  },
  {
    title: "Conversations",
    href: "/conversations",
    icon: MessageSquare,
    status: "preview",
    description: "Session history and structured conversation memory",
  },
  {
    title: "Tasks",
    href: "/tasks",
    icon: CheckSquare,
    badge: "Soon",
    status: "coming-soon",
    description: "Autonomous task queue and execution scheduler",
  },
  {
    title: "Tools Registry",
    href: "/tools",
    icon: Wrench,
    status: "ready",
    description: "Registered capability catalog and security boundaries",
  },
  {
    title: "Activity Log",
    href: "/activity",
    icon: Activity,
    status: "ready",
    description: "System audit stream and execution telemetry",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    status: "ready",
    description: "Core parameters, engine switches, and authentication",
  },
];
