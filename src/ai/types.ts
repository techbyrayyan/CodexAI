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
  requestId?: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

// Phase 2 Chat API Request & Response Contracts
export interface ChatApiMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatApiRequest {
  message: string;
  conversationHistory?: ChatApiMessage[];
}

export interface ChatApiResponse {
  success: true;
  message: string;
  requestId: string;
  agentRole: AgentRole;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

export interface ChatApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
  requestId: string;
}

// Future Tool Calling Contracts (Phase 4 Preparation)
export interface ToolCallRequest {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface ToolCallResult {
  toolCallId: string;
  output?: unknown;
  error?: string;
}

export type AgentExecutionType = "response" | "tool_request" | "tool_result";

export interface AgentExecutionResult {
  type: AgentExecutionType;
  content?: string;
  toolCalls?: ToolCallRequest[];
}

