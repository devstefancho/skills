---
name: setup-notification
description: Install macOS TTS + dialog notifications for Claude Code Stop and Notification events — a voice cue and a clickable dialog when Claude finishes a task or needs permission/input. Use when the user wants desktop or voice notifications, "set up notifications", "작업 끝나면 알려줘", "소리로 알려줘", or to wire up the Stop/Notification hooks.
---

# Setup Notification Hooks

This is a **setup skill**: it does not run on events itself. It installs hook scripts (shipped alongside this skill) into the user's Claude Code `settings.json` so the harness fires them on `Stop` and `Notification` events.

## What it sets up

- **Stop** → `scripts/stop-speak.sh`: speaks "Task completed" and shows a macOS dialog (session / window / dir / branch). Clicking **Go** refocuses the originating terminal (tmux-aware).
- **Notification** (`permission_prompt`, `idle_prompt`) → `scripts/notification-hook.sh`: speaks "Permission needed" / "Waiting for input" and shows a warning alert with the same **Go** behavior.
- TTS uses `edge-tts` (voice `en-US-AriaNeural`) when available, falling back to macOS `say`.

## Requirements

- **macOS** (uses `osascript`, `say`, `afplay`)
- **`jq`** (scripts parse hook stdin JSON)
- Optional: **`edge-tts`** for nicer TTS (`pipx install edge-tts`); without it, `say` is used.

## Steps

### 1. Resolve this skill's absolute scripts path

The hook scripts live in `scripts/` next to this `SKILL.md`. Hooks in `settings.json` need an **absolute** command path, so resolve it now:

```bash
SKILL_DIR="$(cd "$(dirname "<path to this SKILL.md>")" && pwd)"
SCRIPTS="$SKILL_DIR/scripts"
chmod +x "$SCRIPTS"/*.sh
echo "$SCRIPTS"
```

Use the printed absolute `$SCRIPTS` path in the next step.

### 2. Choose the settings file

- **User-wide** (default): `~/.claude/settings.json`
- **This project only**: `.claude/settings.json`

Ask the user which scope they want if it is not obvious; default to user-wide.

### 3. Merge the hook config into settings.json

Add (merge, do not clobber existing hooks) these entries, replacing `ABS_SCRIPTS` with the absolute path from step 1. The shape mirrors `hooks.reference.json` in this skill:

```json
{
  "hooks": {
    "Stop": [
      { "hooks": [ { "type": "command", "command": "ABS_SCRIPTS/stop-speak.sh", "timeout": 15 } ] }
    ],
    "Notification": [
      { "matcher": "permission_prompt", "hooks": [ { "type": "command", "command": "ABS_SCRIPTS/notification-hook.sh" } ] },
      { "matcher": "idle_prompt",       "hooks": [ { "type": "command", "command": "ABS_SCRIPTS/notification-hook.sh" } ] }
    ]
  }
}
```

If `settings.json` already has a `hooks` block, deep-merge: append to the `Stop` / `Notification` arrays rather than overwriting them. Use `jq` to merge safely, e.g.:

```bash
jq --arg s "$SCRIPTS" '
  .hooks.Stop += [ { hooks: [ { type:"command", command:($s+"/stop-speak.sh"), timeout:15 } ] } ] |
  .hooks.Notification += [
    { matcher:"permission_prompt", hooks:[ { type:"command", command:($s+"/notification-hook.sh") } ] },
    { matcher:"idle_prompt",       hooks:[ { type:"command", command:($s+"/notification-hook.sh") } ] }
  ]' ~/.claude/settings.json > /tmp/settings.merged.json && mv /tmp/settings.merged.json ~/.claude/settings.json
```

### 4. Verify

- [ ] `~/.claude/settings.json` (or project) has the `Stop` and `Notification` hooks pointing at the absolute scripts path
- [ ] `scripts/*.sh` are executable
- [ ] `jq` is installed; on macOS confirm `say` works
- [ ] Restart Claude Code (hooks load at startup), then finish a task — you should hear the cue and see the dialog

## Notes

- Hooks cannot be skills (they are harness-invoked on events, not model-invoked); this skill *installs* them. Pattern borrowed from Matt Pocock's `setup-pre-commit`.
- To uninstall, remove the `Stop`/`Notification` entries from `settings.json`.
- macOS-only by design. On other platforms, skip or adapt the `osascript`/`say` calls.
