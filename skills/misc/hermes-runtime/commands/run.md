---
description: Run an async task on Hermes Agent and stream events
argument-hint: "<task> [--background]"
allowed-tools: Bash(node:*), AskUserQuestion
---

Start an async run on Hermes Agent with event streaming.

If no task was provided in `$ARGUMENTS`, use AskUserQuestion to ask what task to run.

Execute:
```bash
node "${CLAUDE_PLUGIN_ROOT}/skills/misc/hermes-runtime/scripts/hermes-companion.mjs" run $ARGUMENTS
```

- Without `--background`: stream events until completion and return output verbatim
- With `--background`: return the job ID immediately so the user can check status later

## Important: Status check guidance

- **Async runs** (created by `/hermes:run`): check status with `/hermes:status latest` or `/hermes:status [job-id]`
- **Cron jobs** (scheduled repeating tasks): list with `/hermes:jobs`

These are different concepts. NEVER tell the user to use `/hermes:jobs` to check the status of an async run. Always guide them to `/hermes:status`.

Return the output verbatim. Do not paraphrase or summarize.
