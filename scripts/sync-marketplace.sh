#!/usr/bin/env bash
# Mirror .claude-plugin/marketplace.json into .agents/plugins/marketplace.json so
# that Codex CLI sees the same plugin catalog as Claude Code. The Codex copy
# uses the same JSON shape (name/description/owner/plugins) but is stored at
# the location Codex looks for.
#
# Usage:
#   scripts/sync-marketplace.sh           # write Codex mirror from Claude source
#   scripts/sync-marketplace.sh --check   # exit 1 if mirrors are out of sync
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CLAUDE_FILE="$REPO_ROOT/.claude-plugin/marketplace.json"
CODEX_FILE="$REPO_ROOT/.agents/plugins/marketplace.json"

if ! command -v jq >/dev/null 2>&1; then
  echo "error: jq is required (install with 'brew install jq' or 'apt-get install jq')" >&2
  exit 2
fi

if [[ ! -f "$CLAUDE_FILE" ]]; then
  echo "error: $CLAUDE_FILE not found" >&2
  exit 2
fi

# Build the Codex copy. Description is rewritten to make the multi-agent intent
# explicit when seen from Codex; everything else (owner, plugins[]) is preserved.
build_codex() {
  jq '.description = "Multi-agent plugins marketplace (Claude Code + Codex) for code style review and SDD workflow"' "$CLAUDE_FILE"
}

mkdir -p "$(dirname "$CODEX_FILE")"

if [[ "${1:-}" == "--check" ]]; then
  if [[ ! -f "$CODEX_FILE" ]]; then
    echo "error: $CODEX_FILE missing — run scripts/sync-marketplace.sh" >&2
    exit 1
  fi
  if ! diff -u <(build_codex) "$CODEX_FILE" >/dev/null; then
    echo "error: $CODEX_FILE is out of sync with $CLAUDE_FILE" >&2
    diff -u <(build_codex) "$CODEX_FILE" || true
    exit 1
  fi
  echo "ok: marketplaces in sync"
  exit 0
fi

build_codex > "$CODEX_FILE"
echo "wrote $CODEX_FILE"
