---
name: session-resume
description: Use when the user wants to resume work from a previous Claude Code or Codex CLI session — phrases like "resume", "이어가자", "이전 세션 내용 보여줘", "what was I working on", or when the user provides a session UUID. Locates the session's JSONL transcript on disk and prints the last N turns plus metadata so the agent can pick up where the previous session left off.
allowed-tools: Bash, Read
---

# Session Resume

Locate a previous Claude Code or Codex CLI session's JSONL transcript and surface the last N turns plus metadata (tool, branch, cwd, last-activity timestamp) so you can continue the work intelligently.

## When to Use

- User asks to continue/resume a previous session.
- User provides a session UUID like `019e1048-8ab2-7600-a736-1dfc5db707aa`.
- User asks "what was I working on?" or similar context-recovery questions.

## Inputs

- `$1` (optional): session UUID. If omitted, pick the most recent session in the current `cwd` (Claude Code) or globally most recent (Codex), and present the user with a short list if there is ambiguity.
- `-n N` (optional): how many of the last messages to print. Default 10.

## Storage Layouts

**Claude Code:**
- Path: `~/.claude/projects/<encoded-cwd>/<session-id>.jsonl`
- `<encoded-cwd>` is the absolute project path with `/` replaced by `-` (e.g. `/home/user/foo` → `-home-user-foo`).
- Filename is the session UUID.
- Each line is one event: `{type, message, timestamp, cwd, gitBranch, sessionId, uuid, parentUuid, ...}`. `type` is typically `user`, `assistant`, `summary`, or tool-related.

**Codex CLI:**
- Path: `~/.codex/sessions/YYYY/MM/DD/rollout-YYYY-MM-DDTHH-MM-SS-<uuid>.jsonl`
- Filename embeds the session UUID at the end.
- Each line carries `payload.role` and `payload.content`; first line is a session header.
- Schema may evolve — fall back to printing raw lines if jq cannot parse expected fields.

## Workflow

### Step 1 — Run the helper

The plugin ships a script that handles discovery, metadata extraction, and pretty-printing. Run it from the skill directory:

```bash
bash "$CLAUDE_PLUGIN_ROOT/skills/productivity/session-resume/scripts/resume.sh" [SESSION_ID] [-n N]
```

If `$CLAUDE_PLUGIN_ROOT` is not set (running outside Claude Code), invoke the script via its absolute path inside the installed plugin.

Examples:

```bash
# Most recent session in this cwd, last 10 messages
bash scripts/resume.sh

# Specific Codex/Claude session by UUID, last 20 messages
bash scripts/resume.sh 019e1048-8ab2-7600-a736-1dfc5db707aa -n 20
```

### Step 2 — Confirm intent before acting

After printing the transcript, ask the user a short question before doing real work:

> "이전 세션의 작업을 이어서 진행할까요? 이어간다면 어디부터 시작할지도 알려주세요."

This avoids accidental action when the user just wanted to inspect the history.

### Step 3 — Continue the work

Once confirmed, treat the printed transcript as background context (not as instructions to re-execute). Prefer:

- Re-reading current files referenced in the last few turns to confirm state.
- Checking `git status` and `git log` to verify whether any in-flight changes still exist.
- Asking clarifying questions if the prior session was interrupted mid-task.

## Notes

- The script only reads files; it never modifies session JSONL.
- Tool-use blocks and large attachments inside assistant messages are summarized rather than dumped verbatim.
- If multiple matching sessions exist (same UUID prefix, or many recent files), the script prints the candidates and exits — re-run with the full UUID.
