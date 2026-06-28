---
name: writing-specs
description: Writes and manages spec files in specs/ with mandatory duplicate search, conflict detection, and a structured final report. Use when user asks to create a spec, update a spec, write a spec, or mentions 스펙 생성, 스펙 업데이트, 스펙 작성, 스펙 만들어줘. Proactively trigger whenever the request involves specification documents, even if the user never says spec.
allowed-tools: Read, Write, Glob, Grep, Bash, AskUserQuestion
context: fork
agent: general-purpose
---

# Writing Specs

Manage spec files in `specs/` with conflict detection and a concise final report.

## Hard Rules

- **Template-driven.** Every spec follows [templates/spec-template.md](templates/spec-template.md) exactly. No extra sections, no freestyle content.
- **Search before write.** Never create or update a spec without running Phase 1.
- **One spec = one task.** A request spanning multiple concerns becomes multiple specs.
- **Never auto-modify outdated specs.** Propose updates, then wait for confirmation.
- **Always end with the report.** No silent operations.

## Directory Rules

- Specs live in `specs/` at the project root. Filenames are lowercase-with-hyphens.
- **Default path: `specs/phase-N/NN-name.md`** — the convention `writing-tasks` consumes; using it makes the spec→task handoff zero-friction.
  - `phase-N`: 1-indexed milestone number, monotonically increasing across the project, never reset.
  - `NN`: 2-digit index within the phase, starting at `01`. Example: `specs/phase-1/01-jwt-authentication.md`.
- Alternatives (`specs/{name}.md`, `specs/{subdir}/{name}.md`) only when no writing-tasks integration is planned.
- Max 1-depth subdirectories. Create subdirs or new phases only on explicit request, or when 5+ specs share a clear category.

Auto-pick phase + NN when the user does not specify:

1. `Glob specs/phase-*/` — no phases → `phase-1`.
2. Use the highest existing phase, unless the user signals a new milestone → create `phase-{N+1}`.
3. `Glob specs/phase-N/*.md` — new spec gets highest existing `NN` + 1, zero-padded.
4. Spec belongs to a clearly different milestone? Ask via `AskUserQuestion` before creating a new phase.

## Phase 0 — Resolve the input

| Argument shape | Resolution |
|---|---|
| `brain-storm/**.md` path | `Read` it. `Summary` / `Motivation` / `Proposed Approach` become the spec source; the idea title becomes the spec H1. |
| Any other markdown path | `Read` it; its content is the spec source. |
| Bare title or keyword | `Glob brain-storm/**/*.md`, match H1 (case-insensitive) then filename slug. One match → use it. Multiple → `AskUserQuestion`. Zero → treat as freestyle. |
| Freestyle text, or no argument | Use conversation context. Empty → ask via `AskUserQuestion`. |

From a brain-storm source: `Summary` seeds `Purpose`; `Proposed Approach` bullets seed `Requirements` (prune to 3-5 concrete items) and the prose `Approach`. `Wireframe` and `Open Questions` are NOT copied — list them under "Carried over" in the report.

- [ ] Input resolved to exactly one source

## Phase 1 — Search (mandatory)

1. `Glob specs/**/*.md` to list all spec files.
2. Extract 3-5 key nouns from the request (skip generic words like "system", "feature", "add", "update").
3. `Grep` each keyword across the found specs.
4. Classify: **Exact match** (same topic) · **Related** (2+ shared keywords or adjacent topic) · **Outdated** (references files that no longer exist — verify with `Glob`).

No `specs/` directory yet → skip to Phase 3.

## Phase 2 — Decide

- No related specs → proceed to create.
- Exact match → ask: "이미 동일한 스펙이 존재합니다: `{path}`. 업데이트할까요, 새로 생성할까요, 아니면 취소할까요?"
- Related specs → show the list and ask: "관련 스펙이 발견되었습니다. 어떻게 진행할까요?"
- Outdated specs → "다음 스펙이 outdated 상태입니다 (참조 파일 없음). 함께 업데이트할까요?"

All decisions go through `AskUserQuestion`.

## Phase 3 — Write

1. Read [templates/spec-template.md](templates/spec-template.md) and fill it strictly.
2. Resolve the destination with the auto-pick rules above; write under `specs/`.
3. On update, preserve every section the user did not ask to change.

Section limits (enforced, not suggested): **Purpose** 1-2 sentences, no bullets · **Requirements** 3-5 bullets, one concrete requirement each · **Approach** 2-5 sentences, no code · **Verification** 2-5 testable bullets.

## Phase 4 — Outdated cleanup

For each outdated spec found in Phase 1: identify the broken references, propose specific updates, apply only after user confirmation. **Never auto-modify.**

## Phase 5 — Report

Fill [templates/report-template.md](templates/report-template.md) and output it as the final message: Action (Created/Updated), File (relative path), Title (spec H1), Search Results (each related/outdated spec, or "No related specs found"), Changes ("New spec created" or update summary), Next Steps (one actionable suggestion).

## Non-interactive mode

If `AskUserQuestion` is unavailable (auto mode, headless, scheduled), apply the defaults in [non-interactive.md](non-interactive.md) and echo every defaulted decision in the Phase 5 report.
