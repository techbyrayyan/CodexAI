# JARVIS AI Assistant — Phase 2: Real AI Brain & OpenAI Agent Integration

> An enterprise-grade, desktop-first personal AI command center inspired by futuristic HUD interfaces (Iron Man JARVIS, Linear, Apple, Vercel).

---

## 1. Project Overview & Scope

JARVIS is engineered to become a full-spectrum personal executive assistant combining voice intelligence, autonomous tool reasoning, computer control, and workflow integrations.

### Phase 3: Realtime Voice Interaction (Current Status: Complete)
Phase 3 establishes natural voice communication between the operator and JARVIS:
- **Dedicated Voice Layer (`src/voice/`)**: Decoupled voice engine featuring modular client, providers, and state interfaces.
- **Provider Abstraction**: Pluggable architecture supporting browser-native speech recognition/synthesis alongside future provider engines.
- **Microphone Capture & Audio Analysis**: Safe browser microphone permission handling, track cleanup, and live Web Audio API analyser calculating normalized audio levels without storing raw audio.
- **Connected Visualizer Core**: `JarvisCore` visualizer reacts dynamically to microphone amplitude during `LISTENING` and audio synthesis during `SPEAKING`.
- **Speech Synthesis (TTS) & Barge-In**: Responsive text-to-speech with natural vocal pacing and immediate barge-in/interruption support (saying "stop" or typing cancels speech instantly).
- **Dual Text & Voice Modes**: Seamless switching between text keyboard mode and realtime voice interaction using the shared conversation stream and cognitive brain.

---

## 2. Implemented Capabilities vs. Intentionally Deferred Capabilities

### Implemented Capabilities (Phase 1, Phase 2 & Phase 3)
- ✅ Google Gemini (Primary) & OpenAI (Optional) AI cognitive brain integration
- ✅ Dedicated voice engine layer (`src/voice/`) with Web Audio API analyser
- ✅ Realtime speech-to-text (STT) and text-to-speech (TTS)
- ✅ Audio-reactive HUD visualizer with live waveform amplitude
- ✅ Barge-in and speech interruption support
- ✅ Dual Text / Voice interaction modes with shared conversation memory
- ✅ Strict system instruction enforcing persona and truthfulness
- ✅ Animated HUD visualizer with state transitions (`idle`, `listening`, `thinking`, `processing`, `speaking`)
- ✅ Strict request validation (4000 character limit, non-empty, JSON schema)
- ✅ In-memory rate limiting and abuse mitigation
- ✅ Structured logging with automatic secret redaction
- ✅ Subsystem health monitoring reflecting live AI engine status

### Intentionally Deferred Capabilities
To maintain engineering discipline and prevent untested or hazardous functionality, the following are **strictly deferred to subsequent phases**:
- ❌ Local Windows computer control / opening apps (Phase 4)
- ❌ Python local automation agent execution (Phase 4)
- ❌ Browser automation & web crawling (Phase 4)
- ❌ WhatsApp, Email, Calendar external integrations (Phase 4)
- ❌ Persistent PostgreSQL database conversation storage (Database Phase)
- ❌ Unrestricted shell / terminal command execution (Guarded)

All UI elements representing deferred features are clearly marked with badges like `NOT CONNECTED` or `COMING SOON`. JARVIS explicitly clarifies that these actions are not yet connected if prompted.

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
- **Phase 2 (Complete)**: Real AI brain, OpenAI agent integration, strict persona & honesty boundaries, safe error handling, rate limiting.
- **Phase 3**: Autonomous tasks, web search, code analysis, browser automation.
- **Phase 4**: Python Windows automation agent, terminal integration, WhatsApp, and email connectors.
