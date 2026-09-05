const BASE_TIME = 1725528000000;

const initialEvents = [
  {
    id: "evt-001",
    category: "system",
    title: "JARVIS Core Initialized",
    description: "Core kernel and state machine booted in Phase 1 mode.",
    level: "success",
    timestamp: BASE_TIME - 1000 * 60 * 8,
  },
  {
    id: "evt-002",
    category: "system",
    title: "Interface Shell Mounted",
    description: "High-density HUD and responsive layout activated.",
    level: "info",
    timestamp: BASE_TIME - 1000 * 60 * 5,
  },
  {
    id: "evt-003",
    category: "security",
    title: "Security Sandbox Verified",
    description: "Tool permissions locked. External command guards operational.",
    level: "success",
    timestamp: BASE_TIME - 1000 * 60 * 2,
  },
  {
    id: "evt-004",
    category: "system",
    title: "System Ready",
    description: "Command Center standing by for user instructions.",
    level: "info",
    timestamp: BASE_TIME - 1000 * 20,
  },
];

class ActivityLogService {
  constructor() {
    this.events = [...initialEvents];
  }

  getEvents(limit = 20, category) {
    let filtered = this.events;
    if (category) {
      filtered = filtered.filter((e) => e.category === category);
    }
    return filtered.slice(0, limit);
  }

  logEvent(event) {
    const newEvent = {
      ...event,
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
    };
    this.events.unshift(newEvent);
    return newEvent;
  }
}

export const activityLogger = new ActivityLogService();
