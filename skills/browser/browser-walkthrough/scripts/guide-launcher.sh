#!/bin/bash
# guide-launcher.sh — inject a guide overlay into a playwright-cli browser session.
# Parses CLI spec, tags target elements, and evaluates guide-overlay.js (same directory).
#
# Usage:
#   ./guide-launcher.sh <mode> "<title>" "<ref|heading|desc>" [more...]
#
# Modes:
#   seq  → sequential steps, per-step color (1/2/3/...)
#   opt  → pick-one options, single orange, letters (A/B/C)
#   one  → single target, pink (👉)
#
# Spec: "ref|heading|desc"  (heading/desc optional, \n → newline in panel)
#
# Elements:
#   - outline on target (scroll-follows automatically)
#   - small round badge next to each target (position:fixed, tracks via rAF)
#   - fixed side panel on the right with all step descriptions
#
set -e
cd "$(dirname "$0")"

MODE="$1"
TITLE="$2"
shift 2 || { echo "Usage: $0 <mode> <title> <ref|heading|desc> [...]"; exit 1; }

case "$MODE" in
  seq|opt|one) ;;
  *) echo "mode must be: seq | opt | one"; exit 1 ;;
esac

[ $# -eq 0 ] && { echo "at least one target required"; exit 1; }

SESSION="${CC_HL_SESSION:-hometax}"

# 1) clear any previous data-cc-step tags first (idempotent)
playwright-cli -s="$SESSION" eval "() => {
  document.querySelectorAll('[data-cc-step]').forEach(x => x.removeAttribute('data-cc-step'));
}" > /dev/null 2>&1 || true

# 2) tag each target via playwright ref (unique per session)
i=1
for SPEC in "$@"; do
  REF="${SPEC%%|*}"
  if [ -z "$REF" ]; then
    echo "skip empty ref"
    i=$((i + 1))
    continue
  fi
  playwright-cli -s="$SESSION" eval "el => el.setAttribute('data-cc-step', '$i')" "$REF" > /dev/null
  i=$((i + 1))
done

# 3) build specs JSON from heading|desc
SPECS_JSON=$(python3 -c '
import json, sys
specs = []
for raw in sys.argv[1:]:
    parts = raw.split("|", 2)
    specs.append({
        "heading": parts[1] if len(parts) > 1 else "",
        "desc":    parts[2] if len(parts) > 2 else "",
    })
print(json.dumps(specs, ensure_ascii=False))
' "$@")

MODE_JSON=$(python3 -c 'import json,sys; print(json.dumps(sys.argv[1], ensure_ascii=False))' "$MODE")
TITLE_JSON=$(python3 -c 'import json,sys; print(json.dumps(sys.argv[1], ensure_ascii=False))' "$TITLE")

# 4) substitute placeholders in the JS template
JS_CODE=$(python3 -c '
import sys
with open(sys.argv[1], "r", encoding="utf-8") as f:
    tpl = f.read()
tpl = tpl.replace("__MODE__", sys.argv[2])
tpl = tpl.replace("__TITLE__", sys.argv[3])
tpl = tpl.replace("__SPECS__", sys.argv[4])
sys.stdout.write(tpl)
' "$(dirname "$0")/guide-overlay.js" "$MODE_JSON" "$TITLE_JSON" "$SPECS_JSON")

# 5) run
playwright-cli -s="$SESSION" eval "$JS_CODE" > /dev/null

echo "✓ [$MODE] $# target(s) highlighted · side panel (top-right) + scroll-tracking badges"
