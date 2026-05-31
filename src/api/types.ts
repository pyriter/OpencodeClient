// Loose types modeled after opencode's OpenAPI spec at /doc.
// Fields are kept optional where the server may omit them across versions.

export type SessionTime = {
  created: number;
  updated: number;
};

export type Session = {
  id: string;
  title?: string;
  parentID?: string;
  time?: SessionTime;
  share?: { url?: string } | null;
};

export type ModelRef = {
  providerID: string;
  modelID: string;
};

export type TextPart = {
  id?: string;
  type: 'text';
  text: string;
  synthetic?: boolean;
};

export type ReasoningPart = {
  id?: string;
  type: 'reasoning';
  text: string;
};

export type ToolPart = {
  id?: string;
  type: 'tool';
  tool: string;
  state?: {
    status?: 'pending' | 'running' | 'completed' | 'error';
    input?: unknown;
    output?: string;
    title?: string;
    metadata?: Record<string, unknown>;
    error?: string;
  };
  callID?: string;
};

export type FilePart = {
  id?: string;
  type: 'file';
  mime?: string;
  filename?: string;
  url?: string;
  source?: { path?: string };
};

export type StepStartPart = {
  id?: string;
  type: 'step-start';
};

export type StepFinishPart = {
  id?: string;
  type: 'step-finish';
  tokens?: { input?: number; output?: number; reasoning?: number };
  cost?: number;
};

export type Part =
  | TextPart
  | ReasoningPart
  | ToolPart
  | FilePart
  | StepStartPart
  | StepFinishPart
  | { id?: string; type: string; [k: string]: unknown };

export type MessageInfo = {
  id: string;
  sessionID: string;
  role: 'user' | 'assistant' | 'system';
  time?: { created: number; completed?: number };
  model?: ModelRef;
  cost?: number;
  tokens?: { input?: number; output?: number; reasoning?: number };
  error?: { name?: string; message?: string };
};

export type Message = {
  info: MessageInfo;
  parts: Part[];
};

export type PromptBody = {
  messageID?: string;
  model?: ModelRef;
  agent?: string;
  parts: Array<Pick<TextPart, 'type' | 'text'> | Part>;
};

export type ProviderModel = {
  id: string;
  name?: string;
};

export type Provider = {
  id: string;
  name?: string;
  models: Record<string, ProviderModel>;
};

export type ProvidersResponse = {
  providers: Provider[];
  default?: Record<string, string>;
};

// Bus event envelope from /event SSE.
// Shapes verified against opencode v1.15.12.
export type SessionStatus =
  | { type: 'busy' }
  | { type: 'idle' }
  | { type: string };

export type BusEvent =
  | { type: 'server.connected'; properties?: Record<string, never> }
  | { type: 'message.updated'; properties: { sessionID: string; info: MessageInfo } }
  | {
      type: 'message.part.updated';
      properties: { sessionID: string; part: Part & { messageID?: string }; time?: number };
    }
  | {
      type: 'message.part.delta';
      properties: {
        sessionID: string;
        messageID: string;
        partID: string;
        field: string;
        delta: string;
      };
    }
  | { type: 'message.removed'; properties: { sessionID: string; messageID: string } }
  | { type: 'session.updated'; properties: { sessionID: string; info: Session } }
  | { type: 'session.deleted'; properties: { sessionID: string; info: Session } }
  | { type: 'session.status'; properties: { sessionID: string; status: SessionStatus } }
  | { type: string; properties?: Record<string, unknown> };
