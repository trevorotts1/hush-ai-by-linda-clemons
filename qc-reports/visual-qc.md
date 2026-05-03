# Hush AI — Visual QC Report
**Date:** 2026-05-03  
**Comparing:** Stitch mockups (desktop + mobile) vs. Next.js implementation  
**Pages reviewed:** `page.tsx` (signup), `mode-select/page.tsx`, `chat/page.tsx`

---

## 1. LOGIN / SIGNUP — `src/app/page.tsx`

### Mockup Elements PRESENT in Next.js
- Hush gradient-text branding (`gradient-text` class)
- "Welcome into the room" headline (`font-headline-md`)
- "Your presence is requested" subtext
- Email input field with Material Symbols `mail` icon
- Rounded card container (`rounded-[32px]`, `bg-surface-container-lowest`)
- Custom color palette (primary purple `#6f00d2`, secondary blue `#2000c7`)
- Mobile-first centered layout with `max-w-[480px]`
- Desktop split layout (hidden on mobile, `md:flex` on desktop)
- Decorative gradient background on hero area
- `font-body-md`, `font-label-bold` typography tokens
- Shadow utilities (`shadow-card`, `input-shadow`)

### Mockup Elements MISSING from Next.js
- **Password field** — mockup has email + password; code has email + phone + first name
- **"Forgot?" link** next to password label
- **Visibility toggle** (`visibility_off` icon) on password field
- **"Sign In" CTA** — code uses "Begin Your Session" with arrow icon
- **"New here? Create an account"** footer link
- **Hero image** — mockup shows an abstract 3D composition; code uses a plain CSS gradient
- **Companion app preview** section (mobile mockup has app screenshot + "Hush companion app" label)
- **Lock icon** on submit button (mockup mobile shows `lock` icon inside button)
- **"Create account" secondary button** (mockup mobile has a bordered secondary button)

### What Next.js Has That Mockup DOESN'T
- **First Name field** (signup vs. login flow difference)
- **Phone field** (signup vs. login flow difference)
- **Form validation state** (`error` message display)
- **Loading state** on submit button (`disabled:opacity-50`)
- **Session storage** integration for user data
- **Router navigation** to `/mode-select` on success

### Visual Fidelity Score: **6 / 10**
> The layout structure, color system, typography scale, and component styling are well-aligned. However, the page is fundamentally a **signup** flow while the mockup depicts a **login** flow. Missing password field, hero image, and secondary actions drop the score. The visual language (rounded corners, shadows, gradients) is consistent.

---

## 2. MODE SELECT — `src/app/mode-select/page.tsx`

### Mockup Elements PRESENT in Next.js
- "Presence Check" header (`font-headline-xl`)
- Personalized greeting with user's first name
- 4+ context selection cards in a responsive grid (`grid-cols-1 md:grid-cols-2`)
- Card hover effects with gradient overlays (`group-hover:opacity-100`)
- Material Symbols icons inside rounded icon containers
- Arrow-forward icon on each card
- TopAppBar with avatar initials, Hush logo, and notification bell
- BottomNavBar (mobile) with 4 tabs: Check, Coach, Library, Settings
- Sidebar (desktop) with Coach, Library, Progress, Settings nav items
- Active state styling on nav items (purple border + background)
- `rounded-[24px]` card corners
- Border color `#E5E5E5` on cards
- `backdrop-blur-md` on header

### Mockup Elements MISSING from Next.js
- **Correct track names** — mockup: "Read the Room", "Close the Deal", "Build Trust", "Own the Stage"; code: "Read Anyone Instantly", "Command Any Room", "Master Your Own Signals", "Transform Your Relationships"
- **Correct icons** — mockup uses `groups`, `handshake`, `favorite`, `mic`; code uses `visibility`, `handshake`, `favorite`, `mic`, `help`
- **Desktop card background images** — mockup has subtle photographic backgrounds with `mix-blend-multiply` on each card; code has solid colors only
- **Decorative image section** at bottom of mobile mockup (large banner with "Find Your Voice" overlay)
- **"Reading the room with you. Choose your communication context..."** subtitle text on desktop (code uses a different greeting)
- **Card-specific color accents** — mockup "Own the Stage" card is full purple (`bg-primary text-on-primary`); code treats all cards uniformly white

