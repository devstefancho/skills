---
name: ui-prototype-preview
description: Generate a distinctive standalone HTML preview from a saved UI brainstorm idea. Use when the user wants to visualize a brainstorm idea as a concrete mockup, prototype, preview, landing page, dashboard, or product screen with strong design quality.
allowed-tools: Read, Write, Glob, Grep, Bash, AskUserQuestion
context: fork
agent: general-purpose
---

# UI Prototype Preview

Generate a self-contained HTML prototype from a saved brainstorm idea. This skill should produce a visually distinctive concept, not a generic AI-looking dashboard. Use it after `brain-storm` when a UI-focused idea needs a stronger visual artifact before specification or implementation.

## Principles

1. **Start from saved intent** - Prefer an existing file in `brain-storm/` instead of inventing a product direction from scratch.
2. **Concept first, code second** - Commit to a clear aesthetic direction before writing any HTML.
3. **Design brief over overloaded arguments** - Prefer a reusable `DESIGN.md` file when there are many constraints, brand tokens, or variant requests.
4. **Prototype, do not under-design** - The goal is not production code, but the result must still feel deliberate, polished, and memorable.
5. **One standout idea** - Every preview should have a single memorable visual or interaction moment that defines the concept.
6. **Avoid generic AI aesthetics** - Do not default to bland SaaS cards, overused purple-on-white palettes, or interchangeable layouts.
7. **Traceability** - Report which brainstorm file the preview came from, what design direction you chose, which design brief you used, and where the HTML was saved.

## Output Rules

- Save previews to `brain-storm/previews/{idea-name}.html`.
- For multi-variant runs, save files to `brain-storm/previews/{idea-name}-{variant-slug}.html`.
- Save design briefs to `brain-storm/design/{idea-name}-design.md` unless the user provides a different path.
- Use lowercase-with-hyphens for filenames.
- Create `brain-storm/previews/` and `brain-storm/design/` if they do not exist.
- The HTML must be standalone with embedded `<style>` and no build step.
- Default to responsive desktop-first layouts unless the brainstorm idea clearly targets mobile.
- Include semantic structure and accessible text labels.
- Prefer locally safe font stacks or imported web fonts only when the environment clearly supports them.

## When to Use a Design Brief

Use a `DESIGN.md`-style file whenever the user wants any of the following:
- 2 or more variants
- Exact brand colors or theme tokens
- Font or typography preferences
- A defined design system or UI kit influence
- Explicit anti-patterns or forbidden aesthetics
- Device/layout preferences such as mobile-first, landing-page-first, or dashboard-first
- Reference links, screenshots, or brand keywords to steer the direction

If the user only gives a simple request, you may proceed without a design brief. But if the request becomes constraint-heavy, create or read a design brief instead of stuffing everything into one command-like prompt.

## Design Brief Workflow

### Step 0: Resolve the Design Brief

1. Search for a relevant design brief in this order:
   - User-provided path
   - `brain-storm/design/{idea-name}-design.md`
   - Other matching `brain-storm/design/**/*.md` files
2. If a suitable design brief exists, read it and apply it.
3. If no design brief exists and the request is complex, auto-generate one from `templates/design-brief-template.md`.
4. Fill the generated brief with sensible defaults derived from the brainstorm idea.
5. Save the generated brief under `brain-storm/design/{idea-name}-design.md`.
6. Tell the user you created the design brief and continue with the first prototype pass unless the user asked to review the brief before generation.

## Design Quality Standard

Before writing HTML, define all of the following:

### 1. Product Context
- What job is this screen doing?
- Who is it for?
- What action or feeling should the screen drive?

### 2. Aesthetic Direction
Choose one bold direction and name it explicitly in your working notes and final report. Examples:
- Editorial performance journal
- Premium athlete brand system
- Gritty marathon training console
- Race-day command center
- Minimal training notebook
- Luxury progress portfolio
- Playful quantified-self scrapbook

### 3. Visual System
Decide intentionally:
- Typography pairing and why it fits
- Color palette and contrast structure
- Layout composition (symmetrical, editorial, layered, asymmetrical, dense, minimal)
- Surface treatment (glass, paper, grain, sharp borders, soft depth, flat blocks, etc.)
- Motion hints or micro-interactions, even if only described in CSS states

