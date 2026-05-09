# CLAUDE.md

This file provides Claude Code-specific guidance. The shared cross-agent guidance lives in [`AGENTS.md`](./AGENTS.md) — read that first.

@AGENTS.md

## Claude Code-Specific Notes

The shared guidance in `AGENTS.md` covers repository purpose, plugin layout, the Claude/Codex compatibility matrix, install commands, and maintenance scripts. The notes below add Claude Code-specific details.

### Local Plugin Development with Claude Code

```bash
# From repository root
claude

# Inside Claude Code
/plugin marketplace add .
/plugin install plugin-name@devstefancho-claude-plugins
```

After installation, restart Claude Code to activate the plugin.

### Iterating on Plugin Components

When updating a plugin during development:

1. Edit files inside the plugin directory.
2. Uninstall: `/plugin uninstall plugin-name@devstefancho-claude-plugins`
3. Reinstall: `/plugin install plugin-name@devstefancho-claude-plugins`
4. Restart Claude Code if needed.

### Common Claude Code Commands

```bash
/plugin                                            # View all available plugins
/plugin marketplace add .                          # Add this repo as a local marketplace
/plugin install <plugin-name>@devstefancho-claude-plugins
/plugin uninstall <plugin-name>@devstefancho-claude-plugins
/help                                              # View installed commands
```

### Claude Code Component Specifics

**Slash Commands** (`commands/*.md`)
- Frontmatter fields used by Claude Code: `description`, `argument-hint`, `allowed-tools`.
- One Markdown file per command (e.g. `spec.md` defines `/spec`).

**Hooks** (`hooks/hooks.json`)
- Claude Code-native event hook format. See `stop-notification-plugin/hooks/hooks.json` for an example.
- Codex's lifecycle hook format differs and is not auto-mirrored.

**MCP Servers** (`.mcp.json`)
- Claude Code reads `.mcp.json` at the plugin root.
- When adding MCP servers, also document them in the plugin's README and consider shipping a `codex.config.toml.snippet` for Codex parity.

### When Editing Manifests

If you update `<plugin>/.claude-plugin/plugin.json`, also update `<plugin>/.codex-plugin/plugin.json` (or run `scripts/sync-marketplace.sh` after editing the marketplace). `scripts/validate-plugins.sh` checks manifest agreement and Codex marketplace schema.

### See Also

- Claude Code documentation: use the `claude-code-guide` subagent for up-to-date references.
- Existing plugins (e.g. `writing-specs-plugin/`) as concrete structural examples.
