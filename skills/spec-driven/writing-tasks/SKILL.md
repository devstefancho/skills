---
name: writing-tasks
description: Decompose specs into persistent task files (tasks/phase-N-slug/NN-name.md) with dependency graph, parallel lane suggestion, and dynamic progress. Use when user mentions task 분리, task 생성, task 쪼개기, spec을 task로, decompose, writing-tasks, 병렬 작업 편성, 의존성 그래프. Proactively trigger when a specs/ directory has unmapped specs or when user wants to track long-running work as persistent task files.
allowed-tools: Read, Write, Glob, Grep, Bash, AskUserQuestion
---

# Writing Tasks

Manages persistent task files under `tasks/` by decomposing specs from `specs/`. Every task has an explicit dependency, progress/lanes are derived dynamically from task files (no shared state files), and parallel-worktree work is safe because each task lives in its own file.

## Core Principles

1. **Task file is the only SSOT** — No `README.md`, `DEPENDENCIES.md`, or `TEMPLATE.md` under `tasks/`. All progress/lanes/graphs are computed dynamically from task file frontmatter.
2. **Spec-driven by default** — Running `/writing-tasks` without arguments triggers decomposition from `specs/` to `tasks/`. Manual creation via `new` is the exception.
3. **Dependency is mandatory** — No task can be created without an explicit `depends_on` (empty array must be consciously declared, not a default).
4. **blocks ↔ depends_on auto-sync** — When A.depends_on includes B, the skill automatically adds A to B.blocks. Never let them drift apart.
5. **Validate on every write** — Circular dependencies, missing ids, phantom spec paths are rejected at write time. Users should never see a broken graph.
6. **Parallel-worktree safe** — Each task is its own file. No shared files under `tasks/` means worktrees never collide.

## Directory Layout (v1 — fixed)

```
specs/
  phase-N/NN-slug.md                      ← input (user-authored or writing-specs)
tasks/
  phase-N-slug/NN-task-slug.md            ← one task per file
```

- **Phase number**: monotonically increasing, cumulative across sprints. Phase 1 → 2 → … → N. Never resets.
- **Phase directory slug**: required, human-readable (e.g. `phase-1-foundation`, `phase-6-analytics`).
- **Local task number**: 2-digit, resets per phase (`01`, `02`, ... `99`). ID format is `N.NN` (e.g. `3.02` for phase 3, task 2).
- **Cross-phase id reference**: always `N.NN` — never ambiguous.

Do NOT create:
- `tasks/README.md`, `tasks/DEPENDENCIES.md`, `tasks/TEMPLATE.md` — all derivable from task files.
- Scripts inside the user's repo (e.g. `scripts/task-status.ts`). The skill computes status itself.

## Task File Frontmatter Schema

```yaml
---
id: "N.NN"
phase: N
title: "한줄 제목"
spec: "specs/phase-N/NN-name.md"
depends_on: ["N.NN", ...]
blocks: ["N.NN", ...]
estimate: "S" | "M" | "L"
status: "todo" | "in_progress" | "review" | "done" | "blocked"
owner: ""
sprint: ""                  # optional, reserved for v2 filtering
completed_at: ""            # optional, ISO date set by implement-with-test when status flips to done
---
```

Reject writes if any required field (`id`, `phase`, `title`, `spec`, `depends_on`, `estimate`, `status`) is missing.

Optional fields (`sprint`, `completed_at`) may be absent or empty. `completed_at` is set automatically by `implement-with-test` when the task transitions to `done`; treat any other value as user-authored.

## Commands

Only two user-facing commands. Everything else is derived.

### `/writing-tasks` (no args) — smart dispatch

Detect state and act:

| State | Action |
|---|---|
| `specs/` has specs without matching tasks | Propose decomposition (see below). Show proposed task list, await approval, then create files. |
| All specs have matching tasks, but work is in progress | Output **status dashboard** (progress %, in_progress tasks, ready tasks, parallel lanes). |
| Detected a new phase directory under `specs/` (e.g. `specs/phase-6/` with no corresponding `tasks/phase-6-*/`) | Ask for the phase slug (e.g. "analytics"), then decompose. |
| All tasks done | Print `All done.` with one-line suggestion (next phase, or archive hint). |

