# Topic-based spec/task authoring (retire the phase axis)

## Context

`writing-specs` and `writing-tasks` organized generated docs by a monotonic **phase** number (`specs/phase-N/`, `tasks/phase-N-slug/`, task id `N.NN`). In real use (runner/web: 80 specs across 7 phases) the phase number carried no meaning and **fragmented coherent topics** — "race" work landed in phase-1, phase-3, phase-6, and all of phase-8. The phase-as-milestone role had already moved to PRD **Stages** (runner/web ADR-0008), leaving the phase directory as pure, meaningless bookkeeping.

## Decision

Organize spec/task output by **Topic** (coherent feature/domain), not phase.

- **Directory axis = Topic.** `docs/specs/<topic>/NN-name.md`, `docs/tasks/<topic>/NN-name.md`. Topic is inferred from the conversation and matched against existing topic directories before a new one is created.
- **Sequencing lives in `depends_on`**, not directory order. The folder says nothing about order.
- **Task id = global, stable, location-independent counter** (e.g. `id: "127"`), zero-padded, max-scanned on create. Chosen over topic-scoped ids (`race.04`) so renaming a Topic never breaks cross-references. Filenames stay topic-local (`04-name.md`); the global id is the only cross-reference handle. This is why a file at `race/04-*.md` carries `id: "127"` — surprising on first read, deliberate for rename-safety.
- **One coordination doc is allowed** under `tasks/` (`CONSTRAINTS.md`) for cross-cutting WHY that `depends_on` cannot express (ordering/regulatory/structural reasons). This reverses the prior "no shared files" rule. Progress, ready-set, parallel lanes, and the dependency graph remain **dynamically derived** (no stored state). Handoff/goal prompts are out of scope — they belong to the `handoff` skill.

## Consequences

- **Contradicts the conclusion of** runner/web **ADR-0008** (which locked a single phase axis and forbade non-phase dirs). That ADR lives in another repo and is not superseded from here — runner/web needs its own ADR update if/when it migrates. ADR-0008's Phase↔Stage split still holds for the *product* axis (Stage); only the technical *Phase directory* is retired here.
- `writing-specs` and `writing-tasks` SKILL.md require rewrites: topic selection replaces phase auto-selection; id scheme, the `spec:` path field, and validation rules change.
- Existing phase-based repos (runner/web: 80 specs) need a migration path — separate decision.
- The single coordination doc reintroduces a small parallel-worktree merge-collision surface; accepted because cross-cutting constraints are discovered rarely.
