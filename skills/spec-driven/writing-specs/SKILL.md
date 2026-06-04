---
name: writing-specs
description: Write and manage spec files with search, conflict detection, and reporting. Use when user asks to create a spec, update a spec, write a spec, or mentions 스펙 생성, 스펙 업데이트, 스펙 작성, 스펙 만들어줘. Proactively trigger whenever the user's request involves specification documents, even if they don't explicitly say "spec".
allowed-tools: Read, Write, Glob, Grep, Bash, AskUserQuestion
context: fork
agent: general-purpose
---

# Writing Specs

Manages spec files in `specs/` directory with conflict detection and concise reporting.

## Principles

1. **Template-driven** - Every spec follows the exact template structure. Never add extra sections or freestyle content. This prevents specs from becoming bloated documents that nobody reads.
2. **Search first** - Always search for existing specs before creating or updating. This catches duplicates, conflicts, and outdated specs early.
3. **One spec = one task** - Each spec covers a single unit of work. If a request spans multiple concerns, split into separate specs.
4. **Concise by default** - Each section has strict limits: Purpose (1-2 sentences), Requirements (max 5 bullets), Approach (2-5 sentences, no code), Verification (max 5 bullets).
5. **Report everything** - Every operation ends with a structured report so the user knows exactly what happened.

## Directory Rules

- Specs live in `specs/` at the project root
- **Default file format (recommended): `specs/phase-N/NN-name.md`**
  - This is the convention `writing-tasks` consumes — using it makes the spec→task handoff zero-friction.
  - `phase-N` is a 1-indexed sprint/milestone number that monotonically increases across the project lifetime (never reset).
  - `NN` is a 2-digit local index within the phase, starting at `01`.
  - Example: `specs/phase-1/01-jwt-authentication.md`, `specs/phase-3/02-profile-delete.md`
- Alternative formats (only when no `writing-tasks` integration is planned): `specs/{name}.md` or `specs/{subdir}/{name}.md`
- Only 1-depth subdirectories allowed (e.g., `specs/phase-1/auth.md` is OK, `specs/phase-1/v2/auth.md` is NOT)
- Filenames use lowercase-with-hyphens (e.g., `jwt-authentication.md`)
- Create subdirectories (or new phases) only when the user explicitly requests grouping or when there are 5+ specs that share a clear category

### Choosing the phase + NN automatically

When the user does not specify a phase or number:
1. `Glob specs/phase-*/` → list existing phases. If none, default to `phase-1`.
2. Pick the **active phase**: the highest-numbered existing phase, unless the user signals a new milestone (in which case create `phase-{N+1}`).
3. `Glob specs/phase-N/*.md` → find the highest existing `NN`. New spec gets `NN+1`, zero-padded.
4. If the spec belongs to an explicitly different milestone (different feature epic, separate timeline), ask the user via `AskUserQuestion` whether to create a new phase.

## Workflow

### Phase 0: Argument Resolution

The user-provided argument can be one of four shapes. Resolve it to a single **input source** before searching.

| Argument shape | Resolution |
|---|---|
| Path to a `brain-storm/{name}.md` (or `brain-storm/{subdir}/{name}.md`) file | `Read` the file. Treat its `Summary`, `Motivation`, `Proposed Approach` as the spec source. The brain-storm idea title becomes the spec H1. |
| Path to any other markdown file | `Read` it and treat its content as the spec source. |
| Bare title or keyword (e.g. `"List Filter and Search"`) | `Glob brain-storm/**/*.md` and match the title (case-insensitive H1 match, then filename slug match). If exactly one match, use it. If multiple, list candidates via `AskUserQuestion`. If zero, treat the argument as a freestyle description (next row). |
| Freestyle natural-language description, or no argument | Use the conversation context. If empty, ask the user via `AskUserQuestion` what spec to create. |

When a brain-storm idea is the source, carry over its content explicitly:
- The idea's `Summary` → seeds the spec `Purpose`.
- The idea's `Proposed Approach` bullets → seeds `Requirements` (prune to 3-5 concrete items) and the prose `Approach`.
- The idea's `Wireframe` and `Open Questions` are **not** copied (template has fixed sections); mention them in the final report under "Carried over" so the user knows what was dropped.

