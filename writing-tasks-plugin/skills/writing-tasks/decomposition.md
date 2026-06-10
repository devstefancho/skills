# Decomposition Rules

Detail for the decomposition flow in SKILL.md (Scan → Propose → Gate → Write → Report).

## Sizing — how many tasks per spec

Read each unmapped spec and decide:

- **S (< 200 lines, simple)** → 1 task per spec.
- **M / L (multiple sections, many files)** → propose N tasks per spec (one per major section / milestone). If ambiguous, ask the user.

## Dependency inference — the four signals

For each proposed task, infer `depends_on` from:

1. **Phase block order** — tasks in lower phases default as candidate prerequisites.
2. **Spec body parsing** — `grep` the spec for references to other spec paths (e.g. `specs/phase-2/04-auth.md`), words like "requires", "선행", "depends on".
3. **Spec frontmatter inheritance** — if the spec has `depends_on` at the file level, carry it over.
4. **Shared module heuristic (flag only)** — if two specs mention the same `packages/*/src/**` path, flag as "potential sequential" and require user confirmation. **Never auto-decide from this signal.**

## Preview table format

```
Phase 3 — profile (6 specs → 8 tasks)
  3.01  d1-profile-migration      no deps
  3.02  profile-api-patch         depends_on: [3.01, 2.04]
  3.03  profile-api-delete        depends_on: [3.01, 2.04, 5.03]
    ⚠ cross-phase: 5.03 (recommendation_events table required before delete)
  ...
```

Then `AskUserQuestion` with options `proceed / edit / cancel`. On `edit`, let the user modify dependencies interactively.

## Write step detail

- Create the phase directory (`tasks/phase-N-slug/`) if new. Ask for the slug if it's a brand-new phase.
- Write each task file from [templates/task-template.md](templates/task-template.md).
- Fill frontmatter and body sections: dependency reasoning, spec backlink, skeleton checklist derived from spec sections.
- After all writes: run validation once (rules in [task-schema.md](task-schema.md)).

## Report format

```
✅ Decomposition complete
   Phases created:  phase-3-profile (new), phase-4-news (new)
   Tasks created:   14
   Cross-phase deps detected and documented in body: 2
   Validation:      clean
```

## Non-interactive defaults

If `AskUserQuestion` is unavailable (auto mode, headless agent, scheduled run), use these defaults and echo every defaulted decision in the report so the user can override.

| Decision point | Default | Rationale |
|---|---|---|
| Decomposition proposal (`proceed/edit/cancel`) | `proceed` | The proposal is already grounded in the four signals; user can edit task files after. |
| Phase slug for a brand-new phase | Derive from spec filename(s): kebab-case, drop trailing numbers, truncate to 3 words. Example: `specs/phase-3/01-profile-migration.md` → `phase-3-profile`. | Deterministic, recoverable. |
| Modified spec encountered (resync diff?) | **Skip resync**, surface the orphan-warning style note in the report. | Never silently rewrite a task body that may have been hand-edited. |
| Manual `/writing-tasks new` (phase / depends_on / estimate) | **Refuse** in non-interactive mode: report "manual task creation requires interactive input." | These are intent-heavy decisions; defaulting them silently produces wrong graphs. |
| `depends_on: []` warning + empty 의존성 section | Auto-write `독립 task` placeholder in the body and warn in the report. | Keeps validation clean; warning surfaces it for human review. |
