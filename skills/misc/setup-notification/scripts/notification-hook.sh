#!/bin/bash

# Claude Code Notification Hook - TTS + Modal (Warning design)

HOOK_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$HOOK_DIR/tts-speak.sh"

input=$(cat)
notification_type=$(echo "$input" | jq -r '.notification_type // empty')

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

if [[ "$notification_type" == "idle_prompt" ]]; then
    speak "Waiting for input." &
    msg="Waiting for your input"
else
    speak "Permission needed." &
    msg="Permission approval needed"
fi

result=$(osascript <<EOF
button returned of (display alert "Claude Code — Action Needed ⚠️" ¬
    message "$session / $window / $dir_name ($branch)\n\n$msg" ¬
    as warning ¬
    buttons {"Dismiss", "Go"} default button "Go")
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
