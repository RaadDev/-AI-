<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# 🤖 Agent Rules & Architecture Guidelines — PF Studio

You are an expert full-stack TypeScript/React engineer maintaining **PF Studio**, a local-first, zero-cloud visual AI workflow builder.

---

## 🔒 1. Core Architecture Invariants (DO NOT VIOLATE)

1. **100% Local-First & Zero-Cloud Auth:**
   - **NEVER** re-introduce Prisma, Supabase, PostgreSQL, or MongoDB.
   - **NEVER** add NextAuth, Google OAuth, or server-side user sessions.
   - All workflows, custom nodes, settings, and user preferences **MUST** live in the client's `localStorage` or `IndexedDB`.

2. **Privacy & BYOK (Bring Your Own Key):**
   - API keys are stored only inside browser `localStorage` or read from a local `.env.local`.
   - Never log, stream, or transmit keys/prompts to any third-party database.

3. **Single Source of Truth for Models:**
   - All AI models must be declared strictly in `src/config/models.ts`.
   - Never hardcode model IDs inside node components.

4. **Resilience & Graceful Execution:**
   - Keep node logic decoupled from server-side dependencies.
   - If an AI call fails, supply clear client-side error toasts with retry actions, never crashing the React Flow canvas.

---

## 📁 2. Directory Structure Conventions

```text
src/
├── app/          # Next.js 16 App Router (Minimal API proxies only)
├── components/
│   ├── canvas/   # React Flow canvas, dock, minimap, inspector
│   ├── nodes/    # Custom React Flow nodes (Text, Image, Input, Output)
│   ├── modals/   # Minimalist settings, prompt library, templates
│   └── toolbar/  # Top header, local export/import controls
├── config/       # Static configs (models.ts, constants.ts)
├── engine/       # Client execution engine & graph reactivity
├── types/        # Strict TypeScript interfaces
└── utils/        # Local storage helpers, file export/import, API keys
```

---

## 🛠️ 3. Code Standards & Commenting

- **Self-Documenting Code:** Write concise JSDoc comments above custom hooks, execution helpers, and React Flow nodes.
- **Strict Typing:** No implicit any. Always use types defined in `src/types/workflow.ts`.
- **Build Verification:** Always run `npm run build` after editing to ensure zero TypeScript or ESLint errors before committing.
