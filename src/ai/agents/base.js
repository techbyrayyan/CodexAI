import { logger } from "@/lib/logger";

export class BaseAgent {
  constructor(role, name, description) {
    this.role = role;
    this.name = name;
    this.description = description;
  }

  async process(input, context) {
    throw new Error("process() method must be implemented by concrete agent subclasses");
  }
}

export class JarvisCoreAgent extends BaseAgent {
  constructor() {
    super(
      "orchestrator",
      "JARVIS Core",
      "Primary autonomous orchestrator and cognitive supervisor"
    );
  }

  async process(input, context) {
    logger.info("JarvisCoreAgent processing input", { role: this.role, inputLength: input?.length || 0 });

    return {
      message: {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: `[PHASE 1 FOUNDATION] Operational parameters confirmed. Live OpenAI agent engine deferred to Phase 2. Received: "${input}"`,
        timestamp: Date.now(),
        agentRole: this.role,
      },
      state: "idle",
      suggestedActions: ["System Status", "Tools Registry", "View Activity"],
    };
  }
}
