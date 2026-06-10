# Multi-Agent Plugins Marketplace

A collection of reusable plugins for AI coding agents — slash commands, agent skills, subagents, hooks, and MCP server integrations. Supports both **[Claude Code](https://claude.ai/code)** and **[Codex CLI](https://developers.openai.com/codex)**, sharing skill/agent content between them.

## Quick Start

### Any agent — `npx skills` (recommended)

Skills in this repo install into 70+ agents (Claude Code, Codex, Cursor, Copilot, ...) via the [skills CLI](https://github.com/vercel-labs/skills):

```bash
# Interactive: pick skills + target agents
npx skills add devstefancho/claude-plugins

# List available skills without installing
npx skills add devstefancho/claude-plugins --list

# Install one skill non-interactively
npx skills add devstefancho/claude-plugins --skill writing-specs -a claude-code -y

# Install everything to all detected agents
npx skills add devstefancho/claude-plugins --all
```

`npx skills` installs the skill content only. To get slash commands, hooks, and MCP servers too, install the full plugin through Claude Code or Codex below.

### Claude Code

```bash
# 1. Add this marketplace
/plugin marketplace add devstefancho/claude-plugins

# 2. Install a plugin
/plugin install <plugin-name>@devstefancho-claude-plugins

# 3. Restart Claude Code to activate
```

### Codex CLI

```bash
# 1. Add this marketplace
codex plugin marketplace add devstefancho/claude-plugins

# 2. Enable available plugins from Codex's plugin UI/policy
```

## Available Plugins

### Spec-Driven Development

| Plugin | Claude Code | Codex | Description |
|--------|-------------|-------|-------------|
| [writing-specs-plugin](./writing-specs-plugin) | Yes | Yes | Spec-driven development with search, conflict detection, and reporting |
| [writing-tasks-plugin](./writing-tasks-plugin) | Yes | Yes | Decompose specs into persistent task files with dependency graph and progress tracking |
| [implement-with-test-plugin](./implement-with-test-plugin) | Yes | Yes | Implement code with tests from specs or direct requests |
| [brain-storm-plugin](./brain-storm-plugin) | Yes | Yes | Brainstorm features and improvements, then generate standalone HTML previews |

### Git & Workflow

| Plugin | Claude Code | Codex | Description |
|--------|-------------|-------|-------------|
| [test-commit-push-pr-clean-plugin](./test-commit-push-pr-clean-plugin) | Yes | Yes | Automate lint, test, commit, push, PR, and worktree cleanup |
| [split-work-plugin](./split-work-plugin) | Yes | Yes | Split current project work into parallel-safe task groups |

### Testing & Browser

| Plugin | Claude Code | Codex | Description |
|--------|-------------|-------|-------------|
| [computer-use-plugin](./computer-use-plugin) | Yes | Yes | Computer Use MCP app testing with scenario execution and feedback reporting |
| [browser-walkthrough-plugin](./browser-walkthrough-plugin) | Yes | Yes | Headed browser walkthrough for iframe/security-heavy sites |

### Agent & Automation

| Plugin | Claude Code | Codex | Description |
|--------|-------------|-------|-------------|
| [agent-team-plugin](./agent-team-plugin) | Yes | Yes | Agent team management for worktree sessions |
| [hermes-gateway-plugin](./hermes-gateway-plugin) | Yes | Yes | Interact with Hermes Agent via local or SSH-tunneled connection |
| [llm-wiki-plugin](./llm-wiki-plugin) | Yes | Yes | LLM-maintained personal wiki with ingest, query, lint, update operations |
| [session-resume-plugin](./session-resume-plugin) | Yes | Yes | Resume work from a previous Claude Code or Codex CLI session by reading the last N turns from its JSONL transcript |
| [stop-notification-plugin](./stop-notification-plugin) | Yes | No | Claude Code hook-based macOS TTS notification when Claude stops or needs attention |

## Skill Style

Every skill follows the same conventions (inspired by [mattpocock/skills](https://github.com/mattpocock/skills)):

- Frontmatter `description` is two sentences: what it does, then `Use when [explicit triggers]`.
- `SKILL.md` stays under ~100 lines — terse, imperative, with phase workflows and checklist gates.
- Overflow detail lives in sibling files (`reference.md`, `templates/`, `scripts/`), linked one level deep.

See the Skill Authoring Conventions section in [`AGENTS.md`](./AGENTS.md) before adding or editing a skill.

## Plugin Structure

Each plugin ships parallel manifests. Plugins marked as Codex-compatible include Codex-loadable components such as skills:

```text
plugin-name/
├── .claude-plugin/
│   └── plugin.json         # Claude Code manifest
├── .codex-plugin/
│   └── plugin.json         # Codex CLI manifest (mirrors the Claude manifest)
├── commands/               # Slash commands (Claude Code primary)
├── skills/                 # Agent skills (shared — same SKILL.md format)
├── agents/                 # Subagents (shared)
├── hooks/                  # Event handlers (Claude Code format)
├── .mcp.json               # MCP servers (Claude Code)
└── README.md
```

The marketplace catalog is mirrored at two locations:

- `.claude-plugin/marketplace.json` — Claude Code
- `.agents/plugins/marketplace.json` — Codex CLI

Run `scripts/sync-marketplace.sh` after editing the Claude file to update the Codex mirror, and `scripts/validate-plugins.sh` to verify manifests and Codex marketplace schema. See [`AGENTS.md`](./AGENTS.md) for the full compatibility matrix.

## Local Development

```bash
# Clone the repo
git clone https://github.com/devstefancho/claude-plugins.git
cd claude-plugins
```

**Claude Code:**

```bash
claude
# Inside Claude Code
/plugin marketplace add .
/plugin install <plugin-name>@devstefancho-claude-plugins
```

**Codex CLI:**

```bash
codex plugin marketplace add .
```

## License

MIT
