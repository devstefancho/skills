# AGENTS.md

This file is the single source of truth for coding agents working in this repository — Claude Code, Codex CLI, Cursor, Amp, Jules, and others. `CLAUDE.md` is a one-line `@AGENTS.md` import so Claude Code reads the same content; other agents read this file directly.

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
├── commands/                    # Slash commands — Claude Code primary
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
| Slash commands (`commands/*.md`) | ✓ | via skills only | Add a skill for any command that should work in Codex |
| Hooks (`hooks/hooks.json`) | ✓ | format differs | Claude Code only; mark hook-only plugins unavailable for Codex |
| MCP (`.mcp.json` / `config.toml`) | ✓ | ✓ | Distinct files; same servers |
| Plugin manifest | `.claude-plugin/plugin.json` | `.codex-plugin/plugin.json` | Mirror each other |
| Marketplace catalog | `.claude-plugin/marketplace.json` | `.agents/plugins/marketplace.json` | Mirror each other |

## Adding or Updating a Plugin

1. Create or update files in the plugin directory.
2. Update **both** manifests when metadata changes:
   - `<plugin>/.claude-plugin/plugin.json`
   - `<plugin>/.codex-plugin/plugin.json`
3. Bump the `version` in both manifests (semver).
4. If adding a new plugin, add an entry to **both** marketplace files:
   - `.claude-plugin/marketplace.json`
   - `.agents/plugins/marketplace.json`
5. If the plugin is Claude-only (for example hook-only), keep the Codex manifest but mark the Codex marketplace entry as `NOT_AVAILABLE`.
6. Run `scripts/sync-marketplace.sh` to regenerate the Codex marketplace from the Claude side.
7. Run `scripts/validate-plugins.sh` before committing to verify manifests and Codex marketplace schema stay in sync.

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
codex plugin marketplace add devstefancho/claude-plugins
```

Codex CLI manages marketplaces with `codex plugin marketplace add|upgrade|remove`. Individual plugin enablement is handled by Codex's plugin UI/policy rather than a `codex plugin install` CLI subcommand.

For local development with either tool, point the marketplace add command at the repo path instead of the GitHub shorthand (see below).

## Local Plugin Development

### Claude Code

```bash
# From repository root
claude

# Inside Claude Code
/plugin marketplace add .
/plugin install <plugin-name>@devstefancho-claude-plugins
```

Restart Claude Code after install to activate the plugin.

### Codex CLI

```bash
# From repository root
codex plugin marketplace add .
```

Restart your Codex session and enable the plugin from Codex's plugin UI/policy to activate it.

## Iterating on Plugin Components

When updating a plugin during development, reinstall or refresh it so the tool picks up changes.

**Claude Code:**

```bash
/plugin uninstall <plugin-name>@devstefancho-claude-plugins
/plugin install <plugin-name>@devstefancho-claude-plugins
```

**Codex CLI:**

```bash
codex plugin marketplace upgrade devstefancho-claude-plugins
```

## Plugin Components — Shared Conventions

**Skills** (`skills/<skill-name>/SKILL.md`)
- Required `SKILL.md` with metadata frontmatter and instructions.
- Optional supporting files (`PRINCIPLES.md`, `EXAMPLES.md`, `scripts/`, `references/`).
- Auto-loaded by both tools when relevant context is detected.

**Subagents** (`agents/*.md`)
- One Markdown file per subagent.
- Both Claude Code and Codex understand subagent definitions in this directory.

**Slash Commands** (`commands/*.md`)
- Markdown with frontmatter (`description`, `argument-hint`, `allowed-tools`).
- Native to Claude Code. For Codex, provide an equivalent `skills/<name>/SKILL.md`; Codex prompts are deprecated.

**Event Hooks** (`hooks/hooks.json`)
- Currently Claude Code-specific. See `stop-notification-plugin/hooks/hooks.json` for an example.
- Codex's lifecycle hook format differs and is not auto-mirrored.

**MCP Servers**
- Claude Code reads `.mcp.json` at the plugin root.
- Codex reads `~/.codex/config.toml` (`[mcp_servers.<name>]`). Plugins shipping MCP servers should also include a `codex.config.toml.snippet` describing the equivalent block.

## Maintenance Scripts

Both scripts require [`jq`](https://jqlang.github.io/jq/).

### `scripts/validate-plugins.sh`

Checks consistency between the Claude and Codex copies, plus the Codex marketplace schema. Fails if anything is missing or has drifted.

```bash
scripts/validate-plugins.sh
```

What it verifies:
- Every plugin with `.claude-plugin/plugin.json` also has `.codex-plugin/plugin.json`.
- `name`, `version`, and `description` agree between the two manifests of each plugin.
- Each Codex manifest declares `"skills": "./skills/"` when the plugin ships a `skills/` directory.
- `.claude-plugin/marketplace.json` and `.agents/plugins/marketplace.json` list the same plugin names.
- Each Codex marketplace entry uses the correct schema: `source.source = "local"`, `source.path` matches the Claude side, `policy.installation` ∈ {`AVAILABLE`, `NOT_AVAILABLE`, `INSTALLED_BY_DEFAULT`}, `policy.authentication` ∈ {`ON_INSTALL`, `ON_USE`}, and `category` is non-empty.
- Every `AVAILABLE` Codex plugin actually has at least one Codex-loadable component (`skills/`, `agents/`, `.app.json`, or `codex.config.toml.snippet`).

Run this before pushing any change that touches manifests or the marketplace catalog. A failing run almost always means one of the paired files was edited without the other.

### `scripts/sync-marketplace.sh`

Generates the Codex marketplace mirror from the Claude one, applying Codex's marketplace schema (wrapping `source` as an object, attaching `policy` and `category`).

```bash
scripts/sync-marketplace.sh           # write .agents/plugins/marketplace.json from .claude-plugin/marketplace.json
scripts/sync-marketplace.sh --check   # exit non-zero if the mirror is out of date (CI-friendly)
```

The Claude catalog remains the single source for plugin names and source paths; Codex-specific fields (`policy.installation`, `category`, `interface.displayName`) are derived inside the script. Edit the script's mapping table when you add a new plugin that needs a non-default policy or category.

Recommended workflow when adding or removing a marketplace entry:

1. Edit `.claude-plugin/marketplace.json` (the single source).
2. Run `scripts/sync-marketplace.sh` to update `.agents/plugins/marketplace.json`.
3. Run `scripts/validate-plugins.sh` to confirm the mirror, per-plugin manifests, and Codex schema are consistent.
4. Commit both files together.

## Distribution

Plugins are shared via:

1. **Git Repository** — both tools support GitHub shorthand (`<owner>/<repo>`).
2. **Local Development** — point the tool's marketplace at a local path.
3. **Team Configuration** — use `.claude/settings.json` for Claude Code; Codex records configured marketplaces in `~/.codex/config.toml` after `codex plugin marketplace add`.

## See Also

- Per-plugin `README.md` files for usage details.
- Claude Code documentation: use the `claude-code-guide` subagent for up-to-date references.
- Codex documentation: <https://developers.openai.com/codex>
- AGENTS.md open standard: <https://agents.md>
