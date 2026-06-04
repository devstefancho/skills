---
argument-hint: "[idea-name or brainstorm-file] [optional direction or notes]"
description: "Generate one or more UI prototype previews from a saved brainstorm idea, using a DESIGN.md brief when needed"
---

# UI Prototype Preview Command

Use the `ui-prototype-preview` skill to turn a saved brainstorm idea into one or more standalone HTML prototypes. This command is intentionally a thin wrapper around the skill: it provides explicit slash-command UX and argument hints, while the skill owns the real generation logic.

## Arguments

- `$ARGUMENTS` - Idea name, brainstorm file reference, and any optional guidance such as a direction, design note, or revision request

Examples:
- `/ui-prototype-preview running-portfolio-narrative-dashboard`
- `/ui-prototype-preview running-portfolio-narrative-dashboard editorial dark`
- `/ui-prototype-preview @brain-storm/running-portfolio-narrative-dashboard.md create 3 variants using our brand system`

## Command Behavior

1. Resolve the source idea from `$ARGUMENTS`.
2. Check for a relevant design brief in one of these places:
   - A file explicitly referenced in `$ARGUMENTS`
   - `brain-storm/design/{idea-name}-design.md`
   - Another matching file in `brain-storm/design/`
3. If the request is complex (multiple variants, brand colors, typography preferences, layout constraints, anti-patterns, or references) and no design brief exists:
   - scaffold a design brief from `../templates/design-brief-template.md`
   - save it under `brain-storm/design/{idea-name}-design.md`
   - continue with a first prototype pass unless the user explicitly asked to review the brief first
4. Generate the prototype HTML output under `brain-storm/previews/`.
5. If variants are requested, create 2-3 materially different outputs rather than shallow palette swaps.
6. Return a concise report including:
   - source idea path
   - design brief path
   - output HTML path(s)
   - variant count
   - chosen aesthetic direction(s)

## Quality Bar

- Prefer a strong visual point of view over a generic dashboard layout.
- If the user gives detailed brand constraints, apply them through the design brief rather than ignoring them.
- If multiple variants are requested, make sure the variants differ in composition, typography, and memorable moment — not just color.
