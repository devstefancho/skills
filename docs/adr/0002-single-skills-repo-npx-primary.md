# Single skills repo with npx as the primary install (retire the dual-publish marketplace)

## Context

The repo was a multi-agent **plugins marketplace**: 13 `*-plugin/` wrappers, each with paired `.claude-plugin/plugin.json` + `.codex-plugin/plugin.json` manifests, two marketplace catalogs (`.claude-plugin/marketplace.json`, `.agents/plugins/marketplace.json`), and sync/validate scripts to keep them aligned (see AGENTS.md). In practice 12 of 13 plugins were a single skill with no hooks and no shipped MCP server — the wrapper + dual-manifest + dual-marketplace machinery was pure overhead around skills. Matt Pocock's `mattpocock/skills` shows the simpler shape: one flat (category-grouped) `skills/` tree, a single repo-level `.claude-plugin/plugin.json`, and `npx skills add <owner>/<repo>` as a tool-agnostic installer.

## Decision

Restructure into a single skills repo, Matt-Pocock style.

- **`skills/<category>/<name>/SKILL.md`** is the unit. One repo-level `.claude-plugin/plugin.json`; the whole repo is one Claude plugin.
- **`npx skills add` is tier 1** — the primary, tool-agnostic install path. Multi-agent reach (Claude Code, Codex, others) is delegated to the installer, not to per-tool marketplace catalogs.
- **Slash commands fold into their skill** (argument dispatch). No `commands/` directory.
- **Hooks become setup-skills.** A hook cannot be a skill (it is harness-invoked on events, not model-invoked), but a skill can *install* one. `stop-notification` becomes a setup-skill that writes the Stop hook into the user's `settings.json`, so it travels via npx like everything else. (Pattern borrowed from Matt's `setup-pre-commit`.)
- **Drop the dual-publish machinery**: all `.codex-plugin/plugin.json`, `.agents/plugins/marketplace.json`, `.claude-plugin/marketplace.json`, `scripts/sync-marketplace.sh`, `scripts/validate-plugins.sh`. AGENTS.md shrinks to describe the single-repo shape.

## Consequences

- Codex users move from `codex plugin marketplace add` to `npx skills add`. Skills are shared-format so they work, but the npx→Codex install path must be **verified once during implementation**; if it falls short, document a manual "clone + point at `skills/`" fallback.
- Loses per-plugin install granularity and marketplace discoverability; the trade is far fewer manifests and one install story.
- Hard to reverse: re-establishing dual-publish means recreating 26 manifests + 2 catalogs + sync tooling.
- Independent of ADR-0001 (topic-based authoring): that changes the *content* of `writing-specs`/`writing-tasks`; this changes *where every skill lives*. They compose.
