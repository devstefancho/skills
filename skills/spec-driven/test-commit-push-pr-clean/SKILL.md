---
name: test-commit-push-pr-clean
description: Run a branch-safe finish workflow: lint, test, commit, push, create a pull request, and clean merged worktrees. Use when the user asks to finish work, test and commit changes, push a branch, open a PR, or clean completed worktrees.
---

# Test Commit Push PR Clean

Use this skill to finish feature-branch work in a repository. Respect user-provided skip flags such as `--skip lint,test,push,pr,clean`.

## Workflow

1. Inspect the current repository state with `git status`, `git branch --show-current`, `git worktree list`, and recent commits.
2. Stop before making commits if the current branch is a default branch such as `main`, `master`, or `develop`; tell the user to create a feature branch or worktree.
3. Unless skipped, run the project's lint or format checks when they are discoverable from package scripts or local tooling.
4. Unless skipped, run the project's tests. If coverage is configured, treat coverage regressions as failures to resolve before committing.
5. Group changes into logical commits. Keep unrelated user changes intact and never revert work you did not make.
6. Unless skipped, push the current branch to its upstream or to `origin`.
7. Unless skipped, create a pull request with `gh pr create`, following the repository's title and body conventions.
8. Unless skipped, inspect merged worktrees with `git worktree list` and remove only worktrees that are clearly merged and not the current working tree.

## Skip Flags

Available skip keys are:

- `lint`
- `test`
- `push`
- `pr`
- `clean`

Example: `--skip push,pr,clean`.

## Commit Guidance

Use conventional commit types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `style`, or `perf`. Prefer a concise Korean title when the repository convention is Korean.

## Pull Request Guidance

Write PR descriptions in Korean when no project-specific convention overrides it. Include:

- user-facing summary
- implementation details grouped by area
- tests or checks that passed
- any deployment or manual verification still needed

For the full Claude slash-command template, see `commands/test-commit-push-pr-clean.md`.
