---
name: writing-tasks
description: Decomposes specs into persistent task files under tasks/ with a dependency graph, parallel lane suggestions, and dynamically derived progress. Use when user mentions task 분리, task 생성, task 쪼개기, spec을 task로, decompose, writing-tasks, 병렬 작업 편성, 의존성 그래프. Proactively trigger when a specs/ directory has unmapped specs or when user wants to track long-running work as persistent task files.
allowed-tools: Read, Write, Glob, Grep, Bash, AskUserQuestion
---

# Writing Tasks

Decompose specs from `specs/` into one-file-per-task under `tasks/`. Progress, lanes, and graphs are always computed from task frontmatter — never stored.

## Hard Rules

- **Task files are the only SSOT.** Never create `tasks/README.md`, `tasks/DEPENDENCIES.md`, `tasks/TEMPLATE.md`, or status scripts in the user's repo — everything is derivable.
- **`depends_on` is mandatory.** An empty array must be consciously declared, never defaulted.
- **`blocks` ↔ `depends_on` never drift.** When A.depends_on gains B, add A to B.blocks automatically (write-through invariant, silent auto-fix).
- **Validate on every write.** Cycles, duplicate ids, phantom deps/specs are rejected before the file lands. Full rules in [task-schema.md](task-schema.md).
- **Parallel-worktree safe.** One task per file; no shared files under `tasks/` means worktrees never collide.
- **Spec-driven by default.** No-arg invocation decomposes `specs/`; manual `new` is the exception.

## Layout (v1 — fixed)

```
specs/  phase-N/NN-slug.md            ← input (user-authored or writing-specs)
tasks/  phase-N-slug/NN-task-slug.md  ← one task per file
```

- Phase numbers increase monotonically across the project lifetime; never reset.
- Phase directory slug is required, human-readable (`phase-1-foundation`).
- Local task number is 2-digit per phase; the global id is `N.NN` (e.g. `3.02` = phase 3, task 2). Cross-phase references always use `N.NN`.

Frontmatter schema and validation rules: [task-schema.md](task-schema.md). Task body sections come from [templates/task-template.md](templates/task-template.md).

## Commands

Only two user-facing commands. Everything else is derived.

### `/writing-tasks` (no args) — smart dispatch

| State | Action |
|---|---|
| Specs without matching tasks | Propose decomposition, await approval, create files |
| All mapped, work in progress | Print the status dashboard ([dashboard.md](dashboard.md)) |
| New `specs/phase-N/` with no `tasks/phase-N-*/` | Ask for the phase slug, then decompose |
| All tasks done | Print `All done.` + one-line suggestion (next phase or archive hint) |

### `/writing-tasks new <description>` — manual task

For ad-hoc tasks without a spec (hotfixes, refactors):

1. Ask which phase (multi-select existing phases + `+ new phase`).
2. Show existing tasks (id, title, status); ask user to select `depends_on` (multi-select).
3. None selected → re-confirm "Is this truly independent (no prerequisites)?" — explicit opt-in required.
4. Ask estimate (S/M/L), generate next local number, write from [templates/task-template.md](templates/task-template.md).
5. Auto-sync `blocks` on each dependency, then validate.

## Decomposition (primary path)

Sizing rules, the four dependency-inference signals, preview format, and report format: [decomposition.md](decomposition.md).

1. **Scan** — `Glob specs/**/*.md` + `Glob tasks/**/*.md`; diff specs not referenced by any task's `spec:` field.
2. **Propose** — split each unmapped spec into tasks, infer `depends_on` from the four signals, show the preview table with the inference trail (which signal → which dependency) so the user can correct.
3. **Gate** — `AskUserQuestion`: `proceed / edit / cancel`. On `edit`, modify dependencies interactively. **Never write before this gate.**
4. **Write** — create `tasks/phase-N-slug/` if new (ask for slug), write each task from the template, validate once after all writes.
5. **Report** — phases created, task count, cross-phase deps documented, validation result.

- [ ] Preview approved (or non-interactive default applied and echoed in the report)
- [ ] Validation clean after all writes

## Incremental updates (re-runs)

- New spec → add new task(s); never overwrite existing files.
- Modified spec → **never silently rewrite the task.** Ask: "Spec `X` was modified. Resync task `N.NN`?" with a diff.
- Deleted spec → mark the matching task as orphan (warning); never auto-delete.
- `status: done` task → never modify its body on resync unless the user explicitly asks.

## Worktree integration

Inside a `.claude/worktrees/task-N.NN-*` worktree: parse the branch name to detect the task, offer the `todo → in_progress` transition, and show only that task's checklist as "Next up" in status output.

## Anti-patterns

**WRONG:** write `tasks/README.md` or a `scripts/task-status.ts` to track progress.
**RIGHT:** compute the dashboard from task frontmatter on demand ([dashboard.md](dashboard.md)).

**WRONG:** quietly default `depends_on: []` when no dependency is obvious.
**RIGHT:** require explicit independence — user opt-in, or the documented non-interactive default in [decomposition.md](decomposition.md).

## Boundaries

This skill only writes and validates task files. Specs come from `writing-specs` (the natural pair); implementation, tests, and status flips flow through `implement-with-test`. Worktree management and personal todo lists are out of scope. Keep outputs tight — the dashboard fits on one screen.
