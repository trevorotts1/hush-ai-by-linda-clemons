# Hush App — Personalized Session Infographic Spec

## Overview
After each coaching session closes, the Hush AI generates a personalized visual summary (infographic) for the user. These images are designed to feel intimate, elegant, and worthy of being saved or shared — reinforcing the coaching relationship and the value of each session.

---

## 1. GPT Image 2 Prompt Template

```
Create an elegant, personalized coaching session summary infographic for "{name}".

SESSION FOCUS: {track}
AFFIRMATION: "{affirmation}"
KEY INSIGHT: {key_insight}

THEMES EXPLORED: {session_themes}

DESIGN REQUIREMENTS:
- Soft, warm color palette dominated by deep purples (#4A1C6F, #6B2D8E), warm golds (#D4A843, #F0C75E), and cream/off-white backgrounds (#FDF8F0)
- Elegant serif typography for the user's name and affirmation; clean sans-serif for supporting text
- Subtle geometric or organic decorative elements (soft curves, mandala-like accents, or flowing lines) that feel calming and premium
- The affirmation should be the visual centerpiece, rendered in a larger, script-like or elegant serif font
- Session themes should appear as small, tasteful icons or word-tags arranged artfully around the composition
- Include a small, subtle "Hush" wordmark or logo placement at the bottom
- Overall mood: intimate, empowering, serene, luxurious but approachable
- Aspect ratio: 4:5 (portrait, optimized for Instagram Stories and mobile lock screens)
- No clutter, generous whitespace, editorial magazine-quality layout
```

---

## 2. Variable Placeholders

| Placeholder | Source | Example |
|-------------|--------|---------|
| `{name}` | User profile first name | "Aisha" |
| `{track}` | Active coaching track from session metadata | "Boundaries & Self-Worth" |
| `{affirmation}` | AI-generated personalized affirmation from session close | "I am allowed to take up space without apology." |
| `{key_insight}` | Single most impactful insight distilled from session transcript | "Your guilt is a habit, not a truth." |
| `{session_themes}` | 2-4 themes/tags extracted from session content | "Boundaries, Guilt, Self-Permission, Rest" |

### Data Flow
```
Session Close Event
    → Transcript analysis (extract themes, key insight)
    → Affirmation generation (dedicated prompt)
    → Prompt template population
    → Image generation API call
    → Store result URL in session record
    → Deliver to user via preferred channel (in-app, SMS, email)
```

---

## 3. Visual Style Guide

### Color Palette
| Role | Hex | Usage |
|------|-----|-------|
| Deep Purple (Primary) | `#4A1C6F` | Headlines, key accents, wordmark |
| Lighter Purple | `#6B2D8E` | Secondary elements, decorative lines |
| Warm Gold | `#D4A843` | Highlights, icons, emphasis text |
| Light Gold | `#F0C75E` | Subtle glows, background gradients |
| Cream | `#FDF8F0` | Primary background |
| Soft Lavender | `#E8D5F2` | Secondary background tints |
| Charcoal | `#2D2D2D` | Body text (if not on cream) |

### Typography Direction
- **Name & Affirmation**: Elegant serif (e.g., Playfair Display, Cormorant Garamond) or refined script
- **Supporting Text**: Clean geometric sans-serif (e.g., Montserrat, Lato)
- **Themes/Tags**: Small caps or all-caps sans, letter-spaced

### Composition Principles
- Center-weighted or slightly asymmetrical balance
- The affirmation is always the hero element
- Themes arranged as a subtle "constellation" or flowing ribbon
- Generous margins (minimum 8% of canvas on all sides)
- No hard borders; soft shadows or glows for depth

### Mood Keywords
Intimate, Serene, Empowering, Luxurious-but-Warm, Editorial, Sacred, Personal

---

## 4. Reference Image Descriptions

### Reference A: "The Affirmation Card"
A tall portrait image resembling a premium greeting card or art print. Cream background with a soft radial gradient of lavender at the center. The user's name appears at the top in small, gold, all-caps serif lettering. Below it, the affirmation dominates in large, elegant dark purple script, centered. A thin gold horizontal line separates the affirmation from the key insight below, rendered in smaller, charcoal italic serif. At the bottom, 3-4 theme words float like small gold constellation dots connected by faint lines. The Hush wordmark sits discreetly at the very bottom center. Overall feel: like receiving a handwritten note from a wise friend.

