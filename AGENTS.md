# AGENTS.md

Single source of truth for coding agents working in this repository — Claude Code, Codex CLI, Cursor, Amp, Jules, and others. `CLAUDE.md` is a one-line `@AGENTS.md` import so Claude Code reads the same content.

## Repository Purpose

This is a **single skills repository**, structured Matt-Pocock style ([mattpocock/skills](https://github.com/mattpocock/skills)). The whole repo is one plugin: every skill lives under `skills/<category>/<name>/`, and the primary, tool-agnostic install path is the `npx skills` installer. There is intentionally **no** marketplace catalog, no per-plugin wrappers, and no per-tool manifests — multi-agent reach is delegated to the installer.

See `docs/adr/0002-single-skills-repo-npx-primary.md` for the decision and `docs/adr/0001-topic-based-spec-task-authoring.md` for the related authoring decision.

## Layout

```text
.claude-plugin/
  plugin.json                  # the ONLY manifest — name + skills[] listing every skill dir
skills/
  <category>/                  # spec-driven | agents | browser | productivity | misc
    <skill-name>/
      SKILL.md                 # REQUIRED — frontmatter (name, description) + instructions
      scripts/  commands/  templates/   # OPTIONAL supporting files the skill reads at runtime
docs/adr/                      # architecture decision records
evals/<skill>/                 # eval suites (dev only — not part of a shipped skill)
scripts/                       # repo dev helpers (cldp.sh, generate-plugin-data.js)
website/                       # docs site (VitePress)
archived/                      # retired skills/plugins (not shipped)
```

### Categories
- **spec-driven** — writing-specs, writing-tasks, writing-flows, implement-with-test, test-commit-push-pr-clean
- **agents** — create-team, split-work
- **browser** — browser-walkthrough, computer-use-test, ui-prototype-preview
- **productivity** — brain-storm, session-resume, llm-wiki, executive-summary
- **misc** — hermes-runtime, setup-notification

## SKILL.md conventions

Skills follow the style of [mattpocock/skills](https://github.com/mattpocock/skills). **Before creating or editing any skill, read [docs/skill-authoring-checklist.md](docs/skill-authoring-checklist.md) and run through its gates — it is the pre-flight checklist for everything below.** When creating or editing a skill:

**Frontmatter**
- `name` (required): kebab-case, must match the skill directory name. Never rename casually — it is the installed-skill identity.
- `description` (required): single line, third person, two-sentence pattern — first what the skill does, then `Use when [explicit triggers]` listing literal phrases users say (keep Korean trigger phrases like 스펙 생성, 팀 만들어줘). Max 1024 chars. The `description` is the trigger contract — write it so the agent auto-loads the skill for the right intents.
- **The description must be valid YAML.** A bare colon inside an unquoted value breaks parsing and silently hides the skill from `npx skills` and frontmatter-driven discovery — wrap the value in double quotes if it contains `:`.
- Claude-specific fields (`allowed-tools`, `context`, `agent`, `model`, `effort`, `user-invocable`) are allowed; other agents ignore them.
- Internal-only skills add `metadata.internal: true` so `npx skills` hides them from discovery.

**Body**
- `# Title` then short `##` sections. Terse, imperative, opinionated. Bold the hard rules.
- Use numbered phases for workflows and `- [ ]` checklists as gates between phases.
- Add an Anti-patterns section with WRONG/RIGHT contrast where the skill has known failure modes.
- Keep `SKILL.md` under ~100 lines. Move overflow into sibling `.md` files in the same skill directory, linked one level deep (`See [reference.md](reference.md)`). Never delete behavior-critical detail — relocate it.

**Structure**
- Supporting files (`scripts/`, `templates/`, `commands/`, extra `*.md`) live inside the skill dir and are referenced **relative to the SKILL.md** (e.g. `[templates/x.md](templates/x.md)`, `../templates/x.md` from a subdir). Within the Claude plugin context, `${CLAUDE_PLUGIN_ROOT}` is the repo root.
- Skills are model-invoked. **Slash commands** are folded into their skill via argument dispatch (no top-level `commands/` dir); a skill may keep per-operation docs under its own `commands/` subdir.
- **Hooks cannot be skills** (they are harness-invoked on events). A skill can *install* a hook: see `skills/misc/setup-notification` — a setup-skill that writes hooks into the user's `settings.json`.

## Adding a skill

**First, read [docs/skill-authoring-checklist.md](docs/skill-authoring-checklist.md)** and use it as the gate for every step below.

1. Create `skills/<category>/<name>/SKILL.md` with `name` + `description` frontmatter.
2. Add any supporting files inside that dir.
3. Register the skill path in `.claude-plugin/plugin.json` `skills[]` (e.g. `"./skills/<category>/<name>"`).
4. Validate JSON: `jq . .claude-plugin/plugin.json`.

## Install

```bash
npx skills@latest add devstefancho/claude-plugins
```

**Local development:** `npx skills@latest add ./` from a clone, or load the repo as a plugin via `--plugin-dir` (see `scripts/cldp.sh`).

**Codex CLI:** install via the same `npx skills add` path. ⚠️ The npx→Codex install path is **not yet verified** (ADR-0002 follow-up); if it falls short, clone and point your skills directory at `skills/`.

## See Also

- Per-skill `SKILL.md` for usage.
- Claude Code documentation: use the `claude-code-guide` subagent.
- AGENTS.md open standard: <https://agents.md>
