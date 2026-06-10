#!/bin/bash
# Common TTS function for Claude Code hooks

speak() {
    local text="$1"
    local tmpfile="/tmp/claude-tts-$$.mp3"
    if command -v edge-tts &>/dev/null; then
        edge-tts --voice "en-US-AriaNeural" --text "$text" --write-media "$tmpfile" 2>/dev/null
        if [[ -f "$tmpfile" ]]; then
            afplay "$tmpfile" 2>/dev/null
            rm -f "$tmpfile"
            return
        fi
    fi
    say -r 180 "$text"
}

activate_terminal() {
    local pid=$(tmux display-message -p '#{client_pid}' 2>/dev/null)
    while [[ -n "$pid" && "$pid" != "1" && "$pid" != "0" ]]; do
        pid=$(ps -o ppid= -p "$pid" 2>/dev/null | tr -d ' ')
        local comm=$(ps -o comm= -p "$pid" 2>/dev/null)
        case "$comm" in
            *iTerm2*)    osascript -e 'tell application "iTerm2" to activate'; return ;;
            *Alacritty*) open -a Alacritty; return ;;
            *kitty*)     open -a kitty; return ;;
            *WezTerm*)   open -a WezTerm; return ;;
            *Terminal*)  osascript -e 'tell application "Terminal" to activate'; return ;;
        esac
    done
}
