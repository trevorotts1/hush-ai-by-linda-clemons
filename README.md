# Hush App — AI Coaching by Linda Clemons

Linda Clemons' AI-powered nonverbal communication coaching app. Built on her bestselling book *Hush*, the app delivers real-time body language insights, coaching conversations, and voice-guided exercises through Linda's unmistakable voice and methodology.

## Features

- **AI Coaching Chat** — DeepSeek-powered conversations in Linda Clemons' voice, drawing from her full book and methodology
- **Voice TTS** — Fish Audio voice synthesis using Linda's custom voice model
- **Mode Selection** — Multiple coaching tracks including "Read the Room," "Command the Room," and "Read Anyone Instantly"
- **Affirmation Generation** — AI-generated personalized affirmations based on session context
- **Post-Session Email** — Session summaries delivered via AgentMail with word cloud visualization
- **Responsive Design** — Desktop and mobile layouts matching Stitch mockups

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 |
| UI | React 19, Tailwind CSS v4 |
| Language | TypeScript |
| AI Chat | DeepSeek V4 Flash |
| Voice TTS | Fish Audio |
| Database | Supabase (PostgreSQL) |
| Email | AgentMail |
| Deployment | Vercel |
| Image Gen | Kie.ai (GPT Image 2) |
| Search | Supabase full-text search over 573 Hush book chunks |

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
| `KIE_API_KEY` | Kie.ai API key for image generation |
| `OPENAI_API_KEY` | Optional, reserved for future infographic or embedding experiments |

## Deployment

Deployed on Vercel. Push to `main` to trigger automatic deployment.

## Repository

https://github.com/trevorotts1/hush-ai-by-linda-clemons
