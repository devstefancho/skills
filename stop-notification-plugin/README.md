# Stop Notification Plugin

TTS voice notification with macOS modal dialog and tmux navigation when Claude Code stops or needs attention.

## Features

- **TTS Voice Notification** - Uses `edge-tts` (Azure Neural voices) with fallback to macOS `say`
- **macOS Modal Dialog** - Native dialog showing session/window/project/branch info
- **Tmux Navigation** - "Go" button navigates to the correct tmux pane
- **Terminal Activation** - Automatically brings your terminal app to the foreground
- **Notification Events** - Alerts on permission prompts and idle prompts

## Supported Events

| Event | Trigger | TTS Message |
|-------|---------|-------------|
| Stop | Claude finishes a response | "Task completed." |
| Notification (permission_prompt) | Claude needs permission approval | "Permission needed." |
| Notification (idle_prompt) | Claude is waiting for user input | "Waiting for input." |

## Requirements

- macOS (uses `osascript`, `afplay`, `say`)
- `jq` - JSON processing
- `edge-tts` (optional) - High-quality Azure Neural TTS. Falls back to macOS `say` if not installed.
- `tmux` (optional) - For pane navigation and session info display

### Installing edge-tts

```bash
pip install edge-tts
```

## Supported Terminals

- iTerm2
- Alacritty
- kitty
- WezTerm
- Terminal.app

## Installation

### Claude Code

```bash
/plugin install stop-notification-plugin@devstefancho-claude-plugins
```

Restart Claude Code after installation to activate.

### Codex

This plugin is not installable in Codex from this marketplace because it depends on Claude Code's Stop and Notification hook events. Codex hook support uses a different format and is not mirrored automatically.

## Uninstall

```bash
/plugin uninstall stop-notification-plugin@devstefancho-claude-plugins
```

## How It Works

### Stop Event

When Claude finishes a response:
1. TTS announces "Task completed."
2. A macOS dialog shows `session / window / project (branch)` with "Dismiss" and "Go" buttons
3. Clicking "Go" navigates to the tmux pane and activates the terminal

### Notification Event

When Claude needs attention (permission prompt or idle):
1. TTS announces the notification type
2. A macOS warning alert shows context info with "Dismiss" and "Go" buttons
3. Clicking "Go" navigates to the tmux pane and activates the terminal

## Note

If you have similar Stop/Notification hooks in `~/.claude/settings.json`, remove them after installing this plugin to avoid duplicate notifications.

## License

MIT
