---
name: hermes-runtime
description: Talk to and control the Hermes companion runtime — chat, run async tasks, check status, manage cron jobs, configure the connection. Use for /hermes, "hermes chat", "hermes run", "hermes status", "hermes jobs", "hermes setup", or 헤르메스 채팅/실행/상태/잡/설정.
metadata:
  public: true
---

# Hermes Runtime

Entry point for the Hermes companion runtime. Detailed per-subcommand argument and UX notes live in `commands/` (chat, run, status, jobs, setup).

## Helper

```bash
node "${CLAUDE_PLUGIN_ROOT}/skills/misc/hermes-runtime/scripts/hermes-companion.mjs" <subcommand> <args>
```

Subcommands:

- `setup [--json]` — check connectivity (auto-detects local vs SSH mode)
- `chat <message> [--stream] [--system <prompt>] [--json]` — send message to Hermes
- `run <task> [--background] [--json]` — start async run with event streaming
- `status [job-id] [--json]` — check connection/job status
- `jobs [list|delete <id>] [--json]` — manage cron jobs
- `tunnel [start|stop|status]` — manage SSH tunnel directly

## Rules

- **Always use the helper.** Never hand-roll SSH, curl, or HTTP commands.
- Return stdout verbatim — no paraphrasing, no summarizing.
- Do not inspect files, monitor progress, or do follow-up work.
- On connectivity failure, suggest running the `setup` subcommand ("hermes setup").

## Connection modes

- **auto** (default) — tries localhost:8642 first, then SSH tunnel
- **local** — direct connection to localhost:8642
- **ssh** — SSH tunnel to remote host (default `arch`)
- Config file: `~/.claude/hermes/config.json`
