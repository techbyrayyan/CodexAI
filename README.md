# JARVIS AI Assistant — Phase 1: Project Foundation & Architecture

> An enterprise-grade, desktop-first personal AI command center inspired by futuristic HUD interfaces (Iron Man JARVIS, Linear, Apple, Vercel).

---

## 1. Project Overview & Scope

JARVIS is engineered to become a full-spectrum personal executive assistant combining voice intelligence, autonomous tool reasoning, computer control, and workflow integrations.

### Phase 1 Focus (Current Phase)
Phase 1 delivers the **clean architectural foundation and premium user interface**:
- **Futuristic Command Center HUD**: Deep space black background (`#000000`), subtle borders, and emerald green (`#10B981`) accents.
- **Animated JARVIS Core Visualizer**: Concentric orbital rings, pulsating energy core, and audio waveform frequencies reacting to 5 states (`idle`, `listening`, `thinking`, `processing`, `speaking`).
- **Interactive State Switcher**: Built-in test controller allowing direct testing and visual verification of all JARVIS states.
- **Cognitive Stream & Chat UI**: Message list, timestamps, typing indicators, auto-scroll, and telemetry log tracking.
- **Truthful System Status**: Real-time inspection of subsystems clearly indicating what is `READY`, `NOT_CONNECTED`, or `COMING_SOON`.
- **Security & Tool Permissions Catalog**: Typed schemas for planned tools with human confirmation gates on sensitive operations.
- **Database Architecture Preparation**: PostgreSQL Prisma schema ready for multi-user context, conversation threads, and tool audits.
- **Local Automation Bridge Contract**: Prepared client architecture for a future Windows Python automation agent.

---

## 2. What Is NOT Implemented in Phase 1

To maintain engineering discipline and prevent untested or hazardous functionality, the following are **intentionally deferred to subsequent phases**:
- ❌ Live OpenAI API calls / LLM responses (Phase 2)
- ❌ Realtime WebRTC voice audio streaming (Phase 2)
- ❌ PostgreSQL / Vector database connection (Phase 2)
- ❌ Browser automation & web crawling (Phase 3)
- ❌ WhatsApp, Email, Calendar integrations (Phase 3/4)
- ❌ Local Windows computer control / Python service execution (Phase 4)
- ❌ Unrestricted shell / terminal command execution (Strictly guarded)

All UI elements representing deferred features are clearly marked with badges like `NOT CONNECTED`, `COMING SOON`, or `SIMULATION MODE`.

---

## 3. Tech Stack

- **Framework**: Next.js 16 (App Router, React 19, TypeScript)
- **Styling**: Tailwind CSS v4, custom CSS variables, custom HUD scrollbars
- **Motion & Animations**: Framer Motion
- **Icons**: Lucide React
- **Validation**: Zod (for runtime environment and tool schemas)
- **Database ORM**: Prisma ORM (prepared for PostgreSQL)
- **Testing**: Vitest

---

## 4. Project Directory Structure

```
├── .env.example                       # Documented environment variables template
├── README.md                          # Architecture and roadmap documentation
├── package.json                       # Dependencies, scripts, and engine specs
├── tsconfig.json                      # Strict TypeScript compiler options
├── vitest.config.ts                   # Vitest testing suite configuration
├── prisma/
│   └── schema.prisma                  # PostgreSQL schema (Users, Conversations, Tasks, Audits)
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # Root layout with HUD AppShell
│   │   ├── page.tsx                   # Primary JARVIS Command Center
│   │   ├── conversations/page.tsx     # Thread archive & session history
│   │   ├── tasks/page.tsx             # Autonomous task scheduler placeholder
│   │   ├── tools/page.tsx             # Registered capability catalog & schema viewer
│   │   ├── activity/page.tsx          # System audit log & telemetry stream
│   │   ├── settings/page.tsx          # System parameters & subsystem controls
│   │   ├── error.tsx                  # Client error boundary
│   │   └── api/
│   │       ├── health/route.ts        # Subsystem health diagnostics endpoint
│   │       └── chat/route.ts          # Structured message endpoint scaffold
│   ├── ai/
│   │   ├── types.ts                   # Agent roles, message contracts, states
│   │   ├── agents/base.ts             # BaseAgent class and JarvisCoreAgent
│   │   ├── memory/types.ts            # Memory provider & vector query contracts
│   │   └── realtime/types.ts          # Audio stream contracts for future voice
│   ├── tools/
│   │   ├── types.ts                   # Tool definitions, schemas, permission tiers
│   │   ├── permissions.ts             # Permission manager & human approval logic
│   │   └── registry.ts                # Tool registry catalog and dispatcher
│   ├── services/
│   │   ├── local-agent.ts             # Local Python agent client interface
│   │   ├── system-status.ts           # Subsystem health evaluator
│   │   └── activity-logger.ts         # Telemetry stream & audit logger
│   ├── database/
│   │   └── client.ts                  # Safe Prisma client singleton wrapper
│   ├── config/
│   │   ├── env.ts                     # Strict Zod environment validator
│   │   ├── site.ts                    # Branding, versioning, metadata
│   │   └── navigation.ts              # Route items and capability status
│   ├── components/
│   │   ├── ui/                        # Button, Badge, Card, Input, Modal, Tabs
│   │   ├── layout/                    # AppShell, Sidebar, Header
│   │   ├── visualizer/                # JARVIS Central Core (Framer Motion)
│   │   ├── command-center/            # CommandInput, QuickActions
│   │   ├── chat/                      # ConversationPanel
│   │   ├── status/                    # SystemStatusPanel
│   │   └── activity/                  # ActivityPanel
│   ├── hooks/
│   │   ├── useJarvisState.ts          # State machine hook (idle/listening/etc.)
│   │   └── useChat.ts                 # Chat interaction & telemetry logging
│   └── lib/
│       ├── logger.ts                  # Structured logger with secret redaction
│       ├── errors.ts                  # Typed application errors
│       └── utils.ts                   # Utility functions & class merger
```

---

## 5. Getting Started

### Prerequisites
- Node.js `v20+` or `v24+`
- npm `v10+`

### Installation
```bash
# Install all dependencies
npm install
```

### Environment Configuration
```bash
# Copy template
cp .env.example .env.local
```

### Development Server
```bash
npm run dev
# Access http://localhost:3000
```

### Verification & Testing
```bash
# Run unit tests
npm test

# Run strict TypeScript typechecking
npm run typecheck

# Run linter
npm run lint

# Run production build
npm run build
```

---

## 6. Security & Permission Architecture

1. **Zero Secrets in Git**: Sensitive keys are strictly accessed via environment variables and never logged or serialized to the client.
2. **Secret Redaction**: `src/lib/logger.ts` automatically strips keys matching `/password/i`, `/secret/i`, `/token/i`, `/key/i`, `/auth/i`, etc.
3. **Permission Tiers**: Tools are divided into `READ`, `WRITE`, and `SENSITIVE`. Sensitive tools mandate operator authorization before execution can be triggered.
4. **Local Windows Security**: The local agent contract requires localhost binding, process-level sandboxing, and tokenized HMAC signatures.

---

## 7. Roadmap

- **Phase 1 (Complete)**: Clean architecture, HUD UI, animated visualizer, tool catalog, telemetry foundation.
- **Phase 2**: OpenAI Agents SDK integration, live reasoning, vector memory, WebRTC voice streaming.
- **Phase 3**: Autonomous tasks, web search, code analysis, browser automation.
- **Phase 4**: Python Windows automation agent, terminal integration, WhatsApp, and email connectors.