### What Next.js Has That Mockup DOESN'T
- **5th track card** ("Something Else") — mockup only shows 4 cards
- **Loading state** on card selection (`disabled:opacity-50`)
- **API integration** (`/api/session/start`) with session storage
- **Router navigation** to `/chat` after selection
- **Auth guard** — redirects to `/` if no user in session storage

### Visual Fidelity Score: **7 / 10**
> The layout, navigation patterns, and card interaction model are very close. The main gaps are the **track naming/branding mismatch**, missing background images on desktop cards, and the absent decorative banner. The component architecture (Sidebar, BottomNav, TopAppBar) is faithfully implemented.

---

## 3. COACHING CHAT — `src/app/chat/page.tsx`

### Mockup Elements PRESENT in Next.js
- Chat message bubbles with asymmetric corners (`rounded-2xl rounded-tr-sm` for user, `rounded-2xl rounded-tl-sm` for coach)
- Coach avatar (circular, though code uses icon instead of image on mobile)
- Audio visualization waveform bars (`wave-bar` animation)
- Play/pause toggle button for audio playback
- Progress timestamp (`0:12 / 0:45` format)
- Sticky bottom input bar with rounded text field
- TopAppBar with Hush logo and profile/volume controls
- Exchange counter (`exchangeCount/100`)
- Loading indicator (3 bouncing dots)
- Auto-scroll to bottom on new messages
- `shadow-[0_4px_20px_0px_rgba(139,44,245,0.08)]` on coach messages

### Mockup Elements MISSING from Next.js
- **Pro Tip / Linda-Style Cue card** — mockup has a prominent golden-yellow cue card (`bg-tertiary-fixed`, `border-l-[4px] border-tertiary-fixed-dim`) with lightbulb icon, framework tags, and coaching advice; **completely absent from code**
- **Coach avatar image** — mockup shows a real portrait photo; code uses `psychology` Material Symbol icon inside a colored circle
- **"Interview Prep Mode • Today"** context badge at top of chat history
- **Mic button** in input bar — mockup shows a large circular mic button; code uses a `send` icon button
- **Volume toggle** in TopAppBar (mobile mockup has `volume_up` icon)
- **Desktop sidebar with user profile** — mockup shows user avatar + name + "Presence with Personality" tagline in sidebar; code's sidebar is simpler
- **User message color** — mockup desktop shows user messages in `bg-primary text-on-primary` (purple); code uses `bg-surface-variant text-on-surface-variant` (gray)
- **Coach message color** — mockup desktop shows coach in `bg-surface-container text-on-surface`; code uses `bg-primary-container text-on-primary` (purple tint)
- **Desktop input layout** — mockup has a centered max-width input bar; code's desktop input is full-width fixed bottom

### What Next.js Has That Mockup DOESN'T
- **Session idle timer** (checks `/api/session/status` every 30s)
- **Session end screen** with "Start New Session" CTA
- **TTS integration** (`/api/tts`) with audio playback controls
- **Message history state** management
- **Exchange count limit** (100 exchanges)
- **Form submit handler** with Enter-to-send

### Visual Fidelity Score: **6 / 10**
> The core chat UI structure is present, but the **missing Pro Tip card is a major visual gap** — it's a signature element of the mockup's coaching UX. The avatar substitution (icon vs. photo), message color mismatch, and missing context badge also hurt fidelity. The audio waveform and playback controls are well-implemented.

---

## Summary Table

| Page | Present | Missing | Unique to Code | Score |
|------|---------|---------|----------------|-------|
| Login/Signup | 10 | 8 | 5 | **6/10** |
| Mode Select | 12 | 6 | 4 | **7/10** |
| Chat | 10 | 9 | 6 | **6/10** |

## Critical Gaps to Address

1. **Login vs. Signup mismatch** — Decide if `/` is login or signup; align mockup and code.
2. **Pro Tip card in Chat** — This is a key differentiator in the mockup and should be added.
3. **Coach avatar image** — Replace `psychology` icon with actual avatar photo.
4. **Track names/icons** — Align with Linda Clemons' actual coaching tracks.
5. **Desktop card backgrounds** — Add subtle imagery or richer gradients to mode-select cards.
6. **User message styling** — Purple user bubbles in mockup vs. gray in code.
7. **Mic vs. Send button** — Mockup emphasizes voice input; code uses text send.
8. **Hero image on login** — Add the abstract 3D composition or equivalent visual.
