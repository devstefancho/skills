---
name: hermes-runtime
description: Talk to and control the Hermes companion runtime — chat, run async tasks, check status, manage cron jobs, configure the connection. Use for /hermes, "hermes chat", "hermes run", "hermes status", "hermes jobs", "hermes setup", or 헤르메스 채팅/실행/상태/잡/설정.
---

# Hermes Runtime

Entry point for the Hermes companion runtime. Detailed per-subcommand argument and UX notes live in `commands/` (chat, run, status, jobs, setup).

Primary helper:
- `node "${CLAUDE_PLUGIN_ROOT}/skills/misc/hermes-runtime/scripts/hermes-companion.mjs" <subcommand> <args>`

Available subcommands:
- `setup [--json]` - Check connectivity (auto-detects local vs SSH mode)
- `chat <message> [--stream] [--system <prompt>] [--json]` - Send message to Hermes
- `run <task> [--background] [--json]` - Start async run with event streaming
- `status [job-id] [--json]` - Check connection/job status
- `jobs [list|delete <id>] [--json]` - Manage cron jobs
- `tunnel [start|stop|status]` - Manage SSH tunnel directly

Execution rules:
- Prefer the helper over hand-rolled SSH, curl, or HTTP commands
- Return stdout verbatim without paraphrasing or summarizing
- Do not inspect files, monitor progress, or do follow-up work
- If the helper reports connectivity failure, suggest running `/hermes:setup`

Connection modes:
- **auto** (default): tries localhost:8642 first, then SSH tunnel
- **local**: direct connection to localhost:8642
- **ssh**: SSH tunnel to remote host (default: `arch`)
- Config file: `~/.claude/hermes/config.json`
