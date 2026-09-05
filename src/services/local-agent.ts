import { env } from "@/config/env";
import { logger } from "@/lib/logger";

export interface LocalAgentCommand {
  action: "shell_exec" | "window_focus" | "keystroke" | "file_read" | "file_write";
  params: Record<string, unknown>;
  timeoutMs?: number;
}

export interface LocalAgentResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  executionTimeMs: number;
}

export interface LocalAgentHealth {
  connected: boolean;
  version?: string;
  os: "windows" | "unknown";
  uptimeSeconds?: number;
  message: string;
}

/**
 * Client interface for communicating with the future Python Windows Local Automation Agent.
 * In Phase 1, all automation endpoints are strictly disconnected.
 */
export class LocalAgentClient {
  private readonly baseUrl: string;
  private readonly secret?: string;

  constructor() {
    this.baseUrl = env.LOCAL_AGENT_URL;
    this.secret = env.LOCAL_AGENT_SECRET;
  }

  /**
   * Evaluates the connectivity of the local Windows Python service.
   * Phase 1 returns clean disconnected status without throwing or hanging.
   */
  async checkHealth(): Promise<LocalAgentHealth> {
    logger.debug("Checking local agent health", { endpoint: this.baseUrl });

    return {
      connected: false,
      os: "windows",
      message: "Local agent offline. Scheduled for Phase 4.",
    };
  }

  /**
   * Dispatches a command to the local Python agent.
   * Strictly guarded in Phase 1.
   */
  async executeCommand<T = unknown>(command: LocalAgentCommand): Promise<LocalAgentResponse<T>> {
    logger.warn("Local agent execution blocked (Phase 1 guard)", { action: command.action });

    return {
      success: false,
      error: "Local Windows agent execution is deferred to Phase 4.",
      executionTimeMs: 0,
    };
  }
}

export const localAgentClient = new LocalAgentClient();
