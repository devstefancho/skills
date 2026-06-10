# devstefancho skills

A single skills repository for AI coding agents (Claude Code, Codex CLI, and others), structured Matt-Pocock style: every skill lives at `skills/<category>/<name>/SKILL.md`, the whole repo is one plugin, and the primary install path is the tool-agnostic `npx skills` installer.

## Install

Skills in this repo install into 70+ agents (Claude Code, Codex, Cursor, Copilot, ...) via the [skills CLI](https://github.com/vercel-labs/skills):

```bash
# Interactive: pick skills + target agents
npx skills@latest add devstefancho/claude-plugins

# List available skills without installing
npx skills add devstefancho/claude-plugins --list

# Install one skill non-interactively
npx skills add devstefancho/claude-plugins --skill writing-specs -a claude-code -y

# Install everything to all detected agents
npx skills add devstefancho/claude-plugins --all
```

Pick the skills you want; the installer copies them into your coding agent. Re-run to add or update skills.

> Codex CLI: install via the same `npx skills add` path. (If your Codex version doesn't yet support npx-installed skills, clone the repo and point your skills directory at `skills/` — see Local development.)

## Skills

### spec-driven
| Skill | Description |
|-------|-------------|
| [writing-specs](./skills/spec-driven/writing-specs) | Write and manage spec files with search, conflict detection, and reporting |
| [writing-tasks](./skills/spec-driven/writing-tasks) | Decompose specs into persistent task files with a dependency graph and progress |
| [implement-with-test](./skills/spec-driven/implement-with-test) | Implement a task with tests; auto-detects the test framework |
| [test-commit-push-pr-clean](./skills/spec-driven/test-commit-push-pr-clean) | Branch-safe finish: lint, test, commit, push, open PR, clean worktrees |

### agents
| Skill | Description |
|-------|-------------|
| [create-team](./skills/agents/create-team) | Create and manage a planner + implementer agent team (create / cleanup / expand) |
| [split-work](./skills/agents/split-work) | Split current work into parallel-safe task groups with worktree branches |

### browser
| Skill | Description |
|-------|-------------|
| [browser-walkthrough](./skills/browser/browser-walkthrough) | Headed, step-by-step browser walkthrough for iframe/security-heavy sites |
| [computer-use-test](./skills/browser/computer-use-test) | Run app test scenarios via Computer Use MCP and report UI/UX feedback |
| [ui-prototype-preview](./skills/browser/ui-prototype-preview) | Turn a saved brainstorm idea into a standalone HTML prototype |

### productivity
| Skill | Description |
|-------|-------------|
| [brain-storm](./skills/productivity/brain-storm) | Brainstorm features/improvements from the current codebase (pre-spec ideation) |
| [session-resume](./skills/productivity/session-resume) | Resume a previous Claude Code / Codex session from its JSONL transcript |
| [llm-wiki](./skills/productivity/llm-wiki) | Maintain an LLM-powered personal wiki from raw sources |

### misc
| Skill | Description |
|-------|-------------|
| [hermes-runtime](./skills/misc/hermes-runtime) | Talk to / control the Hermes companion runtime (chat, run, status, jobs, setup) |
| [setup-notification](./skills/misc/setup-notification) | Install macOS TTS + dialog hooks for Claude Code Stop/Notification events |

## Skill style

Every skill follows the same conventions (inspired by [mattpocock/skills](https://github.com/mattpocock/skills)):

- Frontmatter `description` is two sentences: what it does, then `Use when [explicit triggers]`.
- `SKILL.md` stays under ~100 lines — terse, imperative, with phase workflows and checklist gates.
- Overflow detail lives in sibling files (`reference.md`, `templates/`, `scripts/`), linked one level deep.

See the SKILL.md conventions section in [`AGENTS.md`](./AGENTS.md) before adding or editing a skill.

## Repository structure

```text
.claude-plugin/plugin.json     # single plugin manifest — lists every skill
skills/
  <category>/
    <skill-name>/
      SKILL.md                 # required: name + description frontmatter + instructions
      ...                      # optional supporting files: scripts/, commands/, templates/
docs/adr/                      # architecture decision records
evals/                         # skill eval suites (dev only, not shipped)
```

A skill is the unit. There are no per-plugin wrappers, no `marketplace.json`, and no per-tool manifests — multi-agent reach is delegated to the `npx skills` installer.

## Local development

```bash
git clone https://github.com/devstefancho/claude-plugins.git
cd claude-plugins
```

- Install from your local checkout: `npx skills@latest add ./`
- Or load the whole repo as a plugin in Claude Code via `--plugin-dir` (see `scripts/cldp.sh`).

See [`AGENTS.md`](./AGENTS.md) for conventions and how to add a skill.

## License

MIT
