import { AgentContext, AgentResponse, AgentRole, JarvisState } from "../types";
import { logger } from "@/lib/logger";

export abstract class BaseAgent {
  public readonly role: AgentRole;
  public readonly name: string;
  public readonly description: string;

  constructor(role: AgentRole, name: string, description: string) {
    this.role = role;
    this.name = name;
    this.description = description;
  }

  abstract process(input: string, context: AgentContext): Promise<AgentResponse>;
}

export class JarvisCoreAgent extends BaseAgent {
  constructor() {
    super(
      "orchestrator",
      "JARVIS Core",
      "Primary autonomous orchestrator and cognitive supervisor"
    );
  }

  async process(input: string, context: AgentContext): Promise<AgentResponse> {
    logger.info("JarvisCoreAgent processing input", {
      role: this.role,
      inputLength: input.length,
      sessionId: context.sessionId,
    });

    // Phase 1 scaffold: Returns structured simulation acknowledging that live LLM agent is deferred
    return {
      message: {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: `[PHASE 1 FOUNDATION] Operational parameters confirmed. Live OpenAI agent engine deferred to Phase 2. Received: "${input}"`,
        timestamp: Date.now(),
        agentRole: this.role,
      },
      state: "idle" as JarvisState,
      suggestedActions: ["System Status", "Tools Registry", "View Activity"],
    };
  }
}
