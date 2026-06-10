---
name: brain-storm
description: Brainstorms grounded feature ideas from the current codebase and saves them as wireframed notes in `brain-storm/` — the ideation step before writing specs. Use when the user asks to brainstorm ideas, generate feature ideas, explore improvements, review future opportunities, or clean up outdated brainstorm notes.
allowed-tools: Read, Write, Glob, Grep, Bash, AskUserQuestion
context: fork
agent: general-purpose
---

# Brain Storm

Ideation before `/writing-specs`. Scan the codebase, propose grounded ideas, attach ASCII wireframes, save selected ideas to `brain-storm/`.

## Modes

- **Brainstorm** — generate, compare, and save new ideas.
- **Cleanup** — detect already-implemented notes and remove them after confirmation. Triggered by "clean up brainstorm notes" or "remove ideas that are already implemented".

## Hard Rules

- Ideas live in `brain-storm/{name}.md` or `brain-storm/{subdir}/{name}.md`. One subdirectory level max; filenames lowercase-with-hyphens.
- Create subdirectories only when the user asks for grouping or 5+ ideas share a domain.
- **One idea = one file**, and every saved idea includes an ASCII wireframe or system sketch.
- Ground every idea in the actual codebase — explore before proposing, diverge before converging.
- **Never delete a brainstorm note without evidence-based verification and explicit user approval.**

## Brainstorm Mode

### Phase 1 — Scan and ideate

1. `Glob` key directories (`src/**`, `app/**`, `pages/**`, `components/**`, `lib/**`); read `package.json`, `README.md`, and obvious entry points.
2. `Glob brain-storm/**/*.md` to inspect existing notes.
3. Propose 3-5 ideas, each with **Title**, 1-2 sentence **Description**, **Complexity** (Low/Medium/High), and a 3-5 line ASCII sketch. Make them actionable and varied in scope.
4. Ask the user which ideas to save.

### Phase 2 — Deduplicate and write

For each selected idea:

- [ ] `Grep` `brain-storm/**/*.md` for 3-5 key nouns from the title/description. On a duplicate or near-duplicate, ask whether to update the existing file, create new, or skip.
- [ ] Read `templates/idea-template.md` and `templates/wireframe-guide.md`.
- [ ] Fill every section — Summary (1-2 sentences), Motivation (2-4 sentences referencing specific codebase areas), Proposed Approach (3-7 bullets, no code snippets), Wireframe (fenced ASCII, at least 10 lines), Complexity (with one-sentence reason), Open Questions (1-3 bullets).
- [ ] Write the file under `brain-storm/`.

### Phase 3 — Report

Include the report from [report-format.md](report-format.md) in the final response. **The report is part of the response, never a separate file.**

## Cleanup Mode

### Phase 1 — Detect implemented ideas

1. `Glob brain-storm/**/*.md` to list all notes.
2. For each: read it, extract title and summary, then extract 3-5 implementation-indicator keywords (component names, function names, routes, API endpoints).
3. `Grep` those keywords in source code, excluding `brain-storm/`, `specs/`, `node_modules/`, `.git/`.
4. Mark implemented **only** when multiple matches clearly represent the described functionality — not TODOs or naming coincidence.

### Phase 2 — Confirm and delete

- [ ] Present implemented candidates with supporting evidence.
- [ ] Ask the user — delete all, delete selected, or cancel.
- [ ] Delete only after explicit confirmation.
- [ ] Report status and evidence for each reviewed idea.

## Non-interactive Defaults

If `AskUserQuestion` is unavailable (auto mode, scheduled run, headless agent) or the user said "automatic" / "no questions", use these defaults. **Always echo the defaulted decisions in the final report so the user can override.**

| Decision point | Default | Rationale |
|---|---|---|
| Which ideas to save (Brainstorm Phase 1) | Save 2 ideas: the most diverse pair (1 UX/polish + 1 new capability), preferring Low/Medium complexity. | Diversity beats volume; low complexity proves the workflow without committing to large work. |
| Duplicate detected (Brainstorm Phase 2) | Skip writing the new file. | Never overwrite user-authored notes silently. |
| Cleanup deletion (Cleanup Phase 2) | **Refuse** — report candidates only, do not delete. | Deletion is unrecoverable; require an explicit follow-up command. |
