#!/usr/bin/env bash
# Verify every plugin ships both a Claude Code and a Codex manifest with
# matching name, version, and description. Run after editing a plugin manifest
# or adding a new plugin.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

if ! command -v jq >/dev/null 2>&1; then
  echo "error: jq is required" >&2
  exit 2
fi

fail=0
checked=0

for claude_manifest in */.claude-plugin/plugin.json; do
  [[ -f "$claude_manifest" ]] || continue
  plugin_dir="${claude_manifest%/.claude-plugin/plugin.json}"
  codex_manifest="$plugin_dir/.codex-plugin/plugin.json"
  checked=$((checked + 1))

  if [[ ! -f "$codex_manifest" ]]; then
    echo "FAIL [$plugin_dir]: missing $codex_manifest"
    fail=1
    continue
  fi

  for field in name version description; do
    claude_val=$(jq -r ".$field // \"\"" "$claude_manifest")
    codex_val=$(jq -r ".$field // \"\"" "$codex_manifest")
    if [[ "$claude_val" != "$codex_val" ]]; then
      echo "FAIL [$plugin_dir]: $field mismatch"
      echo "  claude: $claude_val"
      echo "  codex:  $codex_val"
      fail=1
    fi
  done
done

# Also verify marketplace mirrors agree on plugin names.
claude_market=".claude-plugin/marketplace.json"
codex_market=".agents/plugins/marketplace.json"
if [[ -f "$claude_market" && -f "$codex_market" ]]; then
  claude_names=$(jq -r '.plugins[].name' "$claude_market" | sort)
  codex_names=$(jq -r '.plugins[].name' "$codex_market" | sort)
  if [[ "$claude_names" != "$codex_names" ]]; then
    echo "FAIL [marketplace]: plugin lists differ between Claude and Codex"
    diff <(echo "$claude_names") <(echo "$codex_names") || true
    fail=1
  fi
fi

if [[ $fail -eq 0 ]]; then
  echo "ok: $checked plugin(s) validated"
else
  exit 1
fi
