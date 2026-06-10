#!/usr/bin/env bash
# Verify every plugin ships both Claude Code and Codex metadata, and that the
# Codex marketplace uses Codex's marketplace schema. Run after editing manifests
# or marketplace entries.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

if ! command -v jq >/dev/null 2>&1; then
  echo "error: jq is required" >&2
  exit 2
fi

fail=0
checked=0
allowed_installation='^(NOT_AVAILABLE|AVAILABLE|INSTALLED_BY_DEFAULT)$'
allowed_authentication='^(ON_INSTALL|ON_USE)$'

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

  if [[ -d "$plugin_dir/skills" ]]; then
    codex_skills=$(jq -r '.skills // ""' "$codex_manifest")
    if [[ "$codex_skills" != "./skills/" ]]; then
      echo "FAIL [$plugin_dir]: .codex-plugin/plugin.json must declare skills: \"./skills/\""
      fail=1
    fi

    # Every SKILL.md must have parseable YAML frontmatter with name + description.
    # An unquoted colon in `description:` silently hides the skill from
    # `npx skills` and other frontmatter-driven discovery.
    for skill_md in "$plugin_dir"/skills/*/SKILL.md; do
      [[ -f "$skill_md" ]] || continue
      if command -v python3 >/dev/null 2>&1; then
        if ! err=$(python3 - "$skill_md" <<'PY' 2>&1
import sys
text = open(sys.argv[1], encoding="utf-8").read()
if not text.startswith("---\n"):
    sys.exit("missing frontmatter delimiter")
body = text[4:]
end = body.find("\n---")
if end == -1:
    sys.exit("unterminated frontmatter")
try:
    import yaml
    data = yaml.safe_load(body[:end])
except ModuleNotFoundError:
    sys.exit(0)  # PyYAML unavailable; structural checks above still ran
except Exception as exc:
    sys.exit(f"invalid YAML: {exc}")
if not isinstance(data, dict):
    sys.exit("frontmatter is not a mapping")
for field in ("name", "description"):
    value = data.get(field)
    if not isinstance(value, str) or not value.strip():
        sys.exit(f"missing or empty '{field}'")
if len(data["description"]) > 1024:
    sys.exit("description exceeds 1024 chars")
expected = sys.argv[1].split("/")[-2]
if data["name"] != expected:
    sys.exit(f"name '{data['name']}' does not match directory '{expected}'")
PY
        ); then
          echo "FAIL [$skill_md]: $err"
          fail=1
        fi
      fi
    done
  fi
done

# Also verify marketplace mirrors agree on plugin names and Codex schema.
claude_market=".claude-plugin/marketplace.json"
codex_market=".agents/plugins/marketplace.json"
if [[ ! -f "$claude_market" ]]; then
  echo "FAIL [marketplace]: missing $claude_market"
  fail=1
elif [[ ! -f "$codex_market" ]]; then
  echo "FAIL [marketplace]: missing $codex_market"
  fail=1
else
  claude_names=$(jq -r '.plugins[].name' "$claude_market" | sort)
  codex_names=$(jq -r '.plugins[].name' "$codex_market" | sort)
  if [[ "$claude_names" != "$codex_names" ]]; then
    echo "FAIL [marketplace]: plugin lists differ between Claude and Codex"
    diff <(echo "$claude_names") <(echo "$codex_names") || true
    fail=1
  fi

  while IFS=$'\t' read -r plugin_name claude_source; do
    [[ -n "$plugin_name" ]] || continue

    codex_entry_count=$(jq --arg name "$plugin_name" '[.plugins[] | select(.name == $name)] | length' "$codex_market")
    if [[ "$codex_entry_count" != "1" ]]; then
      echo "FAIL [marketplace:$plugin_name]: expected exactly one Codex entry, found $codex_entry_count"
      fail=1
      continue
    fi

    source_type=$(jq -r --arg name "$plugin_name" '.plugins[] | select(.name == $name) | (.source | type)' "$codex_market")
    source_kind=$(jq -r --arg name "$plugin_name" '.plugins[] | select(.name == $name) | .source.source // ""' "$codex_market")
    source_path=$(jq -r --arg name "$plugin_name" '.plugins[] | select(.name == $name) | .source.path // ""' "$codex_market")
    installation=$(jq -r --arg name "$plugin_name" '.plugins[] | select(.name == $name) | .policy.installation // ""' "$codex_market")
    authentication=$(jq -r --arg name "$plugin_name" '.plugins[] | select(.name == $name) | .policy.authentication // ""' "$codex_market")
    category=$(jq -r --arg name "$plugin_name" '.plugins[] | select(.name == $name) | .category // ""' "$codex_market")

    if [[ "$source_type" != "object" ]]; then
      echo "FAIL [marketplace:$plugin_name]: source must be an object"
      fail=1
    fi
    if [[ "$source_kind" != "local" ]]; then
      echo "FAIL [marketplace:$plugin_name]: source.source must be local"
      fail=1
    fi
    if [[ "$source_path" != "$claude_source" ]]; then
      echo "FAIL [marketplace:$plugin_name]: source.path mismatch"
      echo "  claude: $claude_source"
      echo "  codex:  $source_path"
      fail=1
    fi
    if [[ ! "$installation" =~ $allowed_installation ]]; then
      echo "FAIL [marketplace:$plugin_name]: invalid policy.installation '$installation'"
      fail=1
    fi
    if [[ ! "$authentication" =~ $allowed_authentication ]]; then
      echo "FAIL [marketplace:$plugin_name]: invalid policy.authentication '$authentication'"
      fail=1
    fi
    if [[ -z "$category" ]]; then
      echo "FAIL [marketplace:$plugin_name]: missing category"
      fail=1
    fi

    plugin_dir="${claude_source#./}"
    if [[ ! -d "$plugin_dir" ]]; then
      echo "FAIL [marketplace:$plugin_name]: source directory missing: $claude_source"
      fail=1
      continue
    fi

    codex_manifest="$plugin_dir/.codex-plugin/plugin.json"
    if [[ ! -f "$codex_manifest" ]]; then
      echo "FAIL [marketplace:$plugin_name]: missing $codex_manifest"
      fail=1
      continue
    fi

    codex_manifest_name=$(jq -r '.name // ""' "$codex_manifest")
    if [[ "$codex_manifest_name" != "$plugin_name" ]]; then
      echo "FAIL [marketplace:$plugin_name]: Codex manifest name mismatch"
      echo "  marketplace: $plugin_name"
      echo "  manifest:    $codex_manifest_name"
      fail=1
    fi

    if [[ "$installation" != "NOT_AVAILABLE" ]]; then
      if [[ ! -d "$plugin_dir/skills" && ! -d "$plugin_dir/agents" && ! -f "$plugin_dir/.app.json" && ! -f "$plugin_dir/codex.config.toml.snippet" ]]; then
        echo "FAIL [marketplace:$plugin_name]: AVAILABLE Codex plugin has no Codex-loadable component"
        fail=1
      fi
    fi
  done < <(jq -r '.plugins[] | [.name, .source] | @tsv' "$claude_market")
fi

if [[ $fail -eq 0 ]]; then
  echo "ok: $checked plugin(s) validated"
else
  exit 1
fi
