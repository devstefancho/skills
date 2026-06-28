---
name: create-team
description: Creates and manages an agent team (planner + implementer teammates) for the current worktree session. Use when user says "create team", "팀 생성", "팀 만들어줘", "agent team", or wants a planner+implementer spec-driven workflow in a worktree session. Also covers team operations — cleanup ("팀 정리", end teammates) and expand ("팀원 추가", add a role) — folded from the former agent-team commands.
effort: medium
allowed-tools: Bash, Agent, SendMessage, TeamCreate, TaskCreate, TaskList, TaskUpdate, Read, AskUserQuestion
metadata:
  public: true
---

# Create Team

Spin up a planner + implementer agent team for the current worktree session.

## Team operations (argument dispatch)

This skill owns the full team lifecycle (folded from the former `agent-team` slash commands):

- **create** (default) — follow the phases below.
- **cleanup** — when the user says "cleanup team", "팀 정리", "팀원 종료": follow [commands/cleanup-team.md](commands/cleanup-team.md).
- **expand** — when the user says "expand team", "팀원 추가", or names a role to add: follow [commands/expand-team.md](commands/expand-team.md).

## Phase 1 — Derive the team name

Run `git branch --show-current`, then convert to kebab-case:

- Strip a `worktree-` prefix
- Replace `+` with `-`
- Example: `worktree-feat+electron-app` → `feat-electron-app`

## Phase 2 — Create the team

Call `TeamCreate` with `team_name` = derived name, `description` = "Planner + Implementer team".

## Phase 3 — Spawn teammates in parallel

**One message, two Agent tool calls.** Both with the team name and `run_in_background: true`.

- **planner** — description "Planner - brainstorm and spec writing"; prompt = full content of [templates/planner-prompt.md](templates/planner-prompt.md)
- **implementer** — description "Implementer - code and test writing"; prompt = full content of [templates/implementer-prompt.md](templates/implementer-prompt.md)

## Phase 4 — Loop setup

Send via SendMessage:

- To **planner** — only if the `/writing-specs` skill is available: "Run `/loop 10m /writing-specs update spec` to periodically check and update specs." Otherwise skip.
- To **implementer**: "After completing assigned work, check TaskList for new tasks. You can run `/loop 10m check TaskList for unassigned tasks and report to team-lead` to automate this."

## Phase 5 — Display the work guide

Read [templates/work-guide.md](templates/work-guide.md) and display it to the user.

## Fallback — teammate spawning fails

If the Agent tool fails with a `team_name` or other internal error in the current session (known issue anthropics/claude-code#40270):

1. Tell the user team creation succeeded but teammate spawning failed in this execution context.
2. Suggest manual spawning: open separate terminals, run `claude` in each with the planner/implementer prompts, coordinate via SendMessage.

**Never claim the Agent tool is globally unavailable** unless the session explicitly shows the tool missing.

## Facts

- Teammates are full Claude Code sessions, not subagents — all tools (Write, Edit, Bash) and skills (`/writing-specs`, `/loop`) available.
- `/loop` is session-scoped and expires after 7 days.
- Teammate colors are auto-assigned from a hardcoded palette — not configurable.
- All communication flows through team-lead; planner ↔ implementer direct messaging is disabled by prompt rules.
- Teammate model defaults to standard Opus.
