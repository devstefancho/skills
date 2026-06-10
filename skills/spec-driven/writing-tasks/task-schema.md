# Task File Frontmatter Schema & Validation

## Frontmatter schema

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

## Validation rules (run on every write)

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

## Task body sections

From [templates/task-template.md](templates/task-template.md):

- `## 의존성` — list of `- id (title) — reason` for each `depends_on`. Cross-phase deps must have a reason.
- `## 사전 준비` — checkboxes for environment/secret setup.
- `## 구현 체크리스트` — checkboxes, typically one per file or logical unit. Checked as commits land.
- `## Definition of Done` — verification criteria.
- `## 리스크 / 메모` — gotchas.
