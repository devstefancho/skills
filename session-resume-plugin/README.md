# session-resume-plugin

Resume work from a previous Claude Code or Codex CLI session by reading the last N turns from its JSONL transcript on disk.

Useful when:

- A session got context-saturated and you started a fresh one but want the last conversation as background.
- You jump back to a project after a few days and need a quick "what was I doing".
- You have a session UUID copied from another window and want to pick up where it left off.

## How It Works

The skill bundles a small bash helper that:

1. **Finds the JSONL file**
   - With a UUID argument: searches `~/.claude/projects/**/*.jsonl` and `~/.codex/sessions/**/rollout-*.jsonl`.
   - Without an argument: picks the most recently modified session in the current `cwd` (Claude Code) plus the most recent Codex session globally, and uses whichever is newer.
2. **Extracts metadata** — tool, session ID, branch, original cwd, last activity timestamp.
3. **Prints the last N turns** (default 10), with each message truncated to 2000 characters.

The helper never writes to or modifies session files.

## Usage Inside Claude Code / Codex

The skill auto-loads when the user mentions resuming a session, supplies a session UUID, or asks "what was I working on". Once loaded, the agent runs:

```bash
bash "$CLAUDE_PLUGIN_ROOT/skills/session-resume/scripts/resume.sh" [SESSION_ID] [-n N]
```

Examples:

```bash
# Most recent session in this cwd, last 10 messages
bash scripts/resume.sh

# Specific session by UUID, last 20 messages
bash scripts/resume.sh 019e1048-8ab2-7600-a736-1dfc5db707aa -n 20
```

## Storage Layouts the Helper Understands

| Tool | Path |
|------|------|
| Claude Code | `~/.claude/projects/<encoded-cwd>/<session-id>.jsonl` (cwd `/` → `-`) |
| Codex CLI   | `~/.codex/sessions/YYYY/MM/DD/rollout-...-<session-id>.jsonl` |

Codex's JSONL schema may evolve. If structured extraction returns nothing, the helper falls back to printing the raw last N lines.

## Requirements

- `jq` available on `PATH`
- Read access to `~/.claude/projects/` and/or `~/.codex/sessions/`
