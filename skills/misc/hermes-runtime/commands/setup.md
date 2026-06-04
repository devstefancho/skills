---
description: Configure Hermes Agent connection and check status (local/SSH mode switching)
argument-hint: "[--mode auto|local|ssh] [--remote-host <host>] [--remote-port <port>] [--local-port <port>] [--api-key <key>]"
allowed-tools: Bash(node:*), AskUserQuestion
---

Set up and verify the Hermes connection.

## No arguments

Check connection status only:
```bash
node "${CLAUDE_PLUGIN_ROOT}/skills/misc/hermes-runtime/scripts/hermes-companion.mjs" setup
```

## With arguments

Update config and verify connection:
```bash
node "${CLAUDE_PLUGIN_ROOT}/skills/misc/hermes-runtime/scripts/hermes-companion.mjs" setup $ARGUMENTS
```

## When the user requests a config change without specific values

Use AskUserQuestion to prompt:
- "Which mode would you like to switch to?" → choices: auto, local, ssh
- If SSH mode is selected: "What is the SSH host name?" (default: arch)

## Available flags

- `--mode auto|local|ssh` — Change connection mode
- `--remote-host <host>` — SSH remote host (default: arch)
- `--remote-port <port>` — Remote Hermes port (default: 8642)
- `--local-port <port>` — SSH tunnel local port (default: 18642)
- `--api-key <key>` — Set Hermes API key

## Examples

- `/hermes:setup` → Check current connection status
- `/hermes:setup --mode ssh` → Switch to SSH mode
- `/hermes:setup --mode ssh --remote-host myserver` → SSH mode + change host
- `/hermes:setup --mode local` → Switch to local mode
- `/hermes:setup --mode auto` → Auto-detect mode

Config file location: `~/.claude/hermes/config.json`