### Reference B: "The Journal Page"
A portrait image evoking a beautiful handwritten journal spread. Soft cream-to-lavender watercolor wash background with subtle texture. On the left third, a vertical gold brushstroke. The affirmation is placed slightly right of center in a large, confident serif font, with one word highlighted in gold. Session themes appear as small, elegant icons (a feather, a moon, a key, a wave) arranged vertically along the left gold stroke, each with a tiny label. The key insight appears at the bottom in a small, boxed quote style. The Hush logo is a subtle embossed seal in the bottom right. Overall feel: like a page from a luxury self-discovery journal.

### Reference C: "The Sacred Space"
A portrait image with a more atmospheric, meditative quality. Deep purple-to-cream gradient background with soft, out-of-focus light orbs (bokeh effect in gold and lavender). The user's name appears at the top in delicate gold lettering. The affirmation is centered in a glowing, slightly translucent cream text box with rounded corners and a soft shadow. Themes are rendered as small, floating gold symbols (not words) arranged in a gentle arc above the affirmation. The key insight appears below in small, warm white text. The Hush wordmark is minimal, bottom center, in lavender. Overall feel: like a moment of calm captured in visual form — sacred, protected, deeply personal.

---

## 5. Kie.ai API Integration

### Endpoint
```
POST https://api.kie.ai/v1/images/generations
```

### Headers
```
Authorization: Bearer {KIE_AI_API_KEY}
Content-Type: application/json
```

### Request Body
```json
{
  "model": "gpt-image-2",
  "prompt": "[POPULATED PROMPT FROM TEMPLATE ABOVE]",
  "size": "1024x1536",
  "quality": "high",
  "n": 1,
  "style": "vivid"
}
```

### Response Handling
```json
{
  "created": 1715000000,
  "data": [
    {
      "url": "https://api.kie.ai/v1/files/.../image.png",
      "revised_prompt": "[optional sanitized prompt]"
    }
  ]
}
```

### Integration Flow (Post-Session Close)

```
┌─────────────────┐
│ Session Closes  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│ 1. Analyze transcript       │
│    - Extract themes[]       │
│    - Distill key_insight    │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ 2. Generate affirmation   │
│    (dedicated LLM prompt)   │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ 3. Populate prompt template │
│    with session data        │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ 4. Call Kie.ai API          │
│    - size: 1024x1536        │
│    - quality: high          │
│    - timeout: 60s           │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ 5. Store result             │
│    - Save URL to session    │
│    - Queue for delivery     │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ 6. Deliver to user          │
│    - In-app notification    │
│    - Optional: SMS/email    │
│    with image attachment    │
└─────────────────────────────┘
```

### Error Handling
| Scenario | Action |
|----------|--------|
| API timeout (>60s) | Retry once with `quality: "standard"`, then queue for async retry |
| Content policy rejection | Log sanitized prompt, fallback to pre-designed template image with text overlay |
| Invalid response | Alert ops, skip image for this session, continue with text-only summary |
| Storage URL expires | Implement 7-day cache; re-generate on-demand if user requests later |

### Rate Limits & Cost
- Kie.ai rate limit: 20 images/minute on standard tier
- Estimated cost: ~$0.04-0.08 per image (high quality, 1024x1536)
- Budget: ~$500/mo supports ~6,000-12,000 session infographics
- Implement per-user cap: max 1 infographic per session, no retries within 5 minutes

### Security & Privacy
- Never include raw transcript content in the image prompt
- Only use distilled, consented data (name, themes, affirmation, insight)
- Store image URLs with same retention policy as session data
- Allow user opt-out of infographic generation in privacy settings

---

## Appendix: Affirmation Generation Prompt (Pre-Image)

Used to generate the `{affirmation}` variable before image creation:

```
You are Hush, a compassionate AI coach. Based on the following session summary, write a single, powerful, personalized affirmation for the user.

User: {name}
Session Themes: {themes}
Key Insight: {key_insight}

Requirements:
- First person ("I am...", "I choose...", "I deserve...")
- 12-25 words maximum
- Specific to the session content, not generic
- Empowering, gentle but firm
- No toxic positivity — acknowledge struggle while affirming growth
- Return ONLY the affirmation text, no quotes or explanation
```

---

*Spec version: 1.0*
*Last updated: 2025-05-03*
*Owner: Hush AI Product Team*