### `/writing-tasks new <description>` — manual task creation

For ad-hoc tasks without a matching spec (hotfixes, refactors).

Flow:
1. Ask: "Which phase does this belong to?" (multi-select of existing phases + `+ new phase`).
2. Show existing task summary (id, title, status) to help user choose dependencies.
3. Ask: "Select `depends_on`:" (multi-select existing task ids).
4. If user selects none: re-confirm "Is this truly independent (no prerequisites)?" Must opt-in explicitly.
5. Ask for estimate (S/M/L).
6. Generate next local number in that phase.
7. Write task file from template (see `templates/task-template.md`).
8. Auto-sync: add new id to each dependency's `blocks`.
9. Run validate.

## Decomposition Flow (primary path)

When `/writing-tasks` detects unmapped specs:

### Step 1 — Scan

```
Glob specs/**/*.md
Glob tasks/**/*.md
```

Diff: specs present but not referenced by any task's frontmatter `spec:` field.

### Step 2 — Propose

For each unmapped spec, read its content and decide:
- **S (< 200 lines, simple)** → 1 task per spec.
- **M / L (multiple sections, many files)** → propose N tasks per spec (one per major section / milestone). If ambiguous, ask user.

For each proposed task, infer `depends_on` from **four signals**:
1. **Phase block order** — tasks in lower phases default as candidate prerequisites.
2. **Spec body parsing** — `grep` the spec for references to other spec paths (e.g. `specs/phase-2/04-auth.md`), words like "requires", "선행", "depends on".
3. **Spec frontmatter inheritance** — if the spec has `depends_on` at the file level, carry it over.
4. **Shared module heuristic (flag only)** — if two specs mention the same `packages/*/src/**` path, flag as "potential sequential", require user confirmation (never auto-decide).

Output a preview table:

```
Phase 3 — profile (6 specs → 8 tasks)
  3.01  d1-profile-migration      no deps
  3.02  profile-api-patch         depends_on: [3.01, 2.04]
  3.03  profile-api-delete        depends_on: [3.01, 2.04, 5.03]
    ⚠ cross-phase: 5.03 (recommendation_events table required before delete)
  ...
```

Use `AskUserQuestion` with options: `proceed / edit / cancel`. On `edit`, let the user modify dependencies interactively.

### Step 3 — Write

- Create phase directory (`tasks/phase-N-slug/`) if new. Ask for slug if it's a brand-new phase.
- Write each task file from `templates/task-template.md`.
- Fill frontmatter, body sections (dependency reasoning, spec backlink, skeleton checklist from spec sections).
- After all writes: run validate once.

### Step 4 — Report

Emit a concise summary:

```
✅ Decomposition complete
   Phases created:  phase-3-profile (new), phase-4-news (new)
   Tasks created:   14
   Cross-phase deps detected and documented in body: 2
   Validation:      clean
```

## Status Dashboard (derived, no stored file)

When `/writing-tasks` runs with fully-mapped tasks:

```
📊 Progress: X / Y done (Z%)

   Phase 1 — foundation         ████████░░░░  6/12
   Phase 2 — auth               ██░░░░░░░░░░  2/9
   ...

🔵 In progress (N):
   <id>  <title>          <duration since status change>

✅ Ready to start (N):
   <id>  <title>          (all deps met)

⚡ Suggested parallel lanes (only show if >= 2 ready tasks):
   Lane A: [ids]     → touches <shared module>
   Lane B: [ids]     → touches <different module>

⚠️  Blocked (N):
   <id> waiting on <id>

⚠️  Validation issues (only if any):
   <brief list>
```

### Computing "ready"

A task is ready when `status == "todo"` AND every id in `depends_on` has `status == "done"`.

### Computing parallel lanes

For all ready tasks:
1. Read each task's `구현 체크리스트` section, extract file paths / module directories.
2. Group by shared top-level module directory (e.g. `packages/api/src/routes/`).
3. Same group → same lane (sequential). Different groups → different lanes (parallel).
4. Flag conflicts when two lanes touch the same directory but are split by the user manually.

