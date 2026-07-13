# Hush App - AI Coaching by Linda Clemons

Linda Clemons' AI-powered nonverbal communication coaching app. Built on her bestselling book *Hush*, the app delivers real-time body language insights, coaching conversations, and voice-guided exercises in Ms. Linda's cloned voice and methodology.

Design language: **"Quiet Luxury, Loud Presence"** - a dark-first, voice-first, mobile-first companion. Presence with Personality.

## Features

- **Voice-first coaching chat** - DeepSeek-powered conversations in Linda Clemons' voice, drawing from her full book and methodology
- **Voice TTS** - Fish Audio 2.1 Pro (`s2.1-pro`) synthesis using Linda's custom cloned voice, with expression tags
- **Choose your focus** - Coaching tracks: Read Anyone Instantly, Command Any Room, Master Your Own Signals, Transform Your Relationships, or Something Else
- **In-app session recap** - Personalized affirmation on a gold serif card, themes covered, and a full transcript accordion
- **Affirmation generation** - AI-generated personalized affirmations based on session context
- **Post-session email** - Session recap delivered via AgentMail (HTML-escaped, from a verified sender)
- **Library & Progress** - Saved affirmations, book cues, and session/topic tracking
- **Responsive** - One centered app across mobile and desktop (360 / 390 / 768 / 1280)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 |
| UI | React 19, Tailwind CSS v4 |
| Language | TypeScript |
| AI Chat | DeepSeek (`deepseek-chat`) |
| Voice TTS | Fish Audio 2.1 Pro (`s2.1-pro`) |
| Database | Supabase (PostgreSQL) |
| Email | AgentMail |
| Deployment | Vercel |
| Search | Supabase full-text search over the Hush book chunks |
| Fonts | Plus Jakarta Sans (UI/body) + Fraunces (display serif), self-hosted via next/font |

## Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Fill in your API keys in .env.local

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DEEPSEEK_API_KEY` | DeepSeek API key for chat completions |
| `FISH_AUDIO_API_KEY` | Fish Audio API key for TTS |
| `FISH_AUDIO_VOICE_ID_LINDA` | Linda Clemons voice model ID |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `NEXT_PUBLIC_SUPABASE_URL` | Public Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public Supabase anon key |
| `AGENTMAIL_API_KEY` | AgentMail API key for email |
| `AGENTMAIL_FROM` | Verified sender address AgentMail may send as (required to send recap email). No email is sent from an unverified/fabricated domain. |
| `SEED_SECRET` | Secret required to call `/api/seed`. If unset, the seed route is disabled entirely. |
| `NEXT_PUBLIC_APP_URL` | Optional. Public app URL used in email links. |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Local dev server |
| `npm run build` | Production build (runs `check:name` first) |
| `npm run check:name` | Fails if the coach's name is ever misspelled (must be "Clemons") |
| `npm run lint` | ESLint |

## Deployment

Deployed on Vercel. Push to `main` to trigger automatic deployment.

## Repository

https://github.com/trevorotts1/hush-ai-by-linda-clemons
