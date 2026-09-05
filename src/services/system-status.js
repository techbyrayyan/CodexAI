export class SystemStatusService {
  static getSystemHealth() {
    const now = Date.now();

    const subsystems = [
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
