---
name: test-commit-push-pr-clean
description: Runs a branch-safe finish workflow that lints, tests, commits, pushes, creates a pull request, and cleans merged worktrees. Use when the user asks to finish work, test and commit changes, push a branch, open a PR, or clean completed worktrees.
---

# Test Commit Push PR Clean

Finish feature-branch work end to end. Honor user-provided skip flags such as `--skip lint,test,push,pr,clean`.

## Skip flags

Keys: `lint`, `test`, `push`, `pr`, `clean`. Example: `--skip push,pr,clean`.

## Phase 1 — Inspect

- [ ] `git status`, `git branch --show-current`, `git worktree list`, recent commits

**Never commit on a default branch** (`main`, `master`, `develop`). Stop and tell the user to create a feature branch or worktree.

## Phase 2 — Verify (unless skipped)

- [ ] Run lint/format checks discoverable from package scripts or local tooling
- [ ] Run the project's tests; if coverage is configured, treat coverage regressions as failures to resolve before committing

## Phase 3 — Commit

Group changes into logical commits. Conventional types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `style`, `perf`. Prefer a concise Korean title when the repository convention is Korean.

**Never revert work you did not make.** Keep unrelated user changes intact.

## Phase 4 — Push and PR (unless skipped)

- [ ] Push the current branch to its upstream or to `origin`
- [ ] `gh pr create`, following the repository's title and body conventions

Write the PR body in Korean unless a project convention overrides it. Include: user-facing summary, implementation details grouped by area, tests/checks that passed, and any deployment or manual verification still needed.

## Phase 5 — Clean (unless skipped)

Inspect `git worktree list`. Remove only worktrees that are **clearly merged** and **not the current working tree**.

## Reference

Full Claude slash-command template: `commands/test-commit-push-pr-clean.md`.
