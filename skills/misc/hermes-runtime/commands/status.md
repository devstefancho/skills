---
description: Check Hermes connection status, tunnel status, and recent jobs
argument-hint: "[job-id | latest] [--json]"
allowed-tools: Bash(node:*)
---

Check Hermes connection health, tunnel status, and recent job history.

Execute:
```bash
node "${CLAUDE_PLUGIN_ROOT}/skills/misc/hermes-runtime/scripts/hermes-companion.mjs" status $ARGUMENTS
```

## Usage

- No arguments: shows connection status + recent jobs list
- `latest`: shows details of the most recent async run
- `<job-id>`: shows details of a specific job

Return the output verbatim.
