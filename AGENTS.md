# AGENTS.md

This file provides guidance to coding agents (Claude Code, Codex CLI, Cursor, Amp, Jules, etc.) working with code in this repository. It is the shared source of truth — tool-specific files (e.g. `CLAUDE.md`) should reference this document and only add tool-specific instructions on top.

## Repository Purpose

This repository is a **multi-agent plugins marketplace** containing reusable extensions that can be shared across projects and teams. It serves both:

- **Claude Code** — via `.claude-plugin/marketplace.json` and per-plugin `.claude-plugin/plugin.json`
- **Codex CLI** — via `.agents/plugins/marketplace.json` and per-plugin `.codex-plugin/plugin.json`

The actual plugin content (skills, agents, commands) is shared between both tools wherever the formats are compatible.

## Plugin Layout

Each plugin is self-contained and dual-published:

```
plugin-name/
├── .claude-plugin/
│   └── plugin.json              # Claude Code manifest (required for Claude Code)
├── .codex-plugin/
│   └── plugin.json              # Codex CLI manifest (required for Codex)
├── commands/                    # Slash commands — Claude Code primary, Codex via prompts
│   └── example.md
├── agents/                      # Subagents — both tools
│   └── helper.md
├── skills/                      # Agent Skills — both tools (SKILL.md format is shared)
│   └── my-skill/
│       ├── SKILL.md
│       ├── PRINCIPLES.md
│       └── EXAMPLES.md
├── hooks/                       # Event hooks (Claude Code format)
│   └── hooks.json
├── .mcp.json                    # MCP servers (Claude Code format)
├── codex.config.toml.snippet    # MCP servers (Codex config.toml fragment, when applicable)
└── README.md                    # Usage for both tools
```

The required files are `.claude-plugin/plugin.json` and `.codex-plugin/plugin.json`. All other components are optional.

## Component Compatibility Matrix

| Component | Claude Code | Codex CLI | Notes |
|-----------|-------------|-----------|-------|
| Skills (`skills/<name>/SKILL.md`) | ✓ | ✓ | Same format — single source |
| Subagents (`agents/*.md`) | ✓ | ✓ | Same format — single source |
| Slash commands (`commands/*.md`) | ✓ | via skills | Codex prompts are deprecated; prefer skills |
| Hooks (`hooks/hooks.json`) | ✓ | format differs | Claude Code only for now |
| MCP (`.mcp.json` / `config.toml`) | ✓ | ✓ | Distinct files; same servers |
| Plugin manifest | `.claude-plugin/plugin.json` | `.codex-plugin/plugin.json` | Mirror each other |
| Marketplace catalog | `.claude-plugin/marketplace.json` | `.agents/plugins/marketplace.json` | Mirror each other |

## Adding or Updating a Plugin

1. Create or update files in the plugin directory.
2. Update both manifests when metadata changes:
   - `<plugin>/.claude-plugin/plugin.json`
   - `<plugin>/.codex-plugin/plugin.json`
3. Bump the `version` in both manifests (semver).
4. If adding a new plugin, add an entry to **both** marketplace files:
   - `.claude-plugin/marketplace.json`
   - `.agents/plugins/marketplace.json`
5. Run `scripts/validate-plugins.sh` to check that the two manifests stay in sync.
6. If you only edited the Claude side, run `scripts/sync-marketplace.sh` to mirror the change to Codex.

## Installing Plugins

### Claude Code

```bash
# Inside Claude Code
/plugin marketplace add devstefancho/claude-plugins
/plugin install <plugin-name>@devstefancho-claude-plugins
```

### Codex CLI

```bash
# In your shell
codex marketplace add devstefancho/claude-plugins
codex plugin install <plugin-name>
```

For local development with either tool, point the marketplace at the repo path instead of the GitHub shorthand.

## Plugin Components — Shared Conventions

**Skills** (`skills/<skill-name>/SKILL.md`)
- Required `SKILL.md` with metadata frontmatter and instructions.
- Optional supporting files (`PRINCIPLES.md`, `EXAMPLES.md`, `scripts/`, `references/`).
- Auto-loaded by both tools when relevant context is detected.

**Subagents** (`agents/*.md`)
- One Markdown file per subagent.
- Both Claude Code and Codex understand subagent definitions in this directory.

**Slash Commands** (`commands/*.md`)
- Markdown with frontmatter (`description`, `argument-hint`).
- Native to Claude Code. Codex's `~/.codex/prompts/*.md` is deprecated — for new shared functionality prefer skills.

**Event Hooks** (`hooks/hooks.json`)
- Currently Claude Code-specific.
- Codex's lifecycle hook format differs and is not auto-mirrored.

**MCP Servers**
- Claude Code reads `.mcp.json` at the plugin root.
- Codex reads `~/.codex/config.toml` (`[mcp_servers.<name>]`). Plugins shipping MCP servers should also include a `codex.config.toml.snippet` describing the equivalent block.

## Maintenance Scripts

- `scripts/sync-marketplace.sh` — keep `.claude-plugin/marketplace.json` and `.agents/plugins/marketplace.json` in lockstep.
- `scripts/validate-plugins.sh` — verify each plugin has both manifests and that name/version/description agree.

Run these whenever you touch manifests or marketplace entries.

## Distribution

Plugins are shared via:

1. **Git Repository** — both tools support GitHub shorthand (`<owner>/<repo>`).
2. **Local Development** — point the tool's marketplace at a local path.
3. **Team Configuration** — committed configuration in `.claude/settings.json` (Claude Code) or `.codex/config.toml` (Codex) auto-installs declared plugins.

## See Also

- Per-plugin `README.md` files contain usage details.
- `CLAUDE.md` extends this document with Claude Code-specific notes.
- Codex documentation: <https://developers.openai.com/codex>
- AGENTS.md open standard: <https://agents.md>
