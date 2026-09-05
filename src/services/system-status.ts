export type SubsystemStatusCode = "READY" | "NOT_CONNECTED" | "COMING_SOON" | "DEGRADED" | "ERROR";

export interface SubsystemStatus {
  id: string;
  name: string;
  code: SubsystemStatusCode;
  label: string;
  description: string;
  lastChecked: number;
}

export interface FullSystemHealth {
  overall: "OPERATIONAL" | "INITIALIZING" | "OFFLINE";
  timestamp: number;
  subsystems: SubsystemStatus[];
}

export class SystemStatusService {
  /**
   * Returns the exact, truthful operational status of all JARVIS subsystems.
   * Phase 1 clearly indicates that core foundation is ready, while dependent
   * external engines are disconnected or coming soon.
   */
  static getSystemHealth(): FullSystemHealth {
    const now = Date.now();

    const subsystems: SubsystemStatus[] = [
      {
        id: "jarvis_core",
        name: "JARVIS Core",
        code: "READY",
        label: "Foundation Ready",
        description: "Primary orchestrator, state machine, and command HUD initialized.",
        lastChecked: now,
      },
      {
        id: "ai_engine",
        name: "AI Engine",
        code: "NOT_CONNECTED",
        label: "Not Connected",
        description: "OpenAI Agents SDK and LLM reasoning pipeline (Phase 2).",
        lastChecked: now,
      },
      {
        id: "voice_engine",
        name: "Voice Engine",
        code: "NOT_CONNECTED",
        label: "Not Connected",
        description: "Realtime WebRTC/audio streaming synthesizer (Phase 2).",
        lastChecked: now,
      },
      {
        id: "memory_subsystem",
        name: "Memory",
        code: "NOT_CONNECTED",
        label: "Not Connected",
        description: "PostgreSQL & vector memory persistence (Phase 2).",
        lastChecked: now,
      },
      {
        id: "local_agent",
        name: "Local Agent",
        code: "NOT_CONNECTED",
        label: "Not Connected",
        description: "Python-based Windows automation service (Phase 4).",
        lastChecked: now,
      },
      {
        id: "browser_agent",
        name: "Browser Agent",
        code: "COMING_SOON",
        label: "Coming Soon",
        description: "Autonomous browser session controller (Phase 3).",
        lastChecked: now,
      },
    ];

    return {
      overall: "OPERATIONAL",
      timestamp: now,
      subsystems,
    };
  }
}
