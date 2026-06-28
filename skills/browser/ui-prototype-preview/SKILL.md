---
name: ui-prototype-preview
description: Generates a distinctive standalone HTML preview from a saved UI brainstorm idea. Use when the user wants to visualize a brainstorm idea as a concrete mockup, prototype, preview, landing page, dashboard, or product screen with strong design quality.
allowed-tools: Read, Write, Glob, Grep, Bash, AskUserQuestion
context: fork
agent: general-purpose
metadata:
  public: true
---

# UI Prototype Preview

Turn a saved `brain-storm/` idea into a self-contained HTML prototype. Run after `brain-storm` when a UI-focused idea needs a stronger visual artifact before specification or implementation. **The result must look deliberately designed — never a generic AI dashboard.**

## Hard Rules

- Save previews to `brain-storm/previews/{idea-name}.html`; variants to `brain-storm/previews/{idea-name}-{variant-slug}.html`. Save design briefs to `brain-storm/design/{idea-name}-design.md` unless the user gives another path. Lowercase-with-hyphens; create directories as needed.
- The HTML is standalone — embedded `<style>`, no build step, semantic structure, accessible text labels.
- Desktop-first responsive layout unless the idea clearly targets mobile. Locally safe font stacks; import web fonts only when the environment clearly supports them.
- **One standout idea.** Every preview has a single memorable visual or interaction moment.
- **Concept first, code second.** Commit to a named aesthetic direction before writing any HTML.
- Report traceability: source brainstorm file, chosen direction, design brief used, output path.

## Phase 0 — Resolve the design brief

Use a `DESIGN.md`-style brief whenever the request includes any of: 2+ variants, exact brand colors or theme tokens, font/typography preferences, a design system or UI kit influence, explicit forbidden aesthetics, device/layout preferences (mobile-first, landing-page-first, dashboard-first), or reference links/screenshots/brand keywords. Simple requests may skip the brief — but constraint-heavy requests get a brief, not an overloaded prompt.

1. Search in order: user-provided path → `brain-storm/design/{idea-name}-design.md` → other `brain-storm/design/**/*.md`.
2. If a suitable brief exists, read and apply it.
3. If none exists and the request is complex, generate one from `templates/design-brief-template.md`, fill it with defaults derived from the idea, save it to `brain-storm/design/{idea-name}-design.md`, tell the user, and continue — unless they asked to review the brief first. A filled sample: [examples/running-portfolio-design.sample.md](examples/running-portfolio-design.sample.md).

## Phase 1 — Find the source idea

- [ ] `Glob brain-storm/**/*.md`; if no file was specified or the match is ambiguous, ask which idea to use.
- [ ] Read the selected file; extract title, summary, proposed approach, wireframe, open questions.
- [ ] If the note is not actually UI-focused, say so and ask whether to continue with a conceptual mockup or stop.

## Phase 2 — Commit to a design before coding

Write a concise internal brief from the brainstorm file plus any resolved `DESIGN.md`: primary user goal, key sections and layout hierarchy, core interactions, states worth showing, aesthetic direction, visual system choices, memorable moment, variant strategy, and unresolved assumptions to call out.

Define all four pillars in [design-standard.md](design-standard.md) — product context, named aesthetic direction, visual system, memorable moment — **before** writing HTML.

## Phase 3 — Variants (only if requested)

- Create 2-3 distinct directions; each must differ meaningfully in at least two of: aesthetic direction, typography system, palette, layout composition, memorable moment.
- **No shallow palette swaps.** Name variants clearly: `editorial-dark`, `premium-athlete`, `race-console`.

## Phase 4 — Generate the HTML

1. Read `templates/prototype-template.html` and replace its `{{...}}` placeholders with a concept-specific implementation — see the placeholder reference in [design-standard.md](design-standard.md).
2. Demonstrate hierarchy, intentional typography, and at least one standout visual moment. Sample content must feel product-specific, not generic lorem ipsum.
3. Save to the output paths above. Optionally open the file with a local browser command if the environment supports it.

## Phase 5 — Self-critique gate

- [ ] Looks specific to the product idea?
- [ ] Typography intentional rather than default?
- [ ] Clear visual hierarchy?
- [ ] One memorable moment?
- [ ] A designer would recognize an aesthetic point of view?
- [ ] Design brief applied, not merely mentioned?
- [ ] No generic AI-dashboard styling?

**If multiple answers are no, revise before returning.**

## Phase 6 — Report

Return the report from [report-format.md](report-format.md) in the final response.

## Anti-patterns

**WRONG:** Inter + generic SaaS card layout by default; safe purple-blue gradients without product justification; evenly spaced identical cards with no hierarchy; placeholder UI with no point of view; decorative effects unrelated to the product story.

**RIGHT:** one named, bold aesthetic direction with one signature move.

If your first instinct looks interchangeable with a random startup admin dashboard, stop and choose a stronger direction. Full detail in [design-standard.md](design-standard.md).
