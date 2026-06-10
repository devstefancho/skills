# Design Quality Standard

Define all four pillars below before writing any HTML.

## 1. Product Context

- What job is this screen doing?
- Who is it for?
- What action or feeling should the screen drive?

## 2. Aesthetic Direction

Choose one bold direction and name it explicitly in your working notes and final report. Examples:

- Editorial performance journal
- Premium athlete brand system
- Gritty marathon training console
- Race-day command center
- Minimal training notebook
- Luxury progress portfolio
- Playful quantified-self scrapbook

## 3. Visual System

Decide intentionally:

- Typography pairing and why it fits
- Color palette and contrast structure
- Layout composition (symmetrical, editorial, layered, asymmetrical, dense, minimal)
- Surface treatment (glass, paper, grain, sharp borders, soft depth, flat blocks, etc.)
- Motion hints or micro-interactions, even if only described in CSS states

## 4. Memorable Moment

Add one signature move that makes the preview feel designed, such as:

- Hero typography treatment
- Dramatic progress rail
- Editorial split layout
- Layered card stack
- Full-bleed metric strip
- Race-path timeline
- Textured story panel

## Anti-Patterns (full list)

Do not ship a preview that looks like a default template. Specifically avoid:

- Inter + generic SaaS card layout by default
- Safe purple-blue gradients unless the product context truly calls for them
- Evenly spaced identical cards with no hierarchy
- Placeholder UI with no point of view
- Decorative effects with no relationship to the product story

If your first instinct looks interchangeable with a random startup admin dashboard, stop and choose a stronger direction.

## Template Placeholder Reference

`templates/prototype-template.html` placeholders to replace with a concept-specific implementation:

| Placeholder | Meaning |
|---|---|
| `{{TITLE}}` | Page title based on the idea |
| `{{FONT_PRELOADS}}` | Optional font imports, or leave blank |
| `{{DESIGN_TOKENS}}` | CSS variables for palette, typography, radius, shadows, spacing, textures |
| `{{BASE_STYLES}}` | Layout and reusable component styling for the chosen concept |
| `{{MOTION_STYLES}}` | Hover, focus, reveal, or transition rules |
| `{{BODY_CLASS}}` | Theme or concept class name |
| `{{BODY}}` | The actual semantic HTML for the screen |
