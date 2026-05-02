---
name: Presence With Personality
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#4c4355'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#7d7387'
  outline-variant: '#cec2d8'
  surface-tint: '#8018ea'
  primary: '#6f00d2'
  on-primary: '#ffffff'
  primary-container: '#8b2cf5'
  on-primary-container: '#f2e3ff'
  inverse-primary: '#d8b9ff'
  secondary: '#2000c7'
  on-secondary: '#ffffff'
  secondary-container: '#3217ff'
  on-secondary-container: '#c1c0ff'
  tertiary: '#6a4b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#886200'
  on-tertiary-container: '#ffe6bc'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#eddcff'
  primary-fixed-dim: '#d8b9ff'
  on-primary-fixed: '#290055'
  on-primary-fixed-variant: '#6300bb'
  secondary-fixed: '#e2dfff'
  secondary-fixed-dim: '#c2c1ff'
  on-secondary-fixed: '#0c006a'
  on-secondary-fixed-variant: '#2700e8'
  tertiary-fixed: '#ffdea6'
  tertiary-fixed-dim: '#f3be56'
  on-tertiary-fixed: '#271900'
  on-tertiary-fixed-variant: '#5d4200'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-bold:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  container-margin: 20px
  gutter: 16px
---

## Brand & Style

This design system embodies the "Presence With Personality" philosophy, designed to make high-level communication coaching feel practical, energetic, and deeply human. The brand personality is expert yet approachable, leaning into the warmth of a trusted mentor rather than the clinical distance of a typical productivity app. 

The visual style is **Modern / Bold**, characterized by a sophisticated balance of high-contrast typography and a vibrant, warm color palette. It uses clean, intentional whitespace to allow the instructional content to breathe, while employing soft rounded corners and subtle depth to maintain a friendly, tactile quality. The goal is to evoke confidence and readiness in the user through an interface that feels both authoritative and encouraging.

## Colors

The palette is rooted in a soft, off-white (#FFF9F2) base that provides a "warm paper" feel, reducing eye strain and increasing approachability. 

- **Primary Purple (#8B2CF5):** Used for main actions, active states, and brand-heavy moments. It represents the "Personality" aspect of the brand.
- **Electric Blue (#3011FF):** Reserved for high-energy accents, secondary buttons, and specific UI feedback like links or instructional highlights.
- **Golden Yellow (#DBA943):** Acts as a highlighting tool for "Expert Cues" or "Tips," providing a visual link to prestige and wisdom.
- **Teal (#00ADB5):** Used for success states and progress tracking, providing a cool balance to the otherwise warm palette.
- **Neutral (#1A1A1A):** Used strictly for typography and high-contrast borders to ensure maximum readability and a modern, "ink-on-paper" feel.

## Typography

This design system uses a dual-font approach to balance character with clarity. 

**Plus Jakarta Sans** is used for headlines and labels. Its slightly rounded terminals and geometric structure feel modern and welcoming. Large headlines should use heavy weights (700-800) with tight letter spacing to create a powerful visual anchor.

**Be Vietnam Pro** is utilized for body text. It offers exceptional legibility at smaller sizes while maintaining a contemporary, friendly aesthetic that complements the headline choice. 

Labels and small metadata should often utilize uppercase styling with increased letter spacing to provide a clear hierarchy against body copy.

## Layout & Spacing

This design system follows a **fluid grid** model with a mobile-first philosophy. The layout relies on generous vertical rhythm to prevent the expert content from feeling overwhelming. 

On mobile devices, a standard 4-column grid is used with 20px margins. As the viewport scales to desktop, the layout transitions to a 12-column grid with a maximum content width of 1140px. 

Spacing is based on an 8px scale. Component internal padding should prioritize "breathability"—using 24px (md) for container padding to ensure the text doesn't feel cramped. Groups of related items should use 12px (sm) spacing, while distinct sections should be separated by 40px (lg) or more.

## Elevation & Depth

Hierarchy is established through **Ambient Shadows** and **Tonal Layers**. Instead of harsh black shadows, this design system uses soft, diffused shadows tinted with the primary purple or neutral tones to maintain the "warm" brand feel.

- **Level 1 (Base):** The off-white background.
- **Level 2 (Cards/Inputs):** White surfaces with a very subtle 1px border (#E5E5E5) or a soft, low-opacity shadow (Y: 4px, Blur: 20px, Opacity: 4%).
- **Level 3 (Interactive/Floating):** Elements like primary buttons or active modal cards use a more pronounced shadow to indicate "lift" and interactability.

Gradients should be used sparingly, primarily in large call-to-action buttons, blending Primary Purple into Electric Blue to create a sense of movement and energy.

## Shapes

The shape language is defined by **Rounded** geometry. This reinforces the "approachable" aspect of the coaching brand. 

- Standard components (Inputs, Small Cards) use a 0.5rem (8px) radius.
- Large containers and featured sections use "rounded-lg" (16px) or "rounded-xl" (24px) to create a softer, more organic framing for photography and long-form content.
- Buttons and Chips utilize a "pill" style (full radius) in specific contexts where they need to stand out as distinct interactive "pills of knowledge."

## Components

- **Buttons:** Primary buttons use a vibrant gradient (Purple to Blue) with white text and a pill-shape or 12px corner radius. Secondary buttons use a transparent background with a 2px Electric Blue border.
- **Inputs:** Text fields feature a white background, 12px corner radius, and a subtle inner shadow. Labels are placed above the field in "label-bold" style.
- **Chips/Tags:** Used for categorizing communication "cues." These should be small, pill-shaped, and use light tints of the primary colors (e.g., 10% opacity Teal with 100% opacity Teal text).
- **Cards:** Main content cards use a white background and a 24px corner radius. They should include a "soft lift" shadow on hover to encourage interaction.
- **Feedback Cues:** A specific "Linda-Style Cue" component uses the Golden Yellow as a left-border accent (4px width) and a pale yellow background tint to signify expert advice.
- **Progress Bars:** Utilize the Teal (#00ADB5) for the fill color to represent growth and successful communication mastery.