## Validation Rules (run on every write)

Reject if any fail:
- **Duplicate id** — two task files with the same `id`.
- **Phantom dependency** — `depends_on` references an id that doesn't exist.
- **Circular dependency** — any cycle in the depends_on graph.
- **Phantom spec** — `spec:` field points to a non-existent file (use `Glob` to check).
- **Missing required field** — any of the required frontmatter fields absent.
- **Asymmetric blocks/depends_on** — if A.depends_on has B, then B.blocks must have A. Auto-fix silently (this is a write-through invariant, not a user error).

Warn (non-blocking):
- Task with `depends_on: []` but body's "의존성" section is empty — prompt to add reasoning or mark as "독립 task".
- Orphan task — task whose `spec:` was deleted (spec file no longer exists).
- **Non-schema status value** — if `status` is anything other than the five enum values (e.g. `completed`, `partial`, `failed`), normalize it for dashboard purposes (`completed`→`done`, `failed`→`blocked`, `partial`→`review`) and warn. Do not auto-rewrite the file; surface the file path so the user can fix it.

## Incremental Updates

On re-run, preserve existing task files:
- **New spec** → add new task(s), never overwrite existing.
- **Modified spec** → do NOT rewrite the matching task. Instead ask: "Spec `X` was modified. Resync task `N.NN`? [show diff]"
- **Deleted spec** → mark matching task as orphan (warning). Do not auto-delete.
- **Task completed** (`status: done`) → never modify its body on resync unless user explicitly asks.

## Task Body Template

See [templates/task-template.md](templates/task-template.md). Core sections:
- `## 의존성` — list of `- id (title) — reason` for each `depends_on`. Cross-phase must have a reason.
- `## 사전 준비` — checkboxes for environment/secret setup.
- `## 구현 체크리스트` — checkboxes, typically one per file or logical unit. Checked as commits land.
- `## Definition of Done` — verification criteria.
- `## 리스크 / 메모` — gotchas.

## Worktree Integration

The skill detects `.claude/worktrees/task-N.NN-*` branch naming. When invoked inside such a worktree:
- Auto-detect which task the worktree belongs to (parse branch name).
- Offer to transition `todo → in_progress` on that task.
- Show only that task's checklist as "Next up" in the status output.

## What This Skill Does Not Do

- Does not create worktrees — use `git-worktree-plugin` for that.
- Does not create specs — use `writing-specs` for that (the natural pair).
- Does not run tests or implement code — use `implement-with-test`.
- Does not manage todos in Obsidian vault — use `task-manager` (`/td`).

## Interaction Style

- Keep outputs tight. Status dashboard fits on one screen.
- Never create shared files the user didn't ask for. Only `tasks/phase-N-slug/NN-name.md`.
- All user decisions go through `AskUserQuestion`.
- When proposing decompositions, show the inference trail (which signal → which dependency) so the user can correct.

## Non-interactive defaults

If `AskUserQuestion` is unavailable (auto mode, headless agent, scheduled run), use these defaults and echo every defaulted decision back in the Step 4 report so the user can override.

| Decision point | Default | Rationale |
|---|---|---|
| Decomposition proposal (`proceed/edit/cancel`) | `proceed` | The proposal is already grounded in the four signals; user can edit task files after. |
| Phase slug for a brand-new phase | Derive from spec filename(s): kebab-case, drop trailing numbers, truncate to 3 words. Example: `specs/phase-3/01-profile-migration.md` → `phase-3-profile`. | Deterministic, recoverable. |
| Modified spec encountered (resync diff?) | **Skip resync**, surface the orphan-warning style note in the report. | Never silently rewrite a task body that may have been hand-edited. |
| Manual `/writing-tasks new` (phase / depends_on / estimate) | **Refuse** in non-interactive mode: report "manual task creation requires interactive input." | These are intent-heavy decisions; defaulting them silently produces wrong graphs. |
| `depends_on: []` warning + empty 의존성 section | Auto-write `독립 task` placeholder in the body and warn in the report. | Keeps validation clean; warning surfaces it for human review. |
