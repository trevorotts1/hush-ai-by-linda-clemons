# Changelog — Hush App

## v0.1.0 (May 1, 2026)

### Initial Build

- **Scaffold:** Next.js 16 + React 19 + Tailwind CSS v4 + TypeScript
- **Design system:** Stitch mockups for desktop and mobile (login, mode-select, coaching chat)
- **Knowledge base:** Full book text and persona blueprint loaded directly into system prompt
- **API routes:** DeepSeek chat completion, Fish Audio TTS, affirmation generation, post-session email
- **Pages:** Signup (`/`), mode-select (`/mode-select`), chat (`/chat`)
- **Database:** Supabase schema for users, sessions, messages, affirmations
- **Auth:** Supabase client (lazy-loaded for build compatibility)

### Bug Fixes

- Tailwind v4 compatibility fix + lazy Supabase client for build (a069c60)
- Fish Audio `model_id` parameter fix — changed from `voice_id` to `model_id` for Linda's voice (98aa2c7)
- Play/pause toggle fix — audio waveform button now properly pauses and resumes (98aa2c7)

### Architecture Decisions

- Knowledge loaded directly into system prompt instead of RAG pipeline (f1d0280)
- DeepSeek V4 Flash as primary chat model
- Fish Audio for Linda Clemons voice TTS
- AgentMail for post-session email delivery
- Vercel for deployment

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.4 |
| UI | React 19.2.4, Tailwind CSS v4 |
| Language | TypeScript |
| AI Chat | DeepSeek V4 Flash |
| Voice TTS | Fish Audio (model_id: 6fd6d7e4a9a64ef8a1c4a1773e70364b) |
| Database | Supabase (PostgreSQL) |
| Email | AgentMail |
| Deployment | Vercel |
| Image Gen | Kie.ai (GPT Image 2) |
| Embeddings | OpenAI text-embedding-3-small |

## v0.1.1 (May 5, 2026)

### Structural Hardening

- Wired Hush design tokens into Tailwind v4 utilities for spacing, shadows, typography, and safe-area padding.
- Fixed ESLint errors across API routes, chat client, Supabase lazy client, and mode selection page.
- Added typed error handling helper instead of repeated `any` catch blocks.
- Fixed chat React hook structure by removing synchronous effect state setup and stabilizing session-end behavior.
- Fixed session idle tracking so it uses the latest transcript timestamp instead of `started_at`.
- Updated `db/schema.sql` to match the live Supabase full-text search architecture: `hush_book_chunks` + `search_book`.
- Replaced plain image tags with Next Image where structural lint required it.

### Verification

- `npm run lint` passes with zero errors.
- `npm run build` passes.

## v0.1.2 (May 5, 2026)

### Persona and Chat Fidelity Pass

- Strengthened Ms. Linda prompt with story → truth → application → question rhythm.
- Added culturally grounded Linda voice rules, signature phrases, metaphor guidance, and stronger body-language governance.
- Added `LindaAvatar` fallback component so the app has a branded Linda presence until the real photo is provided.
- Added `LindaCue` coaching card to restore the signature cue/pro-tip experience from the Stitch chat mockup.
- Replaced generic psychology icons in chat with Linda avatar fallback.
- Improved chat bubble contrast and desktop input alignment.

### Verification

- `npm run lint` passes.
- `npm run build` passes.
