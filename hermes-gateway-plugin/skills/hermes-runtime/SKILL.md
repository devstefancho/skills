---
name: hermes-runtime
description: Internal contract for calling the hermes-companion runtime helper. Use only from hermes-gateway plugin commands and subagents — never user-invocable, never auto-loaded for user requests.
user-invocable: false
metadata:
  internal: true
---

# Hermes Runtime

Internal contract. **Only invoke from hermes-gateway plugin commands and subagents.**

## Helper

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/hermes-companion.mjs" <subcommand> <args>
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
- On connectivity failure, suggest running `/hermes:setup`.

## Connection modes

- **auto** (default) — tries localhost:8642 first, then SSH tunnel
- **local** — direct connection to localhost:8642
- **ssh** — SSH tunnel to remote host (default `arch`)
- Config file: `~/.claude/hermes/config.json`