After resolution, proceed to Phase 1 with the resolved input source.

### Phase 1: Search (mandatory)

Before any create or update operation, search for existing specs:

1. Run `Glob specs/**/*.md` to list all existing spec files
2. Extract 3-5 key nouns from the user's request (skip generic words like "system", "feature", "add", "update")
3. Run `Grep` for each keyword across all found spec files
4. Classify results:
   - **Exact match**: A spec covering the same topic already exists
   - **Related**: A spec shares 2+ keywords or covers an adjacent topic
   - **Outdated**: A spec references files/paths that no longer exist (verify with `Glob`)

If no `specs/` directory exists yet, skip search and proceed to Phase 3.

### Phase 2: Decision

Based on search results:

- **No related specs found** → Proceed to create
- **Exact match found** → Ask user: "이미 동일한 스펙이 존재합니다: `{path}`. 업데이트할까요, 새로 생성할까요, 아니면 취소할까요?"
- **Related specs found** → Show list and ask: "관련 스펙이 발견되었습니다. 어떻게 진행할까요?"
- **Outdated specs found** → Inform user and offer to update: "다음 스펙이 outdated 상태입니다 (참조 파일 없음). 함께 업데이트할까요?"

Use `AskUserQuestion` for all user decisions.

### Phase 3: Write

1. Read the spec template: [templates/spec-template.md](templates/spec-template.md)
2. Fill each section based on the user's request, strictly following the template structure
3. Resolve the destination path using the **Choosing the phase + NN automatically** rules in Directory Rules (default to `specs/phase-N/NN-name.md`).
4. Write to the resolved path under `specs/`
5. If updating an existing spec, preserve any content the user didn't ask to change

Section constraints (enforced, not suggested):
- **Purpose**: Exactly 1-2 sentences. No bullet points.
- **Requirements**: 3-5 bullet points. Each bullet is one concrete requirement.
- **Approach**: 2-5 sentences in paragraph form. No code snippets.
- **Verification**: 2-5 bullet points. Each describes a testable scenario.

### Phase 4: Outdated Cleanup

If outdated specs were found in Phase 1:
- For each outdated spec, check what references are broken
- Propose specific updates (do NOT auto-modify)
- Only update after user confirmation

### Phase 5: Report

Read the report template and fill it in: [templates/report-template.md](templates/report-template.md)

Output the completed report as the final message. This is how the user sees what happened.

- **Action**: "Created" or "Updated"
- **File**: Full relative path from project root
- **Title**: The spec's H1 title
- **Search Results**: List each related/outdated spec found, or "No related specs found"
- **Changes**: For updates, summarize what changed. For new specs, say "New spec created"
- **Next Steps**: One actionable suggestion (e.g., "Run implementation" or "Review related spec at specs/auth.md")

---

## Non-interactive defaults

If `AskUserQuestion` is unavailable (auto mode, headless agent, scheduled run), use these defaults and echo every defaulted decision in the Phase 5 report so the user can override.

| Decision point | Default | Rationale |
|---|---|---|
| Phase 0: title matches multiple brain-storm files | Pick the file whose H1 exactly matches (case-insensitive) the argument; if still ambiguous, pick the first by alphabetical filename. | Determinism > guessing user intent. |
| Phase 0: no input source resolvable (no arg, no conversation context) | Refuse: report "no spec source identified, please provide a brain-storm path or description." | Silent guessing produces wrong specs. |
| Phase 2: exact match found | **Update** the existing spec, preserving any sections the user did not ask to change. | The intent is almost always "evolve the existing spec." |
| Phase 2: related specs found | Proceed with a **new file**, listing the related specs in the report so the user can merge later if needed. | Avoid silent merges into adjacent specs. |
| Phase 2: outdated specs found | Skip auto-update; list them in the report under "Outdated specs detected". | Phase 4 explicitly forbids auto-modify. |
| Choosing phase + NN: ambiguous milestone | Use the **active phase** (highest existing) and append `NN+1`. Do not create a new phase automatically. | New phases imply a milestone boundary the user should own. |