### 4. Memorable Moment
Add one signature move that makes the preview feel designed, such as:
- Hero typography treatment
- Dramatic progress rail
- Editorial split layout
- Layered card stack
- Full-bleed metric strip
- Race-path timeline
- Textured story panel

## Anti-Patterns

Do not ship a preview that looks like a default template. Specifically avoid:
- Inter + generic SaaS card layout by default
- Safe purple-blue gradients unless the product context truly calls for them
- Evenly spaced identical cards with no hierarchy
- Placeholder UI with no point of view
- Decorative effects with no relationship to the product story

If your first instinct looks interchangeable with a random startup admin dashboard, stop and choose a stronger direction.

## Workflow

### Step 1: Find the Source Idea

1. Run `Glob brain-storm/**/*.md` to find saved ideas.
2. If the user did not specify a file or the match is ambiguous, ask which idea to use.
3. Read the selected brainstorm file carefully.
4. Extract the title, summary, proposed approach, wireframe, and open questions.

### Step 2: Build a Design Brief Before Coding

Using the brainstorm file plus any resolved `DESIGN.md`, write a concise internal brief:
- Primary user goal
- Key sections and layout hierarchy
- Core interactive elements
- States worth showing in the preview
- Aesthetic direction
- Visual system choices
- Memorable moment
- Variant strategy (if applicable)
- Any unresolved assumptions that need to be called out

If the brainstorm note is not actually UI-focused, tell the user and ask whether to continue with a conceptual mockup or stop.

### Step 3: Parse Variant Instructions

1. If the design brief or user request asks for multiple variants, create 2-3 distinct directions.
2. Each variant must differ meaningfully in at least two of the following:
   - aesthetic direction
   - typography system
   - palette
   - layout composition
   - memorable moment
3. Do not create shallow palette swaps.
4. Name variants clearly, for example `editorial-dark`, `premium-athlete`, or `race-console`.

### Step 4: Generate the HTML Preview

1. Read `templates/prototype-template.html`.
2. Replace placeholders with a concept-specific implementation:
   - `{{TITLE}}` - Page title based on the idea
   - `{{FONT_PRELOADS}}` - Optional font imports or leave blank
   - `{{DESIGN_TOKENS}}` - CSS variables for palette, typography, radius, shadows, spacing, and textures
   - `{{BASE_STYLES}}` - Layout and reusable component styling for the chosen concept
   - `{{MOTION_STYLES}}` - Hover, focus, reveal, or transition rules
   - `{{BODY_CLASS}}` - Theme or concept class name
   - `{{BODY}}` - The actual semantic HTML for the screen
3. Build a screen that demonstrates hierarchy, intentional typography, and at least one standout visual moment.
4. Use sample content that feels product-specific rather than generic lorem ipsum.
5. Save each result to `brain-storm/previews/{idea-name}.html` or variant-specific filenames.
6. If the environment supports it, optionally open the file with a local browser command.

### Step 5: Self-Critique Before Finishing

Before finalizing, check:
- Does this look specific to the product idea?
- Is the typography intentional rather than default?
- Is there a clear visual hierarchy?
- Is there one memorable moment?
- Would a designer recognize an aesthetic point of view?
- Did you apply the design brief rather than merely mention it?
- Did you avoid generic AI-dashboard styling?

If the answer to multiple questions is no, revise the preview before returning it.

### Step 6: Report

Return a concise report in the final response:

```markdown
## UI Prototype Preview Report

| Field | Value |
|-------|-------|
| Source Idea | `brain-storm/{idea-file}.md` |
| Design Brief | `brain-storm/design/{idea-name}-design.md` or `{user path}` |
| Output HTML | `brain-storm/previews/{idea-name}.html` or `{variant files}` |
| Variant Count | {1 / 2 / 3} |
| Aesthetic Direction | {chosen concept or concepts} |
| Memorable Moment | {signature visual move} |
| Key Interactions | {buttons / filters / forms / navigation} |

### Notes
- {important assumptions or follow-up opportunities}

### Next Steps
- Refine the design brief and rerun the prototype if stronger brand constraints are needed
- Convert the idea into a buildable spec: `/writing-specs {idea title}`
```
