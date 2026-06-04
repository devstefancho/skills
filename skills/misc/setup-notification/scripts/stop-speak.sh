#!/bin/bash

# Claude Code Stop Hook - Simple TTS + Modal (Done design)

HOOK_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$HOOK_DIR/tts-speak.sh"

input=$(cat)
stop_hook_active=$(echo "$input" | jq -r '.stop_hook_active // false')
[[ "$stop_hook_active" == "true" ]] && exit 0

cwd=$(echo "$input" | jq -r '.cwd // empty')
[[ -z "$cwd" ]] && cwd=$(pwd)

if [[ -n "$TMUX_PANE" ]]; then
    session=$(tmux display-message -t "$TMUX_PANE" -p '#{session_name}' 2>/dev/null || echo "—")
    window=$(tmux display-message -t "$TMUX_PANE" -p '#{window_name}' 2>/dev/null || echo "—")
else
    session="—"
    window="—"
fi
branch=$(git -C "$cwd" rev-parse --abbrev-ref HEAD 2>/dev/null || echo "—")
dir_name=$(basename "$cwd")

speak "Task completed." &

result=$(osascript <<EOF
button returned of (display dialog "$session / $window / $dir_name ($branch)" ¬
    buttons {"Dismiss", "Go"} default button "Go" ¬
    with title "Claude Code — Done ✅" ¬
    with icon note)
EOF
)

if [[ "$result" == "Go" ]]; then
    if [[ -n "$TMUX_PANE" ]]; then
        tmux select-window -t "$TMUX_PANE" 2>/dev/null
        tmux select-pane -t "$TMUX_PANE" 2>/dev/null
        tmux switch-client -t "$TMUX_PANE" 2>/dev/null
    fi
    activate_terminal
fi

exit 0
