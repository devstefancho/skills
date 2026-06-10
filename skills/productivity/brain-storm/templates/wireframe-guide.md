# Wireframe Guide

ASCII wireframe conventions for UI ideas. Follow these rules for consistency.

## Project Type Branch (read this first)

Pick the branch that matches the project being brainstormed:

- **GUI / web / mobile UI** → use the box-drawing rules below.
- **CLI tool / library / backend service** → skip the GUI layout style. Use one of:
  - **Terminal session**: a faithful transcript of the proposed commands and their output (see CLI Example).
  - **Data flow / system sketch**: ASCII arrows between components, JSON/YAML schema snippets, pipeline diagrams.
  The 10-line minimum still applies; the spirit of the rule is "make the implementation direction visible." Small flow-chart rectangles wrapping a process step (e.g. boxed pseudo-code in a sequence) are fine — what to avoid is GUI-style layouts (toolbars, button rows, modals, multi-column dashboards) that imply a screen the project does not have.

---

## GUI Branch (default sections below)

## Box Drawing Characters

Use Unicode box-drawing characters for all borders:

```
┌─────────────────────────┐
│  Component Name         │
├─────────────────────────┤
│  Content area           │
└─────────────────────────┘
```

Characters: `┌ ─ ┐ │ └ ┘ ├ ┤ ┬ ┴ ┼`

## Interactive Elements

- Buttons: `[ Button Text ]`
- Text input: `[ input field_________ ]`
- Checkbox checked: `[x] Label`
- Checkbox unchecked: `[ ] Label`
- Radio selected: `(●) Label`
- Radio unselected: `(○) Label`
- Dropdown: `[ Select ▼ ]`
- Link: `<Link Text>`

## Layout Rules

- Minimum 10 lines for any wireframe
- Show the most important screen or state first
- Use `...` for truncated or repeated content
- Add annotations with `← description` or `// comment` for non-obvious elements
- Indent nested components by 2 spaces

## Example

```
┌─────────────────────────────────────┐
│  ☰  App Title              [👤]    │
├─────────────────────────────────────┤
│                                     │
│  ┌───────────┐  ┌───────────┐      │
│  │  Card 1   │  │  Card 2   │      │
│  │  desc...  │  │  desc...  │      │
│  │ [ View ]  │  │ [ View ]  │      │
│  └───────────┘  └───────────┘      │
│                                     │
│  ┌───────────┐  ┌───────────┐      │
│  │  Card 3   │  │  Card 4   │      │
│  │  desc...  │  │  desc...  │      │
│  │ [ View ]  │  │ [ View ]  │      │
│  └───────────┘  └───────────┘      │
│                                     │
│         [ Load More ]               │
└─────────────────────────────────────┘
```

---

## CLI Example (terminal session style)

```
$ todo add "buy milk" --priority high --due 2026-04-30
added [1] buy milk  [HIGH] (due 2026-04-30)

$ todo list
[ ] 1: buy milk        [HIGH] (due 2026-04-30)
[ ] 2: write spec      [MED]
[x] 3: ship feature

$ todo list --open --search milk
[ ] 1: buy milk        [HIGH] (due 2026-04-30)

$ todo list --done --search xyz
no matching todos
```

## CLI Example (data flow style)

```
   stdin / argv ──► parser ──► validator ──► store(JSON)
                                  │              │
                                  ▼              ▼
                              friendly       atomic write
                              error msgs     (~/.todo.json)
```

