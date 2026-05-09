# Multi-Agent Plugins Marketplace

A collection of reusable plugins for AI coding agents — slash commands, agent skills, subagents, hooks, and MCP server integrations. Supports both **[Claude Code](https://claude.ai/code)** and **[Codex CLI](https://developers.openai.com/codex)**, sharing skill/agent content between them.

## Quick Start

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
codex marketplace add devstefancho/claude-plugins

# 2. Install a plugin
codex plugin install <plugin-name>

# 3. Restart your Codex session to activate
```

## Available Plugins

### Code Quality

| Plugin | Description |
|--------|-------------|
| [code-style-plugin](./code-style-plugin) | Code review based on SRP, DRY, Simplicity First, YAGNI, and Type Safety |
| [code-quality-plugin](./code-quality-plugin) | Code quality review focusing on DRY, KISS, and Clean Code principles |
| [frontend-plugin](./frontend-plugin) | React/Next.js component design review |

### Spec-Driven Development

| Plugin | Description |
|--------|-------------|
| [writing-specs-plugin](./writing-specs-plugin) | Spec writing with conflict detection and reporting |
| [simple-sdd-plugin](./simple-sdd-plugin) | SDD workflow: spec → plan → tasks → implement |
| [implement-with-test-plugin](./implement-with-test-plugin) | Implement code with tests from specs or direct requests |
| [brain-storm-plugin](./brain-storm-plugin) | Brainstorm features and improvements with wireframes and HTML prototype previews |

### Git & Workflow

| Plugin | Description |
|--------|-------------|
| [git-worktree-plugin](./git-worktree-plugin) | Manage git worktrees for parallel branch work |
| [git-commit-plugin](./git-commit-plugin) | Auto-generate conventional commit messages |
| [smart-commit-plugin](./smart-commit-plugin) | Split uncommitted changes into logical commits |
| [pr-create-plugin](./pr-create-plugin) | Create GitHub PRs with auto-generated descriptions |
| [test-commit-push-pr-clean-plugin](./test-commit-push-pr-clean-plugin) | Automate lint, test, commit, push, PR, and worktree cleanup |

### Testing & Reporting

| Plugin | Description |
|--------|-------------|
| [computer-use-plugin](./computer-use-plugin) | App testing via Computer Use MCP with feedback reports |
| [session-reporter-plugin](./session-reporter-plugin) | Generate HTML reports for work sessions |
| [worktrace-plugin](./worktrace-plugin) | Extract work history and generate daily summaries |

### Agent & Automation

| Plugin | Description |
|--------|-------------|
| [agent-team-plugin](./agent-team-plugin) | Create and manage agent teams for worktree sessions |
| [hermes-gateway-plugin](./hermes-gateway-plugin) | Interact with Hermes Agent via local or SSH connection |
| [stop-notification-plugin](./stop-notification-plugin) | macOS TTS notification when Claude stops or needs attention |

### Tooling

| Plugin | Description |
|--------|-------------|
| [scaffold-claude-feature](./scaffold-claude-feature) | Generate Claude Code features with proper structure |
| [common-mcp-plugin](./common-mcp-plugin) | Common MCP servers for shared tools and integrations |
| [local-test-plugin](./local-test-plugin) | Symlink-based local plugin testing |

### Deprecated

| Plugin | Description |
|--------|-------------|
| [spec-manager-plugin](./spec-manager-plugin) | Replaced by `writing-specs-plugin` |

## Plugin Structure

Each plugin ships parallel manifests so it works in both Claude Code and Codex CLI:

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

Run `scripts/sync-marketplace.sh` after editing the Claude file to update the Codex mirror, and `scripts/validate-plugins.sh` to verify both manifests agree. See [`AGENTS.md`](./AGENTS.md) for the full compatibility matrix.

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
codex marketplace add .
codex plugin install <plugin-name>
```

## License

MIT
