export type JarvisState = "idle" | "listening" | "thinking" | "processing" | "speaking";

export type AgentRole =
  | "orchestrator"
  | "coder"
  | "researcher"
  | "system"
  | "browser"
  | "memory";

export interface AgentMessage {
  id: string;
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  timestamp: number;
  agentRole?: AgentRole;
  toolCallId?: string;
  metadata?: Record<string, unknown>;
}

export interface AgentContext {
  sessionId: string;
  userId?: string;
  activeRole: AgentRole;
  systemPrompt: string;
  memoryEnabled: boolean;
}

export interface AgentResponse {
  message: AgentMessage;
  state: JarvisState;
  suggestedActions?: string[];
}
