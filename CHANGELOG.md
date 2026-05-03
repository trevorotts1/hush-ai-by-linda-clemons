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
