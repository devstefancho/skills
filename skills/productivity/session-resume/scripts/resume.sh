#!/usr/bin/env bash
# Locate a previous Claude Code or Codex CLI session's JSONL transcript and
# print its last N turns plus metadata.
#
# Usage:
#   resume.sh                       # most recent session in this cwd / globally
#   resume.sh <session-uuid>        # specific session by UUID (or substring)
#   resume.sh [-n N]                # change number of messages to print (default 10)
#
# Reads ~/.claude/projects/*/*.jsonl and ~/.codex/sessions/**/rollout-*.jsonl.
# Never modifies any file.
set -euo pipefail

if ! command -v jq >/dev/null 2>&1; then
  echo "error: jq is required" >&2
  exit 2
fi

SID=""
N=10

while [[ $# -gt 0 ]]; do
  case "$1" in
    -n)
      [[ $# -lt 2 ]] && { echo "error: -n requires a number" >&2; exit 2; }
      N="$2"; shift 2 ;;
    -h|--help)
      awk '/^#!/{next} /^[^#]/{exit} /^#/{print}' "$0"; exit 0 ;;
    *)
      SID="$1"; shift ;;
  esac
done

CLAUDE_DIR="$HOME/.claude/projects"
CODEX_DIR="$HOME/.codex/sessions"

# ---------------------------------------------------------------------------
# Discover candidate JSONL files
# ---------------------------------------------------------------------------
declare -a CANDIDATES=()

if [[ -n "$SID" ]]; then
  while IFS= read -r f; do
    [[ -n "$f" ]] && CANDIDATES+=("$f")
  done < <(find "$CLAUDE_DIR" "$CODEX_DIR" -name "*${SID}*.jsonl" 2>/dev/null)
else
  encoded_cwd="$(pwd | sed 's:/:-:g')"
  claude_proj_dir="$CLAUDE_DIR/${encoded_cwd}"
  if [[ -d "$claude_proj_dir" ]]; then
    latest_claude="$(ls -t "$claude_proj_dir"/*.jsonl 2>/dev/null | head -1 || true)"
    [[ -n "$latest_claude" ]] && CANDIDATES+=("$latest_claude")
  fi
  if [[ -d "$CODEX_DIR" ]]; then
    latest_codex="$(find "$CODEX_DIR" -name "rollout-*.jsonl" -printf "%T@ %p\n" 2>/dev/null \
                     | sort -rn | head -1 | cut -d' ' -f2- || true)"
    [[ -n "$latest_codex" ]] && CANDIDATES+=("$latest_codex")
  fi
fi

if [[ ${#CANDIDATES[@]} -eq 0 ]]; then
  echo "no session found"
  [[ -n "$SID" ]] && echo "  (searched for *${SID}*.jsonl in $CLAUDE_DIR and $CODEX_DIR)"
  exit 1
fi

# If multiple distinct candidates, list and exit so user can disambiguate.
if [[ ${#CANDIDATES[@]} -gt 1 && -n "$SID" ]]; then
  echo "multiple sessions match '${SID}':"
  for f in "${CANDIDATES[@]}"; do echo "  $f"; done
  echo "re-run with a longer/exact UUID."
  exit 1
fi

# Pick the newest (handles auto-detect case where both Claude+Codex latest exist).
JSONL="$(printf '%s\n' "${CANDIDATES[@]}" \
         | xargs -I{} stat -c '%Y %n' "{}" 2>/dev/null \
         | sort -rn | head -1 | cut -d' ' -f2-)"

# ---------------------------------------------------------------------------
# Determine tool and metadata
# ---------------------------------------------------------------------------
case "$JSONL" in
  *"/.claude/projects/"*) TOOL="claude" ;;
  *"/.codex/sessions/"*)  TOOL="codex"  ;;
  *)                       TOOL="unknown" ;;
esac

basename_jsonl="${JSONL##*/}"
mtime_epoch="$(stat -c '%Y' "$JSONL" 2>/dev/null || echo 0)"
mtime_human="$(date -d "@${mtime_epoch}" '+%Y-%m-%d %H:%M:%S' 2>/dev/null || stat -c '%y' "$JSONL")"

session_id=""
branch=""
cwd=""
if [[ "$TOOL" == "claude" ]]; then
  hdr="$(head -1 "$JSONL")"
  session_id="$(jq -r '.sessionId // ""' <<<"$hdr")"
  branch="$(jq -r '.gitBranch // ""' <<<"$hdr")"
  cwd="$(jq -r '.cwd // ""' <<<"$hdr")"
elif [[ "$TOOL" == "codex" ]]; then
  hdr="$(head -1 "$JSONL")"
  session_id="$(jq -r '.id // .session_id // ""' <<<"$hdr")"
  cwd="$(jq -r '.cwd // .payload?.cwd // ""' <<<"$hdr")"
fi
[[ -z "$session_id" ]] && session_id="${basename_jsonl%.jsonl}"

# ---------------------------------------------------------------------------
# Print header
# ---------------------------------------------------------------------------
echo "Session: $session_id"
echo "Tool:    $TOOL"
echo "File:    $JSONL"
echo "Last activity: $mtime_human"
[[ -n "$branch" ]] && echo "Branch:  $branch"
[[ -n "$cwd" ]]    && echo "cwd:     $cwd"
echo
echo "— last $N messages —"
echo

# ---------------------------------------------------------------------------
# Extract last N turns. Each message is truncated to ~2000 chars to keep
# transcript readable.
# ---------------------------------------------------------------------------
print_truncated() {
  local text="$1"
  local len="${#text}"
  if (( len > 2000 )); then
    printf '%s\n... [truncated %d more chars]\n' "${text:0:2000}" "$((len - 2000))"
  else
    printf '%s\n' "$text"
  fi
}

if [[ "$TOOL" == "claude" ]]; then
  tail -n 800 "$JSONL" \
    | jq -c 'select(.type == "user" or .type == "assistant")' \
    | tail -n "$N" \
    | while IFS= read -r line; do
        role="$(jq -r '.message.role // "?"' <<<"$line")"
        ts="$(jq -r '.timestamp // ""' <<<"$line")"
        content="$(jq -r '
          (.message.content // "") as $c |
          if ($c | type) == "string" then $c
          elif ($c | type) == "array" then
            [ $c[]? |
              if .type == "text" then .text
              elif .type == "tool_use" then "[tool_use: \(.name // "?")]"
              elif .type == "tool_result" then "[tool_result]"
              else "[\(.type // "?")]"
              end
            ] | join("\n")
          else ($c | tostring)
          end
        ' <<<"$line")"
        printf '[%s %s]\n' "$role" "$ts"
        print_truncated "$content"
        echo
      done
elif [[ "$TOOL" == "codex" ]]; then
  tail -n 800 "$JSONL" \
    | jq -c 'select((.payload?.role // "") != "" or .type == "message")' 2>/dev/null \
    | tail -n "$N" \
    | while IFS= read -r line; do
        role="$(jq -r '.payload.role // .role // "?"' <<<"$line")"
        ts="$(jq -r '.timestamp // ""' <<<"$line")"
        content="$(jq -r '
          (.payload.content // .content // "") as $c |
          if ($c | type) == "string" then $c
          elif ($c | type) == "array" then
            [ $c[]? |
              if .type == "input_text" or .type == "output_text" or .type == "text" then (.text // "")
              else "[\(.type // "?")]"
              end
            ] | join("\n")
          else ($c | tostring)
          end
        ' <<<"$line")"
        printf '[%s %s]\n' "$role" "$ts"
        print_truncated "$content"
        echo
      done

  # Fallback: if jq filter produced nothing useful, print raw last lines.
  if [[ -z "$(tail -n 800 "$JSONL" | jq -c 'select((.payload?.role // "") != "" or .type == "message")' 2>/dev/null | head -1)" ]]; then
    echo "(structured extraction returned nothing — printing raw last $N lines)"
    tail -n "$N" "$JSONL"
  fi
else
  echo "(unknown tool layout — printing raw last $N lines)"
  tail -n "$N" "$JSONL"
fi
