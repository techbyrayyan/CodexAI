import { env } from "@/config/env";
import { logger } from "@/lib/logger";

export class LocalAgentClient {
  constructor() {
    this.baseUrl = env.LOCAL_AGENT_URL;
    this.secret = env.LOCAL_AGENT_SECRET;
  }

  async checkHealth() {
    logger.debug("Checking local agent health", { endpoint: this.baseUrl });

    return {
      connected: false,
      os: "windows",
      message: "Local agent offline. Scheduled for Phase 4.",
    };
  }

  async executeCommand(command) {
    logger.warn("Local agent execution blocked (Phase 1 guard)", { action: command.action });

    return {
      success: false,
      error: "Local Windows agent execution is deferred to Phase 4.",
      executionTimeMs: 0,
    };
  }
}

export const localAgentClient = new LocalAgentClient();
