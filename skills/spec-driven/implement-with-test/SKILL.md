---
name: implement-with-test
description: Implements a task as production code plus tests, auto-detecting the test framework (jest, vitest, pytest, go test, cargo test) and following existing project patterns. Task information comes from an argument (description or task file path) or the current conversation. Use when user asks to implement a task, build a feature with tests, or says "implement", "구현", "구현해줘", "테스트와 함께 구현". Proactively trigger whenever the user wants to turn a task or requirement into working code with tests.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, AskUserQuestion
context: main
agent: general-purpose
---

# Implement with Test

Turn a task into production code plus tests that fit naturally into the existing codebase.

## Hard Rules

- **Never code without a task definition.** Extract Purpose / Requirements / Approach / Verification first — this kills aimless coding and scope creep.
- **Follow project patterns; never impose external ones.** Code that looks foreign is a maintenance burden even when technically correct.
- **Tests are part of the implementation, not an afterthought.** Every Verification item maps to at least one test.
- **Never report success while tests fail.** Run to green (max 3 fix attempts) or report the failure honestly. Green is the definition of "done".
- **Minimal diff.** Only files the task needs. No refactors of surrounding code, no drive-by "improvements", no unrelated annotations.

## Phase 1 — Resolve the task

Exactly two sources:

1. **Argument** — a file path (`specs/*.md`, `tasks/*.md`, any task `.md` → `Read` and parse) or a direct natural-language description (parse in place).
2. **No argument** — infer from recent conversation turns.

Extract into: **Purpose** (1-2 sentences) · **Requirements** (3-5 bullets) · **Approach** (2-5 sentences) · **Verification** (2-5 testable bullets). Display the summary.

- [ ] Task extracted into the four sections
- [ ] Conversation-inferred task confirmed with the user (file-based tasks may skip unless ambiguous — conversation-inferred tasks are the most error-prone)

## Phase 2 — Reconnaissance

1. **Language/framework** — check `package.json`, `tsconfig.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, `pom.xml`; read the relevant config.
2. **Test framework** — follow the priority order in [reference.md](reference.md). Not detected → ask via `AskUserQuestion`.
3. **Test patterns** — `Glob **/*.test.* **/*.spec.* **/test_* **/*_test.* **/__tests__/**`, read 1-2 test files: import style, assertion library, structure, setup/teardown, mocking approach, file naming convention, file location (colocated / `__tests__/` / `tests/`).
4. **Source patterns** — identify the source layout (src/, lib/, app/), read 1-2 similar source files: imports, export style, error handling.

## Phase 3 — Plan

List production files to create/modify (with brief descriptions), test files (detected naming + location), and the Verification → test mapping. Show as an informational summary — no confirmation needed, just transparency.

## Phase 4 — Implement

Follow the Approach for architecture. Match existing import/naming/error-handling patterns. Handle edge cases from Requirements. Keep functions focused. Export only what testability requires.

## Phase 5 — Tests

- At least one test per Verification bullet; edge-case tests when Requirements mention them.
- Use the detected framework, assertion library, and existing mocking/setup patterns.
- Descriptive names — the test name alone should state what's being verified.
- Avoid over-mocking; test real behavior where practical.

## Phase 6 — Run to green & report

1. Run the detected test command via `Bash` (per-language commands in [reference.md](reference.md)).
2. On failure (max 3 attempts): read errors carefully, distinguish implementation bug from test bug, fix the root cause not the symptom, re-run.
3. Fill [templates/report-template.md](templates/report-template.md) — all five sections, per the section rules in [reference.md](reference.md) — and output it as the final message.

- [ ] Tests pass, or remaining failures reported honestly with error details

## Phase 7 — Task document update

Only when the Phase 1 argument was a **file path**; skip for description- or conversation-sourced tasks.

Status mapping (writing-tasks compatible): all Verification tests pass → `done` · partial pass after 3 attempts → `review` · all fail → `blocked`.

**Surgical edits only** — update status / `completed_at` / passed checklist items, touch nothing else. Exact frontmatter and checklist rules: [reference.md](reference.md).

## Anti-patterns

**WRONG:** "modernize" unfamiliar or old-style test patterns while adding new tests.
**RIGHT:** mirror the existing patterns as-is.

**WRONG:** report success with "just one flaky test left" after 3 failed fix attempts.
**RIGHT:** status `review`, failures listed in the 테스트 section with error details, follow-ups under 다음 단계.

## Edge cases & non-interactive mode

Error-handling table and defaults for when `AskUserQuestion` is unavailable: [reference.md](reference.md).
