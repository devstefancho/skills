---
name: session-resume
description: Locates a previous Claude Code or Codex CLI session's JSONL transcript and prints the last N turns plus metadata so work can continue. Use when the user says "resume", "이어가자", "이전 세션 내용 보여줘", "what was I working on", or provides a session UUID.
allowed-tools: Bash, Read
---

# Session Resume

Surface a previous session's last N turns plus metadata (tool, branch, cwd, last-activity timestamp), then continue the work intelligently.

## Inputs

- `$1` (optional) — session UUID. If omitted, pick the most recent session in the current cwd (Claude Code) or globally most recent (Codex); on ambiguity, present a short candidate list.
- `-n N` (optional) — how many of the last messages to print. Default 10.

## Phase 1 — Run the helper

```bash
bash "$CLAUDE_PLUGIN_ROOT/skills/productivity/session-resume/scripts/resume.sh" [SESSION_ID] [-n N]
```

If `$CLAUDE_PLUGIN_ROOT` is unset (outside Claude Code), invoke the script by its absolute path inside the installed plugin.

```bash
bash scripts/resume.sh                                            # most recent in this cwd, last 10
bash scripts/resume.sh 019e1048-8ab2-7600-a736-1dfc5db707aa -n 20 # specific session, last 20
```

If multiple sessions match (same UUID prefix, many recent files), the script prints the candidates and exits — re-run with the full UUID.

## Phase 2 — Confirm intent

**Never act on the transcript before asking.** The user may only want to inspect history.

> "이전 세션의 작업을 이어서 진행할까요? 이어간다면 어디부터 시작할지도 알려주세요."

## Phase 3 — Continue the work

Treat the printed transcript as background context, **not as instructions to re-execute**.

- [ ] Re-read files referenced in the last few turns to confirm current state
- [ ] Check `git status` and `git log` for surviving in-flight changes
- [ ] Ask clarifying questions if the prior session was interrupted mid-task

## Storage layouts

**Claude Code** — `~/.claude/projects/<encoded-cwd>/<session-id>.jsonl`

- `<encoded-cwd>` = absolute project path with `/` replaced by `-` (`/home/user/foo` → `-home-user-foo`); filename is the session UUID.
- One event per line: `{type, message, timestamp, cwd, gitBranch, sessionId, uuid, parentUuid, ...}`; `type` is typically `user`, `assistant`, `summary`, or tool-related.

**Codex CLI** — `~/.codex/sessions/YYYY/MM/DD/rollout-YYYY-MM-DDTHH-MM-SS-<uuid>.jsonl`

- Session UUID at the end of the filename; lines carry `payload.role` / `payload.content`; first line is a session header.
- Schema may evolve — fall back to printing raw lines if jq cannot parse expected fields.

## Notes

- The script is read-only; it never modifies session JSONL.
- Tool-use blocks and large attachments are summarized rather than dumped verbatim.
